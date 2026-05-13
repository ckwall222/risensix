import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AppLayout } from '../components/AppLayout'
import { Markdown } from '../components/Markdown'
import { pickChallengeFor, todayDateStr } from '../lib/dailyChallenges'
import { isCompletedToday, markCompletedToday, getStreak } from '../lib/dailyProgress'

export function DailyPage() {
  const { user, profile } = useAuth()
  const [done, setDone] = useState(false)
  const [streak, setStreak] = useState(0)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const today = todayDateStr()
  const challenge = user && profile
    ? pickChallengeFor(user.id, today, profile.ability_level)
    : null

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!user) return
      setLoading(true)
      const [d, s] = await Promise.all([isCompletedToday(user.id), getStreak(user.id)])
      if (!mounted) return
      setDone(d)
      setStreak(s)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [user])

  const markDone = async () => {
    if (!user || !challenge) return
    setSaving(true)
    await markCompletedToday(user.id, challenge.id)
    const s = await getStreak(user.id)
    setSaving(false)
    setDone(true)
    setStreak(s)
  }

  if (!challenge) {
    return <AppLayout><div className="max-w-3xl mx-auto px-6 py-16 text-cream-50/80">Loading…</div></AppLayout>
  }

  return (
    <AppLayout>
      <div className="max-w-[840px] mx-auto px-5 sm:px-6 pt-10 md:pt-14 pb-14">
        <Link to="/dashboard" className="btn-link text-ember-500 text-[14px]">← Back home</Link>
        <div className="eyebrow-hero mt-4">Today · {today}</div>
        <h1 className="h-display text-4xl md:text-6xl mt-2 leading-[1.05]">{challenge.title}</h1>
        <p className="mt-4 text-lg text-cream-50/75 max-w-[680px] leading-snug tracking-[-0.012em]">
          {challenge.summary}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="pill">{challenge.duration} min</span>
          <span className="text-gold-100 text-[14px] font-medium">
            🔥 {streak === 0 ? 'Start your streak today' : `${streak}-day streak`}
          </span>
        </div>

        <hr className="hairline mt-8 mb-10" />

        <Markdown>{challenge.instructions}</Markdown>

        <div className="mt-12 pt-6 border-t border-black/[0.08] flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {done ? (
            <>
              <span className="pill" style={{ color: '#1D7F3F', borderColor: 'rgba(29,127,63,0.30)', background: 'rgba(29,127,63,0.06)' }}>
                ✓ Done today
              </span>
              <span className="text-cream-50/70 text-[14px]">
                Back tomorrow for the next one. Streak: {streak} day{streak === 1 ? '' : 's'}.
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={markDone}
              disabled={saving || loading}
              className="btn btn-primary"
              style={{ padding: '0.7rem 1.5rem', fontSize: '15px' }}
            >
              {saving ? 'Saving…' : 'Mark complete'}
            </button>
          )}
          <Link to="/dashboard" className="btn btn-ghost sm:ml-auto" style={{ padding: '0.7rem 1.5rem', fontSize: '15px' }}>
            Back home&nbsp;›
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
