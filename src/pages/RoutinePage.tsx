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
      <div className="max-w-[1080px] mx-auto px-5 sm:px-6 pt-10 md:pt-14 pb-14">
        <Link to="/dashboard" className="btn-link text-ember-500 text-[14px]">← Back home</Link>
        <div className="eyebrow-hero mt-4">Today's practice · {today}</div>
        <h1 className="h-display text-4xl md:text-6xl mt-2 leading-[1.05]">
          {allDone ? 'Done. See you tomorrow.' : 'One session, in order.'}
        </h1>
        <p className="mt-4 text-lg text-cream-50/75 max-w-[680px] leading-snug tracking-[-0.012em]">
          A daily routine generated for your level. Work top to bottom — each block is a few focused minutes.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <span className="text-[13px] text-gold-100 font-medium">Length</span>
          {([10, 20, 30] as RoutineLength[]).map(n => {
            const isActive = length === n
            return (
              <button
                key={n}
                type="button"
                onClick={() => setLength(n)}
                className="px-3.5 py-1.5 rounded-full text-[13px] font-medium transition"
                style={{
                  border: `1px solid ${isActive ? '#0066CC' : 'rgba(0,0,0,0.10)'}`,
                  background: isActive ? '#0066CC' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#1D1D1F',
                }}
              >
                {n} min
              </button>
            )
          })}
          <span className="ml-auto text-gold-100 text-[13px] font-medium">
            {completedMinutes} / {routine.total_minutes} min done
          </span>
        </div>

        <hr className="hairline mt-7 mb-4" />

        <ol className="space-y-3">
          {routine.blocks.map((b, i) => (
            <li key={i}>
              <div className={`card transition ${b.completed ? 'opacity-65' : ''}`} style={{ padding: '1.5rem 1.75rem' }}>
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => toggleBlock(i)}
                    disabled={saving}
                    aria-label={b.completed ? 'Mark incomplete' : 'Mark complete'}
                    className="shrink-0 w-7 h-7 rounded-full transition flex items-center justify-center text-[13px] font-bold"
                    style={{
                      border: `1.5px solid ${b.completed ? '#1D7F3F' : 'rgba(0,0,0,0.18)'}`,
                      background: b.completed ? '#1D7F3F' : 'transparent',
                      color: b.completed ? '#FFFFFF' : '#1D1D1F',
                    }}
                  >
                    {b.completed ? '✓' : ''}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                      <span className="text-[13px] text-gold-500 font-semibold">{TYPE_LABEL[b.type]}</span>
                      <span className="text-gold-100 text-[12px] font-medium">{b.duration_min} min</span>
                    </div>
                    <div className={`h-display text-lg md:text-xl mb-1 ${b.completed ? 'line-through' : ''}`}>{b.title}</div>
                    <p className="text-cream-50/75 text-[14px] leading-snug">{b.description}</p>
                    {b.link && !b.completed && (
                      <Link to={b.link} className="inline-block mt-3 text-ember-500 text-[14px] hover:underline">
                        Open&nbsp;›
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <hr className="hairline mt-12 mb-6" />
        <h2 className="h-section mb-5">This week</h2>
        <WeeklyPracticeChart days={days} target={20} />
      </div>
    </AppLayout>
  )
}
