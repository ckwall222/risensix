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

  if (loading) return <AppLayout><div className="max-w-4xl mx-auto px-6 py-16 text-cream-50/80 tracking-widest uppercase text-sm">Loading…</div></AppLayout>
  if (!entry) return <AppLayout><div className="max-w-4xl mx-auto px-6 py-16 text-cream-50/70">Not found.</div></AppLayout>

  return (
    <AppLayout>
      <div className="max-w-[840px] mx-auto px-5 sm:px-6 pt-10 md:pt-14 pb-14">
        <Link to="/theory" className="btn-link text-ember-500 text-[14px]">‹ Theory library</Link>
        <div className="eyebrow-hero mt-4">Theory · Difficulty {entry.difficulty} / 5</div>
        <h1 className="h-display text-4xl md:text-6xl mt-2 leading-[1.05]">{entry.title}</h1>
        {entry.summary && (
          <p className="text-lg text-cream-50/75 mt-4 max-w-[680px] leading-snug tracking-[-0.012em]">
            {entry.summary}
          </p>
        )}

        <hr className="hairline mt-8 mb-10" />

        {entry.body && <Markdown>{entry.body}</Markdown>}

        {lessons.length > 0 && (
          <div className="mt-14 pt-8 border-t border-black/[0.08]">
            <div className="eyebrow mb-4">Lessons that use this</div>
            <ul className="space-y-3">
              {lessons.map(l => (
                <li key={l.id} className="flex items-baseline gap-3 flex-wrap">
                  <Link to={`/lessons/${l.slug}`} className="text-[16px] font-medium text-cream-50 hover:text-ember-500 transition">
                    {l.title}
                  </Link>
                  <span className="text-[12px] text-gold-100">{l.focus_area_id}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
