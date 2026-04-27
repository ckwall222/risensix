/**
 * Chord diagram (compact box). Shows a chord shape on a small section of the neck
 * with finger numbers and open/muted indicators above each string.
 *
 * Interactive: click anywhere on the diagram to hear the chord strummed.
 *
 * Embed in markdown via:
 *
 *   ```chord
 *   {
 *     "name": "G major",
 *     "frets": [3, 2, 0, 0, 0, 3],
 *     "fingers": [3, 2, null, null, null, 4]
 *   }
 *   ```
 *
 * String order in `frets` and `fingers`: low E to high E (string 6 to string 1).
 * Each entry: 0 = open, "x" = muted, integer = fret number.
 */

import { useState } from 'react'
import { strumChord } from '../lib/audio'

export type ChordDiagramProps = {
  name?: string
  frets: Array<number | 'x'>            // [string6, string5, string4, string3, string2, string1]
  fingers?: Array<number | null>        // 1-4, or null for open/muted/no-finger
  startFret?: number                    // for chords up the neck (e.g., 5 = "5fr")
  barre?: { fret: number; from: number; to: number }  // strings 1-6, "from" is lower-numbered string
}

const STRING_SPACING = 16
const FRET_HEIGHT = 22
const STRING_COUNT = 6
const FRETS_SHOWN = 4

const PAD_X = 16
const PAD_TOP = 32
const PAD_BOTTOM = 24

const STRING_COLOR = '#C9962B'
const FRET_COLOR = '#6B4515'
const NUT_COLOR = '#FAF6EE'
const DOT_FILL = '#E25C2B'
const TEXT_DIM = '#6B4515'
const TEXT_BRIGHT = '#FAF6EE'
const TEXT_TITLE = '#F8DC91'

export function ChordDiagram({
  name,
  frets,
  fingers,
  startFret,
  barre,
}: ChordDiagramProps) {
  const [playing, setPlaying] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPlaying(true)
    try {
      await strumChord(frets)
    } finally {
      setTimeout(() => setPlaying(false), 700)
    }
  }

  const showNut = !startFret || startFret === 1
  const baseFret = showNut ? 1 : startFret

  const width = PAD_X * 2 + (STRING_COUNT - 1) * STRING_SPACING + 24
  const height = PAD_TOP + FRETS_SHOWN * FRET_HEIGHT + PAD_BOTTOM

  function stringX(stringNum: number): number {
    const indexFromLeft = 6 - stringNum
    return PAD_X + 12 + indexFromLeft * STRING_SPACING
  }

  function fretY(fretFromTop: number): number {
    return PAD_TOP + (fretFromTop - 0.5) * FRET_HEIGHT
  }

  function fretLineY(line: number): number {
    return PAD_TOP + line * FRET_HEIGHT
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width, display: 'block', margin: '1.5em auto', cursor: 'pointer' }}
      role="button"
      aria-label={name ? `Play ${name} chord` : 'Play chord'}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e as unknown as React.MouseEvent) } }}
    >
      {name && (
        <text
          x={width / 2}
          y={14}
          textAnchor="middle"
          fontSize={12}
          fontFamily="Cinzel, serif"
          fill={TEXT_TITLE}
          letterSpacing="0.16em"
        >
          {name.toUpperCase()}
        </text>
      )}

      {/* Play affordance — small triangle in upper right */}
      <g transform={`translate(${width - 14}, 10)`} opacity={playing ? 1 : 0.55}>
        <circle r={6} fill="rgba(226,92,43,0.15)" stroke={DOT_FILL} strokeWidth={0.8} />
        <path d="M -1.5 -2.5 L 2.5 0 L -1.5 2.5 Z" fill={DOT_FILL} />
      </g>

      {/* Strings (vertical) */}
      {[1, 2, 3, 4, 5, 6].map(s => {
        const x = stringX(s)
        const indexFromLeft = 6 - s
        const w = 1.4 - indexFromLeft * 0.12
        return (
          <line
            key={`string-${s}`}
            x1={x}
            y1={PAD_TOP}
            x2={x}
            y2={PAD_TOP + FRETS_SHOWN * FRET_HEIGHT}
            stroke={STRING_COLOR}
            strokeOpacity={0.75}
            strokeWidth={w}
          />
        )
      })}

      {/* Fret lines (horizontal) */}
      {Array.from({ length: FRETS_SHOWN + 1 }).map((_, i) => {
        const isTop = i === 0
        const isNutLine = isTop && showNut
        return (
          <line
            key={`fret-${i}`}
            x1={stringX(6)}
            y1={fretLineY(i)}
            x2={stringX(1)}
            y2={fretLineY(i)}
            stroke={isNutLine ? NUT_COLOR : FRET_COLOR}
            strokeWidth={isNutLine ? 3 : 1.2}
          />
        )
      })}

      {/* Start-fret marker (e.g., "5fr") */}
      {!showNut && (
        <text
          x={stringX(6) - 14}
          y={fretLineY(1) + 4}
          textAnchor="end"
          fontSize={10}
          fontFamily="Cinzel, serif"
          fill={TEXT_DIM}
        >
          {baseFret}fr
        </text>
      )}

      {/* Open / muted indicators above each string */}
      {frets.map((f, i) => {
        const stringNum = 6 - i
        const x = stringX(stringNum)
        const y = PAD_TOP - 8
        if (f === 'x') {
          return (
            <g key={`top-${i}`}>
              <line x1={x - 4} y1={y - 4} x2={x + 4} y2={y + 4} stroke={TEXT_BRIGHT} strokeWidth={1.5} />
              <line x1={x - 4} y1={y + 4} x2={x + 4} y2={y - 4} stroke={TEXT_BRIGHT} strokeWidth={1.5} />
            </g>
          )
        }
        if (f === 0) {
          return <circle key={`top-${i}`} cx={x} cy={y} r={4} fill="none" stroke={TEXT_BRIGHT} strokeWidth={1.4} />
        }
        return null
      })}

      {/* Barre (if present) */}
      {barre && (
        <rect
          x={stringX(barre.to) - 5}
          y={fretLineY(barre.fret - (baseFret ?? 1) + 1) - 6}
          width={Math.abs(stringX(barre.from) - stringX(barre.to)) + 10}
          height={12}
          rx={6}
          fill={DOT_FILL}
          stroke="#0A0A0A"
          strokeWidth={1}
        />
      )}

      {/* Finger dots */}
      {frets.map((f, i) => {
        if (typeof f !== 'number' || f === 0) return null
        const stringNum = 6 - i
        const x = stringX(stringNum)
        const fretFromTop = f - (baseFret ?? 1) + 1
        if (fretFromTop < 1 || fretFromTop > FRETS_SHOWN) return null
        const y = fretY(fretFromTop)
        const finger = fingers?.[i]
        return (
          <g key={`dot-${i}`}>
            <circle cx={x} cy={y} r={7} fill={DOT_FILL} stroke="#0A0A0A" strokeWidth={1} />
            {finger && (
              <text
                x={x}
                y={y + 3}
                textAnchor="middle"
                fontSize={9}
                fontFamily="Inter, sans-serif"
                fontWeight={700}
                fill="#0A0A0A"
              >
                {finger}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
