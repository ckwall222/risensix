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
    <div className="border-b border-black/[0.08]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left py-5 hover:bg-black/[0.02] transition"
        aria-expanded={open}
      >
        <div className="flex items-baseline gap-4 mb-1.5 flex-wrap">
          <span className={`text-gold-500 transition-transform inline-block ${open ? 'rotate-90' : ''}`}>▸</span>
          <div className="prefix-num" style={{ fontSize: 17 }}>{num}</div>
          <h3 className="font-display font-semibold text-lg md:text-xl tracking-[-0.015em] text-cream-50">{name}</h3>
          {isComplete && (
            <span className="pill" style={{ color: '#1D7F3F', borderColor: 'rgba(29,127,63,0.30)', background: 'rgba(29,127,63,0.06)' }}>
              ✓ Stage complete
            </span>
          )}
          <div className="ml-auto text-[13px] text-gold-100 font-medium">
            {earned} / {total}
          </div>
        </div>
        <div className="ml-12 flex items-center gap-3">
          <p className="text-[14px] text-cream-50/70 flex-1 leading-snug">{subtitle}</p>
        </div>
        <div className="h-1 rounded-full ml-12 mt-3 bg-black/[0.08] overflow-hidden">
          <div className="h-full transition-all" style={{ width: `${pct}%`, background: '#0066CC' }} />
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
        <div className={`font-display font-semibold text-[16px] tracking-[-0.015em] ${status === 'earned' ? 'text-cream-50' : 'text-cream-50/70'}`}>
          {m.title}
        </div>
        <div className="text-[13px] text-cream-50/65 mt-0.5 leading-snug">{m.description}</div>
      </div>
      <StatusLabel status={status} />
      {targetSlug && (
        <span className="text-gold-100 group-hover:text-ember-500 transition shrink-0 mt-1.5" aria-hidden="true">›</span>
      )}
    </>
  )

  if (targetSlug) {
    return (
      <li>
        <Link
          to={`/lessons/${targetSlug}`}
          className="flex items-start gap-4 py-2.5 border-b border-black/[0.04] hover:bg-black/[0.02] -mx-2 px-2 transition group"
        >
          {inner}
        </Link>
      </li>
    )
  }

  return (
    <li className="flex items-start gap-4 py-2.5 border-b border-black/[0.04] -mx-2 px-2">
      {inner}
    </li>
  )
}

function StatusIcon({ status }: { status: MilestoneStatus }) {
  if (status === 'earned') {
    return (
      <div
        className="mt-1 h-5 w-5 rounded-full flex items-center justify-center shrink-0"
        style={{ background: '#1D7F3F' }}
        aria-hidden="true"
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M2 5.5L4.5 8L9 2.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }
  if (status === 'in_progress') {
    return (
      <div
        className="mt-1 h-5 w-5 rounded-full flex items-center justify-center shrink-0"
        style={{ border: '2px solid #0066CC' }}
        aria-hidden="true"
      >
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#0066CC' }} />
      </div>
    )
  }
  if (status === 'locked') {
    return (
      <div className="mt-1 h-5 w-5 rounded-full shrink-0" style={{ border: '1px solid rgba(0,0,0,0.18)' }} aria-hidden="true" />
    )
  }
  return (
    <div className="mt-1 h-5 w-5 rounded-full shrink-0" style={{ border: '1px dashed rgba(0,0,0,0.16)' }} aria-hidden="true" />
  )
}

function StatusLabel({ status }: { status: MilestoneStatus }) {
  if (status === 'earned') return <span className="text-[12px] font-semibold shrink-0 mt-1.5" style={{ color: '#1D7F3F' }}>Earned</span>
  if (status === 'in_progress') return <span className="text-[12px] font-semibold shrink-0 mt-1.5" style={{ color: '#0066CC' }}>In progress</span>
  if (status === 'future') return <span className="text-[12px] font-medium text-gold-100 shrink-0 mt-1.5">Coming</span>
  return null
}
