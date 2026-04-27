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
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <Link to="/dashboard" className="text-[10px] uppercase tracking-[0.28em] text-gold-500 hover:text-gold-100 transition">← Home</Link>
        <div className="eyebrow mt-6 mb-3">Tools</div>
        <h1 className="h-display text-4xl md:text-5xl tracking-[0.06em]">Metronome</h1>
        <p className="text-lg text-cream-50/70 mt-4 max-w-2xl leading-relaxed">
          A steady click holds your timing together. Set the tempo, set the time signature, play to the pulse.
        </p>

        <div className="hairline mt-8 mb-10" />

        {/* BPM display */}
        <div className="text-center mb-6">
          <div className="font-display text-7xl md:text-9xl tracking-[0.04em] text-cream-50 leading-none">
            {bpm}
          </div>
          <div className="text-[10px] uppercase tracking-[0.32em] text-gold-500 mt-2">
            BPM · {tempoNameFor(bpm)}
          </div>
        </div>

        {/* BPM controls */}
        <div className="flex items-center gap-2 justify-center mb-3">
          <button type="button" onClick={() => adjust(-5)} className="btn btn-ghost" style={{ padding: '0.6rem 0.9rem' }}>−5</button>
          <button type="button" onClick={() => adjust(-1)} className="btn btn-ghost" style={{ padding: '0.6rem 0.9rem' }}>−1</button>
          <button type="button" onClick={() => adjust(1)}  className="btn btn-ghost" style={{ padding: '0.6rem 0.9rem' }}>+1</button>
          <button type="button" onClick={() => adjust(5)}  className="btn btn-ghost" style={{ padding: '0.6rem 0.9rem' }}>+5</button>
        </div>
        <input
          type="range"
          min={BPM_MIN} max={BPM_MAX} step={1}
          value={bpm}
          onChange={e => setBpm(Number(e.target.value))}
          className="w-full accent-ember-500"
          style={{ accentColor: '#E25C2B' }}
        />
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-cream-50/40 mt-1">
          <span>{BPM_MIN}</span>
          <span>{BPM_MAX}</span>
        </div>

        {/* Time signature */}
        <div className="mt-10">
          <div className="eyebrow mb-3">Time signature</div>
          <div className="flex flex-wrap gap-2">
            {SIGNATURES.map(s => {
              const isActive = beatsPerBar === s.beats
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setBeatsPerBar(s.beats)}
                  className={`px-4 py-2 text-[11px] uppercase tracking-[0.22em] border transition ${
                    isActive ? 'border-gold-500 bg-gold-500/10 text-gold-100' : 'border-cream-50/[0.12] text-cream-50/55 hover:border-gold-500/40'
                  }`}
                >
                  {s.id}
                </button>
              )
            })}
          </div>
        </div>

        {/* Beat indicators */}
        <div className="mt-10 mb-10">
          <div className="eyebrow mb-3">Pulse</div>
          <div className="flex gap-3 justify-center">
            {Array.from({ length: beatsPerBar }).map((_, i) => {
              const isCurrent = i === currentBeat
              const isAccent = i === 0
              return (
                <div
                  key={i}
                  className={`h-12 w-12 rounded-full border-2 transition-all ${
                    isCurrent
                      ? isAccent ? 'bg-ember-500 border-ember-500 scale-110' : 'bg-gold-500 border-gold-500 scale-110'
                      : isAccent ? 'border-ember-500/50 bg-ember-500/5' : 'border-cream-50/[0.12]'
                  }`}
                />
              )
            })}
          </div>
        </div>

        {/* Start / stop */}
        <div className="text-center">
          {running ? (
            <button type="button" onClick={stop} className="btn btn-ghost" style={{ padding: '0.85rem 2.25rem' }}>
              Stop
            </button>
          ) : (
            <button type="button" onClick={start} className="btn btn-primary" style={{ padding: '0.85rem 2.25rem' }}>
              Start
            </button>
          )}
        </div>

        {/* Tips */}
        {!running && (
          <div className="mt-12 card" style={{ padding: '1.25rem 1.5rem' }}>
            <div className="eyebrow mb-3">Practice with intention</div>
            <ul className="text-sm text-cream-50/70 space-y-2 list-disc pl-5">
              <li><strong className="text-cream-50">Slower than feels natural.</strong> If your target is 120, practice at 80 until it's clean. Then 90. Then 100.</li>
              <li><strong className="text-cream-50">Subdivide.</strong> For 8th notes, count "1-and-2-and-3-and-4-and." For 16ths, "1-e-and-a."</li>
              <li><strong className="text-cream-50">Lock to the click.</strong> Your goal is to make the click disappear into your playing — when you hit a beat exactly, the click sounds quieter.</li>
              <li><strong className="text-cream-50">Vary the pulse.</strong> Try the click on beats 2 and 4 only (the backbeat). Or only on beat 1. Different feel, same internal time.</li>
            </ul>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
