import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { fetchAllSongs, type Song } from '../lib/songs'

export function SongbookPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchAllSongs().then(s => {
      if (!mounted) return
      setSongs(s)
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  return (
    <AppLayout>
      <section className="pt-14 md:pt-20 pb-6 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <Link to="/dashboard" className="btn-link text-ember-500 text-[14px]">← Back home</Link>
          <div className="eyebrow-hero mt-6">Songbook</div>
          <h1 className="h-display text-5xl md:text-6xl mt-2">
            Songs you can<span className="block text-gold-100">actually play.</span>
          </h1>
          <p className="mt-4 text-lg text-cream-50/75 max-w-[640px] mx-auto leading-snug tracking-[-0.012em]">
            Public-domain folk and traditional songs with auto-scrolling chord charts. Most use three or four chords you already know.
          </p>
        </div>
      </section>

      <div className="max-w-[1080px] mx-auto px-5 sm:px-6 pb-14">
        {loading ? (
          <div className="text-[15px] text-cream-50/65">Loading…</div>
        ) : songs.length === 0 ? (
          <div className="text-cream-50/70 text-[15px]">No songs yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {songs.map(s => (
              <Link key={s.id} to={`/songs/${s.slug}`} className="card group block" style={{ padding: '1.5rem 1.75rem' }}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[13px] text-gold-500 font-semibold">DIFF {s.difficulty}</span>
                  <span className="text-gold-100 text-[12px] font-medium">{s.bpm} BPM</span>
                </div>
                <div className="h-display text-xl mb-1 group-hover:text-ember-500 transition">{s.title}</div>
                {s.composer && <p className="text-gold-100 text-[13px] italic mb-2">{s.composer}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="pill">{s.key_root} {s.key_quality}</span>
                  {s.capo > 0 && <span className="pill">Capo {s.capo}</span>}
                  {s.era && <span className="pill">{s.era}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
