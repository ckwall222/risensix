import { supabase } from './supabase'
import { todayDateStr } from './dailyChallenges'

export type DailyCompletion = {
  user_id: string
  completed_on: string  // YYYY-MM-DD
  challenge_id: string
}

export async function isCompletedToday(userId: string, date: Date = new Date()): Promise<boolean> {
  const dateStr = todayDateStr(date)
  const { data } = await supabase
    .from('daily_completions')
    .select('completed_on')
    .eq('user_id', userId)
    .eq('completed_on', dateStr)
    .maybeSingle()
  return !!data
}

export async function markCompletedToday(userId: string, challengeId: string, date: Date = new Date()): Promise<void> {
  const dateStr = todayDateStr(date)
  await supabase.from('daily_completions').upsert({
    user_id: userId,
    completed_on: dateStr,
    challenge_id: challengeId,
  }, { onConflict: 'user_id,completed_on' })
}

/** Number of consecutive days ending today the user has completed a challenge. */
export async function getStreak(userId: string, today: Date = new Date()): Promise<number> {
  const start = new Date(today)
  start.setDate(start.getDate() - 60)  // look back 60 days, plenty
  const { data } = await supabase
    .from('daily_completions')
    .select('completed_on')
    .eq('user_id', userId)
    .gte('completed_on', todayDateStr(start))
    .order('completed_on', { ascending: false })

  const dates = new Set<string>((data ?? []).map((r: { completed_on: string }) => r.completed_on))
  let streak = 0
  const cursor = new Date(today)
  while (dates.has(todayDateStr(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
