/**
 * Jam track engine — drums + bass + chord pad synthesized live in the browser.
 *
 * Tone.Transport drives the clock. Every 16th note we tick a master scheduler
 * that decides what (kick/snare/hat/bass/pad) plays based on the active drum
 * pattern and the current bar in the progression. Bar/beat changes notify
 * subscribers so the UI can update the displayed chord.
 *
 * The engine is module-level (one shared instance) because Tone has one global
 * AudioContext anyway and we never need two jam tracks playing at once.
 */

import * as Tone from 'tone'
import {
  type Progression,
  type ResolvedBar,
  type DrumStyle,
  resolveProgression,
} from './progressions'

const BEATS_PER_BAR = 4
const TICKS_PER_BEAT = 4 // 16th-note resolution
const TICKS_PER_BAR = BEATS_PER_BAR * TICKS_PER_BEAT

// Drum patterns expressed as sets of 16th-note positions within a bar (0-15).
const DRUM_PATTERNS: Record<DrumStyle, { kick: number[]; snare: number[]; hat: number[] }> = {
  straight: {
    kick: [0, 8],
    snare: [4, 12],
    hat: [0, 2, 4, 6, 8, 10, 12, 14],
  },
  shuffle: {
    // Shuffle: hi-hat lands on the "and-of" beat 2/3 of the way through, but
    // 16th-note grid only approximates. We hit on triplet-like positions.
    kick: [0, 8],
    snare: [4, 12],
    hat: [0, 3, 4, 7, 8, 11, 12, 15],
  },
  ballad: {
    kick: [0, 8],
    snare: [4, 12],
    hat: [0, 4, 8, 12],
  },
  pop: {
    kick: [0, 6, 8],
    snare: [4, 12],
    hat: [0, 2, 4, 6, 8, 10, 12, 14],
  },
}

type EngineState = {
  kick: Tone.MembraneSynth
  snare: Tone.NoiseSynth
  hat: Tone.MetalSynth
  bass: Tone.MonoSynth
  pad: Tone.PolySynth
  drumGain: Tone.Gain
  bassGain: Tone.Gain
  padGain: Tone.Gain
  master: Tone.Gain
}

let state: EngineState | null = null

function ensureState(): EngineState {
  if (state) return state

  const master = new Tone.Gain(0.85).toDestination()

  const drumGain = new Tone.Gain(0.7).connect(master)
  const bassGain = new Tone.Gain(0.55).connect(master)
  const padGain = new Tone.Gain(0.32).connect(master)

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.3 },
  }).connect(drumGain)

  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
  }).connect(drumGain)

  const hat = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.08, release: 0.05 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  })
  hat.volume.value = -18
  hat.connect(drumGain)

  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    filter: { Q: 2, type: 'lowpass', rolloff: -24 },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.4 },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.25,
      sustain: 0.2,
      release: 0.5,
      baseFrequency: 80,
      octaves: 2.5,
    },
  })
  bass.volume.value = -6
  bass.connect(bassGain)

  const pad = new Tone.PolySynth(Tone.AMSynth, {
    harmonicity: 1.5,
    envelope: { attack: 0.5, decay: 0.3, sustain: 0.7, release: 1.2 },
    modulationEnvelope: { attack: 0.5, decay: 0.0, sustain: 1, release: 0.5 },
  })
  pad.volume.value = -10
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.35 })
  pad.chain(reverb, padGain)

  state = { kick, snare, hat, bass, pad, drumGain, bassGain, padGain, master }
  return state
}

export type JamConfig = {
  progression: Progression
  keyRoot: string
  bpm: number
}

export type JamSubscriber = (info: {
  isPlaying: boolean
  barIndex: number       // 0-based within the progression
  totalBars: number
  bar: ResolvedBar | null
}) => void

let scheduledId: number | null = null
let activeConfig: JamConfig | null = null
let resolvedBars: ResolvedBar[] = []
let totalTicks = 0
let tickCursor = 0
let lastBarIdx = -1
let subscribers: Set<JamSubscriber> = new Set()
let isPlaying = false
let muteFlags = { drums: false, bass: false, pad: false }

export function subscribe(fn: JamSubscriber): () => void {
  subscribers.add(fn)
  // Push current state immediately
  fn({
    isPlaying,
    barIndex: lastBarIdx,
    totalBars: resolvedBars.length,
    bar: resolvedBars[lastBarIdx] ?? null,
  })
  return () => { subscribers.delete(fn) }
}

function emit() {
  const info = {
    isPlaying,
    barIndex: lastBarIdx,
    totalBars: resolvedBars.length,
    bar: resolvedBars[lastBarIdx] ?? null,
  }
  for (const fn of subscribers) fn(info)
}

function ticksFor(bar: ResolvedBar): number {
  return Math.round((bar.beats / BEATS_PER_BAR) * TICKS_PER_BAR)
}

