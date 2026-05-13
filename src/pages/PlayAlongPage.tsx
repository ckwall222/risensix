import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import {
  PlayAlongEngine,
  formatTime,
  type PlayAlongStatus,
} from '../lib/playAlongEngine'

const SPEED_MIN = 0.25
const SPEED_MAX = 1.5
const PITCH_MIN = -12
const PITCH_MAX = 12
const ACCEPT = 'audio/mpeg,audio/mp3,audio/mp4,audio/m4a,audio/x-m4a,audio/wav,audio/x-wav,audio/ogg,audio/flac,audio/aac,audio/*'

export function PlayAlongPage() {
  const engineRef = useRef<PlayAlongEngine | null>(null)
  if (engineRef.current === null) {
    engineRef.current = new PlayAlongEngine()
  }
  const engine = engineRef.current

  const [status, setStatus] = useState<PlayAlongStatus>(() => engine.getStatus())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const unsub = engine.subscribe(setStatus)
    return () => {
      unsub()
      engine.dispose()
      engineRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      setLoading(true)
      try {
        await engine.load(file)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not decode that file.'
        setError(`${msg} Try an MP3, M4A, WAV, OGG, or FLAC.`)
      } finally {
        setLoading(false)
      }
    },
    [engine],
  )

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
    e.target.value = ''
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }
  const onDragLeave = () => setDragging(false)
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  const speedPct = Math.round(status.speed * 100)
  const speedLabel = useMemo(() => {
    if (status.speed < 0.5) return 'Very slow'
    if (status.speed < 0.75) return 'Slow'
    if (status.speed < 0.95) return 'Easier'
    if (status.speed < 1.05) return 'Normal'
    if (status.speed < 1.25) return 'Push'
    return 'Fast'
  }, [status.speed])

  const pitchLabel = useMemo(() => {
    if (status.pitchSemitones === 0) return 'Concert pitch'
    const sign = status.pitchSemitones > 0 ? 'up' : 'down'
    const n = Math.abs(status.pitchSemitones)
    return `${n} semitone${n === 1 ? '' : 's'} ${sign}`
  }, [status.pitchSemitones])

  const seekValue = status.durationSec
    ? Math.round((status.currentSec / status.durationSec) * 1000)
    : 0

  return (
    <AppLayout>
      {/* Hero */}
      <section className="pt-14 md:pt-20 pb-6 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <Link to="/dashboard" className="btn-link text-ember-500 text-[14px]">← Back home</Link>
          <div className="eyebrow-hero mt-6">Play Along</div>
          <h1 className="h-display text-5xl md:text-7xl mt-2 max-w-[860px] mx-auto">
            Slow it down.<span className="block text-gold-100">Keep the key.</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-cream-50/75 max-w-[640px] mx-auto leading-snug tracking-[-0.012em]">
            Drop in a song you own. Drag the tempo to fifty percent and lift the lick — same pitch, half the speed.
          </p>
        </div>
      </section>

      <div className="max-w-[1080px] mx-auto px-5 sm:px-6 pb-14">
        {!status.loaded ? (
          <DropZone
            dragging={dragging}
            loading={loading}
            error={error}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onBrowse={() => fileInputRef.current?.click()}
          />
        ) : (
          <div className="space-y-3.5">
            {/* Track + transport */}
            <div className="rounded-[18px] bg-black text-white overflow-hidden relative">
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(900px 480px at 70% 30%, rgba(255,134,116,0.16), transparent 60%), radial-gradient(700px 460px at 20% 80%, rgba(41,151,255,0.10), transparent 60%)',
                }}
              />
              <div className="relative p-8 md:p-12">
                <div className="flex items-baseline justify-between flex-wrap gap-3 mb-8">
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold tracking-[0.10em] uppercase text-white/70">
                      Now playing
                    </div>
                    <div
                      className="font-display font-semibold tracking-[-0.022em] text-2xl md:text-3xl truncate max-w-full mt-1"
                      title={status.fileName ?? undefined}
                    >
                      {status.fileName}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[14px] text-[#2997FF] hover:underline"
                  >
                    Load another&nbsp;›
                  </button>
                </div>

                <div className="flex items-center gap-5 mb-4">
                  <button
                    type="button"
                    onClick={() => engine.toggle()}
                    className="btn"
                    style={{ background: '#FFFFFF', color: '#1D1D1F', padding: '0.85rem 2rem', minWidth: '7.5rem', fontWeight: 600 }}
                  >
                    {status.playing ? 'Pause' : 'Play'}
                  </button>
                  <div className="font-mono text-[15px] text-white/80 tracking-tight">
                    <span className="text-white">{formatTime(status.currentSec)}</span>
                    <span className="text-white/40"> / </span>
                    <span>{formatTime(status.durationSec)}</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={1}
                  value={seekValue}
                  onChange={(e) => engine.seekPercent(Number(e.target.value) / 1000)}
                  className="w-full play-along-seek"
                  aria-label="Seek"
                />
              </div>
              <style>{`
                .play-along-seek::-webkit-slider-runnable-track { background: rgba(255,255,255,0.18); }
                .play-along-seek::-moz-range-track { background: rgba(255,255,255,0.18); }
              `}</style>
            </div>

            {/* Speed + Pitch — two-up card row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="card" style={{ padding: '2rem 2rem 2.25rem' }}>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="eyebrow">Speed</div>
                  <button
                    type="button"
                    onClick={() => engine.setSpeed(1.0)}
                    className="btn-link text-ember-500 text-[14px]"
                  >
                    Reset
                  </button>
                </div>
                <div className="text-center mb-5">
                  <div className="font-display font-semibold tracking-[-0.03em] text-7xl md:text-8xl text-cream-50 leading-none">
                    {speedPct}
                    <span className="text-3xl md:text-4xl text-gold-100 align-top ml-1">%</span>
                  </div>
                  <div className="mt-2 text-[13px] text-gold-500 font-semibold">
                    {speedLabel} · pitch preserved
                  </div>
                </div>
                <input
                  type="range"
                  min={SPEED_MIN}
                  max={SPEED_MAX}
                  step={0.01}
                  value={status.speed}
                  onChange={(e) => engine.setSpeed(Number(e.target.value))}
                  className="w-full"
                  aria-label="Playback speed"
                />
                <div className="flex items-center justify-between text-[12px] text-gold-100 mt-1.5 mb-4">
                  <span>{Math.round(SPEED_MIN * 100)}%</span>
                  <span>100%</span>
                  <span>{Math.round(SPEED_MAX * 100)}%</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center flex-wrap">
                  {[0.5, 0.65, 0.75, 0.85, 1.0].map((s) => {
                    const isActive = Math.abs(status.speed - s) < 0.005
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => engine.setSpeed(s)}
                        className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition ${
                          isActive
                            ? 'bg-cream-50 text-night-900'
                            : 'bg-black/[0.05] text-cream-50 hover:bg-black/[0.10]'
                        }`}
                      >
                        {Math.round(s * 100)}%
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="card" style={{ padding: '2rem 2rem 2.25rem' }}>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="eyebrow">Pitch</div>
                  <button
                    type="button"
                    onClick={() => engine.setPitchSemitones(0)}
                    className="btn-link text-ember-500 text-[14px]"
                  >
                    Reset
                  </button>
                </div>
                <div className="text-center mb-5">
                  <div className="font-display font-semibold tracking-[-0.03em] text-6xl md:text-7xl text-cream-50 leading-none">
                    {status.pitchSemitones > 0 ? '+' : ''}
                    {status.pitchSemitones}
                    <span className="text-2xl md:text-3xl text-gold-100 align-top ml-2">st</span>
                  </div>
                  <div className="mt-2 text-[13px] text-gold-500 font-semibold">
                    {pitchLabel}
                  </div>
                </div>
                <input
                  type="range"
                  min={PITCH_MIN}
                  max={PITCH_MAX}
                  step={1}
                  value={status.pitchSemitones}
                  onChange={(e) => engine.setPitchSemitones(Number(e.target.value))}
                  className="w-full"
                  aria-label="Pitch in semitones"
                />
                <div className="flex items-center justify-between text-[12px] text-gold-100 mt-1.5 mb-4">
                  <span>−12 st</span>
                  <span>0</span>
                  <span>+12 st</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <PillButton onClick={() => engine.setPitchSemitones(status.pitchSemitones - 1)} label="−1 st" />
                  <PillButton onClick={() => engine.setPitchSemitones(status.pitchSemitones + 1)} label="+1 st" />
                </div>
              </div>
            </div>

            {/* Volume + tips */}
            <div className="card" style={{ padding: '1.75rem 2rem' }}>
              <div className="eyebrow mb-3">Volume</div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={status.volume}
                onChange={(e) => engine.setVolume(Number(e.target.value))}
                className="w-full"
                aria-label="Volume"
              />
            </div>

            <div className="card" style={{ padding: '2rem 2.25rem' }}>
              <div className="eyebrow mb-3">Lift a lick the right way</div>
              <ul className="text-[15px] text-cream-50/80 space-y-2 list-disc pl-5 leading-snug">
                <li>
                  <strong className="text-cream-50 font-semibold">Start at fifty percent.</strong>{' '}
                  Sing the phrase first. If you can't sing it, you can't play it.
                </li>
                <li>
                  <strong className="text-cream-50 font-semibold">Find the root.</strong> Use the
                  pitch slider only if your guitar is tuned a half step down (set it to +1) or you
                  need to match a horn key.
                </li>
                <li>
                  <strong className="text-cream-50 font-semibold">Loop the hard bar.</strong> Drag
                  the scrub bar back two beats before the lick and run it ten times in a row.
                </li>
                <li>
                  <strong className="text-cream-50 font-semibold">Climb the ladder.</strong>{' '}
                  50% → 65% → 75% → 85% → full speed. Each tier should be clean before you move up.
                </li>
              </ul>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          onChange={onFileInputChange}
          className="hidden"
        />
      </div>
    </AppLayout>
  )
}

