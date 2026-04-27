import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { ChordChart } from '../components/ChordChart'
import { Markdown } from '../components/Markdown'
import { fetchSongBySlug, type Song } from '../lib/songs'

export function SongDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    let mounted = true
    setLoading(true)
    fetchSongBySlug(slug).then(s => {
      if (!mounted) return
      setSong(s)
      setLoading(false)
    })
    return () => { mounted = false }
  }, [slug])

  if (loading) {
    return <AppLayout><div className="max-w-3xl mx-auto px-6 py-16 text-cream-50/80">Loading…</div></AppLayout>
  }

  if (!song) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-6 py-16">
          <Link to="/songs" className="text-[10px] uppercase tracking-[0.28em] text-gold-100 hover:text-cream-50 transition">← Songbook</Link>
          <h1 className="h-display text-3xl mt-6">Song not found</h1>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <Link to="/songs" className="text-[10px] uppercase tracking-[0.28em] text-gold-100 hover:text-cream-50 transition">← Songbook</Link>
        <div className="eyebrow mt-6 mb-3">{song.era ?? 'Traditional'}</div>
        <h1 className="h-display text-4xl md:text-5xl tracking-[0.06em]">{song.title}</h1>
        {song.composer && <p className="text-cream-50/60 italic mt-2">{song.composer}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em]">
          <span className="pill">{song.key_root} {song.key_quality}</span>
          <span className="pill">{song.bpm} BPM</span>
          <span className="pill">{song.time_signature}</span>
          {song.capo > 0 && <span className="pill">Capo {song.capo}</span>}
          <span className="pill">Difficulty {song.difficulty}</span>
        </div>

        {song.intro && (
          <>
            <div className="hairline mt-8 mb-6" />
            <Markdown>{song.intro}</Markdown>
          </>
        )}

        <div className="hairline mt-8 mb-6" />
        <ChordChart sections={song.sections} bpm={song.bpm} />

        {song.source_note && (
          <p className="mt-8 text-xs text-cream-50/60 leading-relaxed">
            {song.source_note}
          </p>
        )}
      </div>
    </AppLayout>
  )
}
