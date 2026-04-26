import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function Home() {
  const { session } = useAuth()
  const ctaTo = session ? '/dashboard' : '/signup'
  const ctaLabel = session ? 'Go to dashboard' : 'Start your path'

  return (
    <div className="min-h-screen flex flex-col bg-night-900 text-cream-50">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="sr-only">Risen Six</h1>

        <img
          src="/risensix-logo.png"
          alt="Risen Six"
          className="w-full max-w-sm md:max-w-md mb-2"
        />

        <p className="text-gold-100 italic tracking-[0.32em] text-xs uppercase">
          Six strings · Endless rise
        </p>

        <p className="mt-12 max-w-2xl text-lg text-cream-50/80 leading-relaxed">
          A guitar curriculum built by a luthier. Beginner to advanced — with theory like
          CAGED and the circle of fifths baked into every lesson, and a separate path for
          theory study on its own.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            to={ctaTo}
            className="px-8 py-3 bg-ember-500 hover:bg-ember-500/90 text-cream-50 font-semibold tracking-[0.18em] uppercase text-sm rounded transition"
          >
            {ctaLabel}
          </Link>
          {!session && (
            <Link
              to="/signin"
              className="px-8 py-3 border border-gold-500 text-gold-100 hover:bg-gold-500/10 font-semibold tracking-[0.18em] uppercase text-sm rounded transition"
            >
              Sign in
            </Link>
          )}
        </div>
      </main>

      <footer className="border-t border-night-700 px-6 py-8 text-center text-xs tracking-[0.18em] uppercase text-gold-900">
        Risen Six · A CW Custom Guitars venture · 2026
      </footer>
    </div>
  )
}
