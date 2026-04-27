/**
 * Real, granular milestones for a guitarist's journey.
 * Each one is a thing you can either do or you can't — not vague levels.
 *
 * Some are auto-earned by completing specific lessons.
 * Others (no requiredLessonSlugs) are aspirational — they show the path
 * ahead and unlock when corresponding lesson content lands.
 */

export type MilestoneStage = 'foundation' | 'movement' | 'voice' | 'mastery' | 'craft'

export type Milestone = {
  id: string
  stage: MilestoneStage
  title: string
  description: string
  /** All listed lessons must be completed for this milestone to be earned. Empty = locked future content. */
  requiredLessonSlugs: string[]
}

export const STAGES: { id: MilestoneStage; name: string; subtitle: string }[] = [
  { id: 'foundation', name: 'Foundation', subtitle: 'The mechanics every guitarist needs.' },
  { id: 'movement',   name: 'Movement',   subtitle: 'You start to navigate the neck.' },
  { id: 'voice',      name: 'Voice',      subtitle: 'You begin to sound like you.' },
  { id: 'mastery',    name: 'Mastery',    subtitle: 'You stop being a student.' },
  { id: 'craft',      name: 'Craft',      subtitle: 'You make work the rest of us study.' },
]

/**
 * For a given ability level, which stages should default to "open" on the
 * journey view? The rest collapse by default — visible if the user wants
 * to peek, but out of the way.
 */
export const STAGES_OPEN_FOR: Record<string, MilestoneStage[]> = {
  absolute_beginner: ['foundation'],
  beginner:          ['foundation', 'movement'],
  novice:            ['movement', 'voice'],
  intermediate:      ['voice', 'mastery'],
  advanced:          ['mastery', 'craft'],
}

