import { Milestone, MilestoneStatus, MILESTONES, STAGES, computeMilestoneStatus } from '../lib/milestones'

type Props = {
  completedSlugs: Set<string>
  startedSlugs: Set<string>
}

export function JourneyTimeline({ completedSlugs, startedSlugs }: Props) {
  return (
    <div className="space-y-12">
      {STAGES.map((stage, idx) => {
        const stageMilestones = MILESTONES.filter(m => m.stage === stage.id)
        const earned = stageMilestones.filter(
          m => computeMilestoneStatus(m, completedSlugs, startedSlugs) === 'earned'
        ).length
        return (
          <Stage
            key={stage.id}
            num={String(idx + 1).padStart(2, '0')}
            name={stage.name}
            subtitle={stage.subtitle}
            earned={earned}
            total={stageMilestones.length}
            milestones={stageMilestones}
            completedSlugs={completedSlugs}
            startedSlugs={startedSlugs}
          />
        )
      })}
    </div>
  )
}

function Stage({
  num, name, subtitle, earned, total, milestones, completedSlugs, startedSlugs,
}: {
  num: string
  name: string
  subtitle: string
  earned: number
  total: number
  milestones: Milestone[]
  completedSlugs: Set<string>
  startedSlugs: Set<string>
}) {
  const pct = total === 0 ? 0 : Math.round((earned / total) * 100)
  return (
    <div>
      <div className="flex items-baseline gap-4 mb-1">
        <div className="prefix-num">{num}</div>
        <h3 className="font-display text-xl md:text-2xl tracking-[0.06em] text-cream-50">{name}</h3>
        <div className="ml-auto text-[10px] uppercase tracking-[0.28em] text-cream-50/45">
          {earned} / {total}
        </div>
      </div>
      <p className="text-sm text-cream-50/55 mb-4 ml-12">{subtitle}</p>
      <div className="h-px bg-night-700 ml-12 mb-5">
        <div className="h-full bg-gold-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <ul className="ml-12 space-y-1">
        {milestones.map(m => {
          const status = computeMilestoneStatus(m, completedSlugs, startedSlugs)
          return <MilestoneRow key={m.id} m={m} status={status} />
        })}
      </ul>
    </div>
  )
}

function MilestoneRow({ m, status }: { m: Milestone; status: MilestoneStatus }) {
  return (
    <li className="flex items-start gap-4 py-3 border-b border-cream-50/[0.04]">
      <StatusIcon status={status} />
      <div className="flex-1 min-w-0">
        <div className={`font-display text-base tracking-[0.04em] ${status === 'earned' ? 'text-cream-50' : 'text-cream-50/55'}`}>
          {m.title}
        </div>
        <div className="text-xs text-cream-50/45 mt-0.5 leading-relaxed">{m.description}</div>
      </div>
      <StatusLabel status={status} />
    </li>
  )
}

function StatusIcon({ status }: { status: MilestoneStatus }) {
  if (status === 'earned') {
    return (
      <div className="mt-1 h-5 w-5 rounded-full bg-gold-500 flex items-center justify-center shrink-0" aria-hidden="true">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M2 5.5L4.5 8L9 2.5" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }
  if (status === 'in_progress') {
    return (
      <div className="mt-1 h-5 w-5 rounded-full border-2 border-ember-500 flex items-center justify-center shrink-0" aria-hidden="true">
        <div className="h-1.5 w-1.5 rounded-full bg-ember-500" />
      </div>
    )
  }
  if (status === 'locked') {
    return (
      <div className="mt-1 h-5 w-5 rounded-full border border-cream-50/20 shrink-0" aria-hidden="true" />
    )
  }
  // future
  return (
    <div className="mt-1 h-5 w-5 rounded-full border border-dashed border-cream-50/15 shrink-0" aria-hidden="true" />
  )
}

function StatusLabel({ status }: { status: MilestoneStatus }) {
  if (status === 'earned') {
    return <span className="text-[10px] uppercase tracking-[0.28em] text-gold-100 shrink-0 mt-1">Earned</span>
  }
  if (status === 'in_progress') {
    return <span className="text-[10px] uppercase tracking-[0.28em] text-ember-500 shrink-0 mt-1">In progress</span>
  }
  if (status === 'future') {
    return <span className="text-[10px] uppercase tracking-[0.28em] text-cream-50/30 shrink-0 mt-1">Coming</span>
  }
  return null
}
