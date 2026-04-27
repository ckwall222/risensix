/**
 * Fretboard diagram. Renders a horizontal section of a guitar neck with optional
 * highlighted notes (roots, scale degrees, CAGED shapes, single positions, etc.).
 *
 * Interactive: tap a marked note to hear its pitch.
 *
 * Embed in markdown via:
 *
 *   ```fretboard
 *   {
 *     "title": "A minor pentatonic — Box 1",
 *     "frets": [4, 9],
 *     "notes": [
 *       { "string": 6, "fret": 5, "label": "R", "emphasis": "root" },
 *       { "string": 6, "fret": 8, "label": "♭3" }
 *     ]
 *   }
 *   ```
 *
 * String numbering: 1 = high E (top), 6 = low E (bottom) — matches tab convention.
 */

import { playFret } from '../lib/audio'

export type FretboardNote = {
  string: number          // 1 (high E) ... 6 (low E)
  fret: number            // 0 (open) ... 24
  label?: string          // shown inside the dot (e.g. "R", "♭3", "5")
  emphasis?: 'root' | 'normal' | 'open' | 'muted'
}

export type FretboardProps = {
  frets?: [number, number]      // [start, end], inclusive of fret 0 if start = 0
  notes?: FretboardNote[]
  title?: string
  tuning?: string[]             // length 6, in string order [1, 2, 3, 4, 5, 6]
}

const FRET_WIDTH = 56
const OPEN_ZONE = 24
const STRING_SPACING = 18
const TOP_PADDING = 36
const LEFT_PADDING = 32
const RIGHT_PADDING = 12
const BOTTOM_PADDING = 28

const NUT_COLOR = '#FAF6EE'
const FRET_COLOR = '#6B4515'
const STRING_COLOR = '#C9962B'
const INLAY_COLOR = '#3a2f17'
const TEXT_DIM = '#6B4515'
const TEXT_TITLE = '#F8DC91'
const ROOT_FILL = '#E25C2B'
const NOTE_FILL = '#C9962B'

const DEFAULT_TUNING = ['E', 'B', 'G', 'D', 'A', 'E']

