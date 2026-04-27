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
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <Link to="/dashboard" className="text-[10px] uppercase tracking-[0.28em] text-gold-100 hover:text-cream-50 transition">← Home</Link>
        <div className="eyebrow mt-6 mb-3">Today · {today}</div>
        <h1 className="h-display text-4xl md:text-5xl tracking-[0.06em]">{challenge.title}</h1>
        <p className="text-lg text-cream-50/80 mt-4 max-w-2xl leading-relaxed">{challenge.summary}</p>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.22em]">
          <span className="pill">{challenge.duration} min</span>
          <span className="text-cream-50/80">
            🔥 {streak === 0 ? 'Start your streak today' : `${streak}-day streak`}
          </span>
        </div>

        <div className="hairline mt-8 mb-10" />

        <Markdown>{challenge.instructions}</Markdown>

        <div className="mt-12 pt-6 border-t border-cream-50/[0.06] flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {done ? (
            <>
              <span className="pill">✓ Done today</span>
              <span className="text-cream-50/80 text-sm">
                Back tomorrow for the next one. Streak: {streak} day{streak === 1 ? '' : 's'}.
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={markDone}
              disabled={saving || loading}
              className="btn btn-primary"
            >
              {saving ? 'Saving…' : 'Mark complete'}
            </button>
          )}
          <Link to="/dashboard" className="btn btn-ghost sm:ml-auto">
            Back to home →
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
