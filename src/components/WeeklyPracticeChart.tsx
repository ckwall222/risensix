import type { DayMinutes } from '../lib/practiceLog'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function WeeklyPracticeChart({ days, target = 20 }: { days: DayMinutes[]; target?: number }) {
  const max = Math.max(target, ...days.map(d => d.minutes))
  return (
    <div>
      <div className="flex items-end gap-2 h-32">
        {days.map((d, i) => {
          const date = new Date(d.date + 'T00:00:00')
          const dayLabel = DAY_LABELS[date.getDay()]
          const heightPct = max === 0 ? 0 : Math.min(100, (d.minutes / max) * 100)
          const hitTarget = d.minutes >= target
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <div className="text-[10px] text-cream-50/70 tabular-nums h-3">
                {d.minutes > 0 ? d.minutes : ''}
              </div>
              <div className="w-full h-24 bg-cream-50/[0.04] relative">
                <div
                  className={`absolute bottom-0 left-0 right-0 transition-all ${
                    hitTarget ? 'bg-gold-500' : 'bg-gold-500/40'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                {/* target line */}
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-gold-100/40"
                  style={{ bottom: `${(target / max) * 100}%` }}
                />
              </div>
              <div className={`text-[10px] uppercase tracking-[0.18em] ${i === days.length - 1 ? 'text-gold-100' : 'text-cream-50/60'}`}>
                {dayLabel}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-cream-50/60">
        Last 7 days · target {target} min/day
      </div>
    </div>
  )
}
