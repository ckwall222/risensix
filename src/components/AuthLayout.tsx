import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthLayout({ children, title, subtitle, eyebrow }: { children: ReactNode; title: string; subtitle?: string; eyebrow?: string }) {
  return (
    <div className="min-h-screen flex flex-col bg-night-900 text-cream-50">
      <header className="border-b border-cream-50/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/risensix-logo.png" alt="" className="h-9 w-9 object-contain" />
            <span className="hidden sm:inline font-display tracking-[0.28em] text-xs text-gold-100">RISEN&nbsp;SIX</span>
          </Link>
          <Link to="/" className="text-[10px] uppercase tracking-[0.22em] text-cream-50/70 hover:text-gold-100 transition">
            ← Back
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-start justify-center px-5 sm:px-6 py-12">
        <div className="w-full max-w-md">
          {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
          <h1 className="h-display text-3xl tracking-[0.06em] mb-2">{title}</h1>
          {subtitle && <p className="text-cream-50/70 text-sm mb-10">{subtitle}</p>}
          {children}
        </div>
      </main>
      <footer className="px-6 py-8 text-center text-[10px] tracking-[0.28em] uppercase text-cream-50/65">
        Risen Six · A CW Custom Guitars venture
      </footer>
    </div>
  )
}
