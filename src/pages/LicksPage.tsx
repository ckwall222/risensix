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
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <Link to="/dashboard" className="text-[10px] uppercase tracking-[0.28em] text-gold-100 hover:text-cream-50 transition">← Home</Link>
        <div className="eyebrow mt-6 mb-3">Lick Library</div>
        <h1 className="h-display text-3xl md:text-5xl tracking-[0.06em] mb-4">Solo phrases worth stealing.</h1>
        <p className="text-cream-50/80 text-base md:text-lg max-w-2xl leading-relaxed mb-10">
          Curated single-string and double-stop phrases for soloing — blues, rock, country, jazz, folk. Slow them down, watch every note, then take them up to tempo.
        </p>

        <div className="flex flex-wrap gap-2 mb-10">
          <FilterChip active={genre === 'all'} onClick={() => setGenre('all')}>All</FilterChip>
          {GENRE_ORDER.map(g => (
            <FilterChip key={g} active={genre === g} onClick={() => setGenre(g)}>
              {GENRE_LABEL[g]}
            </FilterChip>
          ))}
        </div>

        {loading ? (
          <div className="text-sm text-cream-50/80 tracking-widest uppercase">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-cream-50/70 text-sm">No licks in this genre yet.</div>
        ) : (
          <div className="space-y-12">
            {GENRE_ORDER.map(g => grouped[g].length > 0 && (
              <section key={g}>
                <h2 className="h-section mb-3">{GENRE_LABEL[g]}</h2>
                <div className="hairline mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-cream-50/[0.06]">
                  {grouped[g].map(l => (
                    <Link
                      key={l.id}
                      to={`/licks/${l.slug}`}
                      className="block bg-night-900 hover:bg-night-700/30 transition p-6 group"
                    >
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="prefix-num">DIFF {l.difficulty}</span>
                        <span className="text-cream-50/80 text-[10px] uppercase tracking-[0.22em]">{l.bpm} BPM · {l.feel}</span>
                      </div>
                      <div className="h-display text-xl mb-2 group-hover:text-gold-100 transition">{l.name}</div>
                      <p className="text-cream-50/80 text-sm leading-relaxed line-clamp-2 mb-3">{l.summary}</p>
                      <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em]">
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
      className={`text-[11px] uppercase tracking-[0.22em] px-3.5 py-2 border transition ${
        active
          ? 'border-gold-500 bg-gold-500/10 text-gold-100'
          : 'border-cream-50/[0.12] text-cream-50/80 hover:border-gold-500/50 hover:text-cream-50'
      }`}
    >
      {children}
    </button>
  )
}
