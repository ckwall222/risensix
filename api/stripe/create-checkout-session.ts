import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/stripe/create-checkout-session
 *
 * Body: { plan: 'pro_monthly' | 'pro_annual' }
 * Headers: Authorization: Bearer <supabase access_token>
 *
 * Creates (or reuses) a Stripe customer for the authed user, then a Checkout
 * session for the requested plan. Returns { url } — client redirects there.
 */

const PRICE_BY_PLAN: Record<string, string | undefined> = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_annual:  process.env.STRIPE_PRICE_PRO_ANNUAL,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!stripeSecret || !supabaseUrl || !supabaseServiceRole) {
    return res.status(500).json({
      error: 'Server not configured. Missing STRIPE_SECRET_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.',
    })
  }

  const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Missing auth token' })

  const plan = String((req.body as { plan?: string })?.plan ?? '')
  const priceId = PRICE_BY_PLAN[plan]
  if (!priceId) {
    return res.status(400).json({ error: `Unknown plan: ${plan}` })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const stripe = new Stripe(stripeSecret)

  // Verify the user via their JWT
  const { data: userData, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: 'Invalid auth token' })
  }
  const user = userData.user

  // Look up (or create) the Stripe customer
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('stripe_customer_id, display_name')
    .eq('id', user.id)
    .maybeSingle()
  if (profileErr) {
    return res.status(500).json({ error: `Profile lookup failed: ${profileErr.message}` })
  }

  let customerId = profile?.stripe_customer_id ?? null
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: profile?.display_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
    if (updateErr) {
      // Not fatal — we have the customer, will reconcile via webhook
      console.warn('Failed to save stripe_customer_id', updateErr)
    }
  }

  const origin = req.headers.origin ?? `https://${req.headers.host}`

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/billing?checkout=success`,
    cancel_url: `${origin}/billing?checkout=canceled`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { supabase_user_id: user.id, plan },
    },
    metadata: { supabase_user_id: user.id, plan },
  })

  return res.status(200).json({ url: session.url })
}
