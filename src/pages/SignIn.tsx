import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthLayout } from '../components/AuthLayout'

export function SignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
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
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout title="Welcome back." subtitle="Six strings. Endless rise.">
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
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-center text-[15px] text-cream-50/70 pt-2">
          New here?{' '}
          <Link to="/signup" className="text-ember-500 hover:underline">
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
      <span className="block text-[13px] font-medium text-cream-50 mb-1.5 tracking-[-0.005em]">{label}</span>
      {children}
    </label>
  )
}
