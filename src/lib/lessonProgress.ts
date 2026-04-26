import { supabase } from './supabase'

export type LessonStatus = 'not_started' | 'in_progress' | 'completed'

export type LessonProgressRow = {
  user_id: string
  lesson_id: string
  status: LessonStatus
  started_at: string | null
  completed_at: string | null
  updated_at: string
}

export async function getProgressForLesson(userId: string, lessonId: string): Promise<LessonProgressRow | null> {
  const { data } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()
  return (data as LessonProgressRow) ?? null
}

export async function getProgressForLessons(userId: string, lessonIds: string[]): Promise<Record<string, LessonProgressRow>> {
  if (lessonIds.length === 0) return {}
  const { data } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds)
  const map: Record<string, LessonProgressRow> = {}
  for (const row of (data as LessonProgressRow[] | null) ?? []) {
    map[row.lesson_id] = row
  }
  return map
}

export async function setLessonStatus(userId: string, lessonId: string, status: LessonStatus): Promise<void> {
  const now = new Date().toISOString()
  const payload: Partial<LessonProgressRow> = {
    user_id: userId,
    lesson_id: lessonId,
    status,
    updated_at: now,
  }
  if (status === 'in_progress') payload.started_at = now
  if (status === 'completed') payload.completed_at = now

  await supabase.from('lesson_progress').upsert(payload, { onConflict: 'user_id,lesson_id' })
}

export async function getProgressCountsByFocusArea(userId: string): Promise<Record<string, { completed: number; total: number }>> {
  const { data: lessons } = await supabase.from('lessons').select('id, focus_area_id')
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id, status')
    .eq('user_id', userId)
    .eq('status', 'completed')

  const completedSet = new Set((progress ?? []).map((p: { lesson_id: string }) => p.lesson_id))
  const counts: Record<string, { completed: number; total: number }> = {}

  for (const lesson of (lessons as { id: string; focus_area_id: string }[] | null) ?? []) {
    const fa = lesson.focus_area_id
    if (!counts[fa]) counts[fa] = { completed: 0, total: 0 }
    counts[fa].total++
    if (completedSet.has(lesson.id)) counts[fa].completed++
  }
  return counts
}
