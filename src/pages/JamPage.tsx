import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { ChordDiagram } from '../components/ChordDiagram'
import {
  startJam,
  stopJam,
  setBpm,
  setKey as setEngineKey,
  setProgression as setEngineProgression,
  setMute,
  subscribe,
} from '../lib/jamEngine'
import { PROGRESSIONS, ALL_KEYS, type Progression, type ResolvedBar } from '../lib/progressions'

export function JamPage() {
  const [keyRoot, setKeyRoot] = useState('A')
  const [progression, setProgression] = useState<Progression>(PROGRESSIONS[0])
  const [bpm, setBpmState] = useState(100)
  const [playing, setPlaying] = useState(false)
  const [barIdx, setBarIdx] = useState(-1)
  const [totalBars, setTotalBars] = useState(0)
  const [bar, setBar] = useState<ResolvedBar | null>(null)
  const [muted, setMuted] = useState({ drums: false, bass: false, pad: false })

  useEffect(() => {
    const unsub = subscribe(info => {
      setPlaying(info.isPlaying)
      setBarIdx(info.barIndex)
      setTotalBars(info.totalBars)
      setBar(info.bar)
    })
    return () => {
      unsub()
      stopJam()
    }
  }, [])

  const handlePlay = async () => {
    if (playing) {
      stopJam()
    } else {
      await startJam({ progression, keyRoot, bpm })
    }
  }

  const handleKey = (k: string) => {
    setKeyRoot(k)
    setEngineKey(k)
  }

  const handleProgression = (p: Progression) => {
    setProgression(p)
    setEngineProgression(p)
  }

  const handleBpm = (n: number) => {
    setBpmState(n)
    setBpm(n)
  }

  const toggleMute = (ch: 'drums' | 'bass' | 'pad') => {
    setMuted(prev => {
      const next = { ...prev, [ch]: !prev[ch] }
      setMute(ch, next[ch])
      return next
    })
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <Link to="/dashboard" className="text-[10px] uppercase tracking-[0.28em] text-gold-100 hover:text-cream-50 transition">← Home</Link>
        <div className="eyebrow mt-6 mb-3">Jam Tracks Studio</div>
        <h1 className="h-display text-3xl md:text-5xl tracking-[0.06em] mb-4">Solo over a real groove.</h1>
        <p className="text-cream-50/80 text-base md:text-lg max-w-2xl leading-relaxed mb-10">
          Pick a key, a progression, and a tempo. Drums, bass, and chord pad will hold down the groove while you take the wheel.
        </p>

        {/* Now playing card */}
        <div className="card is-feature p-6 md:p-8 mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
            <div className="flex-1 min-w-0">
              <div className="eyebrow mb-2">{playing ? 'Now playing' : 'Ready'}</div>
              <div className="h-display text-5xl md:text-6xl text-gold-100 tabular-nums">
                {bar?.symbol ?? '—'}
              </div>
              {playing && totalBars > 0 && (
                <div className="text-cream-50/80 text-sm mt-3 tracking-[0.22em] uppercase">
                  Bar {barIdx + 1} of {totalBars}
                </div>
              )}
            </div>
            {bar && <ChordDiagram {...bar.diagram} />}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePlay}
              className="btn btn-primary"
            >
              {playing ? '■ Stop' : '▶ Play'}
            </button>
            <ChannelToggle label="Drums" muted={muted.drums} onClick={() => toggleMute('drums')} />
            <ChannelToggle label="Bass" muted={muted.bass} onClick={() => toggleMute('bass')} />
            <ChannelToggle label="Pad" muted={muted.pad} onClick={() => toggleMute('pad')} />
          </div>
        </div>

        {/* Tempo */}
        <div className="mb-10">
          <div className="eyebrow mb-3">Tempo</div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={50}
              max={200}
              step={1}
              value={bpm}
              onChange={e => handleBpm(Number(e.target.value))}
              className="flex-1 accent-gold-500"
            />
            <span className="text-cream-50 tabular-nums w-20 text-right text-lg">{bpm} BPM</span>
          </div>
        </div>

        {/* Key */}
        <div className="mb-10">
          <div className="eyebrow mb-3">Key</div>
          <div className="flex flex-wrap gap-2">
            {ALL_KEYS.map(k => (
              <button
                key={k}
                type="button"
                onClick={() => handleKey(k)}
                className={`text-sm font-display tracking-wider px-4 py-2 border transition ${
                  k === keyRoot
                    ? 'border-gold-500 bg-gold-500/10 text-gold-100'
                    : 'border-cream-50/[0.12] text-cream-50/80 hover:border-gold-500/50 hover:text-cream-50'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Progression */}
        <div className="mb-10">
          <div className="eyebrow mb-3">Progression</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-cream-50/[0.06]">
            {PROGRESSIONS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleProgression(p)}
                className={`block text-left p-5 transition ${
                  p.id === progression.id
                    ? 'bg-gold-500/10 border-l-2 border-gold-500'
                    : 'bg-night-900 hover:bg-night-700/30 border-l-2 border-transparent'
                }`}
              >
                <div className="h-display text-lg mb-1">{p.name}</div>
                <p className="text-cream-50/80 text-sm leading-relaxed">{p.summary}</p>
                <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-cream-50/60">
                  {p.bars.length} bars · {p.drumStyle}
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-cream-50/60 mt-8">
          Tip: solo over the chord shown above. The notes inside the chord are always safe; the rest of the diatonic scale gives you melodic options.
        </p>
      </div>
    </AppLayout>
  )
}

function ChannelToggle({ label, muted, onClick }: { label: string; muted: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11px] uppercase tracking-[0.22em] px-3.5 py-2 border transition ${
        muted
          ? 'border-cream-50/[0.12] text-cream-50/40'
          : 'border-gold-500/40 text-gold-100 bg-gold-500/5'
      }`}
      aria-pressed={!muted}
    >
      {muted ? `${label} muted` : label}
    </button>
  )
}
