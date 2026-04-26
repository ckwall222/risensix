import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function Home() {
  const { session } = useAuth()
  const ctaTo = session ? '/dashboard' : '/signup'
  const ctaLabel = session ? 'Open dashboard' : 'Start your path'

  return (
    <div className="min-h-screen bg-night-900 text-cream-50 selection:bg-ember-500/30">
      <h1 className="sr-only">Risen Six — A luthier-built guitar curriculum</h1>

      {/* Top bar */}
      <header className="border-b border-cream-50/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src="/risensix-logo.png" alt="" className="h-8 w-8 sm:h-9 sm:w-9 object-contain" />
            <span className="hidden sm:inline font-display tracking-[0.28em] text-xs text-gold-100">RISEN&nbsp;SIX</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6">
            {!session && (
              <Link
                to="/signin"
                className="hidden sm:inline text-xs uppercase tracking-[0.22em] text-cream-50/70 hover:text-gold-100 transition whitespace-nowrap"
              >
                Sign in
              </Link>
            )}
            <Link
              to={ctaTo}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-ember-500 hover:bg-ember-500/90 text-cream-50 font-semibold tracking-[0.22em] uppercase text-[10px] sm:text-[11px] transition whitespace-nowrap"
            >
              {session ? 'Dashboard' : 'Get started'}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* subtle radial glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.18]"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(201,150,43,0.6) 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
          <div className="text-[11px] tracking-[0.42em] uppercase text-gold-500 mb-8">
            Six strings · Endless rise
          </div>

          <img
            src="/risensix-logo.png"
            alt="Risen Six"
            className="mx-auto w-full max-w-[320px] md:max-w-[400px] mb-10"
          />

          <h2 className="font-display text-5xl md:text-7xl tracking-[0.04em] leading-[1.05] text-cream-50">
            Play with <em className="not-italic text-gold-100">intention.</em>
          </h2>

          <div className="mx-auto mt-8 max-w-2xl">
            <p className="text-lg md:text-xl text-cream-50/75 leading-relaxed">
              A complete guitar curriculum, built by a luthier.
              Beginner to advanced — technique, rhythm, lead, fingerstyle, and the
              theory most courses skip — woven into every lesson.
            </p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={ctaTo}
              className="group px-7 py-3.5 bg-ember-500 hover:bg-ember-500/90 text-cream-50 font-semibold tracking-[0.22em] uppercase text-xs transition"
            >
              {ctaLabel} <span className="inline-block ml-1 transition group-hover:translate-x-1">→</span>
            </Link>
            {!session && (
              <Link
                to="/signin"
                className="px-7 py-3.5 border border-gold-500/40 text-gold-100 hover:bg-gold-500/10 hover:border-gold-500 font-semibold tracking-[0.22em] uppercase text-xs transition"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Hairline divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      {/* Pillars */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-28">
        <div className="text-center mb-16">
          <div className="text-[10px] tracking-[0.42em] uppercase text-gold-500 mb-4">
            The method
          </div>
          <h3 className="font-display text-3xl md:text-4xl tracking-[0.06em] text-cream-50">
            Three pillars. One instrument.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-cream-50/[0.06]">
          <Pillar
            num="01"
            title="Technique"
            body="Picking, fretting, posture, rhythm, fingerstyle. The mechanics that turn struggle into flow — drilled from first principles, refined to a luthier's standard."
          />
          <Pillar
            num="02"
            title="Lead & Phrasing"
            body="Pentatonic, CAGED, the major scale, modes. Not just shapes to memorize — frameworks that make every solo and every melody feel inevitable."
          />
          <Pillar
            num="03"
            title="Theory, woven in"
            body="The circle of fifths, intervals, the why behind every chord. Taught on the fretboard, never on a chalkboard. Browse it on its own, or follow it through every lesson."
          />
        </div>
      </section>

      {/* Built by a luthier */}
      <section className="border-y border-cream-50/[0.06] bg-night-700/30">
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 items-center">
            <div>
              <div className="text-[10px] tracking-[0.42em] uppercase text-gold-500 mb-4">
                Who teaches
              </div>
              <h3 className="font-display text-3xl md:text-4xl tracking-[0.06em] text-cream-50 leading-[1.15]">
                Built by a <em className="not-italic text-gold-100">luthier.</em>
              </h3>
            </div>
            <div className="text-cream-50/75 leading-relaxed text-lg space-y-4">
              <p>
                Risen Six is the curriculum of <strong className="text-cream-50">Christopher Wall</strong>,
                founder of <strong className="text-cream-50">CW Custom Guitars</strong>. Every
                lesson is informed by what a luthier sees: how the instrument
                actually responds to a hand, why a chord voicing rings (or doesn't),
                what makes a guitar feel inevitable instead of awkward.
              </p>
              <p className="text-cream-50/55">
                The result is a method that connects technique to instrument, theory
                to fingerboard, and beginner to advanced without skipping the
                pieces in between.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
        <h3 className="font-display text-3xl md:text-5xl tracking-[0.06em] text-cream-50 leading-[1.1]">
          Six strings.<br className="md:hidden" />
          <span className="text-gold-100"> Endless rise.</span>
        </h3>
        <p className="mt-6 text-cream-50/70 max-w-xl mx-auto">
          Free to start. No credit card. Your account learns what kind of guitarist
          you want to become before your first lesson.
        </p>
        <div className="mt-10">
          <Link
            to={ctaTo}
            className="inline-block group px-8 py-4 bg-ember-500 hover:bg-ember-500/90 text-cream-50 font-semibold tracking-[0.22em] uppercase text-xs transition"
          >
            {ctaLabel} <span className="inline-block ml-1 transition group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cream-50/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/risensix-logo.png" alt="" className="h-7 w-7 object-contain" />
            <span className="font-display tracking-[0.28em] text-[11px] text-gold-900">
              RISEN&nbsp;SIX · A&nbsp;CW&nbsp;CUSTOM&nbsp;GUITARS&nbsp;VENTURE · 2026
            </span>
          </div>
          <div className="text-[11px] tracking-[0.22em] uppercase text-gold-900">
            risensix.com
          </div>
        </div>
      </footer>
    </div>
  )
}

function Pillar({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="bg-night-900 p-10">
      <div className="font-mono text-xs tracking-[0.32em] text-gold-500 mb-6">{num}</div>
      <h4 className="font-display text-xl md:text-2xl tracking-[0.06em] text-cream-50 mb-4">{title}</h4>
      <p className="text-cream-50/65 leading-relaxed text-[15px]">{body}</p>
    </div>
  )
}
