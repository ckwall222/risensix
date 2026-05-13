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

  const COLOR_IN = '#1D7F3F'
  const COLOR_CLOSE = '#B07A1A'
  const COLOR_OFF = '#D63923'
  const COLOR_TICK = 'rgba(0,0,0,0.30)'
  const COLOR_TICK_ZERO = '#1D7F3F'
  const COLOR_DIAL = 'rgba(0,0,0,0.20)'
  const needleColor = inTune ? COLOR_IN : close ? COLOR_CLOSE : COLOR_OFF

  return (
    <AppLayout>
      <section className="pt-14 md:pt-20 pb-6 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <Link to="/tuner" className="btn-link text-ember-500 text-[14px]">← Basic tuner</Link>
          <div className="eyebrow-hero mt-6">Tools · Chromatic tuner</div>
          <h1 className="h-display text-5xl md:text-6xl mt-2">
            Any pitch.<span className="block text-gold-100">Cents-perfect.</span>
          </h1>
          <p className="mt-4 text-lg text-cream-50/75 max-w-[560px] mx-auto leading-snug tracking-[-0.012em]">
            For alternate tunings, intonation checks, and fine adjustments.
          </p>
        </div>
      </section>

      <div className="max-w-[720px] mx-auto px-5 sm:px-6 pb-14">
        {!listening && !error && (
          <div className="text-center">
            <button type="button" onClick={start} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '16px' }}>
              Start chromatic tuner
            </button>
          </div>
        )}

        {error && (
          <div
            className="rounded-[12px] p-4 text-[14px]"
            style={{ background: 'rgba(214,57,35,0.06)', border: '1px solid rgba(214,57,35,0.25)', color: '#A52917' }}
          >
            <div>{error}</div>
            <button type="button" onClick={start} className="btn btn-ghost mt-3" style={{ padding: '0.5rem 1.25rem', fontSize: '14px' }}>
              Try again
            </button>
          </div>
        )}

        {listening && (
          <>
            <div className="card text-center" style={{ padding: '2.5rem 2rem 2rem' }}>
              <div className="relative mx-auto" style={{ width: 280, height: 200 }}>
                <svg viewBox="-110 -100 220 130" width="100%" height="100%">
                  <path d="M -90 0 A 90 90 0 0 1 90 0" fill="none" stroke={COLOR_DIAL} strokeWidth={2} />
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
                        stroke={c === 0 ? COLOR_TICK_ZERO : COLOR_TICK}
                        strokeWidth={c === 0 ? 2 : 1}
                      />
                    )
                  })}
                  <path
                    d={`M ${-Math.sin(5/50*45*Math.PI/180)*82} ${-Math.cos(5/50*45*Math.PI/180)*82} A 82 82 0 0 1 ${Math.sin(5/50*45*Math.PI/180)*82} ${-Math.cos(5/50*45*Math.PI/180)*82}`}
                    fill="none" stroke={COLOR_IN} strokeWidth={3} opacity={inTune ? 0.9 : 0.25}
                  />
                  <g transform={`rotate(${needleRotate})`}>
                    <line x1={0} y1={0} x2={0} y2={-72} stroke={needleColor} strokeWidth={3} strokeLinecap="round" />
                    <circle cx={0} cy={0} r={5} fill={needleColor} />
                  </g>
                  <text x={-90} y={20} fontSize={9} fill="rgba(0,0,0,0.45)" textAnchor="middle">−50¢</text>
                  <text x={0}   y={20} fontSize={9} fill={COLOR_IN} textAnchor="middle" fontWeight="600">0</text>
                  <text x={90}  y={20} fontSize={9} fill="rgba(0,0,0,0.45)" textAnchor="middle">+50¢</text>
                </svg>
              </div>

              <div className="font-display font-semibold tracking-[-0.03em] text-6xl md:text-7xl text-cream-50 mt-2">
                {displayNote}
              </div>
              <div className="text-[15px] font-semibold mt-2" style={{ color: needleColor }}>
                {pitch ? (
                  inTune ? '✓ In tune'
                  : displayCents > 0 ? `+${displayCents.toFixed(0)}¢ — flatten`
                  : `${displayCents.toFixed(0)}¢ — sharpen`
                ) : 'Listening…'}
              </div>
              {displayHz > 0 && (
                <div className="text-[12px] text-gold-100 font-medium mt-1">{displayHz.toFixed(2)} Hz</div>
              )}
            </div>

            <div className="mt-6">
              <div className="eyebrow mb-3 text-center">Standard tuning reference</div>
              <div className="grid grid-cols-6 gap-2">
                {STANDARD_TUNING.map(s => {
                  const isClosest = s.name === closestStringName
                  const tint = isClosest && inTune ? COLOR_IN : isClosest ? COLOR_OFF : null
                  return (
                    <div
                      key={s.name}
                      className="text-center py-3 rounded-[10px] transition"
                      style={{
                        border: `1px solid ${tint ?? 'rgba(0,0,0,0.10)'}`,
                        background: tint ? `${tint}14` : '#FFFFFF',
                      }}
                    >
                      <div
                        className="font-display font-semibold text-lg tracking-[-0.01em]"
                        style={{ color: tint ?? '#1D1D1F' }}
                      >
                        {s.name}
                      </div>
                      <div className="text-[10px] text-gold-100 mt-1 font-medium">{s.freq.toFixed(2)} Hz</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-8 text-center">
              <button type="button" onClick={stop} className="btn btn-ghost" style={{ padding: '0.6rem 1.5rem' }}>
                Stop tuner
              </button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
