import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import {
  detectPitch,
  closestStandardString,
  STANDARD_TUNING,
} from '../lib/pitch'

const COLOR_IN_TUNE = '#1D7F3F'
const COLOR_NEEDS_TUNE = '#D63923'

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
    listening ? 'Listening — pluck a string'
    : 'Tap "Start" then pluck any string.'

  return (
    <AppLayout>
      <section className="pt-14 md:pt-20 pb-6 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <Link to="/dashboard" className="btn-link text-ember-500 text-[14px]">← Back home</Link>
          <div className="eyebrow-hero mt-6">Tools · Tuner</div>
          <h1 className="h-display text-5xl md:text-6xl mt-2">
            Pluck a string.<span className="block text-gold-100">We'll do the rest.</span>
          </h1>
          <p className="mt-4 text-lg text-cream-50/75 max-w-[560px] mx-auto leading-snug tracking-[-0.012em]">
            The right string lights up. Green means in tune. Red arrows tell you which way to turn.
          </p>
        </div>
      </section>

      <div className="max-w-[920px] mx-auto px-5 sm:px-6 pb-14">
        {/* Six strings */}
        <div className="grid grid-cols-6 gap-2 sm:gap-3 mb-8">
          {STANDARD_TUNING.map(s => {
            const isActive = s.name === activeStringName
            const tintColor =
              isActive && direction === 'in' ? COLOR_IN_TUNE :
              isActive ? COLOR_NEEDS_TUNE : null

            return (
              <div
                key={s.name}
                className="text-center py-6 sm:py-9 rounded-[14px] transition-all"
                style={{
                  border: `1px solid ${tintColor ?? 'rgba(0,0,0,0.10)'}`,
                  background: tintColor ? `${tintColor}14` : '#FFFFFF',
                }}
              >
                <div
                  className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.02em]"
                  style={{ color: tintColor ?? '#1D1D1F' }}
                >
                  {s.name[0]}
                </div>
                <div className="text-[11px] text-gold-100 mt-2 font-medium">
                  String {s.stringNum}
                </div>
              </div>
            )
          })}
        </div>

        {/* Big direction display */}
        <div className="card text-center" style={{ padding: '2.5rem 2rem', minHeight: '180px' }}>
          {direction === 'in' && (
            <>
              <div className="text-7xl mb-2" style={{ color: COLOR_IN_TUNE }}>✓</div>
              <div className="text-lg font-semibold" style={{ color: COLOR_IN_TUNE }}>In tune</div>
            </>
          )}
          {direction === 'up' && (
            <>
              <div className="text-7xl mb-2" style={{ color: COLOR_NEEDS_TUNE }}>↑</div>
              <div className="text-base font-semibold text-cream-50">Tune up</div>
              <div className="text-[14px] text-cream-50/70 mt-1">Turn the peg to raise the pitch.</div>
            </>
          )}
          {direction === 'down' && (
            <>
              <div className="text-7xl mb-2" style={{ color: COLOR_NEEDS_TUNE }}>↓</div>
              <div className="text-base font-semibold text-cream-50">Tune down</div>
              <div className="text-[14px] text-cream-50/70 mt-1">Turn the peg to lower the pitch.</div>
            </>
          )}
          {!direction && (
            <div className="text-cream-50/65 text-[16px] pt-8">{guidance}</div>
          )}
        </div>

        {/* Start / stop */}
        <div className="text-center mt-8">
          {listening ? (
            <button type="button" onClick={stop} className="btn btn-ghost" style={{ padding: '0.75rem 2rem', fontSize: '16px' }}>
              Stop
            </button>
          ) : (
            <button type="button" onClick={start} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '16px' }}>
              Start
            </button>
          )}
        </div>

        {error && (
          <div
            className="mt-6 rounded-[12px] p-4 text-[14px]"
            style={{ background: 'rgba(214,57,35,0.06)', border: '1px solid rgba(214,57,35,0.25)', color: '#A52917' }}
          >
            {error}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link to="/tuner/advanced" className="text-ember-500 text-[14px] hover:underline">
            Need more detail? Open the chromatic tuner&nbsp;›
          </Link>
        </div>

        {!listening && !error && (
          <div className="mt-10 card" style={{ padding: '1.75rem 2rem' }}>
            <div className="eyebrow mb-3">If a string won't light up</div>
            <ul className="text-[15px] text-cream-50/75 space-y-2 list-disc pl-5 leading-snug">
              <li>Mute the strings you're not tuning so the tuner only hears one note.</li>
              <li>Pluck firmly. Whisper-quiet plucks fade too fast to read.</li>
              <li>For acoustic, point the soundhole at your phone.</li>
              <li>Quiet room helps — AC, traffic, and TVs throw the reading.</li>
            </ul>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
