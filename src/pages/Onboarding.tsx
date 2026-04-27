import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'
import { AuthLayout } from '../components/AuthLayout'

const ABILITY_LEVELS = [
  { id: 'absolute_beginner', label: "I've never picked one up.", desc: 'Total fresh start — we begin at "this is a guitar."' },
  { id: 'beginner',          label: "I know a few chords.",       desc: 'You can fumble through E, A, D, maybe G — but switching is rough.' },
  { id: 'novice',            label: "I'm comfortable with open chords.", desc: 'You strum songs at parties and people don\'t leave.' },
  { id: 'intermediate',      label: "I can barre and improvise a little.", desc: 'You\'ve started exploring the neck and basic theory.' },
  { id: 'advanced',          label: "I'm advanced.",              desc: 'You want depth, theory, and edge cases — not "this is a chord."' },
] as const

const STYLES = [
  'Rock', 'Blues', 'Folk / Acoustic', 'Country', 'Jazz', 'Classical',
  'Metal', 'Funk', 'Pop', 'Indie', 'Singer-Songwriter', 'Worship',
]

export function Onboarding() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [ability, setAbility] = useState<typeof ABILITY_LEVELS[number]['id'] | null>(null)
  const [styles, setStyles] = useState<string[]>([])
  const [readsTab, setReadsTab] = useState<boolean | null>(null)
  const [hasAcoustic, setHasAcoustic] = useState(false)
  const [hasElectric, setHasElectric] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleStyle = (s: string) => {
    setStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const next = () => setStep(s => Math.min(5, s + 1))
  const back = () => setStep(s => Math.max(1, s - 1))

  const finish = async () => {
    if (!user) return
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.from('profiles').update({
      display_name: displayName.trim() || null,
      ability_level: ability,
      preferred_styles: styles,
      reads_tab: !!readsTab,
      has_played_chord: ability !== 'absolute_beginner',
      has_acoustic: hasAcoustic,
      has_electric: hasElectric,
      onboarded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)
    setSubmitting(false)
    if (error) { setError(error.message); return }
    await refreshProfile()
    navigate('/dashboard', { replace: true })
  }

  const progress = (step / 5) * 100

  return (
    <AuthLayout
      title={step === 1 ? "Let's tune you in" : "A few more"}
      subtitle={`Step ${step} of 5 — this builds your starting path.`}
    >
      {/* progress bar */}
      <div className="h-1 bg-night-700 rounded-full overflow-hidden mb-8">
        <div className="h-full bg-gold-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      {step === 1 && (
        <Step heading="What should we call you?">
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="First name"
            autoFocus
            className="input"
          />
          <Buttons onNext={next} nextDisabled={!displayName.trim()} />
        </Step>
      )}

      {step === 2 && (
        <Step heading="Where are you in your guitar journey?">
          <div className="space-y-2">
            {ABILITY_LEVELS.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAbility(opt.id)}
                className={`w-full text-left px-4 py-3 rounded border transition ${
                  ability === opt.id
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-night-700 hover:border-gold-500/50'
                }`}
              >
                <div className="text-cream-50 font-medium">{opt.label}</div>
                <div className="text-xs text-cream-50/70 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
          <Buttons onBack={back} onNext={next} nextDisabled={!ability} />
        </Step>
      )}

      {step === 3 && (
        <Step heading="What styles do you listen to?" hint="Pick any that fit. Affects which lessons we surface first.">
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleStyle(s)}
                className={`px-4 py-2.5 rounded border text-sm transition ${
                  styles.includes(s)
                    ? 'border-gold-500 bg-gold-500/15 text-cream-50'
                    : 'border-night-700 hover:border-gold-500/50 text-cream-50/70'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <Buttons onBack={back} onNext={next} />
        </Step>
      )}

      {step === 4 && (
        <Step heading="Can you read tab?" hint="Tablature, the 6-line guitar notation. Don't worry if no — we'll teach it.">
          <div className="flex gap-3">
            {[
              { id: true,  label: 'Yes' },
              { id: false, label: 'Not yet' },
            ].map(opt => (
              <button
                key={String(opt.id)}
                type="button"
                onClick={() => setReadsTab(opt.id)}
                className={`flex-1 px-4 py-4 rounded border transition ${
                  readsTab === opt.id
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-night-700 hover:border-gold-500/50'
                }`}
              >
                <div className="text-cream-50 font-medium">{opt.label}</div>
              </button>
            ))}
          </div>
          <Buttons onBack={back} onNext={next} nextDisabled={readsTab === null} />
        </Step>
      )}

      {step === 5 && (
        <Step heading="What guitar do you have?" hint="Both is fine — pick all that apply.">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setHasAcoustic(v => !v)}
              className={`p-4 rounded border transition ${
                hasAcoustic ? 'border-gold-500 bg-gold-500/15' : 'border-night-700 hover:border-gold-500/50'
              }`}
            >
              <div className="text-cream-50 font-medium">Acoustic</div>
              <div className="text-xs text-cream-50/70 mt-0.5">Steel-string or classical</div>
            </button>
            <button
              type="button"
              onClick={() => setHasElectric(v => !v)}
              className={`p-4 rounded border transition ${
                hasElectric ? 'border-gold-500 bg-gold-500/15' : 'border-night-700 hover:border-gold-500/50'
              }`}
            >
              <div className="text-cream-50 font-medium">Electric</div>
              <div className="text-xs text-cream-50/70 mt-0.5">Strat, Tele, Les Paul, anything plugged in</div>
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-300 bg-red-900/20 border border-red-500/30 rounded p-3 mt-4">
              {error}
            </div>
          )}

          <Buttons
            onBack={back}
            onNext={finish}
            nextLabel={submitting ? 'Saving…' : 'Take me to my dashboard'}
            nextDisabled={submitting || (!hasAcoustic && !hasElectric)}
          />
        </Step>
      )}
    </AuthLayout>
  )
}

function Step({ heading, hint, children }: { heading: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl tracking-wider text-cream-50">{heading}</h2>
      {hint && <p className="text-sm text-cream-50/70">{hint}</p>}
      <div>{children}</div>
    </div>
  )
}

function Buttons({
  onBack, onNext, nextLabel = 'Continue', nextDisabled = false,
}: {
  onBack?: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
}) {
  return (
    <div className="flex items-center gap-3 pt-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 text-sm tracking-widest uppercase text-cream-50/80 hover:text-cream-50"
        >
          ← Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="ml-auto px-6 py-3 bg-ember-500 hover:bg-ember-500/90 text-cream-50 font-semibold tracking-[0.18em] uppercase text-sm rounded transition disabled:opacity-40"
      >
        {nextLabel}
      </button>
    </div>
  )
}
