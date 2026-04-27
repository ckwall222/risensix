/**
 * Adaptive practice routine generator.
 *
 * Given a user's ability level, target session length, and a deterministic
 * seed (userId + date), produces an ordered sequence of practice blocks
 * that pulls from licks, jam tracks, theory, and the songbook.
 *
 * "Adaptive" here is deliberately small-scale: we vary block selection by
 * day so the user doesn't repeat the same warmup-drill-jam combo every
 * day, and we tier blocks by ability so beginners aren't asked to
 * solo over a ii-V-I in jazz.
 */

export type PracticeBlockType = 'warmup' | 'drill' | 'theory' | 'jam' | 'song' | 'cooldown'

export type PracticeBlock = {
  type: PracticeBlockType
  title: string
  description: string
  duration_min: number
  link?: string             // route within the app
  completed?: boolean
}

export type RoutineLength = 10 | 20 | 30

export type GeneratedRoutine = {
  id: string                // deterministic id used to memoize the day's routine
  total_minutes: number
  blocks: PracticeBlock[]
}

// ────────── Block pools ──────────────────────────────────────────────

type BlockTemplate = Omit<PracticeBlock, 'completed'> & {
  abilityFloor: number  // 1 (absolute_beginner) ... 5 (advanced)
  abilityCeil: number
}

const ABILITY_LEVEL: Record<string, number> = {
  absolute_beginner: 1,
  beginner: 2,
  novice: 3,
  intermediate: 4,
  advanced: 5,
}

const WARMUPS: BlockTemplate[] = [
  { type: 'warmup', title: 'Chromatic finger-stretch (1-2-3-4)',
    description: 'Climb 1-2-3-4 on each string starting from the open position. Down once, up once. 60 BPM.',
    duration_min: 3, abilityFloor: 1, abilityCeil: 5 },
  { type: 'warmup', title: 'Open chord rotation',
    description: 'C → G → D → Em → Am, four strums each. Two laps. Smooth changes are the goal, not speed.',
    duration_min: 4, abilityFloor: 1, abilityCeil: 3, link: '/chords' },
  { type: 'warmup', title: 'Spider walk across the neck',
    description: 'Index/middle on adjacent strings, ring/pinky next. Walk fingers up the neck without lifting.',
    duration_min: 4, abilityFloor: 2, abilityCeil: 5 },
  { type: 'warmup', title: 'A minor pentatonic Box 1, slow',
    description: '60 BPM, alternate picking, ascending then descending. Listen for evenness.',
    duration_min: 5, abilityFloor: 2, abilityCeil: 5, link: '/licks/blues-am-pent-classic' },
]

const DRILLS: BlockTemplate[] = [
  { type: 'drill', title: 'Lick: BB King box bend',
    description: 'Two-note bend in the upper pentatonic box. Match the target pitch by ear.',
    duration_min: 7, abilityFloor: 3, abilityCeil: 5, link: '/licks/blues-bb-king-tribute' },
  { type: 'drill', title: 'Lick: Pull-off rock fury',
    description: 'Triplet pull-offs in A minor pentatonic. Pick once per group of three.',
    duration_min: 6, abilityFloor: 3, abilityCeil: 5, link: '/licks/rock-am-pent-pull-off' },
  { type: 'drill', title: 'Lick: Travis-picking C → G',
    description: 'Alternating-bass thumb pattern. Practice thumb alone first.',
    duration_min: 8, abilityFloor: 2, abilityCeil: 5, link: '/licks/folk-travis-pattern' },
  { type: 'drill', title: 'F barre clean test',
    description: '30 strums in a row where all 6 strings ring. Reset the count at any muted note.',
    duration_min: 6, abilityFloor: 2, abilityCeil: 4 },
  { type: 'drill', title: 'CAGED: C in 5 places',
    description: 'Play C major in C-, A-, G-, E-, and D-shape. Slow and deliberate.',
    duration_min: 7, abilityFloor: 3, abilityCeil: 5, link: '/licks/blues-mixed-major-minor' },
  { type: 'drill', title: 'Five-note climbing run',
    description: 'Em pentatonic across four strings. Strict alternate picking.',
    duration_min: 6, abilityFloor: 3, abilityCeil: 5, link: '/licks/rock-five-note-flurry' },
]

const THEORY: BlockTemplate[] = [
  { type: 'theory', title: 'Circle of Fifths walk',
    description: 'Pick a key and identify its I-IV-V using the interactive wheel.',
    duration_min: 4, abilityFloor: 1, abilityCeil: 5, link: '/circle' },
  { type: 'theory', title: 'Diatonic chord identification',
    description: 'In G major, name all 7 diatonic chords by ear after hearing them.',
    duration_min: 5, abilityFloor: 2, abilityCeil: 5, link: '/theory' },
  { type: 'theory', title: 'Key signature recall',
    description: 'For each of C, G, D, A, E, name how many sharps it has and which notes are sharped.',
    duration_min: 3, abilityFloor: 2, abilityCeil: 5, link: '/theory' },
]

