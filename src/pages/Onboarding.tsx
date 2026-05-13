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
      title={step === 1 ? "Let's tune you in." : "A few more."}
      subtitle={`Step ${step} of 5 — this builds your starting path.`}
    >
      {/* progress bar */}
      <div className="h-1 rounded-full overflow-hidden mb-8 bg-black/[0.08]">
        <div className="h-full bg-ember-500 transition-all" style={{ width: `${progress}%` }} />
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
              <SelectableRow
                key={opt.id}
                selected={ability === opt.id}
                onClick={() => setAbility(opt.id)}
                title={opt.label}
                desc={opt.desc}
              />
            ))}
          </div>
          <Buttons onBack={back} onNext={next} nextDisabled={!ability} />
        </Step>
      )}

      {step === 3 && (
        <Step heading="What styles do you listen to?" hint="Pick any that fit. Affects which lessons we surface first.">
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map(s => (
              <SelectableChip
                key={s}
                selected={styles.includes(s)}
                onClick={() => toggleStyle(s)}
                label={s}
              />
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
              <SelectableBig
                key={String(opt.id)}
                selected={readsTab === opt.id}
                onClick={() => setReadsTab(opt.id)}
                title={opt.label}
              />
            ))}
          </div>
          <Buttons onBack={back} onNext={next} nextDisabled={readsTab === null} />
        </Step>
      )}

      {step === 5 && (
        <Step heading="What guitar do you have?" hint="Both is fine — pick all that apply.">
          <div className="grid grid-cols-2 gap-3">
            <SelectableBig
              selected={hasAcoustic}
              onClick={() => setHasAcoustic(v => !v)}
              title="Acoustic"
              subtitle="Steel-string or classical"
            />
            <SelectableBig
              selected={hasElectric}
              onClick={() => setHasElectric(v => !v)}
              title="Electric"
              subtitle="Strat, Tele, Les Paul, anything plugged in"
            />
          </div>

          {error && (
            <div
              className="text-[14px] rounded-[10px] p-3 mt-4"
              style={{
                color: '#A52917',
                background: 'rgba(214,57,35,0.06)',
                border: '1px solid rgba(214,57,35,0.25)',
              }}
            >
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
      <h2 className="h-display text-2xl">{heading}</h2>
      {hint && <p className="text-[15px] text-cream-50/70 leading-snug">{hint}</p>}
      <div>{children}</div>
    </div>
  )
}

function SelectableRow({ selected, onClick, title, desc }: { selected: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-[12px] transition"
      style={{
        border: `1px solid ${selected ? '#0066CC' : 'rgba(0,0,0,0.10)'}`,
        background: selected ? 'rgba(0,102,204,0.06)' : '#FFFFFF',
      }}
    >
      <div className="text-cream-50 font-medium text-[15px]">{title}</div>
      <div className="text-[13px] text-cream-50/65 mt-0.5">{desc}</div>
    </button>
  )
}

function SelectableChip({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2.5 rounded-full text-[14px] font-medium transition"
      style={{
        border: `1px solid ${selected ? '#0066CC' : 'rgba(0,0,0,0.12)'}`,
        background: selected ? '#0066CC' : '#FFFFFF',
        color: selected ? '#FFFFFF' : '#1D1D1F',
      }}
    >
      {label}
    </button>
  )
}

function SelectableBig({ selected, onClick, title, subtitle }: { selected: boolean; onClick: () => void; title: string; subtitle?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 p-4 rounded-[14px] transition text-left"
      style={{
        border: `1px solid ${selected ? '#0066CC' : 'rgba(0,0,0,0.10)'}`,
        background: selected ? 'rgba(0,102,204,0.06)' : '#FFFFFF',
      }}
    >
      <div className="text-cream-50 font-semibold text-[16px]">{title}</div>
      {subtitle && <div className="text-[13px] text-cream-50/65 mt-0.5">{subtitle}</div>}
    </button>
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
          className="text-[15px] text-cream-50/70 hover:text-cream-50 transition px-2"
        >
          ← Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="btn btn-primary ml-auto"
        style={{ padding: '0.7rem 1.5rem', fontSize: '15px' }}
      >
        {nextLabel}
      </button>
    </div>
  )
}