function DropZone(props: {
  dragging: boolean
  loading: boolean
  error: string | null
  onDragOver: (e: DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (e: DragEvent<HTMLDivElement>) => void
  onBrowse: () => void
}) {
  const { dragging, loading, error, onDragOver, onDragLeave, onDrop, onBrowse } = props
  return (
    <div>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className="rounded-[18px] text-center transition"
        style={{
          background: dragging ? 'rgba(0,102,204,0.06)' : '#FFFFFF',
          border: `2px dashed ${dragging ? '#0066CC' : 'rgba(0,0,0,0.14)'}`,
          padding: '4.5rem 1.5rem',
        }}
      >
        <div className="eyebrow">Drop a track</div>
        <div className="h-display text-3xl md:text-4xl mt-2">
          {loading ? 'Decoding…' : 'Drop an audio file here'}
        </div>
        <p className="mt-3 text-[16px] text-cream-50/70 max-w-[440px] mx-auto leading-snug">
          MP3, M4A, WAV, OGG, or FLAC. Stays on this device — nothing is uploaded. Use a song you own.
        </p>
        <div className="mt-7">
          <button
            type="button"
            onClick={onBrowse}
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.75rem' }}
          >
            Browse files
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-4 text-[14px] text-gold-500 font-medium">{error}</div>
      )}
      <p className="mt-8 text-[13px] text-gold-100 leading-relaxed max-w-[640px] mx-auto text-center">
        Streaming services like Spotify and Apple Music encrypt their audio, so a practice tool
        can't slow them down. Export the song from a file you own, or use one of your own recordings.
      </p>
    </div>
  )
}

function PillButton({ onClick, label }: { onClick: () => void; label: string }) {
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
