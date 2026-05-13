import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'
import { AppLayout } from '../components/AppLayout'
import { bulkSetCompleted, getProgressForLessons, LessonProgressRow } from '../lib/lessonProgress'

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
  const [bulkSaving, setBulkSaving] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)

  const refresh = useCallback(() => setRefreshTick(t => t + 1), [])

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
  }, [id, user, refreshTick])

  if (loading) return <AppLayout><div className="max-w-5xl mx-auto px-6 py-16 text-cream-50/80 tracking-widest uppercase text-sm">Loading…</div></AppLayout>
  if (!area) return <AppLayout><div className="max-w-5xl mx-auto px-6 py-16 text-cream-50/70">Focus area not found.</div></AppLayout>

  const completedCount = Object.values(progress).filter(p => p.status === 'completed').length
  const pct = lessons.length === 0 ? 0 : Math.round((completedCount / lessons.length) * 100)

  const minDifficulty = ABILITY_MIN_DIFFICULTY[profile?.ability_level ?? 'beginner'] ?? 1
  const foundational = lessons.filter(l => l.difficulty < minDifficulty)
  const current      = lessons.filter(l => l.difficulty >= minDifficulty)
  const foundationalCompleted = foundational.filter(l => progress[l.id]?.status === 'completed').length
  const foundationalAllDone = foundational.length > 0 && foundationalCompleted === foundational.length

  const handleBulkComplete = async () => {
    if (!user) return
    setBulkSaving(true)
    const idsToMark = foundational.filter(l => progress[l.id]?.status !== 'completed').map(l => l.id)
    await bulkSetCompleted(user.id, idsToMark)
    setBulkSaving(false)
    refresh()
  }

  return (
    <AppLayout>
      <section className="pt-14 md:pt-20 pb-6">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <Link to="/dashboard" className="btn-link text-ember-500 text-[14px]">← Back home</Link>
          <div className="eyebrow-hero mt-6">Focus area</div>
          <h1 className="h-display text-4xl md:text-6xl mt-2">{area.name}</h1>
          {area.description && (
            <p className="mt-4 text-lg text-cream-50/75 max-w-[640px] leading-snug tracking-[-0.012em]">
              {area.description}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-[1080px] mx-auto px-5 sm:px-6 pb-14">
        <div className="card mb-8" style={{ padding: '1.5rem 1.75rem' }}>
          <div className="flex items-center justify-between mb-3 text-[13px] font-medium">
            <span className="text-gold-500">Progress</span>
            <span className="text-cream-50/70">{completedCount} / {lessons.length} · {pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/[0.08] overflow-hidden">
            <div className="h-full bg-ember-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {lessons.length === 0 ? (
          <p className="text-cream-50/70">Lessons coming soon.</p>
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
              <p className="text-cream-50/70 mb-8">
                No lessons at your level yet — more coming soon. Foundational material is below.
              </p>
            )}

            {foundational.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between gap-4 py-4 border-y border-black/[0.08]">
                  <button
                    type="button"
                    onClick={() => setFoundationalOpen(o => !o)}
                    className="flex items-baseline gap-3 flex-1 text-left group"
                  >
                    <span className={`text-gold-500 transition-transform ${foundationalOpen ? 'rotate-90' : ''}`}>▸</span>
                    <span className="font-display font-semibold text-[17px] tracking-[-0.015em] text-cream-50 group-hover:text-ember-500 transition">
                      Foundational lessons
                    </span>
                    <span className="text-[13px] text-gold-100 font-medium">
                      {foundationalCompleted}/{foundational.length}
                    </span>
                  </button>
                  {!foundationalAllDone && (
                    <button
                      type="button"
                      onClick={handleBulkComplete}
                      disabled={bulkSaving}
                      className="btn btn-ghost"
                      style={{ padding: '0.4rem 1rem', fontSize: '13px', minHeight: '32px' }}
                    >
                      {bulkSaving ? 'Marking…' : 'Mark all done'}
                    </button>
                  )}
                  {foundationalAllDone && (
                    <span className="pill" style={{ color: '#1D7F3F', borderColor: 'rgba(29,127,63,0.30)', background: 'rgba(29,127,63,0.06)' }}>
                      ✓ All done
                    </span>
                  )}
                </div>

                {foundationalOpen && (
                  <div className="pt-2">
                    <p className="text-[14px] text-cream-50/70 mt-3 mb-2 leading-snug max-w-[640px]">
                      Below your current level — review them anytime, or mark them all done if you don't need to walk through them.
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
    <div className="border-t border-black/[0.08]">
      {lessons.map((l, idx) => {
        const status = progress[l.id]?.status ?? 'not_started'
        const dotStyle =
          status === 'completed' ? { background: '#1D7F3F', border: '1px solid #1D7F3F' } :
          status === 'in_progress' ? { background: '#0066CC', border: '1px solid #0066CC' } :
          { background: 'transparent', border: '1px solid rgba(0,0,0,0.18)' }
        return (
          <Link
            key={l.id}
            to={`/lessons/${l.slug}`}
            className={`flex items-center gap-5 py-5 border-b border-black/[0.08] hover:bg-black/[0.02] transition group px-2 -mx-2 ${muted ? 'opacity-60 hover:opacity-100' : ''}`}
          >
            <div className="prefix-num w-10 shrink-0" style={{ fontSize: 17 }}>
              {String(indexOffset + idx + 1).padStart(2, '0')}
            </div>
            <div className="h-2.5 w-2.5 rounded-full shrink-0" style={dotStyle} />
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold text-[16px] md:text-[18px] tracking-[-0.015em] text-cream-50 group-hover:text-ember-500 transition">
                {l.title}
              </div>
              {l.summary && (
                <div className="text-[13px] md:text-[14px] text-cream-50/70 mt-0.5 line-clamp-1">
                  {l.summary}
                </div>
              )}
            </div>
            <div className="hidden sm:block text-[12px] text-gold-100 font-medium shrink-0">
              D{l.difficulty}{l.duration_minutes ? ` · ${l.duration_minutes}m` : ''}
            </div>
            <div className="text-gold-100 group-hover:text-ember-500 transition">›</div>
          </Link>
        )
      })}
    </div>
  )
}
