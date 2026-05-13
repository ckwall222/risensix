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
      <section className="pt-14 md:pt-20 pb-6 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <Link to="/dashboard" className="btn-link text-ember-500 text-[14px]">← Back home</Link>
          <div className="eyebrow-hero mt-6">Jam Tracks Studio</div>
          <h1 className="h-display text-5xl md:text-6xl mt-2">
            Solo over<span className="block text-gold-100">a real groove.</span>
          </h1>
          <p className="mt-4 text-lg text-cream-50/75 max-w-[640px] mx-auto leading-snug tracking-[-0.012em]">
            Pick a key, a progression, a tempo. Drums, bass, and chord pad hold down the groove. You take the wheel.
          </p>
        </div>
      </section>

      <div className="max-w-[960px] mx-auto px-5 sm:px-6 pb-14">
        {/* Now playing — dark feature card */}
        <div className="rounded-[18px] bg-black text-white overflow-hidden relative mb-8">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(700px 360px at 80% 20%, rgba(255,134,116,0.15), transparent 60%), radial-gradient(560px 320px at 20% 80%, rgba(41,151,255,0.10), transparent 60%)',
            }}
          />
          <div className="relative p-7 md:p-9">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold tracking-[0.10em] uppercase text-white/70">
                  {playing ? 'Now playing' : 'Ready'}
                </div>
                <div className="font-display font-semibold tracking-[-0.03em] text-6xl md:text-7xl text-white tabular-nums mt-2">
                  {bar?.symbol ?? '—'}
                </div>
                {playing && totalBars > 0 && (
                  <div className="text-white/70 text-[14px] mt-3 font-medium">
                    Bar {barIdx + 1} of {totalBars}
                  </div>
                )}
              </div>
              {bar && <ChordDiagram {...bar.diagram} />}
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handlePlay}
                className="btn"
                style={{ background: '#FFFFFF', color: '#1D1D1F', padding: '0.7rem 1.5rem', fontWeight: 600 }}
              >
                {playing ? '■ Stop' : '▶ Play'}
              </button>
              <ChannelToggle label="Drums" muted={muted.drums} onClick={() => toggleMute('drums')} />
              <ChannelToggle label="Bass" muted={muted.bass} onClick={() => toggleMute('bass')} />
              <ChannelToggle label="Pad" muted={muted.pad} onClick={() => toggleMute('pad')} />
            </div>
          </div>
        </div>

        {/* Tempo */}
        <div className="card mb-3.5" style={{ padding: '1.75rem 2rem' }}>
          <div className="eyebrow mb-3">Tempo</div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={50}
              max={200}
              step={1}
              value={bpm}
              onChange={e => handleBpm(Number(e.target.value))}
              className="flex-1"
              style={{ accentColor: '#0066CC' }}
              aria-label="Tempo"
            />
            <span className="text-cream-50 tabular-nums w-24 text-right text-[18px] font-semibold">
              {bpm} BPM
            </span>
          </div>
        </div>

        {/* Key */}
        <div className="card mb-3.5" style={{ padding: '1.75rem 2rem' }}>
          <div className="eyebrow mb-3">Key</div>
          <div className="flex flex-wrap gap-2">
            {ALL_KEYS.map(k => (
              <button
                key={k}
                type="button"
                onClick={() => handleKey(k)}
                className="px-4 py-2 rounded-full text-[14px] font-medium transition"
                style={{
                  border: `1px solid ${k === keyRoot ? '#0066CC' : 'rgba(0,0,0,0.10)'}`,
                  background: k === keyRoot ? '#0066CC' : '#FFFFFF',
                  color: k === keyRoot ? '#FFFFFF' : '#1D1D1F',
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Progression */}
        <div className="card" style={{ padding: '1.75rem 2rem' }}>
          <div className="eyebrow mb-3">Progression</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROGRESSIONS.map(p => {
              const isActive = p.id === progression.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProgression(p)}
                  className="block text-left rounded-[12px] p-5 transition"
                  style={{
                    border: `1px solid ${isActive ? '#0066CC' : 'rgba(0,0,0,0.10)'}`,
                    background: isActive ? 'rgba(0,102,204,0.05)' : '#FFFFFF',
                  }}
                >
                  <div className="h-display text-lg mb-1">{p.name}</div>
                  <p className="text-cream-50/70 text-[14px] leading-snug">{p.summary}</p>
                  <div className="mt-2 text-[12px] text-gold-100 font-medium">
                    {p.bars.length} bars · {p.drumStyle}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <p className="text-[13px] text-gold-100 mt-6 leading-snug">
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
      className="px-3.5 py-1.5 rounded-full text-[13px] font-medium transition"
      style={{
        border: `1px solid ${muted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.30)'}`,
        background: muted ? 'transparent' : 'rgba(255,255,255,0.12)',
        color: muted ? 'rgba(255,255,255,0.45)' : '#FFFFFF',
      }}
      aria-pressed={!muted}
    >
      {muted ? `${label} muted` : label}
    </button>
  )
}
