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

// Cupertino palette for wheel
const RING_BG = '#FFFFFF'
const RING_STROKE = 'rgba(0,0,0,0.10)'
const COLOR_I = '#D63923'        // selected / I — phoenix red
const COLOR_IV_V = '#FF8674'     // IV & V — softer flame
const COLOR_VI = '#0066CC'       // relative minor — Apple blue
const LABEL_MAJOR = '#1D1D1F'
const LABEL_MAJOR_SELECTED = '#FFFFFF'
const LABEL_MINOR = 'rgba(0,0,0,0.50)'
const LABEL_MINOR_SELECTED = '#FFFFFF'
const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif'

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

  const iv = (idx + 11) % 12
  const v  = (idx + 1)  % 12

  return (
    <AppLayout>
      <section className="pt-14 md:pt-20 pb-6 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <Link to="/dashboard" className="btn-link text-ember-500 text-[14px]">← Back home</Link>
          <div className="eyebrow-hero mt-6">Tools · Circle of Fifths</div>
          <h1 className="h-display text-5xl md:text-6xl mt-2">
            Tap a key.<span className="block text-gold-100">Every chord that fits.</span>
          </h1>
          <p className="mt-4 text-lg text-cream-50/75 max-w-[640px] mx-auto leading-snug tracking-[-0.012em]">
            The wheel shows the primary chords, the relative minor, the diatonic set, and the notes of the scale.
          </p>
        </div>
      </section>

      <div className="max-w-[1080px] mx-auto px-5 sm:px-6 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-[420px_1fr] gap-8 items-start">
          {/* Wheel */}
          <div className="card mx-auto w-full" style={{ maxWidth: 460, padding: '1.5rem' }}>
            <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} width="100%" role="application" aria-label="Interactive Circle of Fifths">
              <circle cx={CX} cy={CY} r={R_OUTER} fill={RING_BG} stroke={RING_STROKE} strokeWidth={1.2} />
              <circle cx={CX} cy={CY} r={R_MID} fill={RING_BG} stroke={RING_STROKE} strokeWidth={1} />

              <path d={wedge(iv, R_MID, R_OUTER)} fill={COLOR_IV_V} fillOpacity={0.45} />
              <path d={wedge(v,  R_MID, R_OUTER)} fill={COLOR_IV_V} fillOpacity={0.45} />
              <path d={wedge(idx, R_MID, R_OUTER)} fill={COLOR_I} fillOpacity={0.95} />
              <path d={wedge(idx, R_INNER, R_MID)} fill={COLOR_VI} fillOpacity={0.85} />

              <circle cx={CX} cy={CY} r={R_INNER} fill={RING_BG} stroke={RING_STROKE} strokeWidth={1} />

              {Array.from({ length: 12 }).map((_, i) => {
                const a = segStartDeg(i)
                const [x1, y1] = pointAt(a, R_INNER)
                const [x2, y2] = pointAt(a, R_OUTER)
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={RING_STROKE} strokeWidth={0.8} />
              })}

              {MAJOR_KEYS.map((k, i) => (
                <path
                  key={`btn-${k}`}
                  d={wedge(i, R_MID, R_OUTER)}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedKey(k)}
                  role="button"
                  aria-label={`Select ${k} major`}
                />
              ))}

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
                    fontFamily={SYSTEM_FONT}
                    fontWeight={600}
                    fill={isSelected ? LABEL_MAJOR_SELECTED : LABEL_MAJOR}
                    style={{ pointerEvents: 'none' }}
                  >
                    {k}
                  </text>
                )
              })}

              {MINOR_LABELS.map((m, i) => {
                const r = (R_INNER + R_MID) / 2
                const [x, y] = pointAt(segCenterDeg(i), r)
                return (
                  <text
                    key={`min-${i}`}
                    x={x} y={y + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fontFamily={SYSTEM_FONT}
                    fontWeight={500}
                    fill={i === idx ? LABEL_MINOR_SELECTED : LABEL_MINOR}
                    style={{ pointerEvents: 'none' }}
                  >
                    {m}
                  </text>
                )
              })}
            </svg>

            <div className="mt-5 grid grid-cols-3 gap-3 text-[12px]">
              <Legend color={COLOR_I} label="I — selected" />
              <Legend color={COLOR_IV_V} label="IV / V" />
              <Legend color={COLOR_VI} label="vi (relative)" />
            </div>
          </div>

          {/* Selected key info */}
          <div>
            <div className="card" style={{ padding: '2rem 1.75rem' }}>
              <div className="eyebrow mb-2">Selected key</div>
              <div className="h-display text-4xl md:text-5xl mb-2">{selectedKey} major</div>
              <div className="text-[15px] text-cream-50/75 leading-snug">
                {sigText} · relative minor: <span className="text-gold-500 font-semibold">{relMinor}</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="eyebrow mb-3">Notes in the scale</div>
              <div className="flex flex-wrap gap-2">
                {notes.map(n => (
                  <span
                    key={n}
                    className="px-3 py-1.5 rounded-full text-[14px] font-medium"
                    style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.10)', color: '#1D1D1F' }}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Diatonic chords */}
        <div className="mt-12">
          <h2 className="h-section text-center">The seven chords in {selectedKey} major</h2>
          <p className="text-cream-50/75 text-[15px] leading-snug mt-3 mb-7 max-w-[760px] mx-auto text-center">
            Almost every song in this key uses some combination of these. <strong className="text-cream-50 font-semibold">I, IV, V</strong> carry most of the weight. <strong className="text-cream-50 font-semibold">vi</strong> is the relative minor. <strong className="text-cream-50 font-semibold">ii, iii</strong> color the verses; <strong className="text-cream-50 font-semibold">vii°</strong> resolves powerfully back to I.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {diatonic.map(c => (
              <div key={c.romanNumeral} className="card flex flex-col items-center" style={{ padding: '1.25rem 0.75rem' }}>
                <div className="text-[13px] text-gold-500 font-semibold mb-1">{c.romanNumeral}</div>
                <ChordDiagram {...c.diagram} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 card" style={{ padding: '2rem 2.25rem' }}>
          <div className="eyebrow mb-3">How to use this</div>
          <ul className="text-[15px] text-cream-50/80 space-y-2 list-disc pl-5 leading-snug">
            <li><strong className="text-cream-50 font-semibold">You know a song's key:</strong> the seven chords above are the safest pool to draw from. Most pop songs only use I, IV, V, vi.</li>
            <li><strong className="text-cream-50 font-semibold">Trying to find the next chord:</strong> the IV (left of selected) and V (right) are the strongest moves. The vi (inner ring) shifts to minor without leaving the key.</li>
            <li><strong className="text-cream-50 font-semibold">Want to modulate?</strong> Click the V — that's where most pop songs go for the final-chorus key change.</li>
            <li><strong className="text-cream-50 font-semibold">Reading sheet music?</strong> The "Notes in scale" tells you which sharps or flats appear in the key signature.</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-cream-50/75 text-[12px]">{label}</span>
    </div>
  )
}
