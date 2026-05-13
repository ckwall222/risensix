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
      <section className="pt-14 md:pt-20 pb-6 text-center">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-6">
          <Link to="/dashboard" className="btn-link text-ember-500 text-[14px]">← Back home</Link>
          <div className="eyebrow-hero mt-6">Library · Chords</div>
          <h1 className="h-display text-5xl md:text-6xl mt-2">
            Every shape.<span className="block text-gold-100">A starting point, not the only way.</span>
          </h1>
          <p className="mt-4 text-lg text-cream-50/75 max-w-[640px] mx-auto leading-snug tracking-[-0.012em]">
            Most-used voicings, grouped by type. Browse a category, click a chord to hear it ring.
          </p>
        </div>
      </section>

      <div className="max-w-[1080px] mx-auto px-5 sm:px-6 pb-14">
        {/* Category pills */}
        <nav className="flex flex-wrap gap-2 mb-10 justify-center" aria-label="Chord categories">
          {CHORD_LIBRARY.map(cat => {
            const isActive = cat.id === activeCategory
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="px-4 py-2 rounded-full text-[14px] font-medium transition flex items-center gap-2"
                style={{
                  border: `1px solid ${isActive ? '#0066CC' : 'rgba(0,0,0,0.10)'}`,
                  background: isActive ? '#0066CC' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#1D1D1F',
                }}
              >
                {cat.name}
                <span className={isActive ? 'text-white/70' : 'text-gold-100'} style={{ fontSize: '12px' }}>
                  {cat.chords.length}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="mb-6 text-center max-w-[680px] mx-auto">
          <h2 className="h-section">{active.name}</h2>
          <p className="text-cream-50/75 text-[15px] md:text-[16px] mt-2 leading-snug">
            {active.description}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {active.chords.map(chord => (
            <div key={chord.name} className="card flex items-center justify-center" style={{ padding: '1.5rem 1rem' }}>
              <ChordDiagram {...chord} />
            </div>
          ))}
        </div>

        {/* All categories overview */}
        <div className="mt-16">
          <h2 className="h-section text-center mb-6">All chord types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {CHORD_LIBRARY.map((cat, idx) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="card text-left block group"
                style={{ padding: '1.75rem' }}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <div className="prefix-num">{String(idx + 1).padStart(2, '0')}</div>
                  <div className="text-[12px] text-gold-100">{cat.chords.length} chords</div>
                </div>
                <div className="h-display text-xl md:text-2xl mb-2 group-hover:text-ember-500 transition">{cat.name}</div>
                <p className="text-[14px] text-cream-50/70 leading-snug line-clamp-2">{cat.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
