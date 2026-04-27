/**
 * Audio playback for chord diagrams and fretboard notes.
 *
 * PluckSynth (Karplus-Strong) running through a Freeverb tail for body.
 * Tuned for warmth + longer sustain so chords are actually understandable.
 *
 * PluckSynth isn't compatible with Tone.PolySynth (it's not Monophonic),
 * so we maintain a small pool of voices and round-robin them. 8 voices
 * is enough for any six-string chord plus overlap.
 *
 * Tone's audio context starts on the first user interaction (browser
 * autoplay policy), so every public function awaits Tone.start().
 */

import * as Tone from 'tone'

const VOICE_COUNT = 8

let initPromise: Promise<{
  voices: Tone.PluckSynth[]
}> | null = null

let voiceIndex = 0

async function init() {
  if (!initPromise) {
    initPromise = (async () => {
      // Effect chain: voices → eq → reverb → master → destination
      // Subtle low-mid bump for body, then a touch of reverb for room
      const eq = new Tone.EQ3({ low: 1.5, mid: 0.5, high: -1 })
      const reverb = new Tone.Freeverb({
        roomSize: 0.78,
        dampening: 2800,
      })
      reverb.wet.value = 0.22
      const master = new Tone.Gain(0.95)

      eq.chain(reverb, master, Tone.getDestination())

      const voices = Array.from({ length: VOICE_COUNT }, () => {
        const v = new Tone.PluckSynth({
          attackNoise: 0.45,
          dampening: 5500,
          resonance: 0.988,
        } as Partial<Tone.PluckSynthOptions>)
        v.volume.value = -5
        v.connect(eq)
        return v
      })
      return { voices }
    })()
  }
  return initPromise
}

async function nextVoice(): Promise<Tone.PluckSynth> {
  const { voices } = await init()
  const v = voices[voiceIndex]
  voiceIndex = (voiceIndex + 1) % VOICE_COUNT
  return v
}

/**
 * Open-string notes for standard tuning, indexed by string number - 1.
 * String 1 (high E) = E4, String 6 (low E) = E2.
 */
const OPEN_NOTES_BY_STRING = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'] as const

function noteForFret(stringNum: number, fret: number): string {
  const open = OPEN_NOTES_BY_STRING[stringNum - 1]
  if (!open) return 'C4'
  return Tone.Frequency(open).transpose(fret).toNote()
}

// Durations — set to ring long enough that you can actually hear and
// recognize the chord. PluckSynth's natural decay is governed by resonance,
// so the "duration" mostly affects when damping kicks in at the end.
const NOTE_DURATION = '1n'      // ~2s at default tempo
const CHORD_DURATION = '1m'     // ~2s at default tempo (one measure)
const STRUM_GAP = 0.038         // 38ms between consecutive strings — feels like a real downstroke

/** Play a single fretted note on a specific string (1 = high E, 6 = low E). */
export async function playFret(stringNum: number, fret: number): Promise<void> {
  if (fret < 0 || stringNum < 1 || stringNum > 6) return
  await Tone.start()
  const voice = await nextVoice()
  const note = noteForFret(stringNum, fret)
  voice.triggerAttackRelease(note, NOTE_DURATION)
}

/**
 * Strum a chord low-to-high.
 * frets is a 6-element array: index 0 = string 6 (low E) ... index 5 = string 1 (high E).
 * Each entry: 0 (open), 'x' (muted), or an integer fret.
 */
export async function strumChord(frets: Array<number | 'x'>): Promise<void> {
  await Tone.start()
  const now = Tone.now()
  for (let i = 0; i < frets.length; i++) {
    const fret = frets[i]
    if (fret === 'x') continue
    const stringNum = 6 - i
    const note = noteForFret(stringNum, fret as number)
    const voice = await nextVoice()
    voice.triggerAttackRelease(note, CHORD_DURATION, now + i * STRUM_GAP)
  }
}

export type SequenceNote = {
  string: number      // 1-6 (1 = high E, 6 = low E)
  fret: number
  beat: number        // start, in beats from 0
  duration?: number   // in beats; defaults to 1
  bend?: number       // semitones bent up after attack (0.5 = half, 1 = whole)
}

/**
 * Play a timed sequence of notes (a lick, a phrase, a riff).
 * Returns a handle with stop() so the caller can cancel mid-playback.
 *
 * `bpm` controls how long a beat lasts. `swing` true means eighth notes are
 * delayed so the off-beat lands two-thirds through (shuffle/swing feel).
 */
export async function playSequence(
  notes: SequenceNote[],
  opts: { bpm?: number; swing?: boolean } = {}
): Promise<{ stop: () => void; durationSec: number }> {
  await Tone.start()
  const bpm = opts.bpm ?? 100
  const beatSec = 60 / bpm
  const now = Tone.now()
  const scheduledVoices: Tone.PluckSynth[] = []

  let lastEndBeat = 0
  for (const n of notes) {
    if (n.fret < 0 || n.string < 1 || n.string > 6) continue
    const startBeat = applySwing(n.beat, opts.swing === true)
    const dur = n.duration ?? 1
    const startSec = now + startBeat * beatSec
    const durSec = Math.max(0.05, dur * beatSec * 0.95) // tiny gap so notes don't overlap themselves
    const baseNote = noteForFret(n.string, n.fret)
    const voice = await nextVoice()
    scheduledVoices.push(voice)
    voice.triggerAttackRelease(baseNote, durSec, startSec)

    // Visual-only bends are handled in the UI; we approximate audibly by
    // re-triggering at the bent pitch a sliver later, like a quick hammer.
    if (n.bend && n.bend > 0) {
      const bentNote = Tone.Frequency(baseNote).transpose(n.bend).toNote()
      const bendVoice = await nextVoice()
      scheduledVoices.push(bendVoice)
      bendVoice.triggerAttackRelease(bentNote, durSec * 0.7, startSec + durSec * 0.25)
    }
    lastEndBeat = Math.max(lastEndBeat, startBeat + dur)
  }

  const durationSec = lastEndBeat * beatSec
  let stopped = false
  return {
    stop: () => {
      if (stopped) return
      stopped = true
      for (const v of scheduledVoices) {
        try { v.triggerRelease() } catch { /* ignore */ }
      }
    },
    durationSec,
  }
}

/** Shuffle/swing: shift off-beat eighths to a 2:1 triplet feel. */
function applySwing(beat: number, swing: boolean): number {
  if (!swing) return beat
  const frac = beat - Math.floor(beat)
  // 0.5 (straight off-beat) → 0.667 (triplet off-beat)
  if (Math.abs(frac - 0.5) < 0.01) return Math.floor(beat) + 0.667
  return beat
}
