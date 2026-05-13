import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * POST /api/stripe/webhook
 *
 * Stripe sends subscription / invoice events here. We verify the signature,
 * then update the user's `profiles` row to match the latest state. This is
 * the source of truth for subscription_status — admin overrides in the UI
 * will be reconciled here on the next Stripe event.
 *
 * Important: the body must be RAW (not JSON-parsed) for signature verification.
 */

// Tell Vercel not to parse the JSON body — we need the raw bytes.
export const config = { api: { bodyParser: false } }

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req as unknown as AsyncIterable<Buffer | string>) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

type ProfileUpdate = {
  subscription_status?: 'free' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired'
  plan?: string | null
  stripe_subscription_id?: string | null
  subscription_ends_at?: string | null
}

function statusFromStripe(s: Stripe.Subscription.Status): ProfileUpdate['subscription_status'] {
  switch (s) {
    case 'active':            return 'active'
    case 'trialing':          return 'trialing'
    case 'past_due':          return 'past_due'
    case 'unpaid':            return 'past_due'
    case 'canceled':          return 'canceled'
    case 'incomplete':        return 'past_due'
    case 'incomplete_expired':return 'expired'
    case 'paused':            return 'canceled'
    default:                  return 'expired'
  }
}

async function updateProfileByCustomer(
  supabase: SupabaseClient,
  stripeCustomerId: string,
  updates: ProfileUpdate,
) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('stripe_customer_id', stripeCustomerId)
  if (error) {
    console.error('Webhook: failed to update profile by customer', stripeCustomerId, error)
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).send('Method not allowed')
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!stripeSecret || !webhookSecret || !supabaseUrl || !supabaseServiceRole) {
    console.error('Webhook env not configured')
    return res.status(500).send('Server not configured')
  }

  const sig = req.headers['stripe-signature']
  if (!sig || Array.isArray(sig)) {
    return res.status(400).send('Missing Stripe-Signature')
  }

  const stripe = new Stripe(stripeSecret)
  const supabase = createClient(supabaseUrl, supabaseServiceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let event: Stripe.Event
  try {
    const rawBody = await readRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Webhook signature verification failed:', msg)
    return res.status(400).send(`Webhook Error: ${msg}`)
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        const planFromMeta = sub.metadata?.plan ?? null
        const priceId = sub.items?.data?.[0]?.price?.id ?? null
        const plan = planFromMeta ?? (
          priceId === process.env.STRIPE_PRICE_PRO_MONTHLY ? 'pro_monthly' :
          priceId === process.env.STRIPE_PRICE_PRO_ANNUAL  ? 'pro_annual'  :
          null
        )
        const endsAtSec = (sub as unknown as { current_period_end?: number }).current_period_end
        await updateProfileByCustomer(supabase, customerId, {
          subscription_status: statusFromStripe(sub.status),
          plan,
          stripe_subscription_id: sub.id,
          subscription_ends_at: endsAtSec ? new Date(endsAtSec * 1000).toISOString() : null,
        })
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        const endsAtSec = (sub as unknown as { current_period_end?: number }).current_period_end
        await updateProfileByCustomer(supabase, customerId, {
          subscription_status: 'canceled',
          stripe_subscription_id: sub.id,
          subscription_ends_at: endsAtSec ? new Date(endsAtSec * 1000).toISOString() : null,
        })
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
        if (customerId) {
          await updateProfileByCustomer(supabase, customerId, { subscription_status: 'past_due' })
        }
        break
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
        if (customerId) {
          await updateProfileByCustomer(supabase, customerId, { subscription_status: 'active' })
        }
        break
      }
      default:
        // Ignore other events
        break
    }
  } catch (err) {
    console.error('Webhook handler error', err)
    // Still return 200 so Stripe doesn't retry forever; we logged it
    return res.status(200).json({ received: true, warning: 'handler error' })
  }

  return res.status(200).json({ received: true })
}
