import { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function AppLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const initial = (profile?.display_name?.[0] ?? '?').toUpperCase()
  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-night-900 text-cream-50">
      <header
        className="sticky top-0 z-50 border-b border-black/[0.06]"
        style={{
          background: 'rgba(245,245,247,0.80)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 h-11 flex items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 shrink-0"
            aria-label="Risen Six — Dashboard"
          >
            <img
              src="/risen-six-mark-mono-dark.svg"
              alt=""
              className="h-5 w-5 object-contain"
            />
            <span className="font-semibold text-[15px] tracking-[-0.02em] text-cream-50">
              Risen Six
            </span>
          </Link>

          <nav className="flex items-center gap-5 sm:gap-7">
            <NavItem to="/dashboard" end>Home</NavItem>
            <NavItem to="/chords">Chords</NavItem>
            <NavItem to="/tuner">Tuner</NavItem>
            <NavItem to="/metronome">Metronome</NavItem>
            <NavItem to="/play-along">Play Along</NavItem>
            <NavItem to="/theory">Theory</NavItem>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden sm:inline text-[12px] text-cream-50/85 hover:text-cream-50 transition tracking-[-0.005em]"
            >
              Sign out
            </button>
            <div
              className="h-7 w-7 rounded-full bg-cream-50 text-night-900 flex items-center justify-center text-[11px] font-medium"
              title={profile?.display_name ?? ''}
            >
              {initial}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-night-900 mt-16 pt-10 pb-10 text-[12px] text-gold-100 leading-relaxed border-t border-black/[0.08]">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <FootCol heading="Practice">
              <FootLink to="/routine">Today's session</FootLink>
              <FootLink to="/dashboard">Lessons</FootLink>
              <FootLink to="/theory">Theory</FootLink>
              <FootLink to="/daily">Daily challenge</FootLink>
            </FootCol>
            <FootCol heading="Tools">
              <FootLink to="/play-along">Play Along</FootLink>
              <FootLink to="/licks">Lick Library</FootLink>
              <FootLink to="/jam">Jam Studio</FootLink>
              <FootLink to="/tuner">Tuner</FootLink>
              <FootLink to="/metronome">Metronome</FootLink>
            </FootCol>
            <FootCol heading="Library">
              <FootLink to="/songs">Songbook</FootLink>
              <FootLink to="/chords">Chord library</FootLink>
              <FootLink to="/circle">Circle of fifths</FootLink>
            </FootCol>
            <FootCol heading="Account">
              <FootLink to="/dashboard">Profile</FootLink>
              <button
                type="button"
                onClick={handleSignOut}
                className="block py-1 text-left text-gold-100 hover:text-cream-50 transition"
              >
                Sign out
              </button>
            </FootCol>
          </div>
          <div className="border-t border-black/[0.08] mt-8 pt-5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gold-100">
            <span>Copyright © 2026 CW Custom Guitars. All rights reserved.</span>
            <span className="text-gold-100">Risen Six</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavItem({ to, end, children }: { to: string; end?: boolean; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `text-[12px] tracking-[-0.005em] transition ${
          isActive ? 'text-cream-50 font-medium' : 'text-cream-50/85 hover:text-cream-50'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

function FootCol({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-cream-50 font-semibold text-[12px] mb-2.5">{heading}</div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function FootLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="block py-1 text-gold-100 hover:text-cream-50 transition">
      {children}
    </Link>
  )
}
