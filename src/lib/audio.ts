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
