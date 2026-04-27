import { useEffect, useMemo, useRef, useState } from 'react'
import { Fretboard, type FretboardNote } from './Fretboard'
import { playSequence, type SequenceNote } from '../lib/audio'

type Props = {
  notes: SequenceNote[]
  bpm: number
  feel: 'straight' | 'shuffle' | 'swing'
  bars: number
}

export function LickPlayer({ notes, bpm, feel, bars }: Props) {
  const [tempoOverride, setTempoOverride] = useState(bpm)
  const [playing, setPlaying] = useState(false)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const stopRef = useRef<(() => void) | null>(null)
  const timeoutsRef = useRef<number[]>([])

  // Compute the fret fretWindow the lick lives in.
  const fretWindow = useMemo(() => {
    const fretted = notes.filter(n => n.fret > 0).map(n => n.fret)
    if (fretted.length === 0) return [0, 5] as [number, number]
    const min = Math.min(...fretted)
    const max = Math.max(...fretted)
    // Round to whole-fret positions, give a one-fret buffer each side.
    return [Math.max(0, min - 1), max + 1] as [number, number]
  }, [notes])

  // Static notation overlay: every note shown on the board with the beat label.
  const overlay: FretboardNote[] = useMemo(() => {
    return notes.map((n, i) => ({
      string: n.string,
      fret: n.fret,
      label: String(i + 1),
      emphasis: i === activeIdx ? 'root' : 'normal',
    }))
  }, [notes, activeIdx])

  useEffect(() => {
    return () => {
      stopRef.current?.()
      for (const t of timeoutsRef.current) clearTimeout(t)
    }
  }, [])

  const onPlay = async () => {
    if (playing) {
      stopRef.current?.()
      for (const t of timeoutsRef.current) clearTimeout(t)
      timeoutsRef.current = []
      setPlaying(false)
      setActiveIdx(null)
      return
    }
    setPlaying(true)
    const handle = await playSequence(notes, { bpm: tempoOverride, swing: feel !== 'straight' })
    stopRef.current = handle.stop

    // Visual highlight scheduler — separate from audio scheduler.
    const beatSec = 60 / tempoOverride
    notes.forEach((n, i) => {
      const t = window.setTimeout(() => setActiveIdx(i), n.beat * beatSec * 1000)
      timeoutsRef.current.push(t)
    })
    const endT = window.setTimeout(() => {
      setPlaying(false)
      setActiveIdx(null)
    }, (handle.durationSec + 0.3) * 1000)
    timeoutsRef.current.push(endT)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <button
          type="button"
          onClick={onPlay}
          className="btn btn-primary"
          aria-label={playing ? 'Stop lick' : 'Play lick'}
        >
          {playing ? '■ Stop' : '▶ Play'}
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-md">
          <label htmlFor="lick-tempo" className="text-[10px] uppercase tracking-[0.22em] text-cream-50/80 shrink-0">
            Tempo
          </label>
          <input
            id="lick-tempo"
            type="range"
            min={40}
            max={200}
            step={5}
            value={tempoOverride}
            onChange={e => setTempoOverride(Number(e.target.value))}
            className="flex-1 accent-gold-500"
          />
          <span className="text-cream-50 tabular-nums w-14 text-right text-sm">{tempoOverride} BPM</span>
        </div>
        <span className="text-cream-50/80 text-[10px] uppercase tracking-[0.22em]">{bars} bar{bars === 1 ? '' : 's'} · {feel}</span>
      </div>
      <Fretboard frets={fretWindow} notes={overlay} />
      <p className="text-xs text-cream-50/60 mt-3 leading-relaxed">
        Numbers on the board are the order the notes are played. Highlighted note (gold) is the current note during playback.
      </p>
    </div>
  )
}
