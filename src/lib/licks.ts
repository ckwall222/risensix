import { supabase } from './supabase'
import type { SequenceNote } from './audio'

export type LickGenre = 'blues' | 'rock' | 'country' | 'jazz' | 'folk'
export type LickFeel = 'straight' | 'shuffle' | 'swing'

export type Lick = {
  id: string
  slug: string
  name: string
  summary: string
  genre: LickGenre
  key_root: string
  key_quality: string
  difficulty: number
  bpm: number
  feel: LickFeel
  bars: number
  notes: SequenceNote[]
  instructor_notes: string
  position_label: string | null
  sort_order: number
}

export async function fetchAllLicks(): Promise<Lick[]> {
  const { data, error } = await supabase
    .from('licks')
    .select('*')
    .order('sort_order')
  if (error) {
    console.warn('fetchAllLicks error', error)
    return []
  }
  return (data as Lick[] | null) ?? []
}

export async function fetchLickBySlug(slug: string): Promise<Lick | null> {
  const { data } = await supabase
    .from('licks')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  return (data as Lick | null) ?? null
}

export const GENRE_LABEL: Record<LickGenre, string> = {
  blues: 'Blues',
  rock: 'Rock',
  country: 'Country',
  jazz: 'Jazz',
  folk: 'Folk',
}

export const GENRE_ORDER: LickGenre[] = ['blues', 'rock', 'country', 'jazz', 'folk']
