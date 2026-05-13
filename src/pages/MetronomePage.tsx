import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as Tone from 'tone'
import { AppLayout } from '../components/AppLayout'

const BPM_MIN = 40
const BPM_MAX = 240
const SIGNATURES = [
  { id: '2/4', beats: 2 },
  { id: '3/4', beats: 3 },
  { id: '4/4', beats: 4 },
  { id: '6/8', beats: 6 },
]

const TEMPO_NAMES: { range: [number, number]; name: string }[] = [
  { range: [40, 60],   name: 'Largo'      },
  { range: [60, 76],   name: 'Adagio'     },
  { range: [76, 108],  name: 'Andante'    },
  { range: [108, 120], name: 'Moderato'   },
  { range: [120, 156], name: 'Allegro'    },
  { range: [156, 200], name: 'Vivace'     },
  { range: [200, 241], name: 'Presto'     },
]

function tempoNameFor(bpm: number): string {
  return TEMPO_NAMES.find(t => bpm >= t.range[0] && bpm < t.range[1])?.name ?? '—'
}

export function MetronomePage() {
  const [bpm, setBpm] = useState(100)
  const [beatsPerBar, setBeatsPerBar] = useState(4)
  const [running, setRunning] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(-1)

  const synthRef = useRef<Tone.Synth | null>(null)
  const eventIdRef = useRef<number | null>(null)
  const beatCounterRef = useRef(0)
  const beatsPerBarRef = useRef(beatsPerBar)

  // Keep ref in sync — ticker reads it without re-subscribing
  useEffect(() => { beatsPerBarRef.current = beatsPerBar }, [beatsPerBar])

  // Live tempo updates while running
  useEffect(() => {
    Tone.getTransport().bpm.rampTo(bpm, 0.05)
  }, [bpm])

  const start = async () => {
    await Tone.start()
    if (!synthRef.current) {
      synthRef.current = new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
      } as Partial<Tone.SynthOptions>).toDestination()
      synthRef.current.volume.value = -8
    }
    const transport = Tone.getTransport()
    transport.bpm.value = bpm
    beatCounterRef.current = 0

    eventIdRef.current = transport.scheduleRepeat((time) => {
      const beat = beatCounterRef.current
      const beatInBar = beat % beatsPerBarRef.current
      const isAccent = beatInBar === 0
      synthRef.current?.triggerAttackRelease(
        isAccent ? 'C6' : 'C5',
        isAccent ? '16n' : '32n',
        time,
      )
      Tone.getDraw().schedule(() => setCurrentBeat(beatInBar), time)
      beatCounterRef.current = beat + 1
    }, '4n')

    transport.start()
    setRunning(true)
  }

  const stop = () => {
    const transport = Tone.getTransport()
    transport.stop()
    if (eventIdRef.current !== null) {
      transport.clear(eventIdRef.current)
      eventIdRef.current = null
    }
    transport.cancel()
    setRunning(false)
    setCurrentBeat(-1)
    beatCounterRef.current = 0
  }

  useEffect(() => () => {
    stop()
    synthRef.current?.dispose()
    synthRef.current = null
  }, [])

  const adjust = (delta: number) => setBpm(b => Math.max(BPM_MIN, Math.min(BPM_MAX, b + delta)))

  return (
    <AppLayout>
      <section className="pt-14 md:pt-20 pb-6 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <Link to="/dashboard" className="btn-link text-ember-500 text-[14px]">← Back home</Link>
          <div className="eyebrow-hero mt-6">Tools · Metronome</div>
          <h1 className="h-display text-5xl md:text-6xl mt-2">
            A steady click.<span className="block text-gold-100">A better player.</span>
          </h1>
          <p className="mt-4 text-lg text-cream-50/75 max-w-[560px] mx-auto leading-snug tracking-[-0.012em]">
            Set the tempo. Set the time signature. Play to the pulse.
          </p>
        </div>
      </section>

      <div className="max-w-[640px] mx-auto px-5 sm:px-6 pb-14">
        <div className="card" style={{ padding: '2.5rem 2rem 2.25rem' }}>
          {/* BPM display */}
          <div className="text-center mb-5">
            <div className="font-display font-semibold tracking-[-0.03em] text-7xl md:text-8xl text-cream-50 leading-none">
              {bpm}
            </div>
            <div className="text-[13px] text-gold-500 mt-2 font-semibold">
              BPM · {tempoNameFor(bpm)}
            </div>
          </div>

          {/* BPM controls */}
          <div className="flex items-center gap-2 justify-center mb-4 flex-wrap">
            <PillStep onClick={() => adjust(-5)} label="−5" />
            <PillStep onClick={() => adjust(-1)} label="−1" />
            <PillStep onClick={() => adjust(1)} label="+1" />
            <PillStep onClick={() => adjust(5)} label="+5" />
          </div>
          <input
            type="range"
            min={BPM_MIN} max={BPM_MAX} step={1}
            value={bpm}
            onChange={e => setBpm(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: '#0066CC' }}
            aria-label="BPM"
          />
          <div className="flex items-center justify-between text-[12px] text-gold-100 mt-1.5">
            <span>{BPM_MIN}</span>
            <span>{BPM_MAX}</span>
          </div>

          {/* Time signature */}
          <div className="mt-8">
            <div className="eyebrow mb-3">Time signature</div>
            <div className="flex flex-wrap gap-2">
              {SIGNATURES.map(s => {
                const isActive = beatsPerBar === s.beats
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setBeatsPerBar(s.beats)}
                    className="px-4 py-2 rounded-full text-[14px] font-medium transition"
                    style={{
                      border: `1px solid ${isActive ? '#0066CC' : 'rgba(0,0,0,0.10)'}`,
                      background: isActive ? '#0066CC' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#1D1D1F',
                    }}
                  >
                    {s.id}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Beat indicators */}
          <div className="mt-8 mb-8">
            <div className="eyebrow mb-3">Pulse</div>
            <div className="flex gap-3 justify-center">
              {Array.from({ length: beatsPerBar }).map((_, i) => {
                const isCurrent = i === currentBeat
                const isAccent = i === 0
                return (
                  <div
                    key={i}
                    className="h-12 w-12 rounded-full transition-all"
                    style={{
                      background: isCurrent
                        ? (isAccent ? '#D63923' : '#0066CC')
                        : '#FFFFFF',
                      border: isCurrent
                        ? `2px solid ${isAccent ? '#D63923' : '#0066CC'}`
                        : `2px solid ${isAccent ? 'rgba(214,57,35,0.30)' : 'rgba(0,0,0,0.10)'}`,
                      transform: isCurrent ? 'scale(1.10)' : 'scale(1)',
                    }}
                  />
                )
              })}
            </div>
          </div>

          {/* Start / stop */}
          <div className="text-center">
            {running ? (
              <button type="button" onClick={stop} className="btn btn-ghost" style={{ padding: '0.75rem 2rem', fontSize: '16px' }}>
                Stop
              </button>
            ) : (
              <button type="button" onClick={start} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '16px' }}>
                Start
              </button>
            )}
          </div>
        </div>

        {/* Tips */}
        {!running && (
          <div className="mt-6 card" style={{ padding: '1.75rem 2rem' }}>
            <div className="eyebrow mb-3">Practice with intention</div>
            <ul className="text-[15px] text-cream-50/80 space-y-2 list-disc pl-5 leading-snug">
              <li><strong className="text-cream-50 font-semibold">Slower than feels natural.</strong> If your target is 120, practice at 80 until it's clean. Then 90. Then 100.</li>
              <li><strong className="text-cream-50 font-semibold">Subdivide.</strong> For 8th notes, count "1-and-2-and-3-and-4-and." For 16ths, "1-e-and-a."</li>
              <li><strong className="text-cream-50 font-semibold">Lock to the click.</strong> Your goal is to make the click disappear into your playing — when you hit a beat exactly, the click sounds quieter.</li>
              <li><strong className="text-cream-50 font-semibold">Vary the pulse.</strong> Try the click on beats 2 and 4 only (the backbeat). Or only on beat 1. Different feel, same internal time.</li>
            </ul>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function PillStep({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-black/[0.05] text-cream-50 hover:bg-black/[0.10] transition"
    >
      {label}
    </button>
  )
}
