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
      <section className="pt-14 md:pt-20 pb-6 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <Link to="/dashboard" className="btn-link text-ember-500 text-[14px]">← Back home</Link>
          <div className="eyebrow-hero mt-6">Library · Theory</div>
          <h1 className="h-display text-5xl md:text-6xl mt-2">
            The why<span className="block text-gold-100">behind the what.</span>
          </h1>
          <p className="mt-4 text-lg text-cream-50/75 max-w-[640px] mx-auto leading-snug tracking-[-0.012em]">
            Browseable on its own — and woven through every lesson when relevant.
          </p>
        </div>
      </section>

      <div className="max-w-[1080px] mx-auto px-5 sm:px-6 pb-14">
        {loading ? (
          <div className="text-[15px] text-cream-50/65">Loading…</div>
        ) : entries.length === 0 ? (
          <p className="text-cream-50/70">Theory entries coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {entries.map((e, idx) => (
              <Link key={e.id} to={`/theory/${e.id}`} className="card group block" style={{ padding: '1.75rem' }}>
                <div className="flex items-baseline justify-between mb-5">
                  <div className="prefix-num">{String(idx + 1).padStart(2, '0')}</div>
                  <div className="text-[12px] text-gold-100 font-medium">D{e.difficulty}</div>
                </div>
                <div className="h-display text-xl md:text-2xl mb-2 group-hover:text-ember-500 transition">{e.title}</div>
                {e.summary && <p className="text-[14px] text-cream-50/75 leading-snug">{e.summary}</p>}
                <div className="mt-4 text-[13px] text-ember-500">Read&nbsp;›</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
