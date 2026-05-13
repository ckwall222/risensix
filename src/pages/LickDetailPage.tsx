import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { Markdown } from './../components/Markdown'
import { LickPlayer } from '../components/LickPlayer'
import { fetchLickBySlug, GENRE_LABEL, type Lick } from '../lib/licks'

export function LickDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [lick, setLick] = useState<Lick | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    let mounted = true
    setLoading(true)
    fetchLickBySlug(slug).then(l => {
      if (!mounted) return
      setLick(l)
      setLoading(false)
    })
    return () => { mounted = false }
  }, [slug])

  if (loading) {
    return <AppLayout><div className="max-w-3xl mx-auto px-6 py-16 text-cream-50/80">Loading…</div></AppLayout>
  }

  if (!lick) {
    return (
      <AppLayout>
        <div className="max-w-[840px] mx-auto px-6 py-16">
          <Link to="/licks" className="btn-link text-ember-500 text-[14px]">‹ Lick Library</Link>
          <h1 className="h-display text-3xl mt-6">Lick not found</h1>
          <p className="text-cream-50/75 mt-4">That lick doesn't exist or has been retired.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-[840px] mx-auto px-5 sm:px-6 pt-10 md:pt-14 pb-14">
        <Link to="/licks" className="btn-link text-ember-500 text-[14px]">‹ Lick Library</Link>
        <div className="eyebrow-hero mt-4">{GENRE_LABEL[lick.genre]} · Difficulty {lick.difficulty}</div>
        <h1 className="h-display text-4xl md:text-6xl mt-2 leading-[1.05]">{lick.name}</h1>
        <p className="mt-4 text-lg text-cream-50/75 max-w-[680px] leading-snug tracking-[-0.012em]">
          {lick.summary}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="pill">{lick.key_root} {lick.key_quality}</span>
          <span className="pill">{lick.bpm} BPM</span>
          <span className="pill">{lick.feel}</span>
          {lick.position_label && <span className="pill">{lick.position_label}</span>}
        </div>

        <hr className="hairline mt-8 mb-8" />

        <LickPlayer notes={lick.notes} bpm={lick.bpm} feel={lick.feel} bars={lick.bars} />

        <hr className="hairline mt-10 mb-8" />

        <h2 className="h-section mb-4">Instructor notes</h2>
        <Markdown>{lick.instructor_notes}</Markdown>
      </div>
    </AppLayout>
  )
}