export const MILESTONES: Milestone[] = [
  // ───────────────────────── Foundation ─────────────────────────
  {
    id: 'first-grip',
    stage: 'foundation',
    title: 'You can hold a guitar',
    description: 'Posture, neck angle, body position. Nothing aches.',
    requiredLessonSlugs: ['rs-tech-holding'],
  },
  {
    id: 'six-strings',
    stage: 'foundation',
    title: 'You know the strings cold',
    description: 'Eddie Ate Dynamite, Good Bye Eddie — permanent.',
    requiredLessonSlugs: ['rs-tech-strings'],
  },
  {
    id: 'fretting-hand',
    stage: 'foundation',
    title: 'Your fretting hand stops fighting you',
    description: 'Fingertip pressure, thumb behind the neck, no more buzzing.',
    requiredLessonSlugs: ['rs-tech-fretting'],
  },
  {
    id: 'picking-hand',
    stage: 'foundation',
    title: 'A picking-hand grip you can trust',
    description: 'Pick rests on the index, thumb covers most of it, motion comes from the wrist.',
    requiredLessonSlugs: ['rs-tech-picking'],
  },
  {
    id: 'first-chord',
    stage: 'foundation',
    title: 'Your first clean chord',
    description: 'E minor. All six strings ringing — no muted strings, no buzz.',
    requiredLessonSlugs: ['rs-rhythm-em'],
  },
  {
    id: 'reads-tab',
    stage: 'foundation',
    title: 'You can read tab',
    description: 'No more guessing where the notes go.',
    requiredLessonSlugs: ['rs-theory-tab'],
  },
  {
    id: 'in-time',
    stage: 'foundation',
    title: 'You play in time',
    description: 'A steady count and a strum that holds together.',
    requiredLessonSlugs: ['rs-rhythm-counting', 'rs-rhythm-strum-1'],
  },

  // ───────────────────────── Movement ─────────────────────────
  {
    id: 'fretboard-aware',
    stage: 'movement',
    title: 'The neck stops being a maze',
    description: 'You know how notes repeat — and the 5th and 6th strings feel like home.',
    requiredLessonSlugs: ['rs-theory-fretboard'],
  },
  {
    id: 'pentatonic-box-1',
    stage: 'movement',
    title: 'Pentatonic Box 1 — fluent',
    description: 'Up and down, alternate picking, even rhythm. The shape is yours.',
    requiredLessonSlugs: ['rs-lead-pent-box1'],
  },
  {
    id: 'first-phrase',
    stage: 'movement',
    title: 'Your first lead phrase',
    description: 'Five notes played with intention — slide, bend, vibrato, space.',
    requiredLessonSlugs: ['rs-lead-first-phrase'],
  },
  {
    id: 'first-barre',
    stage: 'movement',
    title: 'Your first barre chord',
    description: 'F major, clean. The unlock for every chord, every key.',
    requiredLessonSlugs: ['rs-mvt-first-barre'],
  },

  // ───────────────────────── Voice ─────────────────────────
  {
    id: 'fingerstyle-basics',
    stage: 'voice',
    title: 'Independent fingers',
    description: 'Thumb keeps the bass. Each finger keeps its string. The pattern stays steady.',
    requiredLessonSlugs: ['rs-finger-pima'],
  },
  {
    id: 'caged-positions',
    stage: 'voice',
    title: 'CAGED across the neck',
    description: 'You can find one major chord in five different places — and connect them.',
    requiredLessonSlugs: ['rs-voice-caged-positions'],
  },
  {
    id: 'all-pent-boxes',
    stage: 'voice',
    title: 'All five pentatonic positions',
    description: 'No corner of the fretboard is unfamiliar.',
    requiredLessonSlugs: ['rs-voice-all-pent-boxes'],
  },
  {
    id: 'phrase-by-ear',
    stage: 'voice',
    title: 'A phrase by ear',
    description: 'You hear four notes and you can play them back. The eyes-closed test.',
    requiredLessonSlugs: ['rs-voice-phrase-by-ear'],
  },

  // ───────────────────────── Mastery ─────────────────────────
  {
    id: 'twelve-bar',
    stage: 'mastery',
    title: 'Improvise over a 12-bar blues',
    description: 'Pentatonic, phrasing, dynamics, rest. Your first real solo.',
    requiredLessonSlugs: ['rs-master-twelve-bar'],
  },
  {
    id: 'song-memory',
    stage: 'mastery',
    title: 'A song, start to finish',
    description: 'No tab. No video. The whole thing — beginning, middle, end.',
    requiredLessonSlugs: ['rs-master-song-memory'],
  },
  {
    id: 'fingerstyle-piece',
    stage: 'mastery',
    title: 'A fingerstyle piece, in front of someone',
    description: 'Travis pattern, melody and bass at once, played for human ears.',
    requiredLessonSlugs: ['rs-master-fingerstyle-piece'],
  },
  {
    id: 'mode-switch',
    stage: 'mastery',
    title: 'You hear modes',
    description: 'Dorian, Mixolydian, Phrygian — they\'re sounds, not theory.',
    requiredLessonSlugs: ['rs-master-modes'],
  },
  {
    id: 'played-for-someone',
    stage: 'mastery',
    title: 'You played for someone',
    description: 'Anyone — a friend, a partner, a stage. The milestone that matters most.',
    requiredLessonSlugs: ['rs-master-played-for-someone'],
  },

  // ───────────────────────── Craft (truly advanced) ─────────────────────────
  {
    id: 'chord-tone-solo',
    stage: 'craft',
    title: 'Chord-tone soloing',
    description: 'You target chord tones (root, 3, 5, 7) on the change — your solos follow the harmony, not just the key.',
    requiredLessonSlugs: [],
  },
  {
    id: 'read-notation',
    stage: 'craft',
    title: 'Read standard notation fluently',
    description: 'Sight-read a piece of sheet music for guitar without translating to tab.',
    requiredLessonSlugs: [],
  },
  {
    id: 'hybrid-picking',
    stage: 'craft',
    title: 'Hybrid picking',
    description: 'Pick and fingers at the same time — the technique behind country chicken-pickin\' and modern jazz fusion.',
    requiredLessonSlugs: [],
  },
  {
    id: 'reharmonize',
    stage: 'craft',
    title: 'Reharmonize a song',
    description: 'Take a song you know and substitute different chords that fit the melody — the foundation of jazz comping and modern songwriting.',
    requiredLessonSlugs: [],
  },
  {
    id: 'composed-original',
    stage: 'craft',
    title: 'Composed an original piece',
    description: 'Beginning, middle, end. Original chord progression, melody, structure. Finished — not a fragment.',
    requiredLessonSlugs: [],
  },
  {
    id: 'recorded-track',
    stage: 'craft',
    title: 'Recorded a track that holds up',
    description: 'You sat down, tracked it, mixed it, and listened back without flinching.',
    requiredLessonSlugs: [],
  },
  {
    id: 'gigged',
    stage: 'craft',
    title: 'Played a paid gig',
    description: 'Someone paid you to play. Doesn\'t matter how much. The line crossed once is crossed for good.',
    requiredLessonSlugs: [],
  },
  {
    id: 'taught-someone',
    stage: 'craft',
    title: 'Taught someone else to play',
    description: 'A friend, a kid, a stranger. The first time someone else plays a chord because you showed them how.',
    requiredLessonSlugs: [],
  },
]

export type MilestoneStatus = 'earned' | 'in_progress' | 'locked' | 'future'

export function computeMilestoneStatus(
  m: Milestone,
  completedSlugs: Set<string>,
  startedSlugs: Set<string>,
): MilestoneStatus {
  if (m.requiredLessonSlugs.length === 0) return 'future'
  const completed = m.requiredLessonSlugs.filter(s => completedSlugs.has(s)).length
  const started   = m.requiredLessonSlugs.filter(s => startedSlugs.has(s)).length
  if (completed === m.requiredLessonSlugs.length) return 'earned'
  if (started > 0) return 'in_progress'
  return 'locked'
}
