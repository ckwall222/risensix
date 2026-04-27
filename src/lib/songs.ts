import { supabase } from './supabase'

export type SongSection = {
  label: string
  lines: string[]
}

export type Song = {
  id: string
  slug: string
  title: string
  composer: string | null
  era: string | null
  key_root: string
  key_quality: string
  bpm: number
  time_signature: string
  capo: number
  difficulty: number
  intro: string | null
  sections: SongSection[]
  source_note: string | null
  sort_order: number
}

export async function fetchAllSongs(): Promise<Song[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('sort_order')
  if (error) {
    console.warn('fetchAllSongs error', error)
    return []
  }
  return (data as Song[] | null) ?? []
}

export async function fetchSongBySlug(slug: string): Promise<Song | null> {
  const { data } = await supabase
    .from('songs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  return (data as Song | null) ?? null
}

/**
 * Parse a "[Chord]lyric [Chord]more lyric" line into an array of segments.
 * Each segment has the chord that should appear above it (or null for none).
 */
export type LineSegment = { chord: string | null; lyric: string }

export function parseChordLine(line: string): LineSegment[] {
  const segments: LineSegment[] = []
  const re = /\[([^\]]+)\]/g
  let lastIdx = 0
  let pendingChord: string | null = null
  let m: RegExpExecArray | null
  while ((m = re.exec(line)) !== null) {
    const before = line.slice(lastIdx, m.index)
    if (before.length > 0 || segments.length === 0) {
      segments.push({ chord: pendingChord, lyric: before })
    }
    pendingChord = m[1]
    lastIdx = re.lastIndex
  }
  const tail = line.slice(lastIdx)
  if (tail.length > 0 || pendingChord !== null) {
    segments.push({ chord: pendingChord, lyric: tail })
  }
  return segments
}