const JAMS: BlockTemplate[] = [
  { type: 'jam', title: '12-bar blues in A',
    description: "Solo over A blues using the minor pentatonic Box 1. Don't worry about wrong notes.",
    duration_min: 8, abilityFloor: 2, abilityCeil: 5, link: '/jam' },
  { type: 'jam', title: 'I-V-vi-IV pop in C',
    description: 'Outline each chord with arpeggios. Then try a melody on the high strings.',
    duration_min: 7, abilityFloor: 1, abilityCeil: 4, link: '/jam' },
  { type: 'jam', title: 'Doo-wop changes in G',
    description: 'Strum eighth notes through I-vi-IV-V. Find a vocal melody.',
    duration_min: 5, abilityFloor: 1, abilityCeil: 3, link: '/jam' },
  { type: 'jam', title: 'ii-V-I in C',
    description: 'Outline Dm7, G7, Cmaj7 with chord tones. The bebop scale unlocks this.',
    duration_min: 8, abilityFloor: 4, abilityCeil: 5, link: '/jam' },
  { type: 'jam', title: 'Minor vamp in Am',
    description: 'Cinematic minor groove. Solo with A natural minor or A dorian.',
    duration_min: 7, abilityFloor: 3, abilityCeil: 5, link: '/jam' },
]

const SONGS: BlockTemplate[] = [
  { type: 'song', title: 'Down in the Valley',
    description: 'Two chords. Strum and sing — yes, sing.',
    duration_min: 5, abilityFloor: 1, abilityCeil: 3, link: '/songs/down-in-the-valley' },
  { type: 'song', title: 'Amazing Grace',
    description: 'Three-chord hymn. Slow tempo, full sustain on each chord.',
    duration_min: 5, abilityFloor: 1, abilityCeil: 4, link: '/songs/amazing-grace' },
  { type: 'song', title: 'House of the Rising Sun',
    description: 'Arpeggiated picking on six chord shapes. The dark folk classic.',
    duration_min: 7, abilityFloor: 2, abilityCeil: 5, link: '/songs/house-of-the-rising-sun' },
  { type: 'song', title: 'Wayfaring Stranger',
    description: 'Em → Am → B7. Slow and reverent.',
    duration_min: 6, abilityFloor: 2, abilityCeil: 4, link: '/songs/wayfaring-stranger' },
  { type: 'song', title: 'Scarborough Fair',
    description: 'Fingerstyle in Dm. The melody breathes between chord changes.',
    duration_min: 8, abilityFloor: 3, abilityCeil: 5, link: '/songs/scarborough-fair' },
]

const COOLDOWNS: BlockTemplate[] = [
  { type: 'cooldown', title: 'Free play / favorite riff',
    description: "Whatever you want. No rules. Five minutes of music for music's sake.",
    duration_min: 3, abilityFloor: 1, abilityCeil: 5 },
  { type: 'cooldown', title: 'Slow, sustained chord arpeggios',
    description: 'Pick any chord you know. Arpeggiate slowly. Listen to each note decay.',
    duration_min: 3, abilityFloor: 1, abilityCeil: 5 },
]

// ────────── Generator ───────────────────────────────────────────────

function simpleHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i)
  return Math.abs(h)
}

function pickFor<T extends BlockTemplate>(pool: T[], ability: number, seed: number): T {
  const eligible = pool.filter(b => ability >= b.abilityFloor && ability <= b.abilityCeil)
  const list = eligible.length > 0 ? eligible : pool
  return list[seed % list.length]
}

export function generateRoutine(
  userId: string,
  dateStr: string,
  abilityLevel: string,
  length: RoutineLength
): GeneratedRoutine {
  const ability = ABILITY_LEVEL[abilityLevel] ?? 2
  const baseSeed = simpleHash(`${userId}|${dateStr}`)

  // Block plan by length:
  // 10 min: warmup, drill, cooldown
  // 20 min: warmup, drill, theory, jam, cooldown
  // 30 min: warmup, drill, theory, jam, song, cooldown
  let plan: PracticeBlockType[]
  if (length === 10) plan = ['warmup', 'drill', 'cooldown']
  else if (length === 20) plan = ['warmup', 'drill', 'theory', 'jam', 'cooldown']
  else plan = ['warmup', 'drill', 'theory', 'jam', 'song', 'cooldown']

  const blocks: PracticeBlock[] = plan.map((type, i) => {
    const seed = baseSeed + i
    const t = (() => {
      switch (type) {
        case 'warmup':   return pickFor(WARMUPS, ability, seed)
        case 'drill':    return pickFor(DRILLS, ability, seed)
        case 'theory':   return pickFor(THEORY, ability, seed)
        case 'jam':      return pickFor(JAMS, ability, seed)
        case 'song':     return pickFor(SONGS, ability, seed)
        case 'cooldown': return pickFor(COOLDOWNS, ability, seed)
      }
    })()
    return {
      type: t.type,
      title: t.title,
      description: t.description,
      duration_min: t.duration_min,
      link: t.link,
      completed: false,
    }
  })

  // Trim or pad to fit length budget within ±15%
  const total = () => blocks.reduce((s, b) => s + b.duration_min, 0)
  while (total() > length * 1.15) {
    const longest = blocks.reduce((max, b, i) => b.duration_min > blocks[max].duration_min ? i : max, 0)
    blocks[longest].duration_min = Math.max(2, blocks[longest].duration_min - 1)
  }

  return {
    id: `routine-${dateStr}-${length}-${ability}`,
    total_minutes: total(),
    blocks,
  }
}
