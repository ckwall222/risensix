import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'
import { AppLayout } from '../components/AppLayout'
import { getProgressCountsByFocusArea } from '../lib/lessonProgress'

type FocusArea = {
  id: string
  name: string
  description: string
  icon_name: string
  sort_order: number
}

type RecommendedLesson = { id: string; slug: string; title: string; summary: string | null; focus_area_id: string }

const ABILITY_DIFFICULTY: Record<string, number[]> = {
  absolute_beginner: [1],
  beginner:          [1, 2],
  novice:            [2, 3],
  intermediate:      [3, 4],
  advanced:          [4, 5],
}

export function Dashboard() {
  const { profile, user } = useAuth()
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([])
  const [counts, setCounts] = useState<Record<string, { completed: number; total: number }>>({})
  const [next, setNext] = useState<RecommendedLesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!user || !profile) return
      setLoading(true)

      const [{ data: areas }, c, recommended] = await Promise.all([
        supabase.from('focus_areas').select('*').order('sort_order'),
        getProgressCountsByFocusArea(user.id),
        recommendNextLesson(user.id, profile.ability_level),
      ])
      if (!mounted) return
      setFocusAreas((areas as FocusArea[] | null) ?? [])
      setCounts(c)
      setNext(recommended)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [user, profile])

  const greeting = profile?.display_name ? `Welcome back, ${profile.display_name}.` : 'Welcome back.'

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Greeting */}
        <h1 className="font-display text-3xl md:text-4xl tracking-[0.1em] text-cream-50 mb-3">{greeting}</h1>

        {/* Recommended next lesson */}
        {next ? (
          <Link
            to={`/lessons/${next.slug}`}
            className="block rounded-xl border border-gold-500/30 bg-gold-500/5 p-6 hover:border-gold-500 hover:bg-gold-500/10 transition"
          >
            <div className="text-xs uppercase tracking-widest text-gold-500 mb-2">Your next lesson · {next.focus_area_id}</div>
            <div className="font-display text-2xl tracking-wider text-cream-50 mb-2">{next.title}</div>
            {next.summary && <p className="text-cream-50/70">{next.summary}</p>}
            <div className="mt-4 inline-flex items-center gap-2 text-ember-500 font-semibold tracking-[0.18em] uppercase text-xs">
              Open lesson →
            </div>
          </Link>
        ) : (
          !loading && (
            <div className="rounded-xl border border-night-700 p-6">
              <div className="text-xs uppercase tracking-widest text-gold-500 mb-2">All caught up</div>
              <div className="font-display text-2xl tracking-wider text-cream-50">Nice work.</div>
              <p className="text-cream-50/70 mt-1">You've completed every lesson available at your level.</p>
            </div>
          )
        )}

        {/* Focus areas */}
        <div className="mt-12">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-xl tracking-[0.18em] text-gold-100 uppercase">Focus areas</h2>
            <Link to="/theory" className="text-xs uppercase tracking-widest text-gold-500 hover:text-gold-100">Theory library →</Link>
          </div>
          {loading ? (
            <div className="text-sm text-cream-50/50">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {focusAreas.map(fa => {
                const c = counts[fa.id] ?? { completed: 0, total: 0 }
                const pct = c.total === 0 ? 0 : Math.round((c.completed / c.total) * 100)
                return (
                  <Link
                    key={fa.id}
                    to={`/focus/${fa.id}`}
                    className="block rounded-xl border border-night-700 hover:border-gold-500/60 transition p-5"
                  >
                    <div className="text-xs uppercase tracking-widest text-gold-500 mb-2">{fa.id}</div>
                    <div className="font-display text-lg tracking-wider text-cream-50 mb-2">{fa.name}</div>
                    <p className="text-sm text-cream-50/65 leading-relaxed mb-4 line-clamp-2">{fa.description}</p>
                    <div className="h-1.5 bg-night-700 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-gold-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-cream-50/50">{c.completed} / {c.total} lessons · {pct}%</div>
                  </Link>
                )
              })}
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

async function recommendNextLesson(userId: string, abilityLevel: string): Promise<RecommendedLesson | null> {
  const allowed = ABILITY_DIFFICULTY[abilityLevel] ?? [1, 2]
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, slug, title, summary, focus_area_id, difficulty, sort_order')
    .in('difficulty', allowed)
    .order('difficulty')
    .order('sort_order')
  const list = (lessons as (RecommendedLesson & { id: string })[] | null) ?? []
  if (list.length === 0) return null

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id, status')
    .eq('user_id', userId)
    .in('status', ['completed', 'in_progress'])

  const map = new Map<string, string>()
  for (const r of (progress as { lesson_id: string; status: string }[] | null) ?? []) {
    map.set(r.lesson_id, r.status)
  }

  const inProgress = list.find(l => map.get(l.id) === 'in_progress')
  if (inProgress) return inProgress

  const notStarted = list.find(l => !map.has(l.id))
  return notStarted ?? null
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
