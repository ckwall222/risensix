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

  const firstName = profile?.display_name?.split(' ')[0] ?? 'friend'
  const earnedCount = MILESTONES.filter(
    m => computeMilestoneStatus(m, completedSlugs, startedSlugs) === 'earned'
  ).length
  const totalAvailable = MILESTONES.filter(m => m.requiredLessonSlugs.length > 0).length

  const completedTotal = completedSlugs.size
  const startedTotal = startedSlugs.size

  return (
    <AppLayout>
      {/* Hero */}
      <section className="pt-16 md:pt-20 pb-6 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="eyebrow-hero">Welcome back</div>
          <h1 className="h-display text-5xl md:text-7xl mt-2 max-w-[920px] mx-auto">
            Hi, {firstName}.<span className="block text-gold-100">One lick closer.</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-cream-50/75 max-w-[640px] mx-auto leading-snug tracking-[-0.012em]">
            A short session is queued. Pick it up where you left off — or jump straight into the tools.
          </p>
          <div className="mt-7 flex items-center gap-5 justify-center flex-wrap">
            <Link to="/routine" className="btn btn-primary" style={{ padding: '0.7rem 1.5rem' }}>
              Start today's session
            </Link>
            <Link to="/dashboard" className="btn-link text-ember-500">
              See your routine
            </Link>
          </div>
        </div>
      </section>

      {/* Today's session — dark feature card, like Apple's product hero */}
      <section className="pb-4">
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
              <div className="relative p-8 md:p-12 min-h-[440px] flex flex-col">
                <div className="text-[12px] font-semibold tracking-[0.10em] uppercase text-white/70">
                  Today · 15-min drill
                </div>
                <h2 className="font-display font-semibold tracking-[-0.025em] text-3xl md:text-5xl leading-[1.05] mt-6 max-w-[680px]">
                  {next.title}
                </h2>
                {next.summary && (
                  <p className="mt-4 text-base md:text-lg text-white/75 max-w-[560px] leading-snug">
                    {next.summary}
                  </p>
                )}
                <div className="mt-auto pt-8 flex items-center gap-5 flex-wrap">
                  <span className="btn btn-primary" style={{ background: '#FFFFFF', color: '#1D1D1F', padding: '0.7rem 1.5rem' }}>
                    Start session
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

      {/* Two-up: progress + Play Along (new feature spotlight) */}
      <section className="pb-4">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="card flex flex-col text-center items-center" style={{ padding: '2.5rem 2rem 2rem', minHeight: '520px' }}>
              <div className="eyebrow-hero">Your progress</div>
              <h3 className="h-display text-3xl md:text-4xl mt-1 max-w-[440px]">
                {completedTotal === 0
                  ? `Your journey starts here.`
                  : `${completedTotal} lesson${completedTotal === 1 ? '' : 's'} down${streak >= 2 ? `, ${streak}-day streak.` : '.'}`}
              </h3>
              <p className="mt-3 text-base text-cream-50/70 max-w-[420px] leading-snug">
                {totalAvailable > 0
                  ? `${earnedCount} of ${totalAvailable} milestones earned · ${MILESTONES.length - totalAvailable} on the path ahead.`
                  : 'Build a streak, earn milestones, watch the fretboard open up.'}
              </p>
              <div className="mt-4 flex items-center gap-5 flex-wrap justify-center">
                <Link to="/dashboard" className="btn-link text-ember-500">See your journey</Link>
                <Link to="/routine" className="btn-link text-ember-500">All milestones</Link>
              </div>
              <div
                className="mt-7 flex-1 w-full max-w-[440px] rounded-[14px] flex items-center justify-center relative"
                style={{
                  minHeight: '200px',
                  background:
                    'radial-gradient(360px 200px at 50% 30%, rgba(214,57,35,0.10), transparent 60%), linear-gradient(180deg,#F5F5F7,#E8E8ED)',
                }}
              >
                <div className="text-center">
                  <div className="font-display font-semibold tracking-[-0.03em] text-7xl md:text-8xl text-cream-50 leading-none">
                    {startedTotal}
                  </div>
                  <div className="mt-2 text-[12px] tracking-[0.10em] uppercase text-gold-100 font-semibold">
                    Lessons started
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/play-along"
              className="card is-dark flex flex-col text-center items-center group"
              style={{ padding: '2.5rem 2rem 2rem', minHeight: '520px' }}
            >
              <div className="eyebrow-hero" style={{ color: '#FF8674' }}>Play Along · New</div>
              <h3 className="h-display text-3xl md:text-4xl mt-1 max-w-[440px] text-white">
                Slow any song down. Same key. Half the speed.
              </h3>
              <p className="mt-3 text-base text-white/75 max-w-[420px] leading-snug">
                Drop in an MP3 you own. Drag the tempo to 50% and lift the lick — no pitch drift.
              </p>
              <div className="mt-4 flex items-center gap-5 flex-wrap justify-center">
                <span className="btn-link" style={{ color: '#2997FF' }}>Open Play Along</span>
                <span className="btn-link" style={{ color: '#2997FF' }}>How it works</span>
              </div>
              <div
                className="mt-7 flex-1 w-full max-w-[440px] rounded-[14px] flex items-center justify-center relative"
                style={{
                  minHeight: '200px',
                  background:
                    'radial-gradient(360px 200px at 50% 30%, rgba(255,134,116,0.20), transparent 60%), linear-gradient(180deg,#0B0B0E,#15151A)',
                }}
              >
                <div className="text-center">
                  <div className="font-display font-semibold tracking-[-0.03em] text-7xl md:text-8xl text-white leading-none">
                    50<span className="text-4xl md:text-5xl text-white/60 align-top ml-1">%</span>
                  </div>
                  <div className="mt-2 text-[12px] tracking-[0.10em] uppercase text-white/60 font-semibold">
                    Tempo · pitch preserved
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Daily challenge — slim row */}
      {dailyChallenge && (
        <section className="pb-4">
          <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
            <Link
              to="/daily"
              className="card flex items-start justify-between gap-6 flex-wrap"
              style={{ padding: '1.5rem 1.75rem' }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-gold-500">
                  Today's challenge · {dailyChallenge.duration} min
                </div>
                <h3 className="h-display text-xl md:text-2xl mt-1">{dailyChallenge.title}</h3>
                <p className="mt-1.5 text-[15px] text-cream-50/70 max-w-[640px] leading-snug">
                  {dailyChallenge.summary}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {dailyDone ? (
                  <span className="pill" style={{ color: '#1D7F3F', borderColor: 'rgba(29,127,63,0.30)', background: 'rgba(29,127,63,0.06)' }}>✓ Done today</span>
                ) : (
                  <span className="text-ember-500 font-medium text-[15px]">Start&nbsp;›</span>
                )}
                <span className="text-[12px] text-gold-100">
                  {streak === 0 ? 'No streak yet' : `🔥 ${streak} day${streak === 1 ? '' : 's'}`}
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Practice tools — Apple-style centered tiles */}
      <section className="pt-10 pb-4">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="h-section text-3xl md:text-4xl">Built around how guitarists actually practice.</h2>
            <p className="mt-3 text-base md:text-lg text-cream-50/70 max-w-[560px] mx-auto leading-snug">
              Tools designed to fit between your warmup and the moment you set the guitar down.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <ToolTile to="/play-along" eyebrow="Play Along" title="Slow it down without changing the key." caption="Drop in a file you own." glyph="▶" accent="#D63923" />
            <ToolTile to="/licks" eyebrow="Lick Library" title="Solo phrases worth stealing." caption="Curated blues, rock, jazz, folk." glyph="♪" accent="#0066CC" />
            <ToolTile to="/jam" eyebrow="Jam Studio" title="Solo over a real groove." caption="Drums, bass, chord pad — any key." glyph="∿" accent="#1D7F3F" />
            <ToolTile to="/tuner" eyebrow="Tuner" title="Get in tune in seconds." caption="Standard and chromatic modes." glyph="◷" accent="#1D1D1F" />
          </div>
          <div className="mt-5 text-center">
            <Link to="/songs" className="btn-link text-ember-500">Browse the songbook</Link>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="pt-12 pb-4">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <h2 className="h-section">Your journey</h2>
          <hr className="hairline mt-3 mb-8" />
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
      <section className="pt-12 pb-4">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="h-section">Focus areas</h2>
            <Link to="/theory" className="btn-link text-ember-500">Theory library</Link>
          </div>
          <hr className="hairline mb-6" />
          <p className="text-[14px] text-cream-50/70 mb-5 leading-snug max-w-[680px]">
            Click a topic to open its lessons. Foundational lessons below your level live inside each focus area.
          </p>
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

      {/* Profile snapshot */}
      {profile && (
        <section className="pt-12 pb-6">
          <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
            <h2 className="h-section">Your profile</h2>
            <hr className="hairline mt-3 mb-6" />
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-8 text-sm">
              <Item label="Ability">{prettyAbility(profile.ability_level)}</Item>
              <Item label="Reads tab">{profile.reads_tab ? 'Yes' : 'Not yet'}</Item>
              <Item label="Gear">{[profile.has_acoustic && 'Acoustic', profile.has_electric && 'Electric'].filter(Boolean).join(' · ') || '—'}</Item>
              <Item label="Styles">{profile.preferred_styles.length ? profile.preferred_styles.join(', ') : '—'}</Item>
            </dl>
          </div>
        </section>
      )}
    </AppLayout>
  )
}

function ToolTile({
  to, eyebrow, title, caption, glyph, accent,
}: {
  to: string; eyebrow: string; title: string; caption: string; glyph: string; accent: string
}) {
  return (
    <Link to={to} className="card flex flex-col text-center items-center group" style={{ padding: '2rem 1.5rem', minHeight: '380px' }}>
      <div className="text-[13px] font-semibold" style={{ color: accent }}>{eyebrow}</div>
      <h4 className="h-display text-xl md:text-2xl mt-1 max-w-[200px] group-hover:text-ember-500 transition">{title}</h4>
      <p className="mt-1.5 text-[14px] text-cream-50/70 leading-snug max-w-[220px]">{caption}</p>
      <div
        className="mt-5 flex-1 w-full rounded-[12px] flex items-center justify-center text-[48px] font-semibold tracking-[-0.03em] leading-none"
        style={{
          minHeight: '120px',
          color: accent,
          background: 'linear-gradient(180deg,#F5F5F7,#E8E8ED)',
        }}
      >
        {glyph}
      </div>
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

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] text-gold-100 mb-1 font-medium">{label}</dt>
      <dd className="text-cream-50 text-[15px]">{children}</dd>
    </div>
  )
}

function prettyAbility(a: string) {
  return a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
