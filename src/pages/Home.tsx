import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function Home() {
  const { session } = useAuth()
  const ctaTo = session ? '/dashboard' : '/signup'
  const ctaLabel = session ? 'Open dashboard' : 'Start your path'

  return (
    <div className="min-h-screen bg-night-900 text-cream-50 selection:bg-ember-500/30">
      <h1 className="sr-only">Risen Six — Become the guitarist you imagined.</h1>

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
            <Link to={ctaTo} className="btn btn-primary !py-2 !px-4 sm:!px-5">
              {session ? 'Dashboard' : 'Get started'}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="relative max-w-5xl mx-auto px-5 sm:px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
          <div className="eyebrow mb-8" style={{ letterSpacing: '0.42em' }}>
            Six strings · Endless rise
          </div>

          <img
            src="/risensix-logo.png"
            alt="Risen Six"
            className="mx-auto w-full max-w-[300px] md:max-w-[380px] mb-10"
          />

          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl tracking-[0.04em] leading-[1.05] text-cream-50">
            Become the guitarist <br className="hidden md:block" />
            <em className="not-italic text-gold-100">you imagined.</em>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl text-cream-50/75 leading-relaxed">
            A complete method that meets you at your first awkward chord and
            takes you somewhere unrecognizable. Beginner to advanced, at your
            pace, on your instrument.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={ctaTo} className="btn btn-primary group">
              {ctaLabel} <span className="inline-block transition group-hover:translate-x-1">→</span>
            </Link>
            {!session && (
              <Link to="/signin" className="btn btn-ghost">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </section>

      <hr className="hairline" />

      {/* Manifesto */}
      <section className="border-y border-cream-50/[0.06]">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-20 md:py-24 text-center">
          <p className="font-display text-2xl md:text-4xl tracking-[0.04em] leading-[1.25] text-cream-50">
            Where you start has nothing to do with{' '}
            <em className="not-italic text-gold-100">where you end up.</em>
          </p>
          <p className="mt-6 text-cream-50/70 text-base md:text-lg max-w-xl mx-auto">
            What changes here isn't the guitar. It's you. The first month is
            friction — buzzing strings, missed beats, calluses still forming.
            The years after are music. The path is built around the difference.
          </p>
        </div>
      </section>

      {/* Pillars — what you build */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-24 md:py-28">
        <div className="text-center mb-16">
          <div className="eyebrow mb-4">What you build</div>
          <h3 className="h-display text-3xl md:text-4xl">
            Three things that <em className="not-italic text-gold-100">change.</em>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-cream-50/[0.06]">
          <Pillar
            num="01"
            title="Hands that listen"
            body="Posture, picking, fretting — drilled into muscle memory until your hands stop being the limit and start being how you express what you hear."
          />
          <Pillar
            num="02"
            title="A voice on the neck"
            body="CAGED, the pentatonic, the major scale. Frameworks that turn 'I don't know what to play' into phrases that sound like yours."
          />
          <Pillar
            num="03"
            title="Theory you actually use"
            body="The why under every chord — taught on the fretboard, never on a chalkboard. You won't memorize. You'll see it."
          />
        </div>
      </section>

      {/* Where you go — milestones */}
      <section className="border-y border-cream-50/[0.06] bg-night-700/30">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-24 md:py-28">
          <div className="text-center mb-16">
            <div className="eyebrow mb-4">Where you go</div>
            <h3 className="h-display text-3xl md:text-4xl max-w-3xl mx-auto leading-[1.15]">
              Most courses teach techniques.{' '}
              <em className="not-italic text-gold-100">This one transforms a player.</em>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Milestone
              when="In 30 days"
              what="You'll play your first complete song."
              detail="Open chords, a steady strum, a song you actually want to play. Twenty minutes a day, no shortcuts."
            />
            <Milestone
              when="In 90 days"
              what="You'll connect shapes across the neck."
              detail="The fretboard stops being a sea of dots. Movable chords, the pentatonic in five positions, the major scale wherever you put your hand."
            />
            <Milestone
              when="In a year"
              what="You'll improvise like it's a conversation."
              detail="Phrasing, ear training, soloing over progressions you've never heard. You stop sounding like a student. You start sounding like you."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-5 sm:px-6 py-24 md:py-32 text-center">
        <h3 className="font-display text-3xl md:text-5xl tracking-[0.06em] text-cream-50 leading-[1.1]">
          Six strings.{' '}
          <span className="text-gold-100">Endless rise.</span>
        </h3>
        <p className="mt-6 text-cream-50/70 max-w-xl mx-auto">
          Free to start. No credit card. Your first lesson is one click away —
          and your account learns what kind of guitarist you want to be before
          you hit it.
        </p>
        <div className="mt-10">
          <Link to={ctaTo} className="btn btn-primary !px-8 !py-4 group">
            {ctaLabel} <span className="inline-block transition group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cream-50/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/risensix-logo.png" alt="" className="h-7 w-7 object-contain" />
            <span className="font-display tracking-[0.28em] text-[11px] text-cream-50/65">
              RISEN&nbsp;SIX · CURRICULUM&nbsp;BY&nbsp;CW&nbsp;CUSTOM&nbsp;GUITARS
            </span>
          </div>
          <div className="text-[11px] tracking-[0.22em] uppercase text-cream-50/65">
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
      <div className="prefix-num mb-6">{num}</div>
      <h4 className="font-display text-xl md:text-2xl tracking-[0.06em] text-cream-50 mb-4">{title}</h4>
      <p className="text-cream-50/65 leading-relaxed text-[15px]">{body}</p>
    </div>
  )
}

function Milestone({ when, what, detail }: { when: string; what: string; detail: string }) {
  return (
    <div className="card" style={{ padding: '1.75rem 1.75rem' }}>
      <div className="eyebrow mb-3">{when}</div>
      <div className="font-display text-lg md:text-xl tracking-[0.04em] text-cream-50 mb-3 leading-snug">{what}</div>
      <p className="text-cream-50/60 leading-relaxed text-[14px]">{detail}</p>
    </div>
  )
}
