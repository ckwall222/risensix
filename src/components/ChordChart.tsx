import { useEffect, useRef, useState } from 'react'
import { type SongSection, parseChordLine } from '../lib/songs'
import * as Tone from 'tone'

type Props = {
  sections: SongSection[]
  bpm: number
}

/**
 * Renders a song's lyrics with chord names floating above the syllable
 * where they're played. Supports auto-scroll synced to the song BPM and
 * a click track for keeping time.
 */
export function ChordChart({ sections, bpm }: Props) {
  const [autoScroll, setAutoScroll] = useState(false)
  const [click, setClick] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(1) // multiplier
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const clickIdRef = useRef<number | null>(null)
  const clickSynthRef = useRef<Tone.MembraneSynth | null>(null)

  // Auto-scroll loop: pixels per second derived from BPM (one bar ≈ a line height).
  useEffect(() => {
    if (!autoScroll) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      return
    }
    const el = containerRef.current
    if (!el) return
    let lastTs = performance.now()
    const pxPerSec = (bpm / 60) * 22 * scrollSpeed // ~22px per beat baseline
    const step = (ts: number) => {
      const dt = (ts - lastTs) / 1000
      lastTs = ts
      el.scrollTop += pxPerSec * dt
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
      if (atBottom) {
        setAutoScroll(false)
        return
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [autoScroll, bpm, scrollSpeed])

  // Click track
  useEffect(() => {
    if (!click) {
      if (clickIdRef.current !== null) {
        Tone.Transport.clear(clickIdRef.current)
        clickIdRef.current = null
      }
      Tone.Transport.stop()
      return
    }
    let cancelled = false
    Tone.start().then(() => {
      if (cancelled) return
      if (!clickSynthRef.current) {
        clickSynthRef.current = new Tone.MembraneSynth({
          pitchDecay: 0.02,
          octaves: 6,
          envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
        }).toDestination()
        clickSynthRef.current.volume.value = -8
      }
      Tone.Transport.bpm.value = bpm
      clickIdRef.current = Tone.Transport.scheduleRepeat(time => {
        clickSynthRef.current?.triggerAttackRelease('C5', '32n', time)
      }, '4n')
      Tone.Transport.start('+0.05')
    })
    return () => {
      cancelled = true
      if (clickIdRef.current !== null) {
        Tone.Transport.clear(clickIdRef.current)
        clickIdRef.current = null
      }
      Tone.Transport.stop()
    }
  }, [click, bpm])

  const restart = () => {
    if (containerRef.current) containerRef.current.scrollTop = 0
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <button
          type="button"
          onClick={() => setAutoScroll(s => !s)}
          className={`btn ${autoScroll ? 'btn-primary' : 'btn-ghost'}`}
        >
          {autoScroll ? '■ Stop scroll' : '▶ Auto-scroll'}
        </button>
        <button
          type="button"
          onClick={() => setClick(c => !c)}
          className={`btn ${click ? 'btn-primary' : 'btn-ghost'}`}
        >
          {click ? '■ Click off' : '🥁 Click on'}
        </button>
        <button type="button" onClick={restart} className="btn btn-ghost">↶ Top</button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-[10px] uppercase tracking-[0.22em] text-cream-50/80">Speed</label>
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.1}
            value={scrollSpeed}
            onChange={e => setScrollSpeed(Number(e.target.value))}
            className="w-32 accent-gold-500"
          />
          <span className="text-cream-50 tabular-nums w-10 text-right text-sm">{scrollSpeed.toFixed(1)}×</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="border border-cream-50/[0.08] bg-night-900/60 max-h-[60vh] overflow-y-auto p-6 md:p-8 leading-loose"
      >
        {sections.map((section, sIdx) => (
          <section key={sIdx} className="mb-8 last:mb-0">
            <div className="eyebrow mb-3">{section.label}</div>
            {section.lines.map((line, lIdx) => (
              <ChordLyricLine key={lIdx} line={line} />
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

function ChordLyricLine({ line }: { line: string }) {
  const segments = parseChordLine(line)
  return (
    <div className="font-mono text-[15px] md:text-base text-cream-50 mb-4 leading-[2.4]">
      <span className="inline-flex flex-wrap gap-y-3">
        {segments.map((seg, i) => (
          <span key={i} className="relative inline-block whitespace-pre">
            {seg.chord && (
              <span className="absolute -top-5 left-0 text-gold-100 font-display tracking-wider text-[13px]">
                {seg.chord}
              </span>
            )}
            <span>{seg.lyric}</span>
          </span>
        ))}
      </span>
    </div>
  )
}
