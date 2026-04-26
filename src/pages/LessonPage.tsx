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

type TheoryEntry = {
  id: string
  title: string
  summary: string | null
}

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

  const goNext = () => {
    if (neighbors.next) navigate(`/lessons/${neighbors.next.slug}`)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-6 py-12 text-cream-50/60">Loading lesson…</div>
      </AppLayout>
    )
  }
  if (!lesson) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-6 py-12 text-cream-50/60">Lesson not found.</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-widest">
          <Link to={`/focus/${lesson.focus_area_id}`} className="text-gold-500 hover:text-gold-100">
            ← {lesson.focus_area_id}
          </Link>
          <span className="text-gold-900">·</span>
          <span className="text-gold-900">Difficulty {lesson.difficulty} / 5</span>
          {lesson.duration_minutes && (
            <>
              <span className="text-gold-900">·</span>
              <span className="text-gold-900">{lesson.duration_minutes} min</span>
            </>
          )}
        </div>

        <h1 className="font-display text-3xl md:text-4xl tracking-[0.08em] text-cream-50 mb-3">{lesson.title}</h1>
        {lesson.summary && <p className="text-lg text-cream-50/70 mb-8">{lesson.summary}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          <div>
            {lesson.body && <Markdown>{lesson.body}</Markdown>}

            <div className="mt-12 flex items-center gap-3 border-t border-night-700 pt-6">
              {status === 'completed' ? (
                <span className="px-5 py-2.5 bg-gold-500/15 border border-gold-500/40 text-gold-100 text-sm tracking-widest uppercase rounded">
                  ✓ Completed
                </span>
              ) : (
                <button
                  type="button"
                  onClick={markComplete}
                  disabled={saving}
                  className="px-6 py-3 bg-ember-500 hover:bg-ember-500/90 text-cream-50 font-semibold tracking-[0.18em] uppercase text-sm rounded transition disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Mark complete'}
                </button>
              )}

              {neighbors.next && (
                <button
                  type="button"
                  onClick={goNext}
                  className="ml-auto px-5 py-2.5 border border-gold-500/40 text-gold-100 hover:bg-gold-500/10 text-sm tracking-widest uppercase rounded transition"
                >
                  Next lesson →
                </button>
              )}
            </div>

            {neighbors.prev && (
              <div className="mt-4 text-sm">
                <Link to={`/lessons/${neighbors.prev.slug}`} className="text-cream-50/55 hover:text-gold-100">
                  ← Prev: {neighbors.prev.title}
                </Link>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            {theory.length > 0 && (
              <div className="rounded-xl border border-gold-500/25 bg-gold-500/5 p-5">
                <div className="text-xs uppercase tracking-widest text-gold-500 mb-3">Theory in this lesson</div>
                <ul className="space-y-3">
                  {theory.map(t => (
                    <li key={t.id}>
                      <Link to={`/theory/${t.id}`} className="block group">
                        <div className="font-display text-base tracking-wide text-cream-50 group-hover:text-gold-100 transition">{t.title}</div>
                        {t.summary && <div className="text-xs text-cream-50/55 mt-0.5">{t.summary}</div>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(lesson.video_url || lesson.tab_url) && (
              <div className="rounded-xl border border-night-700 p-5">
                <div className="text-xs uppercase tracking-widest text-gold-500 mb-3">Resources</div>
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
