import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'
import { AppLayout } from '../components/AppLayout'
import { JourneyTimeline } from '../components/JourneyTimeline'
import { computeMilestoneStatus, MILESTONES } from '../lib/milestones'
import { pickChallengeFor, todayDateStr, type DailyChallenge } from '../lib/dailyChallenges'
import { isCompletedToday, getStreak } from '../lib/dailyProgress'

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
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set())
  const [startedSlugs, setStartedSlugs] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null)
  const [dailyDone, setDailyDone] = useState(false)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!user || !profile) return
      setLoading(true)

      const today = todayDateStr()
      const challenge = pickChallengeFor(user.id, today, profile.ability_level)

      const [{ data: areas }, allLessonsRes, progressRes, recommended, doneToday, streakCount] = await Promise.all([
        supabase.from('focus_areas').select('*').order('sort_order'),
        supabase.from('lessons').select('id, slug, focus_area_id'),
        supabase.from('lesson_progress').select('lesson_id, status').eq('user_id', user.id),
        recommendNextLesson(user.id, profile.ability_level),
        isCompletedToday(user.id),
        getStreak(user.id),
      ])
      if (!mounted) return
      setFocusAreas((areas as FocusArea[] | null) ?? [])
      setDailyChallenge(challenge)
      setDailyDone(doneToday)
      setStreak(streakCount)

      const lessons = (allLessonsRes.data as { id: string; slug: string; focus_area_id: string }[] | null) ?? []
      const progress = (progressRes.data as { lesson_id: string; status: string }[] | null) ?? []

      const idToSlug = new Map(lessons.map(l => [l.id, l.slug] as const))
      const completed = new Set<string>()
      const started = new Set<string>()
      const completedByArea: Record<string, number> = {}
      const completedIds = new Set<string>()
      for (const r of progress) {
        if (r.status === 'completed') completedIds.add(r.lesson_id)
        const slug = idToSlug.get(r.lesson_id)
        if (!slug) continue
        if (r.status === 'completed') completed.add(slug)
        if (r.status === 'in_progress' || r.status === 'completed') started.add(slug)
      }
      const totalsByArea: Record<string, number> = {}
      for (const lesson of lessons) {
        totalsByArea[lesson.focus_area_id] = (totalsByArea[lesson.focus_area_id] ?? 0) + 1
        if (completedIds.has(lesson.id)) {
          completedByArea[lesson.focus_area_id] = (completedByArea[lesson.focus_area_id] ?? 0) + 1
        }
      }
      const c: Record<string, { completed: number; total: number }> = {}
      for (const a of (areas as FocusArea[] | null) ?? []) {
        c[a.id] = { completed: completedByArea[a.id] ?? 0, total: totalsByArea[a.id] ?? 0 }
      }

      setCompletedSlugs(completed)
      setStartedSlugs(started)
      setCounts(c)
      setNext(recommended)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [user, profile])

  const greeting = profile?.display_name ? `Welcome back, ${profile.display_name}.` : 'Welcome back.'

  const earnedCount = MILESTONES.filter(
    m => computeMilestoneStatus(m, completedSlugs, startedSlugs) === 'earned'
  ).length
  const totalAvailable = MILESTONES.filter(m => m.requiredLessonSlugs.length > 0).length

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <div className="eyebrow mb-3">Dashboard</div>
        <h1 className="h-display text-3xl md:text-5xl tracking-[0.06em] mb-3">{greeting}</h1>
        {!loading && totalAvailable > 0 && (
          <p className="text-cream-50/70 text-sm mb-10">
            <span className="text-gold-100">{earnedCount}</span> of{' '}
            <span className="text-cream-50">{totalAvailable}</span> milestones earned
            {' · '}
            <span className="text-cream-50/80">{MILESTONES.length - totalAvailable} on the path ahead</span>
          </p>
        )}

        {/* Today's challenge */}
        {dailyChallenge && (
          <Link
            to="/daily"
            className="block card group mb-6"
            style={{ padding: '1.5rem 1.75rem' }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="eyebrow mb-2">Today's challenge · {dailyChallenge.duration} min</div>
                <div className="h-display text-xl md:text-2xl mb-2 group-hover:text-gold-100 transition">{dailyChallenge.title}</div>
                <p className="text-cream-50/80 text-sm md:text-base">{dailyChallenge.summary}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {dailyDone ? (
                  <span className="pill">✓ Done today</span>
                ) : (
                  <span className="text-ember-500 font-semibold tracking-[0.22em] uppercase text-[11px]">
                    Start →
                  </span>
                )}
                <span className="text-cream-50/80 text-[11px] uppercase tracking-[0.22em]">
                  🔥 {streak === 0 ? 'No streak yet' : `${streak} day${streak === 1 ? '' : 's'}`}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Recommended next lesson */}
        {next ? (
          <Link
            to={`/lessons/${next.slug}`}
            className="block card is-feature group"
            style={{ padding: '1.75rem 2rem' }}
          >
            <div className="eyebrow mb-3">Your next lesson · {next.focus_area_id}</div>
            <div className="h-display text-2xl md:text-3xl mb-3 group-hover:text-gold-100 transition">{next.title}</div>
            {next.summary && <p className="text-cream-50/70 text-base md:text-lg max-w-2xl">{next.summary}</p>}
            <div className="mt-5 inline-flex items-center gap-2 text-ember-500 font-semibold tracking-[0.22em] uppercase text-[11px]">
              Open lesson <span className="transition group-hover:translate-x-1">→</span>
            </div>
          </Link>
        ) : (
          !loading && (
            <div className="card is-feature" style={{ padding: '1.75rem 2rem' }}>
              <div className="eyebrow mb-3">All caught up</div>
              <div className="h-display text-2xl">Nice work.</div>
              <p className="text-cream-50/80 mt-2">You've completed every lesson available at your level.</p>
            </div>
          )
        )}

        {/* Practice tools */}
        <div className="mt-16">
          <h2 className="h-section">Practice tools</h2>
          <div className="hairline mt-2 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-cream-50/[0.06]">
            <Link to="/licks" className="block bg-night-900 hover:bg-night-700/30 transition p-6 group">
              <div className="eyebrow mb-3">Lick Library</div>
              <div className="h-display text-xl mb-2 group-hover:text-gold-100 transition">Solo phrases worth stealing</div>
              <p className="text-cream-50/80 text-sm leading-relaxed">Curated blues, rock, country, jazz, and folk licks with playback at any tempo.</p>
              <div className="mt-3 text-ember-500 font-semibold tracking-[0.22em] uppercase text-[10px]">Browse →</div>
            </Link>
            <Link to="/jam" className="block bg-night-900 hover:bg-night-700/30 transition p-6 group">
              <div className="eyebrow mb-3">Jam Tracks Studio</div>
              <div className="h-display text-xl mb-2 group-hover:text-gold-100 transition">Solo over a real groove</div>
              <p className="text-cream-50/80 text-sm leading-relaxed">Drums, bass, and chord pad in any key. Pick a progression and start practicing.</p>
              <div className="mt-3 text-ember-500 font-semibold tracking-[0.22em] uppercase text-[10px]">Open studio →</div>
            </Link>
          </div>
        </div>

        {/* Journey */}
        <div className="mt-16">
          <h2 className="h-section">Your journey</h2>
          <div className="hairline mt-2 mb-10" />
          {loading ? (
            <div className="text-sm text-cream-50/80 tracking-widest uppercase">Loading…</div>
          ) : (
            <JourneyTimeline
              completedSlugs={completedSlugs}
              startedSlugs={startedSlugs}
              abilityLevel={profile?.ability_level}
            />
          )}
        </div>

        {/* Focus areas — accordions */}
        <div className="mt-20">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="h-section">Focus areas</h2>
            <Link to="/theory" className="text-[10px] uppercase tracking-[0.28em] text-gold-100 hover:text-cream-50 transition">
              Theory library →
            </Link>
          </div>
          <div className="hairline mt-2 mb-6" />
          <p className="text-xs text-cream-50/80 mb-5 leading-relaxed">
            Click a topic to open its lessons. Foundational lessons (below your level) are collapsible inside each focus area, and you can mark them complete in bulk there.
          </p>

          {loading ? (
            <div className="text-sm text-cream-50/80 tracking-widest uppercase">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-cream-50/[0.06]">
              {focusAreas.map((fa, idx) => {
                const c = counts[fa.id] ?? { completed: 0, total: 0 }
                const pct = c.total === 0 ? 0 : Math.round((c.completed / c.total) * 100)
                return (
                  <Link
                    key={fa.id}
                    to={`/focus/${fa.id}`}
                    className="block bg-night-900 hover:bg-night-700/30 transition p-7 group"
                  >
                    <div className="flex items-baseline justify-between mb-5">
                      <div className="prefix-num">{String(idx + 1).padStart(2, '0')}</div>
                      <div className="flex items-center gap-3">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-cream-50/80">{c.completed}/{c.total}</div>
                        <span className="text-cream-50/75 group-hover:text-gold-100 group-hover:translate-x-1 transition">→</span>
                      </div>
                    </div>
                    <div className="h-display text-xl md:text-2xl mb-3 group-hover:text-gold-100 transition">{fa.name}</div>
                    <p className="text-sm text-cream-50/80 leading-relaxed line-clamp-2 mb-5">{fa.description}</p>
                    <div className="h-px bg-night-700">
                      <div className="h-full bg-gold-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-cream-50/80 mt-2">{pct}% complete</div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Profile snapshot */}
        {profile && (
          <div className="mt-20">
            <h2 className="h-section">Your profile</h2>
            <div className="hairline mt-2 mb-6" />
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-8 text-sm">
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
      <dt className="text-[10px] uppercase tracking-[0.28em] text-cream-50/80 mb-1">{label}</dt>
      <dd className="text-cream-50">{children}</dd>
    </div>
  )
}

function prettyAbility(a: string) {
  return a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
