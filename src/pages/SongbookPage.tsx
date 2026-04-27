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
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <Link to="/dashboard" className="text-[10px] uppercase tracking-[0.28em] text-gold-100 hover:text-cream-50 transition">← Home</Link>
        <div className="eyebrow mt-6 mb-3">Songbook</div>
        <h1 className="h-display text-3xl md:text-5xl tracking-[0.06em] mb-4">Songs you can actually play.</h1>
        <p className="text-cream-50/80 text-base md:text-lg max-w-2xl leading-relaxed mb-10">
          Public-domain folk and traditional songs with chord charts that scroll at song tempo. Beginner-friendly arrangements — most use three or four chords you already know.
        </p>

        {loading ? (
          <div className="text-sm text-cream-50/80 tracking-widest uppercase">Loading…</div>
        ) : songs.length === 0 ? (
          <div className="text-cream-50/70 text-sm">No songs yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-cream-50/[0.06]">
            {songs.map(s => (
              <Link
                key={s.id}
                to={`/songs/${s.slug}`}
                className="block bg-night-900 hover:bg-night-700/30 transition p-6 group"
              >
                <div className="flex items-baseline justify-between mb-3">
                  <span className="prefix-num">DIFF {s.difficulty}</span>
                  <span className="text-cream-50/80 text-[10px] uppercase tracking-[0.22em]">{s.bpm} BPM</span>
                </div>
                <div className="h-display text-xl mb-1 group-hover:text-gold-100 transition">{s.title}</div>
                {s.composer && <p className="text-cream-50/60 text-xs italic mb-2">{s.composer}</p>}
                <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] mt-3">
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