export function Fretboard({
  frets = [0, 5],
  notes = [],
  title,
  tuning = DEFAULT_TUNING,
}: FretboardProps) {
  const [startFret, endFret] = frets
  const showOpen = startFret === 0
  const fretSpan = endFret - (showOpen ? 0 : startFret)
  const fretboardWidth =
    (showOpen ? OPEN_ZONE : 0) + fretSpan * FRET_WIDTH
  const totalWidth = LEFT_PADDING + fretboardWidth + RIGHT_PADDING
  const totalHeight = TOP_PADDING + (6 - 1) * STRING_SPACING + BOTTOM_PADDING

  function fretLineX(fret: number): number {
    if (showOpen) {
      if (fret === 0) return LEFT_PADDING + OPEN_ZONE
      return LEFT_PADDING + OPEN_ZONE + (fret - 0) * FRET_WIDTH
    }
    return LEFT_PADDING + (fret - startFret) * FRET_WIDTH
  }

  function fretCenterX(fret: number): number {
    if (fret === 0) {
      return showOpen ? LEFT_PADDING + OPEN_ZONE / 2 : LEFT_PADDING + 6
    }
    return fretLineX(fret) - FRET_WIDTH / 2
  }

  function stringY(stringNum: number): number {
    return TOP_PADDING + (stringNum - 1) * STRING_SPACING
  }

  const inlayFrets = [3, 5, 7, 9, 15, 17, 19, 21]
  const doubleInlayFrets = [12, 24]

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      width="100%"
      style={{ maxWidth: totalWidth, display: 'block', margin: '1.5em auto' }}
      role="img"
      aria-label={title ?? 'Fretboard diagram'}
    >
      {title && (
        <text
          x={totalWidth / 2}
          y={16}
          textAnchor="middle"
          fontSize={11}
          fontFamily="Cinzel, serif"
          fill={TEXT_TITLE}
          letterSpacing="0.18em"
        >
          {title.toUpperCase()}
        </text>
      )}

      {/* Inlay dots */}
      {[...inlayFrets, ...doubleInlayFrets].map(fret => {
        if (fret <= startFret || fret > endFret) return null
        const cx = fretCenterX(fret)
        if (doubleInlayFrets.includes(fret)) {
          return (
            <g key={`inlay-${fret}`}>
              <circle cx={cx} cy={stringY(2)} r={3.5} fill={INLAY_COLOR} />
              <circle cx={cx} cy={stringY(5)} r={3.5} fill={INLAY_COLOR} />
            </g>
          )
        }
        const cy = (stringY(3) + stringY(4)) / 2
        return <circle key={`inlay-${fret}`} cx={cx} cy={cy} r={3.5} fill={INLAY_COLOR} />
      })}

      {/* Strings */}
      {[1, 2, 3, 4, 5, 6].map(s => {
        const y = stringY(s)
        const x1 = LEFT_PADDING + (showOpen ? OPEN_ZONE : 0)
        const x2 = LEFT_PADDING + fretboardWidth
        const w = 0.6 + (s - 1) * 0.18
        return (
          <line
            key={`string-${s}`}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke={STRING_COLOR}
            strokeOpacity={0.65}
            strokeWidth={w}
          />
        )
      })}

      {/* Fret wires */}
      {Array.from({ length: fretSpan + 1 }).map((_, i) => {
        const fret = (showOpen ? 0 : startFret) + i
        const x = fretLineX(fret)
        const isNut = fret === 0
        return (
          <line
            key={`fret-${fret}`}
            x1={x}
            y1={stringY(1) - 6}
            x2={x}
            y2={stringY(6) + 6}
            stroke={isNut ? NUT_COLOR : FRET_COLOR}
            strokeWidth={isNut ? 3.5 : 1.4}
          />
        )
      })}

      {/* Tuning labels (left edge) */}
      {tuning.map((t, i) => {
        const stringNum = i + 1
        return (
          <text
            key={`tuning-${stringNum}`}
            x={LEFT_PADDING - 6}
            y={stringY(stringNum) + 3.5}
            textAnchor="end"
            fontSize={10}
            fontFamily="Cinzel, serif"
            fill={TEXT_DIM}
          >
            {t}
          </text>
        )
      })}

      {/* Fret numbers (below) */}
      {Array.from({ length: fretSpan }).map((_, i) => {
        const fret = (showOpen ? 0 : startFret) + i + 1
        const cx = fretCenterX(fret)
        return (
          <text
            key={`fnum-${fret}`}
            x={cx}
            y={stringY(6) + 20}
            textAnchor="middle"
            fontSize={10}
            fontFamily="Cinzel, serif"
            fill={TEXT_DIM}
            letterSpacing="0.08em"
          >
            {fret}
          </text>
        )
      })}

      {/* Highlighted notes — clickable to play */}
      {notes.map((n, i) => {
        const cx = fretCenterX(n.fret)
        const cy = stringY(n.string)
        const handlePlay = (e: React.MouseEvent | React.KeyboardEvent) => {
          e.preventDefault()
          e.stopPropagation()
          playFret(n.string, n.fret)
        }

        if (n.emphasis === 'muted') {
          return (
            <g key={`note-${i}`}>
              <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4} stroke="#FAF6EE" strokeWidth={1.5} />
              <line x1={cx - 4} y1={cy + 4} x2={cx + 4} y2={cy - 4} stroke="#FAF6EE" strokeWidth={1.5} />
            </g>
          )
        }
        if (n.emphasis === 'open' || n.fret === 0) {
          return (
            <g
              key={`note-${i}`}
              role="button"
              aria-label={`Play open string ${n.string}`}
              tabIndex={0}
              onClick={handlePlay}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlay(e) }}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={cx} cy={cy} r={9} fill="transparent" />
              <circle cx={cx} cy={cy} r={6} fill="none" stroke="#FAF6EE" strokeWidth={1.4} />
              {n.label && (
                <text x={cx} y={cy + 3} textAnchor="middle" fontSize={8.5} fontFamily="Inter, sans-serif" fontWeight={600} fill="#FAF6EE">
                  {n.label}
                </text>
              )}
            </g>
          )
        }
        const fill = n.emphasis === 'root' ? ROOT_FILL : NOTE_FILL
        return (
          <g
            key={`note-${i}`}
            role="button"
            aria-label={`Play string ${n.string} fret ${n.fret}`}
            tabIndex={0}
            onClick={handlePlay}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlay(e) }}
            style={{ cursor: 'pointer' }}
          >
            <circle cx={cx} cy={cy} r={9} fill={fill} stroke="#0A0A0A" strokeWidth={1.2} />
            {n.label && (
              <text
                x={cx}
                y={cy + 3.2}
                textAnchor="middle"
                fontSize={9}
                fontFamily="Inter, sans-serif"
                fontWeight={700}
                fill="#0A0A0A"
              >
                {n.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
