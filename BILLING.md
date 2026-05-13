# Billing — Stripe integration checklist

This is the punch-list to turn the `/billing` placeholder into a live subscription
flow. The DB columns, RLS policies, admin UI, and frontend Plan UI are already in
place. What's missing is the server-side glue to Stripe.

## What's in already

- `profiles.subscription_status`, `profiles.plan`, `profiles.stripe_customer_id`,
  `profiles.stripe_subscription_id`, `profiles.subscription_ends_at`
- Only admins or the billing service can change those columns (trigger-enforced)
- `/billing` page renders plan tiles + current state; subscribe buttons currently
  show a `TODO` alert
- `/admin` lets you manually override `subscription_status` and `plan` per user
  (useful for comps, refunds, sandbox testing)

## What you need to do (about an hour, one-time)

### 1. Create a Stripe account

- https://dashboard.stripe.com — sign up if you haven't
- Switch to **Test mode** (top right) for development

### 2. Create two products in Stripe

- **Products → Add product**
  - Name: `Risen Six Pro (Monthly)`
  - Pricing: Recurring, $12 USD, every month
  - Copy the price ID (looks like `price_1ABCxxxx`) — this is `pro_monthly`
- Repeat for **Annual**: $108 USD, every year — copy as `pro_annual`

### 3. Add env vars to Vercel

Project Settings → Environment Variables (Production + Preview):

- `STRIPE_SECRET_KEY` = `sk_test_...` (Test secret key from Stripe dashboard)
- `STRIPE_WEBHOOK_SECRET` = (created in step 5)
- `STRIPE_PRICE_PRO_MONTHLY` = `price_xxxxx`
- `STRIPE_PRICE_PRO_ANNUAL` = `price_xxxxx`
- `SUPABASE_SERVICE_ROLE_KEY` = (Supabase dashboard → Project Settings → API →
  service_role secret — NEVER expose to the client)
- `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_test_...` (safe to expose; used client-side)

### 4. Install Stripe SDK and add Vercel serverless functions

```powershell
npm install stripe
```

Create `api/stripe/create-checkout-session.ts`:

- Receives `{ plan: 'pro_monthly' | 'pro_annual' }` from the client
- Uses the user's auth token (via Supabase) to identify them
- If no `stripe_customer_id` on the profile yet, create one in Stripe + save it
- Call `stripe.checkout.sessions.create({ mode: 'subscription', ... })`
- Return `{ url: session.url }` — the client redirects there

Create `api/stripe/create-portal-session.ts`:

- Uses the user's `stripe_customer_id` to open Stripe Customer Portal
- For "Manage subscription" / cancel / update card

Create `api/stripe/webhook.ts`:

- Verifies signature with `STRIPE_WEBHOOK_SECRET`
- Handles events: `customer.subscription.created` / `updated` / `deleted`,
  `invoice.payment_failed`, `invoice.paid`
- Uses Supabase service_role key to update the user's `profiles` row:
  `subscription_status`, `plan`, `stripe_subscription_id`, `subscription_ends_at`

### 5. Register the webhook endpoint in Stripe

- Stripe dashboard → **Developers → Webhooks → Add endpoint**
- Endpoint URL: `https://risensix.com/api/stripe/webhook`
- Listen to: `customer.subscription.*`, `invoice.*`
- Copy the signing secret → set it as `STRIPE_WEBHOOK_SECRET` in Vercel (step 3)

### 6. Update `BillingPage.tsx`

- Replace `handleSubscribeClick` `alert(...)` with:
  ```ts
  const res = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  })
  const { url } = await res.json()
  if (url) window.location.href = url
  ```
- Same pattern for `handleManageClick` → `/api/stripe/create-portal-session`

### 7. Test in Stripe Test mode

- Use Stripe's test cards (`4242 4242 4242 4242`, any future expiry, any CVC)
- Verify the webhook fires and updates `profiles.subscription_status` to `active`
- Use Stripe's webhook testing tool to simulate `subscription.deleted` and
  confirm `subscription_status` flips to `canceled`

### 8. Gate premium content

Add a helper:

```ts
// src/lib/subscription.ts
import type { Profile } from '../auth/AuthContext'
export function isPaidUser(p: Profile | null): boolean {
  if (!p) return false
  return p.subscription_status === 'active' || p.subscription_status === 'trialing'
}
```

Then wrap premium pages/components:

```tsx
const { profile } = useAuth()
if (!isPaidUser(profile)) {
  return <Navigate to="/billing" />
}
```

Decide what's free vs paid — likely free tier gets onboarding, the tuner, and a
handful of foundational lessons; pro unlocks the full curriculum + songbook +
Play Along.

### 9. Switch to live keys when ready to take real money

- In Stripe dashboard, flip from Test mode to Live mode
- Create the same products + prices again in Live mode (test/live are separate)
- Update the Vercel env vars to `sk_live_...` / `pk_live_...` / live price IDs
- Re-register the webhook in Live mode

## Apple App Store (separate project)

The web app can't sell subscriptions through the App Store — Apple requires
StoreKit on a native app, and any web-purchased subscription has to be honored
when the user signs in via the iOS app.

When that's worth building:

1. Wrap this Vite app in Capacitor (`npx cap init`) — outputs an Xcode project
2. Implement StoreKit2 subscription products in Swift (mirror the web plans)
3. Server endpoint `api/apple/verify-receipt` that validates Apple's
   `JWSTransaction` and writes the same `subscription_status` row
4. App Store Connect: register subscription products with the same identifiers
5. Submit to App Review — they'll test that subscription purchase works AND that
   a web-purchased account also shows pro features on iOS

That's a 1–2 week project. Doesn't block any of the web work above.
