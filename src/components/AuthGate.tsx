import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

type Props = {
  children: ReactNode
  requireOnboarded?: boolean
  requireAdmin?: boolean
}

export function AuthGate({ children, requireOnboarded = false, requireAdmin = false }: Props) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night-900">
        <div className="text-gold-100 tracking-widest text-xs">Loading…</div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  if (requireOnboarded && profile && !profile.onboarded_at) {
    return <Navigate to="/onboarding" replace />
  }

  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
