import { FormEvent, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthLayout } from '../components/AuthLayout'

export function SignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) { setError(error); return }
    navigate(from, { replace: true })
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Six strings. Endless rise.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
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
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-cream-50/60 pt-2">
          New here?{' '}
          <Link to="/signup" className="text-gold-100 underline underline-offset-4 hover:text-gold-500">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-gold-900 mb-2">{label}</span>
      {children}
    </label>
  )
}
