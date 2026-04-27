import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { ChordDiagram } from '../components/ChordDiagram'
import {
  diatonicChordsForKey,
  notesInKey,
  keySignatureCount,
  relativeMinor,
} from '../lib/chordGen'

const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'D♭', 'A♭', 'E♭', 'B♭', 'F'] as const
type MajorKey = typeof MAJOR_KEYS[number]

const SEG_DEG = 30
const SVG_SIZE = 380
const CX = SVG_SIZE / 2
const CY = SVG_SIZE / 2
const R_OUTER = 168
const R_MID = 105
const R_INNER = 56

function rad(deg: number) { return (deg * Math.PI) / 180 }
function segCenterDeg(i: number) { return -90 + i * SEG_DEG }
function segStartDeg(i: number) { return segCenterDeg(i) - SEG_DEG / 2 }
function segEndDeg(i: number) { return segCenterDeg(i) + SEG_DEG / 2 }
function pointAt(deg: number, r: number): [number, number] {
  const a = rad(deg)
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}
function wedge(i: number, r1: number, r2: number) {
  const a1 = segStartDeg(i)
  const a2 = segEndDeg(i)
  const [p1x, p1y] = pointAt(a1, r1)
  const [p2x, p2y] = pointAt(a1, r2)
  const [p3x, p3y] = pointAt(a2, r2)
  const [p4x, p4y] = pointAt(a2, r1)
  return `M ${p1x} ${p1y} L ${p2x} ${p2y} A ${r2} ${r2} 0 0 1 ${p3x} ${p3y} L ${p4x} ${p4y} A ${r1} ${r1} 0 0 0 ${p1x} ${p1y} Z`
}

const MINOR_LABELS = ['Am', 'Em', 'Bm', 'F♯m', 'C♯m', 'G♯m', 'D♯m', 'B♭m', 'Fm', 'Cm', 'Gm', 'Dm']

