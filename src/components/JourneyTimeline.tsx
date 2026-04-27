import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Milestone, MilestoneStatus, MILESTONES, STAGES, STAGES_OPEN_FOR, computeMilestoneStatus,
} from '../lib/milestones'

type Props = {
  completedSlugs: Set<string>
  startedSlugs: Set<string>
  abilityLevel?: string
}

function targetSlugFor(m: Milestone, completedSlugs: Set<string>): string | null {
  if (m.requiredLessonSlugs.length === 0) return null
  const next = m.requiredLessonSlugs.find(s => !completedSlugs.has(s))
  return next ?? m.requiredLessonSlugs[0]
}

export function JourneyTimeline({ completedSlugs, startedSlugs, abilityLevel = 'beginner' }: Props) {
  const stagesOpenByLevel = STAGES_OPEN_FOR[abilityLevel] ?? STAGES_OPEN_FOR['beginner']

  return (
    <div className="space-y-3">
      {STAGES.map((stage, idx) => {
        const stageMilestones = MILESTONES.filter(m => m.stage === stage.id)
        const earned = stageMilestones.filter(
          m => computeMilestoneStatus(m, completedSlugs, startedSlugs) === 'earned'
        ).length
        const inProgress = stageMilestones.filter(
          m => computeMilestoneStatus(m, completedSlugs, startedSlugs) === 'in_progress'
        ).length
        const isComplete = stageMilestones.length > 0 && earned === stageMilestones.length
        // Default open: any milestone in progress, OR this stage is in the user's
        // current level band. Otherwise collapsed (out of the way).
        const defaultOpen = inProgress > 0 || stagesOpenByLevel.includes(stage.id)
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
            defaultOpen={defaultOpen}
            isComplete={isComplete}
          />
        )
      })}
    </div>
  )
}

function Stage({
  num, name, subtitle, earned, total, milestones, completedSlugs, startedSlugs, defaultOpen, isComplete,
}: {
  num: string
  name: string
  subtitle: string
  earned: number
  total: number
  milestones: Milestone[]
  completedSlugs: Set<string>
  startedSlugs: Set<string>
  defaultOpen: boolean
  isComplete: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const pct = total === 0 ? 0 : Math.round((earned / total) * 100)
  return (
    <div className="border-b border-cream-50/[0.06]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left py-5 hover:bg-cream-50/[0.02] transition"
        aria-expanded={open}
      >
        <div className="flex items-baseline gap-4 mb-1.5">
          <span className={`text-gold-100 transition-transform inline-block ${open ? 'rotate-90' : ''}`}>▸</span>
          <div className="prefix-num">{num}</div>
          <h3 className="font-display text-lg md:text-xl tracking-[0.06em] text-cream-50">{name}</h3>
          {isComplete && <span className="pill">✓ Stage complete</span>}
          <div className="ml-auto text-[10px] uppercase tracking-[0.28em] text-cream-50/80">
            {earned} / {total}
          </div>
        </div>
        <div className="ml-12 flex items-center gap-3">
          <p className="text-sm text-cream-50/70 flex-1">{subtitle}</p>
        </div>
        <div className="h-px bg-night-700 ml-12 mt-3">
          <div className="h-full bg-gold-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </button>
      {open && (
        <ul className="ml-12 pb-6 pt-1 space-y-1">
          {milestones.map(m => {
            const status = computeMilestoneStatus(m, completedSlugs, startedSlugs)
            return (
              <MilestoneRow
                key={m.id}
                m={m}
                status={status}
                targetSlug={targetSlugFor(m, completedSlugs)}
              />
            )
          })}
        </ul>
      )}
    </div>
  )
}

function MilestoneRow({ m, status, targetSlug }: { m: Milestone; status: MilestoneStatus; targetSlug: string | null }) {
  const inner = (
    <>
      <StatusIcon status={status} />
      <div className="flex-1 min-w-0">
        <div className={`font-display text-base tracking-[0.04em] ${status === 'earned' ? 'text-cream-50' : 'text-cream-50/70'}`}>
          {m.title}
        </div>
        <div className="text-xs text-cream-50/80 mt-0.5 leading-relaxed">{m.description}</div>
      </div>
      <StatusLabel status={status} />
      {targetSlug && (
        <span className="text-cream-50/75 group-hover:text-gold-100 group-hover:translate-x-1 transition shrink-0 mt-1" aria-hidden="true">→</span>
      )}
    </>
  )

  if (targetSlug) {
    return (
      <li>
        <Link
          to={`/lessons/${targetSlug}`}
          className="flex items-start gap-4 py-2.5 border-b border-cream-50/[0.04] hover:bg-cream-50/[0.02] -mx-2 px-2 transition group"
        >
          {inner}
        </Link>
      </li>
    )
  }

  return (
    <li className="flex items-start gap-4 py-2.5 border-b border-cream-50/[0.04] -mx-2 px-2">
      {inner}
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
  return (
    <div className="mt-1 h-5 w-5 rounded-full border border-dashed border-cream-50/15 shrink-0" aria-hidden="true" />
  )
}

function StatusLabel({ status }: { status: MilestoneStatus }) {
  if (status === 'earned') return <span className="text-[10px] uppercase tracking-[0.28em] text-gold-100 shrink-0 mt-1">Earned</span>
  if (status === 'in_progress') return <span className="text-[10px] uppercase tracking-[0.28em] text-ember-500 shrink-0 mt-1">In progress</span>
  if (status === 'future') return <span className="text-[10px] uppercase tracking-[0.28em] text-cream-50/75 shrink-0 mt-1">Coming</span>
  return null
}
