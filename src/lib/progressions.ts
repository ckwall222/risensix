/**
 * Chord progressions for jam tracks.
 *
 * Each progression is a sequence of bars; each bar references a scale
 * degree (1-7) plus a quality variant. At play time the progression is
 * resolved against a chosen key root using the existing chordGen helpers.
 */

import { chordFor, type ChordQuality } from './chordGen'
import type { ChordDiagramProps } from '../components/ChordDiagram'

export type DegreeQuality = 'major' | 'minor' | 'dom7' | 'maj7' | 'min7' | 'dim'

export type ProgressionBar = {
  degree: number          // 1-7 within the major scale (1 = I)
  quality: DegreeQuality  // overrides the diatonic default
  beats: number           // total beats this chord lasts (4 = full bar in 4/4)
}

export type DrumStyle = 'straight' | 'shuffle' | 'ballad' | 'pop'

export type Progression = {
  id: string
  name: string
  summary: string
  bars: ProgressionBar[]
  drumStyle: DrumStyle
}

export const PROGRESSIONS: Progression[] = [
  {
    id: 'blues-12',
    name: '12-bar blues',
    summary: 'I-IV-I turnaround over 12 bars. The single most-used progression in popular music.',
    drumStyle: 'shuffle',
    bars: [
      { degree: 1, quality: 'dom7', beats: 4 },
      { degree: 1, quality: 'dom7', beats: 4 },
      { degree: 1, quality: 'dom7', beats: 4 },
      { degree: 1, quality: 'dom7', beats: 4 },
      { degree: 4, quality: 'dom7', beats: 4 },
      { degree: 4, quality: 'dom7', beats: 4 },
      { degree: 1, quality: 'dom7', beats: 4 },
      { degree: 1, quality: 'dom7', beats: 4 },
      { degree: 5, quality: 'dom7', beats: 4 },
      { degree: 4, quality: 'dom7', beats: 4 },
      { degree: 1, quality: 'dom7', beats: 4 },
      { degree: 5, quality: 'dom7', beats: 4 },
    ],
  },
  {
    id: 'pop-1564',
    name: 'I-V-vi-IV pop',
    summary: 'The "axis of awesome" progression. Underpins half of modern pop.',
    drumStyle: 'pop',
    bars: [
      { degree: 1, quality: 'major', beats: 4 },
      { degree: 5, quality: 'major', beats: 4 },
      { degree: 6, quality: 'minor', beats: 4 },
      { degree: 4, quality: 'major', beats: 4 },
    ],
  },
  {
    id: 'doo-wop-1645',
    name: 'I-vi-IV-V doo-wop',
    summary: 'Classic 50s changes. Stand By Me, every slow dance ever.',
    drumStyle: 'ballad',
    bars: [
      { degree: 1, quality: 'major', beats: 4 },
      { degree: 6, quality: 'minor', beats: 4 },
      { degree: 4, quality: 'major', beats: 4 },
      { degree: 5, quality: 'major', beats: 4 },
    ],
  },
  {
    id: 'jazz-251',
    name: 'ii-V-I (one bar each)',
    summary: 'The fundamental jazz cadence. Practice your bebop vocabulary over this.',
    drumStyle: 'straight',
    bars: [
      { degree: 2, quality: 'min7', beats: 4 },
      { degree: 5, quality: 'dom7', beats: 4 },
      { degree: 1, quality: 'maj7', beats: 8 },
    ],
  },
  {
    id: 'rock-power-eight',
    name: 'Rock 8-bar power',
    summary: 'Driving rock changes. Punchy, anthemic.',
    drumStyle: 'straight',
    bars: [
      { degree: 1, quality: 'major', beats: 4 },
      { degree: 5, quality: 'major', beats: 4 },
      { degree: 6, quality: 'minor', beats: 4 },
      { degree: 4, quality: 'major', beats: 4 },
      { degree: 1, quality: 'major', beats: 4 },
      { degree: 5, quality: 'major', beats: 4 },
      { degree: 4, quality: 'major', beats: 4 },
      { degree: 4, quality: 'major', beats: 4 },
    ],
  },
  {
    id: 'minor-vamp',
    name: 'i-VII-VI-VII minor vamp',
    summary: 'Cinematic minor groove. Roll with it indefinitely.',
    drumStyle: 'pop',
    bars: [
      { degree: 6, quality: 'minor', beats: 4 },  // vi treated as i
      { degree: 5, quality: 'major', beats: 4 },  // V (♭VII relative to minor i)
      { degree: 4, quality: 'major', beats: 4 },  // IV (♭VI)
      { degree: 5, quality: 'major', beats: 4 },
    ],
  },
]

const NOTE_INDEX: Record<string, number> = {
  'C': 0, 'C♯': 1, 'D♭': 1, 'D': 2, 'D♯': 3, 'E♭': 3,
  'E': 4, 'F': 5, 'F♯': 6, 'G♭': 6, 'G': 7, 'G♯': 8,
  'A♭': 8, 'A': 9, 'A♯': 10, 'B♭': 10, 'B': 11,
}
const NOTE_NAMES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const NOTE_NAMES_FLAT  = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
const KEY_USES_FLATS = new Set(['F', 'B♭', 'E♭', 'A♭', 'D♭', 'G♭'])

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11]

export type ResolvedBar = {
  rootName: string
  quality: DegreeQuality
  beats: number
  symbol: string                     // display: "C7", "Dm7", "Gmaj7"
  diagram: ChordDiagramProps & { name: string }
  midiRoot: number                   // root note as MIDI number, e.g. 60 = C4
}

export function resolveProgression(p: Progression, keyRoot: string): ResolvedBar[] {
  const keyIdx = NOTE_INDEX[keyRoot] ?? 0
  const naming = KEY_USES_FLATS.has(keyRoot) ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP
  return p.bars.map(bar => {
    const interval = MAJOR_SCALE_INTERVALS[(bar.degree - 1) % 7]
    const noteIdx = (keyIdx + interval) % 12
    const rootName = naming[noteIdx]
    const triadQuality: ChordQuality = bar.quality === 'minor' || bar.quality === 'min7' ? 'minor'
      : bar.quality === 'dim' ? 'dim'
      : 'major'
    const diagram = chordFor(rootName, triadQuality)
    const symbol = formatSymbol(rootName, bar.quality)
    // midiRoot: place the root in the bass octave (e.g. C2 = 36)
    const midiRoot = 36 + noteIdx
    return { rootName, quality: bar.quality, beats: bar.beats, symbol, diagram, midiRoot }
  })
}

function formatSymbol(root: string, q: DegreeQuality): string {
  switch (q) {
    case 'major': return root
    case 'minor': return root + 'm'
    case 'dom7':  return root + '7'
    case 'maj7':  return root + 'maj7'
    case 'min7':  return root + 'm7'
    case 'dim':   return root + '°'
  }
}

export const ALL_KEYS: string[] = ['C', 'G', 'D', 'A', 'E', 'B', 'F', 'B♭', 'E♭', 'A♭', 'D♭', 'F♯']
