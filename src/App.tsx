import { RisenSixMark } from './components/RisenSixMark'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-night-900 text-cream-50">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <RisenSixMark className="w-32 h-32 mb-8" />

        <h1 className="font-display text-6xl md:text-7xl font-bold tracking-[0.12em]">
          RISEN SIX
        </h1>

        <p className="mt-3 text-gold-100 italic tracking-[0.18em] text-sm uppercase">
          Six strings · Endless rise
        </p>

        <p className="mt-12 max-w-2xl text-lg text-cream-50/80 leading-relaxed">
          A guitar curriculum built by a luthier. Beginner to advanced — with theory like
          CAGED and the circle of fifths baked into every lesson, and a separate path for
          theory study on its own.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            className="px-8 py-3 bg-ember-500 hover:bg-ember-500/90 text-cream-50 font-semibold tracking-[0.18em] uppercase text-sm rounded transition"
          >
            Start your path
          </button>
          <button
            type="button"
            className="px-8 py-3 border border-gold-500 text-gold-100 hover:bg-gold-500/10 font-semibold tracking-[0.18em] uppercase text-sm rounded transition"
          >
            Browse lessons
          </button>
        </div>

        <p className="mt-16 text-xs text-gold-900 tracking-[0.18em] uppercase">
          Coming soon · Account & onboarding launching in Phase 3
        </p>
      </main>

      <footer className="border-t border-night-700 px-6 py-8 text-center text-xs tracking-[0.18em] uppercase text-gold-900">
        Risen Six · A CW Custom Guitars venture · 2026
      </footer>
    </div>
  )
}
