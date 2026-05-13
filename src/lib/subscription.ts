import type { Profile, SubscriptionStatus } from '../auth/AuthContext'

const PAID_STATUSES: SubscriptionStatus[] = ['active', 'trialing']

/**
 * True if the user has an active subscription (active or trialing).
 * Admins are always treated as paid — they need access to everything.
 */
export function isPaidUser(profile: Profile | null): boolean {
  if (!profile) return false
  if (profile.role === 'admin') return true
  return PAID_STATUSES.includes(profile.subscription_status)
}

/**
 * True if the subscription is in a past-due / failed state but not yet fully
 * canceled. UI may want to show a warning banner to update payment.
 */
export function needsAttention(profile: Profile | null): boolean {
  return profile?.subscription_status === 'past_due'
}
