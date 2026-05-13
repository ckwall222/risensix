import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function Home() {
  const { session } = useAuth()
  const ctaTo = session ? '/dashboard' : '/signup'
  const ctaLabel = session ? 'Open dashboard' : 'Start your path'

  return (
    <div className="min-h-screen bg-night-900 text-cream-50">
      <h1 className="sr-only">Risen Six — Become the guitarist you imagined.</h1>

      {/* Top bar — Apple-style 44px translucent */}
      <header
        className="sticky top-0 z-50 border-b border-black/[0.06]"
        style={{
          background: 'rgba(245,245,247,0.80)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 h-11 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div
              className="rounded-full overflow-hidden flex-shrink-0"
              style={{ width: 28, height: 28, background: '#000' }}
            >
              <img
                src="/risensix-logo.png"
                alt=""
                style={{ width: '142%', height: '142%', objectFit: 'cover', objectPosition: 'center 27%', marginLeft: '-21%', marginTop: '-12%', display: 'block' }}
              />
            </div>
            <span className="font-display font-medium text-[18px] tracking-[-0.015em] text-cream-50" style={{ fontVariationSettings: '"opsz" 36' }}>
              Risen Six
            </span>
          </Link>
          <nav className="flex items-center gap-5 sm:gap-7">
            {!session && (
              <Link to="/signin" className="text-[12px] text-cream-50/85 hover:text-cream-50 transition tracking-[-0.005em]">
                Sign in
              </Link>
            )}
            <Link to={ctaTo} className="btn btn-primary" style={{ padding: '0.4rem 1rem', minHeight: '28px', fontSize: '13px' }}>
              {session ? 'Dashboard' : 'Get started'}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — Apple light hero */}
      <section className="pt-16 md:pt-24 pb-10 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="eyebrow-hero">Risen Six</div>
          <h2 className="h-display text-5xl sm:text-6xl md:text-8xl mt-2 max-w-[920px] mx-auto">
            Become the guitarist
            <span className="block text-gold-100">you imagined.</span>
          </h2>
          <p className="mt-5 text-lg md:text-xl text-cream-50/75 max-w-[640px] mx-auto leading-snug tracking-[-0.012em]">
            A complete method that meets you at your first awkward chord and takes you somewhere
            unrecognizable. Beginner to advanced, on your instrument, at your pace.
          </p>
          <div className="mt-8 flex items-center gap-5 justify-center flex-wrap">
            <Link to={ctaTo} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '16px' }}>
              {ctaLabel}
            </Link>
            {!session && (
              <Link to="/signin" className="text-ember-500 text-[16px] hover:underline">
                Sign in&nbsp;›
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Hero card — dark feature panel */}
      <section className="pb-4">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div
            className="rounded-[18px] bg-black text-white overflow-hidden relative"
            style={{ minHeight: '460px' }}
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(900px 480px at 75% 25%, rgba(214,57,35,0.22), transparent 60%), radial-gradient(700px 460px at 15% 75%, rgba(0,102,204,0.12), transparent 60%)',
              }}
            />
            <div className="relative p-8 md:p-14 flex flex-col h-full">
              <div className="text-[12px] font-semibold tracking-[0.10em] uppercase text-white/70">
                The method
              </div>
              <h3 className="font-display font-semibold tracking-[-0.025em] text-3xl md:text-5xl leading-[1.05] mt-6 max-w-[680px]">
                Where you start has nothing to do with{' '}
                <span style={{ color: '#FF8674' }}>where you end up.</span>
              </h3>
              <p className="mt-5 text-base md:text-lg text-white/75 max-w-[640px] leading-snug">
                What changes here isn't the guitar. It's you. The first month is friction — buzzing
                strings, missed beats, calluses still forming. The years after are music. The path is
                built around the difference.
              </p>
              <div className="mt-auto pt-10 flex items-center gap-5 flex-wrap">
                <Link
                  to={ctaTo}
                  className="btn"
                  style={{ background: '#FFFFFF', color: '#1D1D1F', padding: '0.7rem 1.5rem', fontWeight: 600 }}
                >
                  {ctaLabel}
                </Link>
                <span className="text-[#2997FF] text-base">Read the manifesto&nbsp;›</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars — three white tiles */}
      <section className="pt-12 pb-4">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="text-center mb-8">
            <div className="eyebrow-hero">What you build</div>
            <h3 className="h-display text-3xl md:text-4xl mt-1 max-w-[680px] mx-auto">
              Three things that change.
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <Pillar
              num="01"
              accent="#D63923"
              title="Hands that listen."
              body="Posture, picking, fretting — drilled into muscle memory until your hands stop being the limit and start being how you express what you hear."
            />
            <Pillar
              num="02"
              accent="#0066CC"
              title="A voice on the neck."
              body="CAGED, the pentatonic, the major scale. Frameworks that turn 'I don't know what to play' into phrases that sound like yours."
            />
            <Pillar
              num="03"
              accent="#1D7F3F"
              title="Theory you actually use."
              body="The why under every chord — taught on the fretboard, never on a chalkboard. You won't memorize. You'll see it."
            />
          </div>
        </div>
      </section>

      {/* Where you go — milestones in a clean editorial list */}
      <section className="pt-12 pb-4">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <div className="text-center mb-8">
            <div className="eyebrow-hero">Where you go</div>
            <h3 className="h-display text-3xl md:text-4xl mt-1 max-w-[760px] mx-auto leading-[1.1]">
              Most courses teach techniques.<br className="hidden md:block" />
              <span className="text-gold-100">This one transforms a player.</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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

      {/* Final CTA — Apple-style centered closer */}
      <section className="pt-20 pb-24 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <h3 className="h-display text-4xl md:text-6xl">
            Six strings.<span className="block text-gold-100">Endless rise.</span>
          </h3>
          <p className="mt-5 text-lg text-cream-50/75 max-w-[560px] mx-auto leading-snug tracking-[-0.01em]">
            Free to start. No credit card. Your first lesson is one click away — and your account
            learns what kind of guitarist you want to be before you hit it.
          </p>
          <div className="mt-8">
            <Link to={ctaTo} className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '17px' }}>
              {ctaLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.08] pt-10 pb-10">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-gold-100">
          <div className="flex items-center gap-2.5">
            <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 22, height: 22, background: '#000' }}>
              <img src="/risensix-logo.png" alt="" style={{ width: '142%', height: '142%', objectFit: 'cover', objectPosition: 'center 27%', marginLeft: '-21%', marginTop: '-12%', display: 'block' }} />
            </div>
            <span>Risen Six · Curriculum by CW Custom Guitars</span>
          </div>
          <div>risensix.com</div>
        </div>
      </footer>
    </div>
  )
}

function Pillar({ num, title, body, accent }: { num: string; title: string; body: string; accent: string }) {
  return (
    <div className="card" style={{ padding: '2rem 1.75rem' }}>
      <div className="text-[14px] font-semibold mb-4" style={{ color: accent }}>
        {num}
      </div>
      <h4 className="h-display text-xl md:text-2xl mb-3">{title}</h4>
      <p className="text-[15px] text-cream-50/70 leading-snug">{body}</p>
    </div>
  )
}

function Milestone({ when, what, detail }: { when: string; what: string; detail: string }) {
  return (
    <div className="card" style={{ padding: '2rem 1.75rem' }}>
      <div className="eyebrow mb-3">{when}</div>
      <div className="h-display text-xl md:text-2xl mb-3 leading-tight">{what}</div>
      <p className="text-[14px] text-cream-50/70 leading-snug">{detail}</p>
    </div>
  )
}
