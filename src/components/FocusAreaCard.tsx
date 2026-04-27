import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LessonProgressRow, bulkSetCompleted } from '../lib/lessonProgress'

export type FocusAreaCardLesson = {
  id: string
  slug: string
  title: string
  difficulty: number
  duration_minutes: number | null
  summary: string | null
  sort_order: number
}

type Props = {
  num: string
  focusAreaId: string
  name: string
  description: string
  lessons: FocusAreaCardLesson[]
  progress: Record<string, LessonProgressRow>
  minDifficulty: number
  userId: string
  onProgressChange: () => void
}

export function FocusAreaCard({
  num, focusAreaId, name, description, lessons, progress, minDifficulty, userId, onProgressChange,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [foundationalOpen, setFoundationalOpen] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)

  const completedCount = lessons.filter(l => progress[l.id]?.status === 'completed').length
  const total = lessons.length
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100)

  const foundational = lessons.filter(l => l.difficulty < minDifficulty)
  const current      = lessons.filter(l => l.difficulty >= minDifficulty)
  const foundationalCompleted = foundational.filter(l => progress[l.id]?.status === 'completed').length
  const foundationalAllDone = foundational.length > 0 && foundationalCompleted === foundational.length

  const markAllFoundationalComplete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setBulkSaving(true)
    const idsToMark = foundational.filter(l => progress[l.id]?.status !== 'completed').map(l => l.id)
    await bulkSetCompleted(userId, idsToMark)
    setBulkSaving(false)
    onProgressChange()
  }

  return (
    <div className="bg-night-900">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-7 hover:bg-night-700/30 transition"
        aria-expanded={expanded}
      >
        <div className="flex items-baseline justify-between mb-5">
          <div className="prefix-num">{num}</div>
          <div className="flex items-center gap-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-cream-50/40">{completedCount}/{total}</div>
            <span className={`text-gold-500 transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
          </div>
        </div>
        <div className="h-display text-xl md:text-2xl mb-3">{name}</div>
        <p className="text-sm text-cream-50/60 leading-relaxed line-clamp-2 mb-5">{description}</p>
        <div className="h-px bg-night-700">
          <div className="h-full bg-gold-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-cream-50/45 mt-2">{pct}% complete</div>
      </button>

      {expanded && (
        <div className="px-7 pb-7 -mt-1">
          {current.length > 0 && (
            <ul className="border-t border-cream-50/[0.06]">
              {current.map(l => (
                <LessonRow key={l.id} lesson={l} status={progress[l.id]?.status ?? 'not_started'} />
              ))}
            </ul>
          )}

          {foundational.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3 py-3 border-y border-cream-50/[0.06]">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFoundationalOpen(o => !o) }}
                  className="flex items-center gap-3 text-left flex-1"
                >
                  <span className={`text-gold-500 transition-transform ${foundationalOpen ? 'rotate-90' : ''}`}>▸</span>
                  <span className="font-display text-sm tracking-[0.06em] text-cream-50">
                    Foundational <span className="text-cream-50/45">({foundational.length})</span>
                  </span>
                </button>
                {!foundationalAllDone && (
                  <button
                    type="button"
                    onClick={markAllFoundationalComplete}
                    disabled={bulkSaving}
                    className="text-[10px] uppercase tracking-[0.22em] text-gold-500 hover:text-gold-100 transition border border-gold-500/40 hover:border-gold-500 px-3 py-1.5 disabled:opacity-50"
                  >
                    {bulkSaving ? 'Marking…' : 'Mark all done'}
                  </button>
                )}
              </div>
              {foundationalOpen && (
                <ul className="opacity-60 hover:opacity-100 transition">
                  {foundational.map(l => (
                    <LessonRow key={l.id} lesson={l} status={progress[l.id]?.status ?? 'not_started'} />
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-5">
            <Link
              to={`/focus/${focusAreaId}`}
              className="text-[10px] uppercase tracking-[0.28em] text-gold-500 hover:text-gold-100 transition"
            >
              Open full focus area →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function LessonRow({ lesson, status }: { lesson: FocusAreaCardLesson; status: string }) {
  const dot =
    status === 'completed' ? 'bg-gold-500' :
    status === 'in_progress' ? 'bg-ember-500' :
    'bg-transparent border border-cream-50/20'
  return (
    <li>
      <Link
        to={`/lessons/${lesson.slug}`}
        className="flex items-center gap-3 py-3 border-b border-cream-50/[0.04] hover:bg-cream-50/[0.02] -mx-2 px-2 transition group"
      >
        <div className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-cream-50 group-hover:text-gold-100 transition truncate">{lesson.title}</div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-cream-50/35 shrink-0">
          D{lesson.difficulty}{lesson.duration_minutes ? ` · ${lesson.duration_minutes}m` : ''}
        </div>
        <div className="text-cream-50/30 group-hover:text-gold-100 transition">→</div>
      </Link>
    </li>
  )
}
