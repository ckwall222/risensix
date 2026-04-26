import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'
import { AppLayout } from '../components/AppLayout'
import { getProgressForLessons, LessonProgressRow } from '../lib/lessonProgress'

type FocusArea = {
  id: string
  name: string
  description: string | null
}

type LessonRow = {
  id: string
  slug: string
  title: string
  difficulty: number
  duration_minutes: number | null
  summary: string | null
  sort_order: number
}

export function FocusAreaPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [area, setArea] = useState<FocusArea | null>(null)
  const [lessons, setLessons] = useState<LessonRow[]>([])
  const [progress, setProgress] = useState<Record<string, LessonProgressRow>>({})
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return <AppLayout><div className="max-w-5xl mx-auto px-6 py-12 text-cream-50/60">Loading…</div></AppLayout>
  }

  if (!area) {
    return <AppLayout><div className="max-w-5xl mx-auto px-6 py-12 text-cream-50/60">Focus area not found.</div></AppLayout>
  }

  const completedCount = Object.values(progress).filter(p => p.status === 'completed').length
  const pct = lessons.length === 0 ? 0 : Math.round((completedCount / lessons.length) * 100)

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="text-xs uppercase tracking-widest text-gold-500 hover:text-gold-100">← Dashboard</Link>
        <h1 className="mt-3 font-display text-3xl md:text-4xl tracking-[0.08em] text-cream-50">{area.name}</h1>
        {area.description && <p className="text-lg text-cream-50/70 mt-3 max-w-3xl">{area.description}</p>}

        <div className="mt-8 mb-8">
          <div className="flex items-center justify-between mb-2 text-xs uppercase tracking-widest">
            <span className="text-gold-500">Progress</span>
            <span className="text-cream-50/65">{completedCount} / {lessons.length} · {pct}%</span>
          </div>
          <div className="h-2 bg-night-700 rounded-full overflow-hidden">
            <div className="h-full bg-gold-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {lessons.length === 0 ? (
          <p className="text-cream-50/55">Lessons coming soon.</p>
        ) : (
          <ol className="space-y-2">
            {lessons.map((l, idx) => {
              const status = progress[l.id]?.status ?? 'not_started'
              const dot = status === 'completed' ? 'bg-gold-500' : status === 'in_progress' ? 'bg-ember-500' : 'bg-night-700 border border-night-700'
              return (
                <li key={l.id}>
                  <Link
                    to={`/lessons/${l.slug}`}
                    className="flex items-center gap-4 p-4 rounded-lg border border-night-700 hover:border-gold-500/50 transition group"
                  >
                    <div className="text-xs text-gold-900 tracking-widest w-8">{String(idx + 1).padStart(2, '0')}</div>
                    <div className={`h-2 w-2 rounded-full ${dot}`} />
                    <div className="flex-1">
                      <div className="font-display text-base tracking-wide text-cream-50 group-hover:text-gold-100">{l.title}</div>
                      {l.summary && <div className="text-xs text-cream-50/55 mt-0.5 line-clamp-1">{l.summary}</div>}
                    </div>
                    <div className="text-xs text-gold-900 tracking-widest hidden sm:block">
                      D{l.difficulty}{l.duration_minutes ? ` · ${l.duration_minutes}m` : ''}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </AppLayout>
  )
}
