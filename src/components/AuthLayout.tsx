import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen flex flex-col bg-night-900 text-cream-50">
      <header className="px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-3">
          <img src="/risensix-logo.png" alt="Risen Six" className="h-12 w-12 object-contain" />
          <span className="font-display tracking-[0.2em] text-sm text-gold-100">RISEN SIX</span>
        </Link>
      </header>
      <main className="flex-1 flex items-start justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl tracking-[0.12em] text-cream-50 mb-2">{title}</h1>
          {subtitle && <p className="text-cream-50/60 text-sm mb-8">{subtitle}</p>}
          {children}
        </div>
      </main>
      <footer className="px-6 py-6 text-center text-xs tracking-[0.18em] uppercase text-gold-900">
        Risen Six · A CW Custom Guitars venture
      </footer>
    </div>
  )
}
