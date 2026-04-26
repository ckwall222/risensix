import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'
import { AppLayout } from '../components/AppLayout'

type FocusArea = {
  id: string
  name: string
  description: string
  icon_name: string
  sort_order: number
}

const PRIMER_BY_ABILITY: Record<string, { headline: string; sub: string }> = {
  absolute_beginner: { headline: 'Start at the beginning.', sub: "We'll cover holding the guitar, naming strings, and your very first chord." },
  beginner:          { headline: 'Lock in your open chords.', sub: 'Smooth transitions between E, A, D, G, C — the foundation of everything.' },
  novice:            { headline: 'Time to barre.', sub: 'Movable shapes unlock the entire neck. We start with F.' },
  intermediate:      { headline: 'CAGED & the circle.', sub: 'Two systems that connect every chord to every scale, everywhere.' },
  advanced:          { headline: 'Refine the edges.', sub: 'Modes, phrasing, comping concepts, and ear training.' },
}

export function Dashboard() {
  const { profile } = useAuth()
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.from('focus_areas').select('*').order('sort_order').then(({ data }) => {
      if (!mounted) return
      setFocusAreas((data ?? []) as FocusArea[])
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const primer = profile ? PRIMER_BY_ABILITY[profile.ability_level] : null
  const greeting = profile?.display_name ? `Welcome back, ${profile.display_name}.` : 'Welcome back.'

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Greeting + recommended next */}
        <div className="mb-12">
          <h1 className="font-display text-3xl md:text-4xl tracking-[0.1em] text-cream-50 mb-3">
            {greeting}
          </h1>
          {primer && (
            <div className="rounded-xl border border-gold-500/30 bg-gold-500/5 p-6">
              <div className="text-xs uppercase tracking-widest text-gold-500 mb-2">Your next move</div>
              <div className="font-display text-2xl tracking-wider text-cream-50 mb-2">{primer.headline}</div>
              <p className="text-cream-50/70">{primer.sub}</p>
              <button
                type="button"
                disabled
                className="mt-5 px-5 py-2.5 bg-ember-500/40 text-cream-50/50 font-semibold tracking-[0.18em] uppercase text-xs rounded cursor-not-allowed"
                title="Lessons coming in Phase 4"
              >
                Open lesson · Coming Phase 4
              </button>
            </div>
          )}
        </div>

        {/* Focus areas */}
        <div>
          <h2 className="font-display text-xl tracking-[0.18em] text-gold-100 mb-5 uppercase">Focus areas</h2>
          {loading ? (
            <div className="text-sm text-cream-50/50">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {focusAreas.map(fa => (
                <div key={fa.id} className="rounded-xl border border-night-700 hover:border-gold-500/50 transition p-5 bg-night-900">
                  <div className="text-xs uppercase tracking-widest text-gold-500 mb-2">{fa.id}</div>
                  <div className="font-display text-lg tracking-wider text-cream-50 mb-2">{fa.name}</div>
                  <p className="text-sm text-cream-50/65 leading-relaxed mb-4">{fa.description}</p>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-night-700 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gold-500" style={{ width: '0%' }} />
                  </div>
                  <div className="text-xs text-cream-50/50">0 / 0 lessons · 0%</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile snapshot */}
        {profile && (
          <div className="mt-12 rounded-xl border border-night-700 p-5">
            <h2 className="font-display text-base tracking-[0.18em] text-gold-100 mb-4 uppercase">Your profile</h2>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-sm">
              <Item label="Ability">{prettyAbility(profile.ability_level)}</Item>
              <Item label="Reads tab">{profile.reads_tab ? 'Yes' : 'Not yet'}</Item>
              <Item label="Gear">{[profile.has_acoustic && 'Acoustic', profile.has_electric && 'Electric'].filter(Boolean).join(' · ') || '—'}</Item>
              <Item label="Styles">{profile.preferred_styles.length ? profile.preferred_styles.join(', ') : '—'}</Item>
            </dl>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-gold-900 mb-0.5">{label}</dt>
      <dd className="text-cream-50">{children}</dd>
    </div>
  )
}

function prettyAbility(a: string) {
  return a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
