/**
 * Monophonic pitch detection via autocorrelation.
 *
 * Given a Float32Array of audio samples and the sample rate, returns the
 * fundamental frequency in Hz, or -1 if the signal is too quiet / unstable.
 *
 * Refined autocorrelation with parabolic interpolation — the standard
 * textbook algorithm for guitar tuners. Accurate to within a few cents
 * for clean signals down to E2 (82 Hz).
 */

export function detectPitch(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length

  // RMS of the buffer — bail out on silence
  let rms = 0
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i]
  rms = Math.sqrt(rms / SIZE)
  if (rms < 0.01) return -1

  // Trim leading + trailing silence (above 0.2 amplitude threshold)
  let start = 0, end = SIZE - 1
  const threshold = 0.2
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) >= threshold) { start = i; break }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) >= threshold) { end = SIZE - i; break }
  }
  const trimmed = buf.subarray(start, end)
  const N = trimmed.length
  if (N < 64) return -1

  // Autocorrelation: c[lag] = Σ trimmed[j] * trimmed[j + lag]
  const c = new Float32Array(N)
  for (let lag = 0; lag < N; lag++) {
    let sum = 0
    for (let j = 0; j + lag < N; j++) sum += trimmed[j] * trimmed[j + lag]
    c[lag] = sum
  }

  // Find first descent past the central peak (so we don't lock to lag=0)
  let d = 0
  while (d + 1 < N && c[d] > c[d + 1]) d++

  // Find max correlation past that initial descent
  let maxLag = -1
  let maxVal = -Infinity
  for (let i = d; i < N; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i]
      maxLag = i
    }
  }
  if (maxLag < 1 || maxLag >= N - 1) return -1

  // Parabolic interpolation around the peak for sub-sample accuracy
  const x1 = c[maxLag - 1], x2 = c[maxLag], x3 = c[maxLag + 1]
  const a = (x1 + x3 - 2 * x2) / 2
  const b = (x3 - x1) / 2
  const lagInterp = a !== 0 ? maxLag - b / (2 * a) : maxLag

  if (lagInterp <= 0) return -1
  return sampleRate / lagInterp
}

// ────────────────────────────────────────────────────────────────────────
// Note conversion
// ────────────────────────────────────────────────────────────────────────

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

/** A4 = 440 Hz (concert pitch). Standard reference. */
const A4 = 440

/** Convert a frequency in Hz to a MIDI note number (float). 69 = A4. */
export function freqToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / A4)
}

/** Note name + octave for a MIDI number. e.g. midi 69 → { name: 'A', octave: 4 } */
export function midiToNoteName(midi: number): { name: string; octave: number } {
  const rounded = Math.round(midi)
  const name = NOTE_NAMES[((rounded % 12) + 12) % 12]
  const octave = Math.floor(rounded / 12) - 1
  return { name, octave }
}

/** Cents-off from the nearest semitone for a given frequency. Range ~[-50, +50]. */
export function centsOffNearestNote(freq: number): { note: string; octave: number; cents: number; targetHz: number } {
  const midi = freqToMidi(freq)
  const rounded = Math.round(midi)
  const cents = (midi - rounded) * 100
  const { name, octave } = midiToNoteName(rounded)
  const targetHz = A4 * Math.pow(2, (rounded - 69) / 12)
  return { note: name, octave, cents, targetHz }
}

// ────────────────────────────────────────────────────────────────────────
// Standard guitar tuning reference
// ────────────────────────────────────────────────────────────────────────

export type GuitarString = { name: string; midi: number; freq: number; stringNum: number }

export const STANDARD_TUNING: GuitarString[] = [
  { name: 'E2', midi: 40, freq: 82.41,  stringNum: 6 },
  { name: 'A2', midi: 45, freq: 110.00, stringNum: 5 },
  { name: 'D3', midi: 50, freq: 146.83, stringNum: 4 },
  { name: 'G3', midi: 55, freq: 196.00, stringNum: 3 },
  { name: 'B3', midi: 59, freq: 246.94, stringNum: 2 },
  { name: 'E4', midi: 64, freq: 329.63, stringNum: 1 },
]

/** Returns the standard-tuning string closest to a detected frequency. */
export function closestStandardString(freq: number): { string: GuitarString; cents: number } {
  const midi = freqToMidi(freq)
  let best = STANDARD_TUNING[0]
  let bestDelta = Math.abs(midi - best.midi)
  for (const s of STANDARD_TUNING) {
    const d = Math.abs(midi - s.midi)
    if (d < bestDelta) {
      best = s
      bestDelta = d
    }
  }
  const cents = (midi - best.midi) * 100
  return { string: best, cents }
}
