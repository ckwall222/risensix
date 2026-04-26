import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AppLayout } from '../components/AppLayout'

type Entry = { id: string; title: string; summary: string | null; difficulty: number }

export function TheoryList() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase
      .from('theory_entries')
      .select('id, title, summary, difficulty')
      .order('sort_order')
      .then(({ data }) => {
        if (!mounted) return
        setEntries((data as Entry[] | null) ?? [])
        setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="text-xs uppercase tracking-widest text-gold-500 hover:text-gold-100">← Dashboard</Link>
        <h1 className="mt-3 font-display text-3xl md:text-4xl tracking-[0.08em] text-cream-50">Theory</h1>
        <p className="text-lg text-cream-50/70 mt-3 max-w-3xl">
          The why behind the what. Browseable on its own — and woven through every lesson when relevant.
        </p>

        <div className="mt-10">
          {loading ? (
            <p className="text-cream-50/55">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-cream-50/55">Theory entries coming soon.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entries.map(e => (
                <li key={e.id}>
                  <Link
                    to={`/theory/${e.id}`}
                    className="block p-5 rounded-xl border border-night-700 hover:border-gold-500/50 transition"
                  >
                    <div className="text-xs text-gold-500 uppercase tracking-widest mb-1">Difficulty {e.difficulty}/5</div>
                    <div className="font-display text-lg tracking-wide text-cream-50">{e.title}</div>
                    {e.summary && <p className="text-sm text-cream-50/65 mt-2">{e.summary}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
