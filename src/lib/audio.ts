/**
 * Audio playback for chord diagrams and fretboard notes.
 *
 * Uses Tone.js's PluckSynth (Karplus-Strong) to produce a plausible
 * plucked-string tone with no audio samples shipped.
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
let voicesPromise: Promise<Tone.PluckSynth[]> | null = null
let voiceIndex = 0

async function getVoices(): Promise<Tone.PluckSynth[]> {
  if (!voicesPromise) {
    voicesPromise = (async () => {
      return Array.from({ length: VOICE_COUNT }, () => {
        const v = new Tone.PluckSynth({
          attackNoise: 0.8,
          dampening: 4500,
          resonance: 0.95,
        } as Partial<Tone.PluckSynthOptions>).toDestination()
        v.volume.value = -10
        return v
      })
    })()
  }
  return voicesPromise
}

async function nextVoice(): Promise<Tone.PluckSynth> {
  const voices = await getVoices()
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

/** Play a single fretted note on a specific string (1 = high E, 6 = low E). */
export async function playFret(stringNum: number, fret: number): Promise<void> {
  if (fret < 0 || stringNum < 1 || stringNum > 6) return
  await Tone.start()
  const voice = await nextVoice()
  const note = noteForFret(stringNum, fret)
  voice.triggerAttackRelease(note, '2n')
}

/**
 * Strum a chord low-to-high.
 * frets is a 6-element array: index 0 = string 6 (low E) ... index 5 = string 1 (high E).
 * Each entry: 0 (open), 'x' (muted), or an integer fret.
 */
export async function strumChord(frets: Array<number | 'x'>): Promise<void> {
  await Tone.start()
  const now = Tone.now()
  const STRUM_GAP = 0.022
  for (let i = 0; i < frets.length; i++) {
    const fret = frets[i]
    if (fret === 'x') continue
    const stringNum = 6 - i
    const note = noteForFret(stringNum, fret as number)
    const voice = await nextVoice()
    voice.triggerAttackRelease(note, '2n', now + i * STRUM_GAP)
  }
}
