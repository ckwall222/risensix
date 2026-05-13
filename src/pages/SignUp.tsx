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
    if (error) { setError(error); return }
    setSentTo(email)
  }

  if (sentTo) {
    return (
      <AuthLayout title="Check your inbox." subtitle="One last step before we tune you in.">
        <div
          className="rounded-[14px] p-5 space-y-3"
          style={{ border: '1px solid rgba(0,0,0,0.10)', background: '#FFFFFF' }}
        >
          <p className="text-cream-50 text-[16px]">
            We sent a confirmation link to <strong>{sentTo}</strong>.
          </p>
          <p className="text-[14px] text-cream-50/70 leading-snug">
            Click the link in that email to verify your account, then come back and sign in.
            The link expires in 24 hours.
          </p>
        </div>
        <p className="text-center text-[15px] text-cream-50/70 pt-6">
          Already confirmed?{' '}
          <Link to="/signin" className="text-ember-500 hover:underline">
            Sign in
          </Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create your account." subtitle="A few seconds. Then we'll learn what kind of guitarist you want to become.">
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
          <div
            className="text-[14px] rounded-[10px] p-3"
            style={{
              color: '#A52917',
              background: 'rgba(214,57,35,0.06)',
              border: '1px solid rgba(214,57,35,0.25)',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary w-full"
          style={{ padding: '0.85rem 1.5rem', fontSize: '16px' }}
        >
          {submitting ? 'Creating…' : 'Create account'}
        </button>

        <p className="text-center text-[15px] text-cream-50/70 pt-2">
          Already have one?{' '}
          <Link to="/signin" className="text-ember-500 hover:underline">
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
      <span className="block text-[13px] font-medium text-cream-50 mb-1.5 tracking-[-0.005em]">{label}</span>
      {children}
    </label>
  )
}
