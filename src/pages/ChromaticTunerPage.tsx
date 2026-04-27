import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import {
  detectPitch,
  centsOffNearestNote,
  STANDARD_TUNING,
  closestStandardString,
} from '../lib/pitch'

/**
 * Advanced / chromatic tuner — detects any semitone, shows cents, Hz, needle.
 * For finer-grained tuning work (alternate tunings, intonation checks, etc.).
 */
export function ChromaticTunerPage() {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pitch, setPitch] = useState<number | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastPitchRef = useRef<number | null>(null)

  const start = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      const Ctx = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctx) throw new Error('Web Audio not supported in this browser')
      const ctx = new Ctx()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)

      audioCtxRef.current = ctx
      streamRef.current = stream
      analyserRef.current = analyser
      setListening(true)

      const buf = new Float32Array(analyser.fftSize)
      const tick = () => {
        const a = analyserRef.current
        const c = audioCtxRef.current
        if (!a || !c) return
        a.getFloatTimeDomainData(buf)
        const detected = detectPitch(buf, c.sampleRate)
        if (detected > 0) {
          const last = lastPitchRef.current
          const smoothed = last && Math.abs(last - detected) < 5 ? last * 0.6 + detected * 0.4 : detected
          lastPitchRef.current = smoothed
          setPitch(smoothed)
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch (e) {
      const msg = (e as Error).message ?? String(e)
      setError(msg.includes('Permission') ? 'Microphone permission denied. Allow it in your browser settings and reload.' : msg)
    }
  }

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    analyserRef.current = null
    lastPitchRef.current = null
    setListening(false)
    setPitch(null)
  }

  useEffect(() => () => stop(), [])

  let displayNote = '—'
  let displayCents = 0
  let displayHz = 0
  let closestStringName: string | null = null
  if (pitch && pitch > 30 && pitch < 2000) {
    const r = centsOffNearestNote(pitch)
    displayNote = `${r.note}${r.octave}`
    displayCents = r.cents
    displayHz = pitch
    closestStringName = closestStandardString(pitch).string.name
  }

  const inTune = Math.abs(displayCents) < 5
  const close = Math.abs(displayCents) < 15

  const clampedCents = Math.max(-50, Math.min(50, displayCents))
  const needleRotate = (clampedCents / 50) * 45

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <Link to="/tuner" className="text-[10px] uppercase tracking-[0.28em] text-gold-500 hover:text-gold-100 transition">← Basic tuner</Link>
        <div className="eyebrow mt-6 mb-3">Tools</div>
        <h1 className="h-display text-4xl md:text-5xl tracking-[0.06em]">Chromatic tuner</h1>
        <p className="text-lg text-cream-50/70 mt-4 max-w-2xl leading-relaxed">
          Any pitch, any semitone — with cents-off and frequency. For alternate tunings, intonation checks, and fine adjustments.
        </p>

        <div className="hairline mt-8 mb-8" />

        {!listening && !error && (
          <button type="button" onClick={start} className="btn btn-primary">
            Start chromatic tuner
          </button>
        )}

        {error && (
          <div className="card" style={{ padding: '1rem 1.25rem', borderColor: 'rgba(226,92,43,0.5)' }}>
            <div className="text-sm text-cream-50/85">{error}</div>
            <button type="button" onClick={start} className="btn btn-ghost mt-3" style={{ padding: '0.5rem 1rem' }}>
              Try again
            </button>
          </div>
        )}

        {listening && (
          <>
            <div className="text-center">
              <div className="relative mx-auto" style={{ width: 280, height: 200 }}>
                <svg viewBox="-110 -100 220 130" width="100%" height="100%">
                  <path d="M -90 0 A 90 90 0 0 1 90 0" fill="none" stroke="#1A1A1A" strokeWidth={2} />
                  {[-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50].map(c => {
                    const angle = (c / 50) * 45 - 90
                    const rad = angle * Math.PI / 180
                    const r1 = 78
                    const r2 = c === 0 ? 92 : c % 50 === 0 ? 90 : 84
                    return (
                      <line
                        key={c}
                        x1={r1 * Math.cos(rad)} y1={r1 * Math.sin(rad)}
                        x2={r2 * Math.cos(rad)} y2={r2 * Math.sin(rad)}
                        stroke={c === 0 ? '#F8DC91' : '#6B4515'}
                        strokeWidth={c === 0 ? 2 : 1}
                      />
                    )
                  })}
                  <path
                    d={`M ${-Math.sin(5/50*45*Math.PI/180)*82} ${-Math.cos(5/50*45*Math.PI/180)*82} A 82 82 0 0 1 ${Math.sin(5/50*45*Math.PI/180)*82} ${-Math.cos(5/50*45*Math.PI/180)*82}`}
                    fill="none" stroke="#C9962B" strokeWidth={3} opacity={inTune ? 0.9 : 0.4}
                  />
                  <g transform={`rotate(${needleRotate})`}>
                    <line x1={0} y1={0} x2={0} y2={-72}
                      stroke={inTune ? '#C9962B' : close ? '#F8DC91' : '#E25C2B'}
                      strokeWidth={3} strokeLinecap="round" />
                    <circle cx={0} cy={0} r={5} fill={inTune ? '#C9962B' : close ? '#F8DC91' : '#E25C2B'} />
                  </g>
                  <text x={-90} y={20} fontSize={9} fill="#6B4515" textAnchor="middle" fontFamily="Cinzel, serif">−50¢</text>
                  <text x={0}   y={20} fontSize={9} fill="#F8DC91" textAnchor="middle" fontFamily="Cinzel, serif">0</text>
                  <text x={90}  y={20} fontSize={9} fill="#6B4515" textAnchor="middle" fontFamily="Cinzel, serif">+50¢</text>
                </svg>
              </div>

              <div className="font-display text-6xl md:text-8xl tracking-[0.04em] text-cream-50 mb-2">
                {displayNote}
              </div>
              <div
                className="text-lg tracking-[0.08em] uppercase mb-1"
                style={{ color: inTune ? '#C9962B' : close ? '#F8DC91' : '#E25C2B' }}
              >
                {pitch ? (
                  inTune ? '✓ In tune'
                  : displayCents > 0 ? `+${displayCents.toFixed(0)}¢ — flatten`
                  : `${displayCents.toFixed(0)}¢ — sharpen`
                ) : 'Listening…'}
              </div>
              {displayHz > 0 && (
                <div className="text-xs text-cream-50/60 tracking-widest uppercase">{displayHz.toFixed(2)} Hz</div>
              )}
            </div>

            {/* Standard-tuning string row, for reference */}
            <div className="mt-10">
              <div className="eyebrow mb-3 text-center">Standard tuning reference</div>
              <div className="grid grid-cols-6 gap-2">
                {STANDARD_TUNING.map(s => {
                  const isClosest = s.name === closestStringName
                  return (
                    <div
                      key={s.name}
                      className={`text-center py-3 border transition ${
                        isClosest && inTune ? 'border-gold-500 bg-gold-500/15 text-cream-50'
                        : isClosest ? 'border-ember-500 bg-ember-500/10 text-cream-50'
                        : 'border-cream-50/[0.08] text-cream-50/70'
                      }`}
                    >
                      <div className="font-display text-lg tracking-[0.06em]">{s.name}</div>
                      <div className="text-[10px] text-cream-50/60 tracking-widest mt-1">{s.freq.toFixed(2)} Hz</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-8 text-center">
              <button type="button" onClick={stop} className="btn btn-ghost">
                Stop tuner
              </button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
