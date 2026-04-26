import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { ChordDiagram } from '../components/ChordDiagram'
import { CHORD_LIBRARY } from '../lib/chordLibrary'

export function ChordsPage() {
  const [activeCategory, setActiveCategory] = useState<string>(CHORD_LIBRARY[0].id)
  const active = CHORD_LIBRARY.find(c => c.id === activeCategory) ?? CHORD_LIBRARY[0]

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <Link to="/dashboard" className="text-[10px] uppercase tracking-[0.28em] text-gold-500 hover:text-gold-100 transition">← Home</Link>
        <div className="eyebrow mt-6 mb-3">Library</div>
        <h1 className="h-display text-4xl md:text-5xl tracking-[0.06em]">Chords</h1>
        <p className="text-lg text-cream-50/70 mt-4 max-w-3xl leading-relaxed">
          Most-used chord voicings, grouped by type. Browse by category — every shape is a starting point, not the only way to play it.
        </p>

        <div className="hairline mt-10 mb-8" />

        {/* Category tabs */}
        <nav className="flex flex-wrap gap-2 mb-12" aria-label="Chord categories">
          {CHORD_LIBRARY.map(cat => {
            const isActive = cat.id === activeCategory
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-[10px] uppercase tracking-[0.22em] border transition ${
                  isActive
                    ? 'border-gold-500 bg-gold-500/10 text-gold-100'
                    : 'border-cream-50/[0.12] text-cream-50/55 hover:border-gold-500/40 hover:text-gold-100'
                }`}
              >
                {cat.name}
                <span className="ml-2 text-cream-50/40">{cat.chords.length}</span>
              </button>
            )
          })}
        </nav>

        {/* Active category description + grid */}
        <div className="mb-8">
          <h2 className="h-section mb-3">{active.name}</h2>
          <p className="text-cream-50/65 max-w-2xl text-sm md:text-base leading-relaxed">{active.description}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {active.chords.map(chord => (
            <div key={chord.name} className="card flex items-center justify-center" style={{ padding: '1.5rem 1rem' }}>
              <ChordDiagram {...chord} />
            </div>
          ))}
        </div>

        {/* All categories overview at the bottom */}
        <div className="mt-20">
          <h2 className="h-section mb-4">All chord types</h2>
          <div className="hairline mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-cream-50/[0.06]">
            {CHORD_LIBRARY.map((cat, idx) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="text-left bg-night-900 hover:bg-night-700/30 transition p-6"
              >
                <div className="flex items-baseline justify-between mb-3">
                  <div className="prefix-num">{String(idx + 1).padStart(2, '0')}</div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-cream-50/40">{cat.chords.length} chords</div>
                </div>
                <div className="font-display text-lg tracking-[0.04em] text-cream-50 mb-2">{cat.name}</div>
                <p className="text-sm text-cream-50/60 leading-relaxed line-clamp-2">{cat.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
