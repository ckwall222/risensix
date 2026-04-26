import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AppLayout } from '../components/AppLayout'
import { Markdown } from '../components/Markdown'

type Entry = { id: string; title: string; summary: string | null; body: string | null; difficulty: number }
type LessonRef = { id: string; slug: string; title: string; focus_area_id: string }

export function TheoryDetail() {
  const { id } = useParams<{ id: string }>()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [lessons, setLessons] = useState<LessonRef[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!id) return
      setLoading(true)
      const { data: e } = await supabase
        .from('theory_entries')
        .select('id, title, summary, body, difficulty')
        .eq('id', id)
        .maybeSingle()
      if (!mounted) return
      setEntry(e as Entry | null)

      const { data: ls } = await supabase
        .from('lesson_theory_links')
        .select('lessons(id, slug, title, focus_area_id)')
        .eq('theory_entry_id', id)
      if (!mounted) return
      const list: LessonRef[] = (ls ?? [])
        .map((row: { lessons: LessonRef | LessonRef[] | null }) => {
          const r = row.lessons
          return Array.isArray(r) ? r[0] : r
        })
        .filter((r): r is LessonRef => !!r)
      setLessons(list)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [id])

  if (loading) return <AppLayout><div className="max-w-4xl mx-auto px-6 py-12 text-cream-50/60">Loading…</div></AppLayout>
  if (!entry) return <AppLayout><div className="max-w-4xl mx-auto px-6 py-12 text-cream-50/60">Not found.</div></AppLayout>

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/theory" className="text-xs uppercase tracking-widest text-gold-500 hover:text-gold-100">← Theory library</Link>
        <h1 className="mt-3 font-display text-3xl md:text-4xl tracking-[0.08em] text-cream-50">{entry.title}</h1>
        {entry.summary && <p className="text-lg text-cream-50/70 mt-3">{entry.summary}</p>}

        <div className="mt-10">
          {entry.body && <Markdown>{entry.body}</Markdown>}
        </div>

        {lessons.length > 0 && (
          <div className="mt-12 rounded-xl border border-night-700 p-5">
            <div className="text-xs uppercase tracking-widest text-gold-500 mb-3">Lessons that use this</div>
            <ul className="space-y-2">
              {lessons.map(l => (
                <li key={l.id}>
                  <Link to={`/lessons/${l.slug}`} className="text-cream-50 hover:text-gold-100 underline underline-offset-4">
                    {l.title}
                  </Link>
                  <span className="ml-2 text-xs text-gold-900 tracking-widest uppercase">{l.focus_area_id}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
