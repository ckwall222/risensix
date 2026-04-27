/**
 * Generate ChordDiagram-compatible voicings from a root + quality.
 *
 * Open-position chord shapes are preferred where available (cleaner sound,
 * easier to play). Otherwise we fall back to barre shapes.
 */

import type { ChordDiagramProps } from '../components/ChordDiagram'

const NOTE_INDEX: Record<string, number> = {
  'C': 0,  'C♯': 1, 'D♭': 1, 'D': 2,  'D♯': 3, 'E♭': 3,
  'E': 4,  'F': 5,  'F♯': 6, 'G♭': 6, 'G': 7,  'G♯': 8,
  'A♭': 8, 'A': 9,  'A♯': 10, 'B♭': 10, 'B': 11,
}

export type ChordQuality = 'major' | 'minor' | 'dim'

/** Hand-curated open-position voicings for the most common keys. */
const OPEN_VOICINGS: Record<string, ChordDiagramProps> = {
  'C_major':  { name: 'C',   frets: ['x', 3, 2, 0, 1, 0],   fingers: [null, 3, 2, null, 1, null] },
  'D_major':  { name: 'D',   frets: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2] },
  'E_major':  { name: 'E',   frets: [0, 2, 2, 1, 0, 0],     fingers: [null, 2, 3, 1, null, null] },
  'F_major':  { name: 'F',   frets: [1, 3, 3, 2, 1, 1],     fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 } },
  'G_major':  { name: 'G',   frets: [3, 2, 0, 0, 0, 3],     fingers: [3, 2, null, null, null, 4] },
  'A_major':  { name: 'A',   frets: ['x', 0, 2, 2, 2, 0],   fingers: [null, null, 1, 2, 3, null] },
  'B_major':  { name: 'B',   frets: ['x', 2, 4, 4, 4, 2],   fingers: [null, 1, 3, 3, 3, 1], barre: { fret: 2, from: 1, to: 5 }, startFret: 2 },

  'A_minor':  { name: 'Am',  frets: ['x', 0, 2, 2, 1, 0],   fingers: [null, null, 2, 3, 1, null] },
  'D_minor':  { name: 'Dm',  frets: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1] },
  'E_minor':  { name: 'Em',  frets: [0, 2, 2, 0, 0, 0],     fingers: [null, 2, 3, null, null, null] },
  'F_minor':  { name: 'Fm',  frets: [1, 3, 3, 1, 1, 1],     fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 } },
  'G_minor':  { name: 'Gm',  frets: [3, 5, 5, 3, 3, 3],     fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 3, from: 1, to: 6 }, startFret: 3 },
  'B_minor':  { name: 'Bm',  frets: ['x', 2, 4, 4, 3, 2],   fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 2, from: 1, to: 5 }, startFret: 2 },
  'C_minor':  { name: 'Cm',  frets: ['x', 3, 5, 5, 4, 3],   fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 3, from: 1, to: 5 }, startFret: 3 },
}

/** E-shape major barre at the given fret. Root is on string 6 (low E). */
function eShapeMajorBarre(rootFret: number): ChordDiagramProps {
  return {
    frets: [rootFret, rootFret + 2, rootFret + 2, rootFret + 1, rootFret, rootFret],
    fingers: [1, 3, 4, 2, 1, 1],
    barre: { fret: rootFret, from: 1, to: 6 },
    startFret: rootFret > 1 ? rootFret : undefined,
  }
}

/** E-shape minor barre. */
function eShapeMinorBarre(rootFret: number): ChordDiagramProps {
  return {
    frets: [rootFret, rootFret + 2, rootFret + 2, rootFret, rootFret, rootFret],
    fingers: [1, 3, 4, 1, 1, 1],
    barre: { fret: rootFret, from: 1, to: 6 },
    startFret: rootFret > 1 ? rootFret : undefined,
  }
}

/** Diminished triad (small 3-string voicing). */
function dimTriad(rootFret: number): ChordDiagramProps {
  // Root on string 4, ♭3 on string 3, ♭5 on string 2
  return {
    frets: ['x', 'x', rootFret, rootFret + 3, rootFret + 3, 'x'],
    fingers: [null, null, 1, 2, 3, null],
    startFret: rootFret > 1 ? rootFret : undefined,
  }
}

