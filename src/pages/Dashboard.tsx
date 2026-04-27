import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'
import { AppLayout } from '../components/AppLayout'
import { JourneyTimeline } from '../components/JourneyTimeline'
import { FocusAreaCard, FocusAreaCardLesson } from '../components/FocusAreaCard'
import { LessonProgressRow } from '../lib/lessonProgress'
import { computeMilestoneStatus, MILESTONES } from '../lib/milestones'

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
const ABILITY_MIN_DIFFICULTY: Record<string, number> = {
  absolute_beginner: 1,
  beginner:          1,
  novice:            2,
  intermediate:      3,
  advanced:          4,
}

export function Dashboard() {
  const { profile, user } = useAuth()
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([])
  const [lessonsByArea, setLessonsByArea] = useState<Record<string, FocusAreaCardLesson[]>>({})
  const [progress, setProgress] = useState<Record<string, LessonProgressRow>>({})
  const [next, setNext] = useState<RecommendedLesson | null>(null)
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set())
  const [startedSlugs, setStartedSlugs] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [refreshTick, setRefreshTick] = useState(0)

  const refresh = useCallback(() => setRefreshTick(t => t + 1), [])

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!user || !profile) return
      setLoading(true)

      const [{ data: areas }, allLessonsRes, progressRes, recommended] = await Promise.all([
        supabase.from('focus_areas').select('*').order('sort_order'),
        supabase.from('lessons').select('id, slug, title, summary, difficulty, duration_minutes, focus_area_id, sort_order').order('sort_order'),
        supabase.from('lesson_progress').select('*').eq('user_id', user.id),
        recommendNextLesson(user.id, profile.ability_level),
      ])
      if (!mounted) return
      setFocusAreas((areas as FocusArea[] | null) ?? [])

      const lessons = (allLessonsRes.data as (FocusAreaCardLesson & { focus_area_id: string })[] | null) ?? []
      const byArea: Record<string, FocusAreaCardLesson[]> = {}
      for (const l of lessons) {
        const list = byArea[l.focus_area_id] ?? (byArea[l.focus_area_id] = [])
        list.push(l)
      }
      setLessonsByArea(byArea)

      const progRows = (progressRes.data as LessonProgressRow[] | null) ?? []
      const progMap: Record<string, LessonProgressRow> = {}
      for (const r of progRows) progMap[r.lesson_id] = r
      setProgress(progMap)

      // Build slug → status sets for milestones
      const idToSlug = new Map(lessons.map(l => [l.id, l.slug] as const))
      const completed = new Set<string>()
      const started = new Set<string>()
      for (const r of progRows) {
        const slug = idToSlug.get(r.lesson_id)
        if (!slug) continue
        if (r.status === 'completed') completed.add(slug)
        if (r.status === 'in_progress' || r.status === 'completed') started.add(slug)
      }
      setCompletedSlugs(completed)
      setStartedSlugs(started)
      setNext(recommended)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [user, profile, refreshTick])

  const greeting = profile?.display_name ? `Welcome back, ${profile.display_name}.` : 'Welcome back.'

  const earnedCount = MILESTONES.filter(
    m => computeMilestoneStatus(m, completedSlugs, startedSlugs) === 'earned'
  ).length
  const totalAvailable = MILESTONES.filter(m => m.requiredLessonSlugs.length > 0).length
  const minDifficulty = ABILITY_MIN_DIFFICULTY[profile?.ability_level ?? 'beginner'] ?? 1

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <div className="eyebrow mb-3">Dashboard</div>
        <h1 className="h-display text-3xl md:text-5xl tracking-[0.06em] mb-3">{greeting}</h1>
        {!loading && totalAvailable > 0 && (
          <p className="text-cream-50/55 text-sm mb-10">
            <span className="text-gold-100">{earnedCount}</span> of{' '}
            <span className="text-cream-50">{totalAvailable}</span> milestones earned
            {' · '}
            <span className="text-cream-50/40">{MILESTONES.length - totalAvailable} on the path ahead</span>
          </p>
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
              <p className="text-cream-50/65 mt-2">You've completed every lesson available at your level.</p>
            </div>
          )
        )}

        {/* Journey */}
        <div className="mt-16">
          <h2 className="h-section">Your journey</h2>
          <div className="hairline mt-2 mb-10" />
          {loading ? (
            <div className="text-sm text-cream-50/40 tracking-widest uppercase">Loading…</div>
          ) : (
            <JourneyTimeline completedSlugs={completedSlugs} startedSlugs={startedSlugs} />
          )}
        </div>

        {/* Focus areas — accordions */}
        <div className="mt-20">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="h-section">Focus areas</h2>
            <Link to="/theory" className="text-[10px] uppercase tracking-[0.28em] text-gold-500 hover:text-gold-100 transition">
              Theory library →
            </Link>
          </div>
          <div className="hairline mt-2 mb-6" />
          <p className="text-xs text-cream-50/45 mb-5 leading-relaxed">
            Click any area to expand its lesson list. Foundational lessons (below your level) collapse by default — you can mark them complete in bulk if you don't need to walk through them.
          </p>

          {loading ? (
            <div className="text-sm text-cream-50/40 tracking-widest uppercase">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-cream-50/[0.06]">
              {focusAreas.map((fa, idx) => (
                <FocusAreaCard
                  key={fa.id}
                  num={String(idx + 1).padStart(2, '0')}
                  focusAreaId={fa.id}
                  name={fa.name}
                  description={fa.description}
                  lessons={lessonsByArea[fa.id] ?? []}
                  progress={progress}
                  minDifficulty={minDifficulty}
                  userId={user!.id}
                  onProgressChange={refresh}
                />
              ))}
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
      <dt className="text-[10px] uppercase tracking-[0.28em] text-gold-900 mb-1">{label}</dt>
      <dd className="text-cream-50">{children}</dd>
    </div>
  )
}

function prettyAbility(a: string) {
  return a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
