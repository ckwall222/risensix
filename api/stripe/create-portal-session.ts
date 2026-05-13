import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/stripe/create-portal-session
 *
 * Headers: Authorization: Bearer <supabase access_token>
 *
 * Opens the Stripe Customer Portal for the authed user. They can update card,
 * change plan, cancel, view invoices. Returns { url } — client redirects there.
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!stripeSecret || !supabaseUrl || !supabaseServiceRole) {
    return res.status(500).json({ error: 'Server not configured.' })
  }

  const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Missing auth token' })

  const supabase = createClient(supabaseUrl, supabaseServiceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const stripe = new Stripe(stripeSecret)

  const { data: userData, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: 'Invalid auth token' })
  }
  const user = userData.user

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()
  if (profileErr) {
    return res.status(500).json({ error: `Profile lookup failed: ${profileErr.message}` })
  }
  if (!profile?.stripe_customer_id) {
    return res.status(400).json({ error: 'No Stripe customer for this user. Subscribe first.' })
  }

  const origin = req.headers.origin ?? `https://${req.headers.host}`

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/billing`,
  })

  return res.status(200).json({ url: session.url })
}