export function CircleToolPage() {
  const [selectedKey, setSelectedKey] = useState<MajorKey>('C')

  const idx = MAJOR_KEYS.indexOf(selectedKey)
  const diatonic = diatonicChordsForKey(selectedKey)
  const notes = notesInKey(selectedKey)
  const sig = keySignatureCount(selectedKey)
  const sigText = sig === 0 ? '0 sharps · 0 flats' : sig > 0 ? `${sig} sharp${sig > 1 ? 's' : ''}` : `${Math.abs(sig)} flat${Math.abs(sig) > 1 ? 's' : ''}`
  const relMinor = relativeMinor(selectedKey)

  // I, IV, V, vi indices on the wheel (relative to selected key)
  const iv = (idx + 11) % 12   // one step counterclockwise (IV)
  const v  = (idx + 1)  % 12   // one step clockwise (V)
  // vi is on the inner ring at the SAME angular position as the major (relative minor)

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <Link to="/dashboard" className="text-[10px] uppercase tracking-[0.28em] text-gold-100 hover:text-cream-50 transition">← Home</Link>
        <div className="eyebrow mt-6 mb-3">Tools</div>
        <h1 className="h-display text-4xl md:text-5xl tracking-[0.06em]">Circle of Fifths</h1>
        <p className="text-lg text-cream-50/70 mt-4 max-w-2xl leading-relaxed">
          Tap a key. The wheel shows you everything related to it — primary chords, related minors, diatonic chord set, and notes in the scale. The toolkit for figuring out what fits a song you're learning.
        </p>

        <div className="hairline mt-8 mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-[420px_1fr] gap-10 items-start">
          {/* Interactive wheel */}
          <div className="mx-auto w-full" style={{ maxWidth: 420 }}>
            <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} width="100%" role="application" aria-label="Interactive Circle of Fifths">
              {/* Background rings */}
              <circle cx={CX} cy={CY} r={R_OUTER} fill="#0a0a0a" stroke="#3a2f17" strokeWidth={1.2} />
              <circle cx={CX} cy={CY} r={R_MID} fill="#0a0a0a" stroke="#3a2f17" strokeWidth={1} />

              {/* Highlight wedges */}
              <path d={wedge(iv, R_MID, R_OUTER)} fill="#C9962B" fillOpacity={0.35} />
              <path d={wedge(v,  R_MID, R_OUTER)} fill="#C9962B" fillOpacity={0.35} />
              <path d={wedge(idx, R_MID, R_OUTER)} fill="#E25C2B" fillOpacity={0.85} />
              <path d={wedge(idx, R_INNER, R_MID)} fill="#7A4F12" fillOpacity={0.6} />

              {/* Inner ring border */}
              <circle cx={CX} cy={CY} r={R_INNER} fill="#0a0a0a" stroke="#3a2f17" strokeWidth={1} />

              {/* Radial dividers */}
              {Array.from({ length: 12 }).map((_, i) => {
                const a = segStartDeg(i)
                const [x1, y1] = pointAt(a, R_INNER)
                const [x2, y2] = pointAt(a, R_OUTER)
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3a2f17" strokeWidth={0.8} />
              })}

              {/* Major-key click targets (wedges) — invisible overlay */}
              {MAJOR_KEYS.map((k, i) => (
                <path
                  key={`btn-${k}`}
                  d={wedge(i, R_MID, R_OUTER)}
                  fill="transparent"
                  stroke="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedKey(k)}
                  role="button"
                  aria-label={`Select ${k} major`}
                />
              ))}

              {/* Major key labels */}
              {MAJOR_KEYS.map((k, i) => {
                const r = (R_MID + R_OUTER) / 2
                const [x, y] = pointAt(segCenterDeg(i), r)
                const isSelected = i === idx
                return (
                  <text
                    key={`maj-${i}`}
                    x={x} y={y + 6}
                    textAnchor="middle"
                    fontSize={isSelected ? 20 : 17}
                    fontFamily="Cinzel, serif"
                    fontWeight={700}
                    fill={isSelected ? '#0A0A0A' : '#FAF6EE'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {k}
                  </text>
                )
              })}

              {/* Minor key labels (inner ring) */}
              {MINOR_LABELS.map((m, i) => {
                const r = (R_INNER + R_MID) / 2
                const [x, y] = pointAt(segCenterDeg(i), r)
                return (
                  <text
                    key={`min-${i}`}
                    x={x} y={y + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fontFamily="Inter, sans-serif"
                    fill={i === idx ? '#FAF6EE' : 'rgba(250,246,238,0.5)'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {m}
                  </text>
                )
              })}
            </svg>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-[0.22em]">
              <Legend color="#E25C2B" label="I — selected" />
              <Legend color="#C9962B" label="IV / V" />
              <Legend color="#7A4F12" label="vi (relative)" />
            </div>
          </div>

          {/* Selected key info */}
          <div>
            <div className="card is-feature" style={{ padding: '1.5rem 1.75rem' }}>
              <div className="eyebrow mb-2">Selected key</div>
              <div className="font-display text-4xl tracking-[0.04em] text-cream-50 mb-2">{selectedKey} major</div>
              <div className="text-sm text-cream-50/70 leading-relaxed">
                {sigText} · relative minor: <span className="text-gold-100">{relMinor}</span>
              </div>
            </div>

            <div className="mt-8">
              <div className="eyebrow mb-3">Notes in the scale</div>
              <div className="flex flex-wrap gap-2">
                {notes.map(n => (
                  <span key={n} className="px-3 py-1.5 border border-cream-50/[0.12] text-cream-50/85 text-sm tracking-wider">{n}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Diatonic chords */}
        <div className="mt-12">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="h-section">The seven chords in {selectedKey} major</h2>
          </div>
          <div className="hairline mb-6" />
          <p className="text-cream-50/80 text-sm leading-relaxed mb-6 max-w-3xl">
            Almost every song in this key uses some combination of these. <strong className="text-cream-50">I, IV, V</strong> (the orange + amber wedges) carry most of the weight. <strong className="text-cream-50">vi</strong> is the relative minor — a common substitute for I that shifts the mood. <strong className="text-cream-50">ii</strong> and <strong className="text-cream-50">iii</strong> color the verses; <strong className="text-cream-50">vii°</strong> is rarely used as a chord but resolves powerfully back to I.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {diatonic.map(c => (
              <div key={c.romanNumeral} className="card flex flex-col items-center" style={{ padding: '1rem 0.75rem' }}>
                <div className="text-[10px] uppercase tracking-[0.28em] text-gold-100 mb-1">{c.romanNumeral}</div>
                <ChordDiagram {...c.diagram} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="eyebrow mb-3">How to use this</div>
          <ul className="text-sm text-cream-50/70 space-y-2 list-disc pl-5">
            <li><strong className="text-cream-50">You know a song's key:</strong> the seven chords above are the safest pool to draw from. Most pop songs only use I, IV, V, vi.</li>
            <li><strong className="text-cream-50">Trying to find the next chord:</strong> the IV (left of selected) and V (right) are the strongest moves. The vi (inner ring) shifts to minor without leaving the key.</li>
            <li><strong className="text-cream-50">Want to modulate?</strong> Click the V — that's where most pop songs go for the final-chorus key change.</li>
            <li><strong className="text-cream-50">Reading sheet music?</strong> The "Notes in scale" tells you which sharps or flats appear in the key signature.</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-3 w-3" style={{ backgroundColor: color }} />
      <span className="text-cream-50/80">{label}</span>
    </div>
  )
}
