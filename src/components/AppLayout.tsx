import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function AppLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const initial = (profile?.display_name?.[0] ?? '?').toUpperCase()

  return (
    <div className="min-h-screen flex flex-col bg-night-900 text-cream-50">
      <header className="border-b border-night-700 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-3">
          <img src="/risensix-logo.png" alt="Risen Six" className="h-10 w-10 object-contain" />
          <span className="font-display tracking-[0.2em] text-sm text-gold-100">RISEN SIX</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <div className="text-xs text-cream-50/50 uppercase tracking-widest">Signed in as</div>
            <div className="text-sm text-cream-50">{profile?.display_name ?? '...'}</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center font-display text-gold-100">
            {initial}
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-xs uppercase tracking-widest text-gold-900 hover:text-gold-500 transition"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-night-700 px-6 py-6 text-center text-xs tracking-[0.18em] uppercase text-gold-900">
        Risen Six · A CW Custom Guitars venture
      </footer>
    </div>
  )
}