const NOTE_FRET_ON_LOW_E: Record<string, number> = {
  'F': 1,  'F♯': 2,  'G': 3,  'G♯': 4,  'A': 5,  'A♯': 6,  'B♭': 6,
  'B': 7,  'C': 8,   'C♯': 9, 'D♭': 9,  'D': 10, 'D♯': 11, 'E♭': 11,
  'E': 12,
}

const NOTE_FRET_ON_D_STRING: Record<string, number> = {
  'D': 0, 'D♯': 1, 'E♭': 1, 'E': 2, 'F': 3, 'F♯': 4, 'G♭': 4,
  'G': 5, 'G♯': 6, 'A♭': 6, 'A': 7, 'A♯': 8, 'B♭': 8, 'B': 9,
  'C': 10, 'C♯': 11, 'D♭': 11,
}

export function chordFor(rootName: string, quality: ChordQuality): ChordDiagramProps & { name: string } {
  const key = `${rootName}_${quality}`
  if (OPEN_VOICINGS[key]) return OPEN_VOICINGS[key] as ChordDiagramProps & { name: string }

  const labelSuffix = quality === 'major' ? '' : quality === 'minor' ? 'm' : '°'
  const name = `${rootName}${labelSuffix}`

  if (quality === 'dim') {
    const fret = NOTE_FRET_ON_D_STRING[rootName]
    if (fret === undefined) return { name, frets: ['x','x','x','x','x','x'] }
    return { ...dimTriad(fret), name }
  }

  // Use E-shape barre for any other root (covers all 12 keys)
  const fret = NOTE_FRET_ON_LOW_E[rootName] ?? NOTE_INDEX[rootName] ?? 0
  if (quality === 'major') {
    return { ...eShapeMajorBarre(fret), name }
  }
  return { ...eShapeMinorBarre(fret), name }
}

// ────────────────────────────────────────────────────────────────────────
// Diatonic chords for any major key
// ────────────────────────────────────────────────────────────────────────

const NOTE_NAMES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const NOTE_NAMES_FLAT  = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']

const KEY_USES_FLATS = new Set(['F', 'B♭', 'E♭', 'A♭', 'D♭', 'G♭'])

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11]   // root + W-W-H-W-W-W-H

export type DiatonicChord = {
  romanNumeral: string         // I, ii, iii, IV, V, vi, vii°
  rootName: string             // C, Dm, etc. — note name in the right enharmonic
  quality: ChordQuality
  diagram: ChordDiagramProps & { name: string }
}

export function diatonicChordsForKey(keyRoot: string): DiatonicChord[] {
  const idx = NOTE_INDEX[keyRoot]
  if (idx === undefined) return []
  const useFlats = KEY_USES_FLATS.has(keyRoot)
  const naming = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP

  const qualities: ChordQuality[] = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'dim']
  const numerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']

  return MAJOR_SCALE_INTERVALS.map((interval, i) => {
    const noteIdx = (idx + interval) % 12
    const rootName = naming[noteIdx]
    const quality = qualities[i]
    return {
      romanNumeral: numerals[i],
      rootName,
      quality,
      diagram: chordFor(rootName, quality),
    }
  })
}

/** Notes in a major scale, in the right enharmonic spelling for the key. */
export function notesInKey(keyRoot: string): string[] {
  const idx = NOTE_INDEX[keyRoot]
  if (idx === undefined) return []
  const naming = KEY_USES_FLATS.has(keyRoot) ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP
  return MAJOR_SCALE_INTERVALS.map(i => naming[(idx + i) % 12])
}

/** Number of sharps (+) or flats (-). e.g. G major → 1, F major → -1. */
export function keySignatureCount(keyRoot: string): number {
  const map: Record<string, number> = {
    'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F♯': 6,
    'F': -1, 'B♭': -2, 'E♭': -3, 'A♭': -4, 'D♭': -5, 'G♭': -6,
  }
  return map[keyRoot] ?? 0
}

/** Relative minor for a major key. */
export function relativeMinor(keyRoot: string): string {
  const idx = NOTE_INDEX[keyRoot]
  if (idx === undefined) return ''
  const naming = KEY_USES_FLATS.has(keyRoot) ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP
  return `${naming[(idx + 9) % 12]}m`
}
