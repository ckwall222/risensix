import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'
import { AppLayout } from '../components/AppLayout'
import { getProgressForLessons, LessonProgressRow } from '../lib/lessonProgress'

type FocusArea = { id: string; name: string; description: string | null }

type LessonRow = {
  id: string
  slug: string
  title: string
  difficulty: number
  duration_minutes: number | null
  summary: string | null
  sort_order: number
}

// Lessons strictly below this difficulty are considered "foundational"
// for the user's current ability level.
const ABILITY_MIN_DIFFICULTY: Record<string, number> = {
  absolute_beginner: 1,
  beginner:          1,
  novice:            2,
  intermediate:      3,
  advanced:          4,
}

export function FocusAreaPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const [area, setArea] = useState<FocusArea | null>(null)
  const [lessons, setLessons] = useState<LessonRow[]>([])
  const [progress, setProgress] = useState<Record<string, LessonProgressRow>>({})
  const [loading, setLoading] = useState(true)
  const [foundationalOpen, setFoundationalOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!id || !user) return
      setLoading(true)
      const [{ data: areaRow }, { data: lessonRows }] = await Promise.all([
        supabase.from('focus_areas').select('*').eq('id', id).maybeSingle(),
        supabase.from('lessons').select('id, slug, title, difficulty, duration_minutes, summary, sort_order').eq('focus_area_id', id).order('sort_order'),
      ])
      if (!mounted) return
      setArea(areaRow as FocusArea | null)
      const ls = (lessonRows as LessonRow[] | null) ?? []
      setLessons(ls)
      const p = await getProgressForLessons(user.id, ls.map(l => l.id))
      if (!mounted) return
      setProgress(p)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [id, user])

  if (loading) return <AppLayout><div className="max-w-5xl mx-auto px-6 py-16 text-cream-50/40 tracking-widest uppercase text-sm">Loading…</div></AppLayout>
  if (!area) return <AppLayout><div className="max-w-5xl mx-auto px-6 py-16 text-cream-50/55">Focus area not found.</div></AppLayout>

  const completedCount = Object.values(progress).filter(p => p.status === 'completed').length
  const pct = lessons.length === 0 ? 0 : Math.round((completedCount / lessons.length) * 100)

  const minDifficulty = ABILITY_MIN_DIFFICULTY[profile?.ability_level ?? 'beginner'] ?? 1
  const foundational = lessons.filter(l => l.difficulty < minDifficulty)
  const current      = lessons.filter(l => l.difficulty >= minDifficulty)

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <Link to="/dashboard" className="text-[10px] uppercase tracking-[0.28em] text-gold-500 hover:text-gold-100 transition">← Home</Link>
        <div className="eyebrow mt-6 mb-3">Focus area</div>
        <h1 className="h-display text-4xl md:text-5xl tracking-[0.06em]">{area.name}</h1>
        {area.description && <p className="text-lg text-cream-50/70 mt-4 max-w-3xl leading-relaxed">{area.description}</p>}

        <div className="mt-10 mb-10">
          <div className="flex items-center justify-between mb-2 text-[10px] uppercase tracking-[0.28em]">
            <span className="text-gold-500">Progress</span>
            <span className="text-cream-50/55">{completedCount} / {lessons.length} · {pct}%</span>
          </div>
          <div className="h-px bg-night-700">
            <div className="h-full bg-gold-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {lessons.length === 0 ? (
          <p className="text-cream-50/55">Lessons coming soon.</p>
        ) : (
          <>
            {current.length > 0 && (
              <LessonList
                lessons={current}
                progress={progress}
                indexOffset={0}
              />
            )}

            {current.length === 0 && foundational.length > 0 && (
              <p className="text-cream-50/55 mb-8">
                No lessons at your level yet — more coming soon. Foundational material is below.
              </p>
            )}

            {foundational.length > 0 && (
              <div className="mt-12">
                <button
                  type="button"
                  onClick={() => setFoundationalOpen(o => !o)}
                  className="w-full flex items-center justify-between gap-4 py-4 border-y border-cream-50/[0.06] hover:border-gold-500/40 transition group"
                >
                  <div className="flex items-baseline gap-3">
                    <span className={`text-gold-500 transition-transform ${foundationalOpen ? 'rotate-90' : ''}`}>▸</span>
                    <span className="font-display text-base tracking-[0.06em] text-cream-50 group-hover:text-gold-100 transition">
                      Foundational lessons
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.28em] text-cream-50/45">
                    {foundationalOpen ? 'Hide' : `${foundational.length} · Show`}
                  </span>
                </button>

                {foundationalOpen && (
                  <div className="pt-2">
                    <p className="text-xs text-cream-50/45 mt-3 mb-2 leading-relaxed max-w-2xl">
                      Below your current level — review them anytime, but they aren't counted against your at-level progress.
                    </p>
                    <LessonList
                      lessons={foundational}
                      progress={progress}
                      indexOffset={current.length}
                      muted
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}

function LessonList({
  lessons,
  progress,
  indexOffset,
  muted = false,
}: {
  lessons: LessonRow[]
  progress: Record<string, LessonProgressRow>
  indexOffset: number
  muted?: boolean
}) {
  return (
    <div className="border-t border-cream-50/[0.06]">
      {lessons.map((l, idx) => {
        const status = progress[l.id]?.status ?? 'not_started'
        const dot =
          status === 'completed' ? 'bg-gold-500' :
          status === 'in_progress' ? 'bg-ember-500' :
          'bg-transparent border border-cream-50/20'
        return (
          <Link
            key={l.id}
            to={`/lessons/${l.slug}`}
            className={`flex items-center gap-5 py-5 border-b border-cream-50/[0.06] hover:bg-cream-50/[0.02] transition group px-2 -mx-2 ${muted ? 'opacity-60 hover:opacity-100' : ''}`}
          >
            <div className="prefix-num w-10 shrink-0">{String(indexOffset + idx + 1).padStart(2, '0')}</div>
            <div className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
            <div className="flex-1 min-w-0">
              <div className="font-display text-base md:text-lg tracking-[0.04em] text-cream-50 group-hover:text-gold-100 transition">{l.title}</div>
              {l.summary && <div className="text-xs md:text-sm text-cream-50/55 mt-1 line-clamp-1">{l.summary}</div>}
            </div>
            <div className="hidden sm:block text-[10px] uppercase tracking-[0.22em] text-cream-50/40 shrink-0">
              D{l.difficulty}{l.duration_minutes ? ` · ${l.duration_minutes}m` : ''}
            </div>
            <div className="text-cream-50/30 group-hover:text-gold-100 transition">→</div>
          </Link>
        )
      })}
    </div>
  )
}
