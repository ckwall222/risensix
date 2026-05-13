import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthLayout({ children, title, subtitle, eyebrow }: { children: ReactNode; title: string; subtitle?: string; eyebrow?: string }) {
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
          <Link to="/" className="flex items-center gap-2.5">
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
          <Link to="/" className="text-[13px] text-ember-500 hover:underline">
            ← Back
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-start justify-center px-5 sm:px-6 pt-16 md:pt-24 pb-12">
        <div className="w-full max-w-[420px] text-center">
          {eyebrow && <div className="eyebrow-hero mb-2">{eyebrow}</div>}
          <h1 className="h-display text-4xl md:text-5xl mb-3">{title}</h1>
          {subtitle && (
            <p className="text-cream-50/70 text-[17px] mb-10 leading-snug tracking-[-0.01em]">
              {subtitle}
            </p>
          )}
          <div className="text-left">{children}</div>
        </div>
      </main>
      <footer className="px-6 py-10 text-center text-[12px] text-gold-100">
        Risen Six · A CW Custom Guitars venture
      </footer>
    </div>
  )
}
