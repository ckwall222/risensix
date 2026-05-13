import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'
import { AppLayout } from '../components/AppLayout'
import { JourneyTimeline } from '../components/JourneyTimeline'
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

  const firstName = profile?.display_name?.split(' ')[0] ?? 'friend'

  return (
    <AppLayout>
      {/* Hero — clean, sentence-case, one inline daily-challenge pill */}
      <section className="pt-16 md:pt-24 pb-10 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <h1 className="h-display text-5xl md:text-7xl max-w-[920px] mx-auto">
            Hi, {firstName}.<span className="block text-gold-100">One lick closer.</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-cream-50/70 max-w-[640px] mx-auto leading-snug tracking-[-0.012em]">
            A short session is waiting. Pick it up where you left off, or jump into the tools.
          </p>
          <div className="mt-7 flex items-center gap-5 justify-center flex-wrap">
            <Link to="/routine" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '16px' }}>
              Start today's session
            </Link>
            {dailyChallenge && (
              <Link
                to="/daily"
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition"
                style={{
                  border: '1px solid rgba(0,0,0,0.10)',
                  background: dailyDone ? 'rgba(29,127,63,0.06)' : '#FFFFFF',
                  color: dailyDone ? '#1D7F3F' : '#1D1D1F',
                }}
              >
                <span className="text-gold-500" aria-hidden>•</span>
                {dailyDone ? `Daily challenge · done` : `Today's challenge · ${dailyChallenge.duration} min`}
                {streak > 0 && <span className="text-gold-100">🔥 {streak}</span>}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Today's session — single dark feature card */}
      <section className="pb-12">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          {next ? (
            <Link
              to={`/lessons/${next.slug}`}
              className="block relative overflow-hidden rounded-[18px] bg-black text-white"
            >
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(900px 480px at 75% 25%, rgba(214,57,35,0.22), transparent 60%), radial-gradient(700px 460px at 15% 70%, rgba(0,102,204,0.12), transparent 60%)',
                }}
              />
              <div className="relative p-8 md:p-12 min-h-[400px] flex flex-col">
                <div className="text-[12px] font-semibold tracking-[0.10em] uppercase text-white/70">
                  Today · Recommended lesson
                </div>
                <h2 className="font-display font-medium tracking-[-0.02em] text-3xl md:text-5xl leading-[1.05] mt-6 max-w-[680px]" style={{ fontVariationSettings: '"opsz" 144' }}>
                  {next.title}
                </h2>
                {next.summary && (
                  <p className="mt-4 text-base md:text-lg text-white/75 max-w-[560px] leading-snug">
                    {next.summary}
                  </p>
                )}
                <div className="mt-auto pt-8 flex items-center gap-5 flex-wrap">
                  <span className="btn" style={{ background: '#FFFFFF', color: '#1D1D1F', padding: '0.7rem 1.5rem', fontWeight: 600 }}>
                    Open lesson
                  </span>
                  <span className="text-[#2997FF] text-base">See plan&nbsp;›</span>
                </div>
              </div>
            </Link>
          ) : !loading ? (
            <div className="rounded-[18px] bg-white border border-black/[0.06] p-10 text-center">
              <div className="eyebrow">All caught up</div>
              <h2 className="h-display text-3xl mt-2">Nice work.</h2>
              <p className="text-cream-50/70 mt-2 max-w-[480px] mx-auto">
                You've completed every lesson available at your level. New material is on the way.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Tools — tightened tiles, no big glyph visual */}
      <section className="pb-12">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="h-section">Practice tools</h2>
            <Link to="/songs" className="text-ember-500 text-[14px] hover:underline">
              Songbook&nbsp;›
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <ToolTile to="/play-along" eyebrow="Play Along" title="Slow it down without changing the key." caption="Drop in a file you own." />
            <ToolTile to="/licks" eyebrow="Lick Library" title="Solo phrases worth stealing." caption="Curated blues, rock, jazz, folk." />
            <ToolTile to="/jam" eyebrow="Jam Studio" title="Solo over a real groove." caption="Drums, bass, chord pad — any key." />
            <ToolTile to="/tuner" eyebrow="Tuner" title="Get in tune in seconds." caption="Standard and chromatic modes." />
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="pb-12">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <h2 className="h-section">Your journey</h2>
          <hr className="hairline mt-3 mb-6" />
          {loading ? (
            <div className="text-sm text-cream-50/60">Loading…</div>
          ) : (
            <JourneyTimeline
              completedSlugs={completedSlugs}
              startedSlugs={startedSlugs}
              abilityLevel={profile?.ability_level}
            />
          )}
        </div>
      </section>

      {/* Focus areas */}
      <section className="pb-16">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="h-section">Focus areas</h2>
            <Link to="/theory" className="text-ember-500 text-[14px] hover:underline">
              Theory library&nbsp;›
            </Link>
          </div>
          <hr className="hairline mb-6" />
          {loading ? (
            <div className="text-sm text-cream-50/60">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {focusAreas.map((fa, idx) => {
                const c = counts[fa.id] ?? { completed: 0, total: 0 }
                const pct = c.total === 0 ? 0 : Math.round((c.completed / c.total) * 100)
                return (
                  <Link key={fa.id} to={`/focus/${fa.id}`} className="card group block" style={{ padding: '1.75rem' }}>
                    <div className="flex items-baseline justify-between mb-5">
                      <div className="prefix-num">{String(idx + 1).padStart(2, '0')}</div>
                      <div className="text-[12px] text-gold-100">{c.completed}/{c.total}</div>
                    </div>
                    <div className="h-display text-xl md:text-2xl mb-2 group-hover:text-ember-500 transition">{fa.name}</div>
                    <p className="text-[14px] text-cream-50/70 leading-snug line-clamp-2 mb-4">{fa.description}</p>
                    <div className="h-1 rounded-full bg-black/[0.08] overflow-hidden">
                      <div className="h-full bg-cream-50" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[12px] text-gold-100 mt-2">{pct}% complete</div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  )
}

function ToolTile({ to, eyebrow, title, caption }: { to: string; eyebrow: string; title: string; caption: string }) {
  return (
    <Link to={to} className="card flex flex-col group" style={{ padding: '1.5rem 1.5rem 1.25rem' }}>
      <div className="eyebrow mb-2">{eyebrow}</div>
      <h4 className="h-display text-lg md:text-xl mb-1.5 group-hover:text-ember-500 transition leading-[1.2]">{title}</h4>
      <p className="text-[14px] text-cream-50/70 leading-snug flex-1">{caption}</p>
      <div className="mt-4 text-[13px] text-ember-500">Open&nbsp;›</div>
    </Link>
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
