/**
 * Circle of Fifths SVG diagram. Outer ring = major keys, inner ring = relative minors.
 *
 * Embed in markdown via:
 *
 *   ```cof
 *   {
 *     "title": "I, IV, V in C major",
 *     "highlightI":  "C",
 *     "highlightIV": "F",
 *     "highlightV":  "G"
 *   }
 *   ```
 */

const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'D♭', 'A♭', 'E♭', 'B♭', 'F'] as const
const MINOR_KEYS = ['Am', 'Em', 'Bm', 'F♯m', 'C♯m', 'G♯m', 'D♯m', 'B♭m', 'Fm', 'Cm', 'Gm', 'Dm'] as const
const SIGNATURES = ['', '1♯', '2♯', '3♯', '4♯', '5♯', '6♯', '5♭', '4♭', '3♭', '2♭', '1♭']

type MajorKey = typeof MAJOR_KEYS[number]

export type CircleOfFifthsProps = {
  title?: string
  /** Major-key tonic — drawn with a strong gold fill. */
  highlightI?: MajorKey
  /** Subdominant — gold-amber. */
  highlightIV?: MajorKey
  /** Dominant — gold-amber. */
  highlightV?: MajorKey
  /** Relative minor (matches highlightI's relative minor by default). */
  highlightVi?: MajorKey
  /** Optional dimmed list of additional emphasised keys. */
  ghosted?: MajorKey[]
}

const SEG_DEG = 30
const SVG = 360
const CX = SVG / 2
const CY = SVG / 2
const R_OUTER = 158        // wheel outer edge
const R_MID = 100          // boundary between major and minor rings
const R_INNER = 52         // inner edge (center hole)

const STROKE = 'rgba(0,0,0,0.10)'
const RING_FILL = '#FFFFFF'
const TEXT_DIM = '#1D1D1F'
const TEXT_TITLE = '#D63923'
const FILL_I = '#D63923'         // phoenix red — selected
const FILL_IV = '#FF8674'        // softer flame — IV
const FILL_V = '#FF8674'         // softer flame — V
const FILL_VI = '#0066CC'        // Apple blue — relative minor
const SF_DISPLAY = '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif'
const SF_TEXT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif'

function rad(degrees: number) { return (degrees * Math.PI) / 180 }

/** Angle (in degrees) for the center of segment i. C is at the top (12 o'clock). */
function segCenterDeg(i: number) { return -90 + i * SEG_DEG }
function segStartDeg(i: number) { return segCenterDeg(i) - SEG_DEG / 2 }
function segEndDeg(i: number)   { return segCenterDeg(i) + SEG_DEG / 2 }

function pointAt(angleDeg: number, r: number): [number, number] {
  const a = rad(angleDeg)
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}

/** Donut-wedge path for segment i between r1 (inner) and r2 (outer). */
function wedge(i: number, r1: number, r2: number) {
  const a1 = segStartDeg(i)
  const a2 = segEndDeg(i)
  const [p1x, p1y] = pointAt(a1, r1)
  const [p2x, p2y] = pointAt(a1, r2)
  const [p3x, p3y] = pointAt(a2, r2)
  const [p4x, p4y] = pointAt(a2, r1)
  return `M ${p1x} ${p1y} L ${p2x} ${p2y} A ${r2} ${r2} 0 0 1 ${p3x} ${p3y} L ${p4x} ${p4y} A ${r1} ${r1} 0 0 0 ${p1x} ${p1y} Z`
}

