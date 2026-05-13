import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { fetchAllLicks, GENRE_LABEL, GENRE_ORDER, type Lick, type LickGenre } from '../lib/licks'

export function LicksPage() {
  const [licks, setLicks] = useState<Lick[]>([])
  const [loading, setLoading] = useState(true)
  const [genre, setGenre] = useState<LickGenre | 'all'>('all')

  useEffect(() => {
    let mounted = true
    fetchAllLicks().then(data => {
      if (!mounted) return
      setLicks(data)
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    if (genre === 'all') return licks
    return licks.filter(l => l.genre === genre)
  }, [licks, genre])

  const grouped = useMemo(() => {
    const groups: Record<LickGenre, Lick[]> = { blues: [], rock: [], country: [], jazz: [], folk: [] }
    for (const l of filtered) groups[l.genre].push(l)
    return groups
  }, [filtered])

  return (
    <AppLayout>
      <section className="pt-14 md:pt-20 pb-6 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <Link to="/dashboard" className="btn-link text-ember-500 text-[14px]">← Back home</Link>
          <div className="eyebrow-hero mt-6">Lick Library</div>
          <h1 className="h-display text-5xl md:text-6xl mt-2">
            Solo phrases<span className="block text-gold-100">worth stealing.</span>
          </h1>
          <p className="mt-4 text-lg text-cream-50/75 max-w-[640px] mx-auto leading-snug tracking-[-0.012em]">
            Curated blues, rock, country, jazz, and folk phrases. Slow them down, watch every note, then take them up to tempo.
          </p>
        </div>
      </section>

      <div className="max-w-[1080px] mx-auto px-5 sm:px-6 pb-14">
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          <FilterChip active={genre === 'all'} onClick={() => setGenre('all')}>All</FilterChip>
          {GENRE_ORDER.map(g => (
            <FilterChip key={g} active={genre === g} onClick={() => setGenre(g)}>
              {GENRE_LABEL[g]}
            </FilterChip>
          ))}
        </div>

        {loading ? (
          <div className="text-[15px] text-cream-50/65">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-cream-50/70 text-[15px]">No licks in this genre yet.</div>
        ) : (
          <div className="space-y-10">
            {GENRE_ORDER.map(g => grouped[g].length > 0 && (
              <section key={g}>
                <h2 className="h-section mb-5">{GENRE_LABEL[g]}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {grouped[g].map(l => (
                    <Link key={l.id} to={`/licks/${l.slug}`} className="card group block" style={{ padding: '1.5rem 1.75rem' }}>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-[13px] text-gold-500 font-semibold">DIFF {l.difficulty}</span>
                        <span className="text-gold-100 text-[12px] font-medium">{l.bpm} BPM · {l.feel}</span>
                      </div>
                      <div className="h-display text-xl mb-1.5 group-hover:text-ember-500 transition">{l.name}</div>
                      <p className="text-cream-50/70 text-[14px] leading-snug line-clamp-2 mb-3">{l.summary}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="pill">{l.key_root} {l.key_quality}</span>
                        {l.position_label && <span className="pill">{l.position_label}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 rounded-full text-[14px] font-medium transition"
      style={{
        border: `1px solid ${active ? '#0066CC' : 'rgba(0,0,0,0.10)'}`,
        background: active ? '#0066CC' : '#FFFFFF',
        color: active ? '#FFFFFF' : '#1D1D1F',
      }}
    >
      {children}
    </button>
  )
}
