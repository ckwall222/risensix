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
        <div className="max-w-[840px] mx-auto px-6 py-16">
          <Link to="/songs" className="btn-link text-ember-500 text-[14px]">‹ Songbook</Link>
          <h1 className="h-display text-3xl mt-6">Song not found</h1>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-[840px] mx-auto px-5 sm:px-6 pt-10 md:pt-14 pb-14">
        <Link to="/songs" className="btn-link text-ember-500 text-[14px]">‹ Songbook</Link>
        <div className="eyebrow-hero mt-4">{song.era ?? 'Traditional'}</div>
        <h1 className="h-display text-4xl md:text-6xl mt-2 leading-[1.05]">{song.title}</h1>
        {song.composer && <p className="text-gold-100 italic mt-2 text-[15px]">{song.composer}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="pill">{song.key_root} {song.key_quality}</span>
          <span className="pill">{song.bpm} BPM</span>
          <span className="pill">{song.time_signature}</span>
          {song.capo > 0 && <span className="pill">Capo {song.capo}</span>}
          <span className="pill">Difficulty {song.difficulty}</span>
        </div>

        {song.intro && (
          <>
            <hr className="hairline mt-8 mb-6" />
            <Markdown>{song.intro}</Markdown>
          </>
        )}

        <hr className="hairline mt-8 mb-6" />
        <ChordChart sections={song.sections} bpm={song.bpm} />

        {song.source_note && (
          <p className="mt-8 text-[13px] text-gold-100 leading-snug">{song.source_note}</p>
        )}
      </div>
    </AppLayout>
  )
}
