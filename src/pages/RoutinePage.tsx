import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AppLayout } from '../components/AppLayout'
import { WeeklyPracticeChart } from '../components/WeeklyPracticeChart'
import {
  generateRoutine,
  type GeneratedRoutine,
  type PracticeBlock,
  type RoutineLength,
} from '../lib/routineGenerator'
import {
  fetchLastNDays,
  fetchTodaySession,
  todayDateStr,
  upsertSession,
  type DayMinutes,
  type PracticeSession,
} from '../lib/practiceLog'

const TYPE_LABEL: Record<PracticeBlock['type'], string> = {
  warmup: 'Warmup',
  drill: 'Skill drill',
  theory: 'Theory',
  jam: 'Jam',
  song: 'Song',
  cooldown: 'Cooldown',
}

export function RoutinePage() {
  const { user, profile } = useAuth()
  const [length, setLength] = useState<RoutineLength>(20)
  const [routine, setRoutine] = useState<GeneratedRoutine | null>(null)
  const [days, setDays] = useState<DayMinutes[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const today = todayDateStr()

  const generated = useMemo(() => {
    if (!user || !profile) return null
    return generateRoutine(user.id, today, profile.ability_level, length)
  }, [user, profile, today, length])

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!user || !profile || !generated) return
      setLoading(true)
      const [existing, lastWeek] = await Promise.all([
        fetchTodaySession(user.id),
        fetchLastNDays(user.id, 7),
      ])
      if (!mounted) return
      // If there's an existing session that matches today's generated routine,
      // overlay its completion state. Otherwise use freshly generated blocks.
      if (existing && existing.routine_id === generated.id) {
        setRoutine({ ...generated, blocks: existing.blocks })
      } else {
        setRoutine(generated)
      }
      setDays(lastWeek)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [user, profile, generated])

  const completedMinutes = useMemo(() => {
    if (!routine) return 0
    return routine.blocks.reduce((s, b) => s + (b.completed ? b.duration_min : 0), 0)
  }, [routine])

  const allDone = routine ? routine.blocks.every(b => b.completed) : false

  const toggleBlock = async (idx: number) => {
    if (!routine || !user) return
    const newBlocks = routine.blocks.map((b, i) =>
      i === idx ? { ...b, completed: !b.completed } : b
    )
    const newRoutine = { ...routine, blocks: newBlocks }
    setRoutine(newRoutine)
    setSaving(true)
    const totalMinutes = newBlocks.filter(b => b.completed).reduce((s, b) => s + b.duration_min, 0)
    const session: PracticeSession = {
      user_id: user.id,
      completed_on: today,
      total_minutes: totalMinutes,
      routine_id: newRoutine.id,
      blocks: newBlocks,
    }
    await upsertSession(session)
    // Refresh weekly chart so today reflects the new total
    const lastWeek = await fetchLastNDays(user.id, 7)
    setDays(lastWeek)
    setSaving(false)
  }

  if (loading || !routine) {
    return <AppLayout><div className="max-w-3xl mx-auto px-6 py-16 text-cream-50/80">Building today's routine…</div></AppLayout>
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <Link to="/dashboard" className="text-[10px] uppercase tracking-[0.28em] text-gold-100 hover:text-cream-50 transition">← Home</Link>
        <div className="eyebrow mt-6 mb-3">Today's practice · {today}</div>
        <h1 className="h-display text-3xl md:text-5xl tracking-[0.06em] mb-2">
          {allDone ? 'Done. See you tomorrow.' : 'One session, in order.'}
        </h1>
        <p className="text-cream-50/80 mt-4 max-w-2xl leading-relaxed">
          A daily routine generated for your level. Work top to bottom — each block is a few focused minutes.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.22em] text-cream-50/80">Length</span>
          {([10, 20, 30] as RoutineLength[]).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setLength(n)}
              className={`text-[11px] uppercase tracking-[0.22em] px-3.5 py-2 border transition ${
                length === n
                  ? 'border-gold-500 bg-gold-500/10 text-gold-100'
                  : 'border-cream-50/[0.12] text-cream-50/80 hover:border-gold-500/50 hover:text-cream-50'
              }`}
            >
              {n} min
            </button>
          ))}
          <span className="ml-auto text-cream-50/80 text-[11px] uppercase tracking-[0.22em]">
            {completedMinutes} / {routine.total_minutes} min done
          </span>
        </div>

        <div className="hairline mt-8 mb-4" />

        <ol className="space-y-4">
          {routine.blocks.map((b, i) => (
            <li key={i}>
              <div className={`card p-5 md:p-6 transition ${b.completed ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => toggleBlock(i)}
                    disabled={saving}
                    aria-label={b.completed ? 'Mark incomplete' : 'Mark complete'}
                    className={`shrink-0 w-7 h-7 rounded-full border transition flex items-center justify-center text-sm ${
                      b.completed
                        ? 'border-gold-500 bg-gold-500/20 text-gold-100'
                        : 'border-cream-50/[0.2] hover:border-gold-500'
                    }`}
                  >
                    {b.completed ? '✓' : ''}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                      <span className="prefix-num">{TYPE_LABEL[b.type]}</span>
                      <span className="text-cream-50/70 text-[10px] uppercase tracking-[0.22em]">{b.duration_min} min</span>
                    </div>
                    <div className={`h-display text-lg md:text-xl mb-1 ${b.completed ? 'line-through' : ''}`}>{b.title}</div>
                    <p className="text-cream-50/80 text-sm leading-relaxed">{b.description}</p>
                    {b.link && !b.completed && (
                      <Link to={b.link} className="inline-block mt-3 text-ember-500 font-semibold tracking-[0.22em] uppercase text-[10px]">
                        Open →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="hairline mt-12 mb-6" />
        <h2 className="h-section mb-5">This week</h2>
        <WeeklyPracticeChart days={days} target={20} />
      </div>
    </AppLayout>
  )
}
