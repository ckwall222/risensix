import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'
import { AppLayout } from '../components/AppLayout'
import { Markdown } from '../components/Markdown'
import { getProgressForLesson, setLessonStatus, LessonStatus } from '../lib/lessonProgress'

type Lesson = {
  id: string
  slug: string
  title: string
  focus_area_id: string
  difficulty: number
  duration_minutes: number | null
  summary: string | null
  body: string | null
  video_url: string | null
  tab_url: string | null
  sort_order: number
}

type TheoryEntry = { id: string; title: string; summary: string | null }

export function LessonPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [theory, setTheory] = useState<TheoryEntry[]>([])
  const [neighbors, setNeighbors] = useState<{ prev: Lesson | null; next: Lesson | null }>({ prev: null, next: null })
  const [status, setStatus] = useState<LessonStatus>('not_started')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!slug || !user) return
      setLoading(true)
      const { data: lessonRow } = await supabase
        .from('lessons')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
      if (!mounted) return
      if (!lessonRow) { setLoading(false); return }
      const l = lessonRow as Lesson
      setLesson(l)

      const [{ data: links }, { data: areaLessons }, prog] = await Promise.all([
        supabase
          .from('lesson_theory_links')
          .select('theory_entry_id, theory_entries(id, title, summary)')
          .eq('lesson_id', l.id),
        supabase
          .from('lessons')
          .select('id, slug, title, focus_area_id, difficulty, duration_minutes, summary, body, video_url, tab_url, sort_order')
          .eq('focus_area_id', l.focus_area_id)
          .order('sort_order'),
        getProgressForLesson(user.id, l.id),
      ])
      if (!mounted) return

      const linkedTheory: TheoryEntry[] = (links ?? [])
        .map((row: { theory_entries: TheoryEntry | TheoryEntry[] | null }) => {
          const e = row.theory_entries
          return Array.isArray(e) ? e[0] : e
        })
        .filter((e): e is TheoryEntry => !!e)
      setTheory(linkedTheory)

      const all = (areaLessons as Lesson[] | null) ?? []
      const idx = all.findIndex(x => x.id === l.id)
      setNeighbors({
        prev: idx > 0 ? all[idx - 1] : null,
        next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null,
      })

      setStatus(prog?.status ?? 'not_started')

      if (!prog) {
        await setLessonStatus(user.id, l.id, 'in_progress')
        setStatus('in_progress')
      }

      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [slug, user])

  const markComplete = async () => {
    if (!lesson || !user) return
    setSaving(true)
    await setLessonStatus(user.id, lesson.id, 'completed')
    setStatus('completed')
    setSaving(false)
  }

  const goNext = () => { if (neighbors.next) navigate(`/lessons/${neighbors.next.slug}`) }

  if (loading) return <AppLayout><div className="max-w-5xl mx-auto px-6 py-16 text-cream-50/40 tracking-widest uppercase text-sm">Loading lesson…</div></AppLayout>
  if (!lesson) return <AppLayout><div className="max-w-5xl mx-auto px-6 py-16 text-cream-50/55">Lesson not found.</div></AppLayout>

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12">
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.28em] mb-6">
          <Link to={`/focus/${lesson.focus_area_id}`} className="text-gold-500 hover:text-gold-100 transition">
            ← {lesson.focus_area_id}
          </Link>
          <span className="text-cream-50/30">·</span>
          <span className="text-cream-50/45">Difficulty {lesson.difficulty} / 5</span>
          {lesson.duration_minutes && (
            <>
              <span className="text-cream-50/30">·</span>
              <span className="text-cream-50/45">{lesson.duration_minutes} min</span>
            </>
          )}
          <span className="ml-auto">
            {status === 'completed' && <span className="pill">✓ Completed</span>}
          </span>
        </div>

        <div className="eyebrow mb-3">Lesson</div>
        <h1 className="h-display text-4xl md:text-5xl tracking-[0.04em] leading-[1.08]">{lesson.title}</h1>
        {lesson.summary && <p className="text-lg text-cream-50/70 mt-5 max-w-3xl leading-relaxed">{lesson.summary}</p>}

        <div className="hairline mt-10 mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-12">
          <div>
            {lesson.body && <Markdown>{lesson.body}</Markdown>}

            <div className="mt-16 pt-6 border-t border-cream-50/[0.06] flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {status === 'completed' ? (
                <span className="pill">✓ Completed</span>
              ) : (
                <button
                  type="button"
                  onClick={markComplete}
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Saving…' : 'Mark complete'}
                </button>
              )}

              {neighbors.next && (
                <button
                  type="button"
                  onClick={goNext}
                  className="btn btn-ghost sm:ml-auto"
                >
                  Next lesson →
                </button>
              )}
            </div>

            {neighbors.prev && (
              <div className="mt-6">
                <Link to={`/lessons/${neighbors.prev.slug}`} className="text-[11px] uppercase tracking-[0.22em] text-cream-50/45 hover:text-gold-100 transition">
                  ← Prev: {neighbors.prev.title}
                </Link>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            {theory.length > 0 && (
              <div className="card is-feature">
                <div className="eyebrow mb-3">Theory in this lesson</div>
                <ul className="space-y-3">
                  {theory.map(t => (
                    <li key={t.id}>
                      <Link to={`/theory/${t.id}`} className="block group">
                        <div className="font-display text-base tracking-[0.04em] text-cream-50 group-hover:text-gold-100 transition">{t.title}</div>
                        {t.summary && <div className="text-xs text-cream-50/55 mt-1 leading-relaxed">{t.summary}</div>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(lesson.video_url || lesson.tab_url) && (
              <div className="card">
                <div className="eyebrow mb-3">Resources</div>
                {lesson.video_url && (
                  <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="block text-sm text-cream-50 hover:text-gold-100 mb-2 underline underline-offset-4">
                    Watch video →
                  </a>
                )}
                {lesson.tab_url && (
                  <a href={lesson.tab_url} target="_blank" rel="noopener noreferrer" className="block text-sm text-cream-50 hover:text-gold-100 underline underline-offset-4">
                    Download tab →
                  </a>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}
