/**
 * Static chord library — most-used voicings grouped by chord type.
 * Each entry can be rendered directly by <ChordDiagram />.
 */

import type { ChordDiagramProps } from '../components/ChordDiagram'

export type ChordCategory = {
  id: string
  name: string
  description: string
  chords: ChordDiagramProps[]
}

export const CHORD_LIBRARY: ChordCategory[] = [
  {
    id: 'major',
    name: 'Major',
    description: 'The bright, resolved sound. The "happy" chords. Built from the root, major 3rd, and perfect 5th.',
    chords: [
      { name: 'C',    frets: ['x', 3, 2, 0, 1, 0],   fingers: [null, 3, 2, null, 1, null] },
      { name: 'D',    frets: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2] },
      { name: 'E',    frets: [0, 2, 2, 1, 0, 0],     fingers: [null, 2, 3, 1, null, null] },
      { name: 'F',    frets: [1, 3, 3, 2, 1, 1],     fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 } },
      { name: 'G',    frets: [3, 2, 0, 0, 0, 3],     fingers: [3, 2, null, null, null, 4] },
      { name: 'A',    frets: ['x', 0, 2, 2, 2, 0],   fingers: [null, null, 1, 2, 3, null] },
      { name: 'B',    frets: ['x', 2, 4, 4, 4, 2],   fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 2, from: 1, to: 5 }, startFret: 2 },
    ],
  },
  {
    id: 'minor',
    name: 'Minor',
    description: 'The introspective, somber sound. Built from the root, flat 3rd, and perfect 5th.',
    chords: [
      { name: 'Am',   frets: ['x', 0, 2, 2, 1, 0],   fingers: [null, null, 2, 3, 1, null] },
      { name: 'Dm',   frets: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1] },
      { name: 'Em',   frets: [0, 2, 2, 0, 0, 0],     fingers: [null, 2, 3, null, null, null] },
      { name: 'Fm',   frets: [1, 3, 3, 1, 1, 1],     fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 } },
      { name: 'Gm',   frets: [3, 5, 5, 3, 3, 3],     fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 3, from: 1, to: 6 }, startFret: 3 },
      { name: 'Bm',   frets: ['x', 2, 4, 4, 3, 2],   fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 2, from: 1, to: 5 }, startFret: 2 },
      { name: 'Cm',   frets: ['x', 3, 5, 5, 4, 3],   fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 3, from: 1, to: 5 }, startFret: 3 },
    ],
  },
  {
    id: 'dom7',
    name: 'Dominant 7th',
    description: 'The bluesy, restless sound. Built from major chord plus a flat 7th. Wants to resolve.',
    chords: [
      { name: 'A7',   frets: ['x', 0, 2, 0, 2, 0],   fingers: [null, null, 2, null, 3, null] },
      { name: 'B7',   frets: ['x', 2, 1, 2, 0, 2],   fingers: [null, 2, 1, 3, null, 4] },
      { name: 'C7',   frets: ['x', 3, 2, 3, 1, 0],   fingers: [null, 3, 2, 4, 1, null] },
      { name: 'D7',   frets: ['x', 'x', 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3] },
      { name: 'E7',   frets: [0, 2, 0, 1, 0, 0],     fingers: [null, 2, null, 1, null, null] },
      { name: 'G7',   frets: [3, 2, 0, 0, 0, 1],     fingers: [3, 2, null, null, null, 1] },
    ],
  },
  {
    id: 'maj7',
    name: 'Major 7th',
    description: 'The lush, dreamy sound. Major chord plus the major 7th.',
    chords: [
      { name: 'Cmaj7', frets: ['x', 3, 2, 0, 0, 0],   fingers: [null, 3, 2, null, null, null] },
      { name: 'Dmaj7', frets: ['x', 'x', 0, 2, 2, 2], fingers: [null, null, null, 1, 1, 1], barre: { fret: 2, from: 1, to: 3 } },
      { name: 'Fmaj7', frets: ['x', 'x', 3, 2, 1, 0], fingers: [null, null, 3, 2, 1, null] },
      { name: 'Gmaj7', frets: [3, 2, 0, 0, 0, 2],     fingers: [3, 1, null, null, null, 2] },
      { name: 'Amaj7', frets: ['x', 0, 2, 1, 2, 0],   fingers: [null, null, 2, 1, 3, null] },
    ],
  },
  {
    id: 'm7',
    name: 'Minor 7th',
    description: 'Smooth, introspective. Minor chord plus a flat 7th. The bedrock of jazz and soul.',
    chords: [
      { name: 'Am7',  frets: ['x', 0, 2, 0, 1, 0],   fingers: [null, null, 2, null, 1, null] },
      { name: 'Dm7',  frets: ['x', 'x', 0, 2, 1, 1], fingers: [null, null, null, 2, 1, 1], barre: { fret: 1, from: 1, to: 2 } },
      { name: 'Em7',  frets: [0, 2, 0, 0, 0, 0],     fingers: [null, 2, null, null, null, null] },
      { name: 'Bm7',  frets: ['x', 2, 4, 2, 3, 2],   fingers: [null, 1, 3, 1, 2, 1], barre: { fret: 2, from: 1, to: 5 }, startFret: 2 },
    ],
  },
  {
    id: 'sus',
    name: 'Sus chords',
    description: 'Suspended — the 3rd is replaced with a 2nd or 4th. They feel unresolved, leaning, alive.',
    chords: [
      { name: 'Asus2', frets: ['x', 0, 2, 2, 0, 0],   fingers: [null, null, 1, 2, null, null] },
      { name: 'Asus4', frets: ['x', 0, 2, 2, 3, 0],   fingers: [null, null, 1, 2, 3, null] },
      { name: 'Dsus2', frets: ['x', 'x', 0, 2, 3, 0], fingers: [null, null, null, 1, 2, null] },
      { name: 'Dsus4', frets: ['x', 'x', 0, 2, 3, 3], fingers: [null, null, null, 1, 2, 3] },
      { name: 'Esus4', frets: [0, 2, 2, 2, 0, 0],     fingers: [null, 1, 2, 3, null, null] },
    ],
  },
  {
    id: 'power',
    name: 'Power chords',
    description: 'No 3rd, no major/minor — just the root and the 5th. The backbone of rock and metal.',
    chords: [
      { name: 'E5',   frets: [0, 2, 2, 'x', 'x', 'x'],   fingers: [null, 1, 2, null, null, null] },
      { name: 'A5',   frets: ['x', 0, 2, 2, 'x', 'x'],   fingers: [null, null, 1, 2, null, null] },
      { name: 'D5',   frets: ['x', 'x', 0, 2, 3, 'x'],   fingers: [null, null, null, 1, 2, null] },
      { name: 'G5',   frets: [3, 5, 5, 'x', 'x', 'x'],   fingers: [1, 3, 4, null, null, null], startFret: 3 },
      { name: 'C5',   frets: ['x', 3, 5, 5, 'x', 'x'],   fingers: [null, 1, 3, 4, null, null], startFret: 3 },
    ],
  },
]
