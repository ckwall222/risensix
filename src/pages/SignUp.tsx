import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthLayout } from '../components/AuthLayout'

export function SignUp() {
  const { signUp } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signUp(email, password, displayName.trim() || undefined)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    setSentTo(email)
  }

  if (sentTo) {
    return (
      <AuthLayout title="Check your inbox" subtitle="One last step before we tune you in.">
        <div className="rounded-lg border border-gold-500/30 bg-gold-500/5 p-6 space-y-4">
          <p className="text-cream-50">
            We sent a confirmation link to <strong className="text-gold-100">{sentTo}</strong>.
          </p>
          <p className="text-sm text-cream-50/70">
            Click the link in that email to verify your account, then come back and sign in. The link expires in 24 hours.
          </p>
        </div>
        <p className="text-center text-sm text-cream-50/80 pt-6">
          Already confirmed?{' '}
          <Link to="/signin" className="text-gold-100 underline underline-offset-4 hover:text-gold-100">
            Sign in
          </Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create your account" subtitle="A few seconds. Then we'll learn what kind of guitarist you want to become.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="First name (or what to call you)">
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="First name"
            className="input"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="8+ characters"
            className="input"
          />
        </Field>

        {error && (
          <div className="text-sm text-red-300 bg-red-900/20 border border-red-500/30 rounded p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-3 bg-ember-500 hover:bg-ember-500/90 text-cream-50 font-semibold tracking-[0.18em] uppercase text-sm rounded transition disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-cream-50/80 pt-2">
          Already have one?{' '}
          <Link to="/signin" className="text-gold-100 underline underline-offset-4 hover:text-gold-100">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-cream-50/80 mb-2">{label}</span>
      {children}
    </label>
  )
}