export function CircleOfFifths({
  title,
  highlightI, highlightIV, highlightV, highlightVi,
  ghosted = [],
}: CircleOfFifthsProps) {
  const indexOf = (k?: MajorKey) => (k ? MAJOR_KEYS.indexOf(k) : -1)
  const iI = indexOf(highlightI)
  const iIV = indexOf(highlightIV)
  const iV = indexOf(highlightV)
  const iVi = indexOf(highlightVi)
  const ghostIdx = new Set(ghosted.map(g => MAJOR_KEYS.indexOf(g)).filter(i => i >= 0))

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${SVG} ${SVG}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '1.5em auto' }}
      role="img"
      aria-label={title ?? 'Circle of Fifths'}
    >
      {title && (
        <text
          x={CX}
          y={18}
          textAnchor="middle"
          fontSize={11}
          fontFamily={SF_DISPLAY}
          fill={TEXT_TITLE}
          letterSpacing="0.18em"
        >
          {title.toUpperCase()}
        </text>
      )}

      {/* Major ring background */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill={RING_FILL} stroke={STROKE} strokeWidth={1.2} />
      <circle cx={CX} cy={CY} r={R_MID}   fill={RING_FILL} stroke={STROKE} strokeWidth={1} />

      {/* Highlight wedges (drawn before dividers so they sit beneath the lines) */}
      {ghostIdx.size > 0 && Array.from(ghostIdx).map(i => (
        <path key={`ghost-${i}`} d={wedge(i, R_MID, R_OUTER)} fill="rgba(0,0,0,0.04)" />
      ))}
      {iIV >= 0 && <path d={wedge(iIV, R_MID, R_OUTER)} fill={FILL_IV} fillOpacity={0.55} />}
      {iV >= 0  && <path d={wedge(iV,  R_MID, R_OUTER)} fill={FILL_V}  fillOpacity={0.55} />}
      {iI >= 0  && <path d={wedge(iI,  R_MID, R_OUTER)} fill={FILL_I}  fillOpacity={0.85} />}
      {iVi >= 0 && <path d={wedge(iVi, R_INNER, R_MID)} fill={FILL_VI} fillOpacity={0.6} />}

      {/* Inner ring border */}
      <circle cx={CX} cy={CY} r={R_INNER} fill={RING_FILL} stroke={STROKE} strokeWidth={1} />

      {/* Radial divider lines */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = segStartDeg(i)
        const [x1, y1] = pointAt(a, R_INNER)
        const [x2, y2] = pointAt(a, R_OUTER)
        return <line key={`div-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE} strokeWidth={0.8} />
      })}

      {/* Major key labels (outer ring) */}
      {MAJOR_KEYS.map((k, i) => {
        const r = (R_MID + R_OUTER) / 2
        const [x, y] = pointAt(segCenterDeg(i), r)
        const isHighlighted = i === iI
        return (
          <text
            key={`maj-${i}`}
            x={x} y={y + 5}
            textAnchor="middle"
            fontSize={i === iI || i === iIV || i === iV ? 18 : 16}
            fontFamily={SF_DISPLAY}
            fontWeight={700}
            fill={isHighlighted ? '#FFFFFF' : TEXT_DIM}
            letterSpacing="0.04em"
          >
            {k}
          </text>
        )
      })}

      {/* Minor key labels (inner ring) */}
      {MINOR_KEYS.map((k, i) => {
        const r = (R_INNER + R_MID) / 2
        const [x, y] = pointAt(segCenterDeg(i), r)
        return (
          <text
            key={`min-${i}`}
            x={x} y={y + 4}
            textAnchor="middle"
            fontSize={11}
            fontFamily={SF_TEXT}
            fill={i === iVi ? '#FFFFFF' : 'rgba(0,0,0,0.55)'}
            letterSpacing="0.06em"
          >
            {k}
          </text>
        )
      })}

      {/* Key signatures (outside the wheel) */}
      {SIGNATURES.map((sig, i) => {
        if (!sig) return null
        const [x, y] = pointAt(segCenterDeg(i), R_OUTER + 16)
        return (
          <text
            key={`sig-${i}`}
            x={x} y={y + 3}
            textAnchor="middle"
            fontSize={10}
            fontFamily={SF_TEXT}
            fill="rgba(250,246,238,0.45)"
          >
            {sig}
          </text>
        )
      })}
    </svg>
  )
}
