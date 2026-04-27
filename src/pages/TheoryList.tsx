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
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <Link to="/dashboard" className="text-[10px] uppercase tracking-[0.28em] text-gold-100 hover:text-cream-50 transition">← Dashboard</Link>
        <div className="eyebrow mt-6 mb-3">Library</div>
        <h1 className="h-display text-4xl md:text-5xl tracking-[0.06em]">Theory</h1>
        <p className="text-lg text-cream-50/70 mt-4 max-w-3xl leading-relaxed">
          The why behind the what. Browseable on its own — and woven through every lesson when relevant.
        </p>

        <div className="hairline mt-10 mb-10" />

        {loading ? (
          <div className="text-sm text-cream-50/80 tracking-widest uppercase">Loading…</div>
        ) : entries.length === 0 ? (
          <p className="text-cream-50/70">Theory entries coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-cream-50/[0.06]">
            {entries.map((e, idx) => (
              <Link
                key={e.id}
                to={`/theory/${e.id}`}
                className="block bg-night-900 hover:bg-night-700/30 transition p-7"
              >
                <div className="flex items-baseline justify-between mb-5">
                  <div className="prefix-num">{String(idx + 1).padStart(2, '0')}</div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-cream-50/80">D{e.difficulty}</div>
                </div>
                <div className="h-display text-xl md:text-2xl mb-3">{e.title}</div>
                {e.summary && <p className="text-sm text-cream-50/80 leading-relaxed">{e.summary}</p>}
                <div className="mt-5 text-[10px] uppercase tracking-[0.28em] text-gold-100">Read →</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
