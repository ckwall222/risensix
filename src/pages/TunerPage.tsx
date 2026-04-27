import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import {
  detectPitch,
  closestStandardString,
  STANDARD_TUNING,
} from '../lib/pitch'

/**
 * Basic tuner — minimal UI focused on the six strings of standard tuning.
 * No cents, no Hz. Pluck a string; the page tells you up / down / in tune.
 */
export function TunerPage() {
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

  // Determine the active string + state
  let activeStringName: string | null = null
  let direction: 'up' | 'down' | 'in' | null = null
  if (pitch && pitch > 30 && pitch < 2000) {
    const { string, cents } = closestStandardString(pitch)
    activeStringName = string.name
    if (Math.abs(cents) < 5) direction = 'in'
    else if (cents < 0) direction = 'up'
    else direction = 'down'
  }

  const guidance =
    direction === 'in' ? 'In tune'
    : direction === 'up' ? 'Tune up — turn the peg toward higher pitch'
    : direction === 'down' ? 'Tune down — turn the peg toward lower pitch'
    : listening ? 'Listening — pluck a string'
    : 'Tap "Start" then pluck any string'

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <Link to="/dashboard" className="text-[10px] uppercase tracking-[0.28em] text-gold-100 hover:text-cream-50 transition">← Home</Link>
        <div className="eyebrow mt-6 mb-3">Tools</div>
        <h1 className="h-display text-4xl md:text-5xl tracking-[0.06em]">Tuner</h1>
        <p className="text-lg text-cream-50/70 mt-4 max-w-2xl leading-relaxed">
          Pluck any string. The right string lights up — gold means in tune.
        </p>

        <div className="hairline mt-8 mb-12" />

        {/* Six strings */}
        <div className="grid grid-cols-6 gap-2 sm:gap-3 mb-10">
          {STANDARD_TUNING.map(s => {
            const isActive = s.name === activeStringName
            const cls =
              isActive && direction === 'in'   ? 'border-gold-500 bg-gold-500/20 text-cream-50' :
              isActive && direction === 'up'   ? 'border-ember-500 bg-ember-500/20 text-cream-50' :
              isActive && direction === 'down' ? 'border-ember-500 bg-ember-500/20 text-cream-50' :
              'border-cream-50/[0.12] text-cream-50/70'
            return (
              <div
                key={s.name}
                className={`text-center py-6 sm:py-8 border-2 transition-all ${cls}`}
              >
                <div className="font-display text-3xl sm:text-5xl tracking-[0.04em]">{s.name[0]}</div>
                <div className="text-[9px] uppercase tracking-[0.22em] text-cream-50/80 mt-2">String {s.stringNum}</div>
              </div>
            )
          })}
        </div>

        {/* Big direction display */}
        <div className="text-center mb-8 min-h-[120px] flex flex-col items-center justify-center">
          {direction === 'in' && (
            <>
              <div className="text-7xl mb-2" style={{ color: '#C9962B' }}>✓</div>
              <div className="text-lg uppercase tracking-[0.18em]" style={{ color: '#C9962B' }}>In tune</div>
            </>
          )}
          {direction === 'up' && (
            <>
              <div className="text-7xl mb-2" style={{ color: '#E25C2B' }}>↑</div>
              <div className="text-base uppercase tracking-[0.16em] text-cream-50/85">Tune up</div>
              <div className="text-xs text-cream-50/70 mt-1">Turn the peg to raise the pitch</div>
            </>
          )}
          {direction === 'down' && (
            <>
              <div className="text-7xl mb-2" style={{ color: '#E25C2B' }}>↓</div>
              <div className="text-base uppercase tracking-[0.16em] text-cream-50/85">Tune down</div>
              <div className="text-xs text-cream-50/70 mt-1">Turn the peg to lower the pitch</div>
            </>
          )}
          {!direction && (
            <div className="text-cream-50/70">{guidance}</div>
          )}
        </div>

        {/* Start / stop */}
        <div className="text-center">
          {listening ? (
            <button type="button" onClick={stop} className="btn btn-ghost" style={{ padding: '0.85rem 2.25rem' }}>
              Stop
            </button>
          ) : (
            <button type="button" onClick={start} className="btn btn-primary" style={{ padding: '0.85rem 2.25rem' }}>
              Start
            </button>
          )}
        </div>

        {error && (
          <div className="card mt-6" style={{ padding: '1rem 1.25rem', borderColor: 'rgba(226,92,43,0.5)' }}>
            <div className="text-sm text-cream-50/85">{error}</div>
          </div>
        )}

        {/* Link to advanced */}
        <div className="mt-12 text-center">
          <Link
            to="/tuner/advanced"
            className="text-[10px] uppercase tracking-[0.28em] text-gold-100 hover:text-cream-50 transition"
          >
            Need more detail? Open the chromatic tuner →
          </Link>
        </div>

        {/* Tips */}
        {!listening && !error && (
          <div className="mt-12 card" style={{ padding: '1.25rem 1.5rem' }}>
            <div className="eyebrow mb-3">If a string won't light up</div>
            <ul className="text-sm text-cream-50/70 space-y-2 list-disc pl-5">
              <li>Mute the strings you're not tuning so the tuner only hears one note.</li>
              <li>Pluck firmly. Whisper-quiet plucks fade too fast to read.</li>
              <li>For acoustic, point the soundhole at your phone.</li>
              <li>Quiet room helps — air conditioning, traffic, and TVs throw the reading.</li>
            </ul>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
