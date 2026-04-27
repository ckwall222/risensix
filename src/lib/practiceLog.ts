import { supabase } from './supabase'
import type { PracticeBlock } from './routineGenerator'

export type PracticeSession = {
  user_id: string
  completed_on: string
  total_minutes: number
  routine_id: string
  blocks: PracticeBlock[]
}

export function todayDateStr(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export async function fetchTodaySession(userId: string): Promise<PracticeSession | null> {
  const { data } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('completed_on', todayDateStr())
    .maybeSingle()
  return (data as PracticeSession | null) ?? null
}

export async function upsertSession(session: Omit<PracticeSession, 'user_id'> & { user_id: string }): Promise<void> {
  await supabase.from('practice_sessions').upsert(session, {
    onConflict: 'user_id,completed_on',
  })
}

/** Last N days of sessions, oldest first. Includes empty days as nulls. */
export type DayMinutes = { date: string; minutes: number }

export async function fetchLastNDays(userId: string, n: number = 7): Promise<DayMinutes[]> {
  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() - (n - 1))

  const { data } = await supabase
    .from('practice_sessions')
    .select('completed_on, total_minutes')
    .eq('user_id', userId)
    .gte('completed_on', todayDateStr(start))
    .order('completed_on', { ascending: true })

  const map = new Map<string, number>()
  for (const r of (data as { completed_on: string; total_minutes: number }[] | null) ?? []) {
    map.set(r.completed_on, r.total_minutes)
  }

  const out: DayMinutes[] = []
  for (let i = 0; i < n; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const ds = todayDateStr(d)
    out.push({ date: ds, minutes: map.get(ds) ?? 0 })
  }
  return out
}
