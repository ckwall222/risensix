import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { useAuth } from '../auth/AuthContext'
import type { SubscriptionStatus } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  free: 'Free',
  trialing: 'Free trial',
  active: 'Active',
  past_due: 'Payment past due',
  canceled: 'Canceled',
  expired: 'Expired',
}

const STATUS_TONE: Record<SubscriptionStatus, string> = {
  free: '#6E6E73',
  trialing: '#0066CC',
  active: '#1D7F3F',
  past_due: '#B07A1A',
  canceled: '#A52917',
  expired: '#6E6E73',
}

export function BillingPage() {
  const { profile, refreshProfile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const status = profile?.subscription_status ?? 'free'
  const tone = STATUS_TONE[status]
  const endsAt = profile?.subscription_ends_at
    ? new Date(profile.subscription_ends_at).toLocaleDateString()
    : null
  const checkoutResult = searchParams.get('checkout')

  // When the user returns from Stripe Checkout, refresh the profile so the
  // updated subscription_status (set by the webhook) shows up.
  useEffect(() => {
    if (checkoutResult === 'success') {
      void refreshProfile()
      // Poll once more after a brief delay — webhooks can land slightly after
      // the redirect lands.
      const t = setTimeout(() => { void refreshProfile() }, 2500)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutResult])

  const clearCheckoutParam = () => {
    if (checkoutResult) {
      searchParams.delete('checkout')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const handleSubscribeClick = async (plan: string) => {
    setError(null)
    setBusy(plan)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('Not signed in')
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error ?? `Checkout failed (${res.status})`)
      if (!body.url) throw new Error('No checkout URL returned')
      window.location.href = body.url
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setBusy(null)
    }
  }

  const handleManageClick = async () => {
    setError(null)
    setBusy('manage')
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('Not signed in')
      const res = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error ?? `Portal failed (${res.status})`)
      if (!body.url) throw new Error('No portal URL returned')
      window.location.href = body.url
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setBusy(null)
    }
  }

  return (
    <AppLayout>
      <section className="pt-14 md:pt-20 pb-6 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <Link to="/dashboard" className="btn-link text-ember-500 text-[14px]">← Back home</Link>
          <div className="eyebrow-hero mt-4">Billing · Subscription</div>
          <h1 className="h-display text-5xl md:text-6xl mt-2">
            {status === 'active' || status === 'trialing'
              ? 'You\'re in.'
              : <>Practice deeper.<span className="block text-gold-100">Subscribe for full access.</span></>}
          </h1>
          <p className="mt-4 text-lg text-cream-50/75 max-w-[560px] mx-auto leading-snug tracking-[-0.012em]">
            Free gets you the basics. A subscription unlocks the full curriculum, all tools, and the songbook.
          </p>
        </div>
      </section>

      <div className="max-w-[920px] mx-auto px-5 sm:px-6 pb-14">
        {/* Status banner after returning from Stripe Checkout */}
        {checkoutResult === 'success' && (
          <div
            className="rounded-[14px] p-4 mb-5 flex items-start justify-between gap-4"
            style={{ background: 'rgba(29,127,63,0.06)', border: '1px solid rgba(29,127,63,0.30)', color: '#1D7F3F' }}
          >
            <div className="text-[14px]">
              <strong className="font-semibold">Welcome to Pro.</strong> Your subscription is live.
              If the status below still says Free, it'll catch up in a few seconds (webhook running).
            </div>
            <button type="button" onClick={clearCheckoutParam} className="text-[14px] underline opacity-80 hover:opacity-100">
              Dismiss
            </button>
          </div>
        )}
        {checkoutResult === 'canceled' && (
          <div
            className="rounded-[14px] p-4 mb-5 flex items-start justify-between gap-4"
            style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.10)' }}
          >
            <div className="text-[14px] text-cream-50/85">Checkout canceled — no charge.</div>
            <button type="button" onClick={clearCheckoutParam} className="text-[14px] underline opacity-80 hover:opacity-100">
              Dismiss
            </button>
          </div>
        )}
        {error && (
          <div
            className="rounded-[14px] p-4 mb-5 text-[14px]"
            style={{ background: 'rgba(214,57,35,0.06)', border: '1px solid rgba(214,57,35,0.25)', color: '#A52917' }}
          >
            {error}
          </div>
        )}

        {/* Current status */}
        <div className="card mb-8" style={{ padding: '1.5rem 1.75rem' }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="eyebrow mb-1.5">Current plan</div>
              <div className="flex items-center gap-3">
                <span
                  className="font-display font-medium text-2xl"
                  style={{ fontVariationSettings: '"opsz" 72', color: tone }}
                >
                  {STATUS_LABEL[status]}
                </span>
                {profile?.plan && (
                  <span className="text-[14px] text-cream-50/65 font-medium">· {profile.plan}</span>
                )}
              </div>
              {endsAt && (
                <div className="text-[13px] text-gold-100 mt-1.5">
                  {status === 'canceled' ? `Ends ${endsAt}` : `Renews ${endsAt}`}
                </div>
              )}
            </div>
            {(status === 'active' || status === 'trialing' || status === 'past_due') && (
              <button
                type="button"
                onClick={handleManageClick}
                disabled={busy === 'manage'}
                className="btn btn-ghost"
                style={{ padding: '0.55rem 1.25rem' }}
              >
                {busy === 'manage' ? 'Opening…' : 'Manage subscription'}
              </button>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-8">
          <PlanCard
            name="Pro"
            price="$12"
            cadence="per month"
            highlights={[
              'Full curriculum — all 6 focus areas',
              'Every practice tool unlocked',
              'Songbook + auto-scrolling chord charts',
              'Daily challenge + streak tracking',
              'Cancel anytime',
            ]}
            current={profile?.plan === 'pro_monthly'}
            busy={busy === 'pro_monthly'}
            onSubscribe={() => handleSubscribeClick('pro_monthly')}
          />
          <PlanCard
            name="Pro Annual"
            price="$108"
            cadence="per year ($9 / month, save 25%)"
            highlights={[
              'Everything in Pro',
              'Two months free',
              'Priority on new features',
              'Cancel anytime',
            ]}
            current={profile?.plan === 'pro_annual'}
            busy={busy === 'pro_annual'}
            featured
            onSubscribe={() => handleSubscribeClick('pro_annual')}
          />
        </div>

        {/* Disclosure */}
        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="eyebrow mb-2">A note on payment</div>
          <p className="text-[14px] text-cream-50/75 leading-snug">
            Subscriptions are handled by Stripe — your card never touches Risen Six servers.
            For iOS users, App Store billing will be available once the native app ships.
            Cancel any time from this page; you keep access until the end of the period you paid for.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}

function PlanCard({
  name, price, cadence, highlights, current, featured, busy, onSubscribe,
}: {
  name: string
  price: string
  cadence: string
  highlights: string[]
  current?: boolean
  featured?: boolean
  busy?: boolean
  onSubscribe: () => void
}) {
  return (
    <div
      className={featured ? 'rounded-[18px] bg-black text-white relative overflow-hidden' : 'card'}
      style={featured ? { padding: '1.75rem 2rem' } : { padding: '1.75rem 2rem' }}
    >
      {featured && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(540px 280px at 80% 20%, rgba(214,57,35,0.18), transparent 60%)',
          }}
        />
      )}
      <div className="relative">
        <div className="flex items-baseline justify-between">
          <div
            className="eyebrow"
            style={{ color: featured ? '#FF8674' : '#D63923' }}
          >
            {name}
            {featured && <span className="ml-2 text-[11px] font-semibold">· Best value</span>}
          </div>
          {current && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: '#1D7F3F',
                background: 'rgba(29,127,63,0.10)',
                border: '1px solid rgba(29,127,63,0.30)',
              }}
            >
              Current plan
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span
            className="font-display font-medium tracking-[-0.025em] leading-none"
            style={{ fontVariationSettings: '"opsz" 144', fontSize: '3rem', color: featured ? '#FFFFFF' : '#1D1D1F' }}
          >
            {price}
          </span>
        </div>
        <div className={`text-[13px] mt-1 ${featured ? 'text-white/70' : 'text-cream-50/65'}`}>
          {cadence}
        </div>

        <ul className={`mt-5 space-y-1.5 text-[14px] ${featured ? 'text-white/85' : 'text-cream-50/80'}`}>
          {highlights.map(h => (
            <li key={h} className="flex items-start gap-2 leading-snug">
              <span style={{ color: featured ? '#FF8674' : '#D63923' }}>✓</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          {current ? (
            <button type="button" disabled className="btn btn-ghost w-full" style={{ padding: '0.65rem 1rem' }}>
              You're on this plan
            </button>
          ) : featured ? (
            <button
              type="button"
              onClick={onSubscribe}
              disabled={busy}
              className="btn w-full"
              style={{ background: '#FFFFFF', color: '#1D1D1F', padding: '0.65rem 1rem', fontWeight: 600 }}
            >
              {busy ? 'Opening Stripe…' : 'Subscribe'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubscribe}
              disabled={busy}
              className="btn btn-primary w-full"
              style={{ padding: '0.65rem 1rem' }}
            >
              {busy ? 'Opening Stripe…' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
