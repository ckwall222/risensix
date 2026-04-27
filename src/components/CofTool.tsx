/**
 * Interactive Circle of Fifths widget.
 *
 * Click any major key on the wheel; the widget shows that key's
 * diatonic chord set, scale notes, key signature, and relative minor.
 *
 * Used both as the standalone /circle page AND embedded inside
 * markdown lessons via the ```cof-tool code fence.
 */

import { useState } from 'react'
import { ChordDiagram } from './ChordDiagram'
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

export type CofToolProps = {
  /** Initial selected key. Defaults to C. */
  initialKey?: MajorKey
  /** When true, hide the chord diagram grid (compact widget mode). */
  compact?: boolean
}

export function CofTool({ initialKey = 'C', compact = false }: CofToolProps) {
  const [selectedKey, setSelectedKey] = useState<MajorKey>(initialKey)

  const idx = MAJOR_KEYS.indexOf(selectedKey)
  const diatonic = diatonicChordsForKey(selectedKey)
  const notes = notesInKey(selectedKey)
  const sig = keySignatureCount(selectedKey)
  const sigText = sig === 0 ? '0 sharps · 0 flats' : sig > 0 ? `${sig} sharp${sig > 1 ? 's' : ''}` : `${Math.abs(sig)} flat${Math.abs(sig) > 1 ? 's' : ''}`
  const relMinor = relativeMinor(selectedKey)

  const iv = (idx + 11) % 12
  const v = (idx + 1) % 12

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 md:grid-cols-[420px_1fr] gap-8 items-start">
        <div className="mx-auto w-full" style={{ maxWidth: 420 }}>
          <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} width="100%" role="application" aria-label="Interactive Circle of Fifths">
            <circle cx={CX} cy={CY} r={R_OUTER} fill="#0a0a0a" stroke="#3a2f17" strokeWidth={1.2} />
            <circle cx={CX} cy={CY} r={R_MID} fill="#0a0a0a" stroke="#3a2f17" strokeWidth={1} />

            <path d={wedge(iv, R_MID, R_OUTER)} fill="#C9962B" fillOpacity={0.35} />
            <path d={wedge(v, R_MID, R_OUTER)} fill="#C9962B" fillOpacity={0.35} />
            <path d={wedge(idx, R_MID, R_OUTER)} fill="#E25C2B" fillOpacity={0.85} />
            <path d={wedge(idx, R_INNER, R_MID)} fill="#7A4F12" fillOpacity={0.6} />

            <circle cx={CX} cy={CY} r={R_INNER} fill="#0a0a0a" stroke="#3a2f17" strokeWidth={1} />

            {Array.from({ length: 12 }).map((_, i) => {
              const a = segStartDeg(i)
              const [x1, y1] = pointAt(a, R_INNER)
              const [x2, y2] = pointAt(a, R_OUTER)
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3a2f17" strokeWidth={0.8} />
            })}

            {/* Click targets — invisible wedges over the major ring */}
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

            {/* Minor key labels */}
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
                  fill={i === idx ? '#FAF6EE' : 'rgba(250,246,238,0.55)'}
                  style={{ pointerEvents: 'none' }}
                >
                  {m}
                </text>
              )
            })}
          </svg>

          <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-[0.22em]">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3" style={{ backgroundColor: '#E25C2B' }} />
              <span className="text-cream-50/65">I — selected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3" style={{ backgroundColor: '#C9962B' }} />
              <span className="text-cream-50/65">IV / V</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3" style={{ backgroundColor: '#7A4F12' }} />
              <span className="text-cream-50/65">vi (relative)</span>
            </div>
          </div>
        </div>

        <div>
          <div className="card is-feature" style={{ padding: '1.25rem 1.5rem' }}>
            <div className="text-[10px] uppercase tracking-[0.32em] text-gold-500 mb-2">Selected key</div>
            <div className="font-display text-3xl tracking-[0.04em] text-cream-50 mb-2">{selectedKey} major</div>
            <div className="text-sm text-cream-50/75 leading-relaxed">
              {sigText} · relative minor: <span className="text-gold-100">{relMinor}</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-[10px] uppercase tracking-[0.32em] text-gold-500 mb-2">Notes in scale</div>
            <div className="flex flex-wrap gap-2">
              {notes.map(n => (
                <span key={n} className="px-3 py-1.5 border border-cream-50/[0.12] text-cream-50/85 text-sm tracking-wider">{n}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Diatonic chords */}
      {!compact && (
        <div className="mt-8">
          <div className="text-[10px] uppercase tracking-[0.32em] text-gold-500 mb-3">
            The seven chords in {selectedKey} major
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {diatonic.map(c => (
              <div key={c.romanNumeral} className="card flex flex-col items-center" style={{ padding: '0.75rem 0.5rem' }}>
                <div className="text-[10px] uppercase tracking-[0.28em] text-gold-500 mb-1">{c.romanNumeral}</div>
                <ChordDiagram {...c.diagram} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
