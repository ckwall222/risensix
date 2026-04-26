import { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function AppLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const initial = (profile?.display_name?.[0] ?? '?').toUpperCase()

  return (
    <div className="min-h-screen flex flex-col bg-night-900 text-cream-50">
      <header className="border-b border-cream-50/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-3 shrink-0">
            <img src="/risensix-logo.png" alt="" className="h-9 w-9 object-contain" />
            <span className="hidden sm:inline font-display tracking-[0.28em] text-xs text-gold-100">RISEN&nbsp;SIX</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[11px] uppercase tracking-[0.28em]">
            <NavItem to="/dashboard">Dashboard</NavItem>
            <NavItem to="/theory">Theory</NavItem>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center font-display text-sm text-gold-100">
                {initial}
              </div>
              <div className="leading-tight">
                <div className="text-[10px] text-gold-900 uppercase tracking-[0.22em]">Signed in</div>
                <div className="text-sm text-cream-50">{profile?.display_name ?? '...'}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-[10px] uppercase tracking-[0.22em] text-gold-900 hover:text-gold-100 transition px-2"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-cream-50/[0.06] mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-[10px] tracking-[0.28em] uppercase text-gold-900">
          Risen Six · A CW Custom Guitars venture · 2026
        </div>
      </footer>
    </div>
  )
}

function NavItem({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/dashboard'}
      className={({ isActive }) =>
        `transition ${isActive ? 'text-gold-100' : 'text-cream-50/55 hover:text-cream-50'}`
      }
    >
      {children}
    </NavLink>
  )
}