function barAtTick(tickInLoop: number): { barIdx: number; tickInBar: number } {
  let acc = 0
  for (let i = 0; i < resolvedBars.length; i++) {
    const t = ticksFor(resolvedBars[i])
    if (tickInLoop < acc + t) return { barIdx: i, tickInBar: tickInLoop - acc }
    acc += t
  }
  return { barIdx: 0, tickInBar: 0 }
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

function frequencyForRoot(midiRoot: number, octaveOffset: number): number {
  return midiToFreq(midiRoot + octaveOffset * 12)
}

function chordVoicingFreqs(midiRoot: number, quality: ResolvedBar['quality']): number[] {
  // Build a 4-voice voicing in the pad's octave (around C4 = 60)
  const baseMidi = 48 + ((midiRoot - 36 + 12) % 12) // bring to C3 area
  const intervals: number[] = (() => {
    switch (quality) {
      case 'major': return [0, 4, 7]
      case 'minor': return [0, 3, 7]
      case 'dom7':  return [0, 4, 7, 10]
      case 'maj7':  return [0, 4, 7, 11]
      case 'min7':  return [0, 3, 7, 10]
      case 'dim':   return [0, 3, 6]
    }
  })()
  return intervals.map(iv => midiToFreq(baseMidi + iv))
}

function tick(time: number) {
  if (!state || resolvedBars.length === 0) return
  const tickInLoop = tickCursor % totalTicks
  const { barIdx, tickInBar } = barAtTick(tickInLoop)
  const bar = resolvedBars[barIdx]

  // Bar change → chord pad + bar event
  if (barIdx !== lastBarIdx) {
    lastBarIdx = barIdx
    if (!muteFlags.pad) {
      const freqs = chordVoicingFreqs(bar.midiRoot, bar.quality)
      state.pad.triggerAttackRelease(freqs, '2n', time)
    }
    emit()
  }

  // Drums + bass keyed off the *bar-local* tick.
  const beatInBar = Math.floor(tickInBar / TICKS_PER_BEAT)
  const tickInBarMod = tickInBar % TICKS_PER_BAR
  const pat = DRUM_PATTERNS[activeConfig?.progression.drumStyle ?? 'straight']

  if (!muteFlags.drums) {
    if (pat.kick.includes(tickInBarMod)) {
      state.kick.triggerAttackRelease('C1', '8n', time)
    }
    if (pat.snare.includes(tickInBarMod)) {
      state.snare.triggerAttackRelease('16n', time)
    }
    if (pat.hat.includes(tickInBarMod)) {
      state.hat.triggerAttackRelease('32n', time, 0.4)
    }
  }

  if (!muteFlags.bass) {
    // Bass plays the root on beats 1 and 3 of each bar (downbeats)
    if (beatInBar === 0 || beatInBar === 2) {
      const freq = frequencyForRoot(bar.midiRoot, 0)
      if (tickInBar % TICKS_PER_BEAT === 0) {
        state.bass.triggerAttackRelease(freq, '8n', time)
      }
    }
  }

  tickCursor++
}

export async function startJam(config: JamConfig): Promise<void> {
  await Tone.start()
  ensureState()
  activeConfig = config
  resolvedBars = resolveProgression(config.progression, config.keyRoot)
  totalTicks = resolvedBars.reduce((s, b) => s + ticksFor(b), 0)
  tickCursor = 0
  lastBarIdx = -1
  Tone.Transport.bpm.value = config.bpm
  if (scheduledId !== null) Tone.Transport.clear(scheduledId)
  scheduledId = Tone.Transport.scheduleRepeat(tick, '16n')
  Tone.Transport.start('+0.1')
  isPlaying = true
  emit()
}

export function stopJam(): void {
  if (scheduledId !== null) {
    Tone.Transport.clear(scheduledId)
    scheduledId = null
  }
  Tone.Transport.stop()
  isPlaying = false
  lastBarIdx = -1
  // Silence any sustained pad notes
  if (state) state.pad.releaseAll()
  emit()
}

export function setBpm(bpm: number): void {
  if (!isPlaying) return
  Tone.Transport.bpm.rampTo(bpm, 0.1)
  if (activeConfig) activeConfig.bpm = bpm
}

export function setKey(keyRoot: string): void {
  if (!activeConfig) return
  activeConfig.keyRoot = keyRoot
  resolvedBars = resolveProgression(activeConfig.progression, keyRoot)
  // Bar count stays the same so tickCursor remains valid; emit a change.
  lastBarIdx = -1
  emit()
}

export function setProgression(progression: Progression): void {
  if (!activeConfig) return
  activeConfig.progression = progression
  resolvedBars = resolveProgression(progression, activeConfig.keyRoot)
  totalTicks = resolvedBars.reduce((s, b) => s + ticksFor(b), 0)
  tickCursor = 0
  lastBarIdx = -1
  emit()
}

export function setMute(channel: 'drums' | 'bass' | 'pad', muted: boolean) {
  muteFlags[channel] = muted
}

export function isJamPlaying(): boolean {
  return isPlaying
}
