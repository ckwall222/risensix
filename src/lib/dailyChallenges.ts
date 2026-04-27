/**
 * Daily challenge pool. A daily prompt (~10–15 min) tailored to the
 * user's current skill tier — deliberately NOT showing beginner content
 * to advanced players, and not throwing advanced material at beginners.
 *
 * One challenge is selected per day per user, deterministically (hash of
 * user id + date), so refreshing doesn't re-roll. The same user gets the
 * same challenge for a given day.
 */

export type ChallengeTier = 'foundation' | 'movement' | 'voice' | 'mastery' | 'craft'

export type DailyChallenge = {
  id: string
  title: string
  summary: string             // one-liner shown on dashboard card
  instructions: string        // markdown body for the /daily page
  duration: number            // minutes
  tiers: ChallengeTier[]      // which skill bands this challenge fits
}

export const TIERS_FOR_ABILITY: Record<string, ChallengeTier[]> = {
  absolute_beginner: ['foundation'],
  beginner:          ['foundation'],
  novice:            ['movement'],
  intermediate:      ['voice'],
  advanced:          ['mastery', 'craft'],
}

export const CHALLENGES: DailyChallenge[] = [
  // ───────────────────────── Foundation ─────────────────────────
  {
    id: 'f-em-clean',
    title: 'E minor, six clean strings',
    summary: '10 reps. Every string rings. No buzz, no mute.',
    instructions: `Hold an Em chord. Pluck **each string one at a time** from low E to high E. Listen for any string that's muted or buzzy.

If you hear a problem:
- Adjust your finger angle (more on the tip, less on the pad)
- Check your thumb is behind the neck, not over the top
- Reset and try again

**Goal:** 10 strums in a row where all 6 strings ring cleanly. Reset the count if even one string fails.`,
    duration: 10,
    tiers: ['foundation'],
  },
  {
    id: 'f-chord-switch',
    title: 'G to D, 60 switches',
    summary: 'A metronome. Two chords. Build the muscle memory.',
    instructions: `Set your metronome to **60 BPM**. Hold a G chord. On every click, switch to D. On the next click, back to G. And so on.

**60 switches total** — about 1 minute of clean alternation.

If you fumble:
- Slow the metronome to 50 BPM
- Identify which finger is slow to land — drill that finger's destination

This is the most important drill in early guitar. Chord changes — done in time — are 80% of strumming songs.`,
    duration: 12,
    tiers: ['foundation'],
  },
  {
    id: 'f-strum-pattern',
    title: 'D-DU-UDU strum, 5 minutes',
    summary: 'One chord, the standard pattern, in time.',
    instructions: `Hold any open chord (Em is fine). Set the metronome to **70 BPM**.

Play **D-DU-UDU** (down, down-up, up-down-up) — the strumming pattern that fits about a million songs. Every "D" or "U" lands on a metronome subdivision.

**Goal:** 5 minutes nonstop. Don't speed up. Don't add extra strums. Lock to the click. The hand keeps moving down-up-down-up even on the "skip" beats — your hand is a metronome arm.`,
    duration: 10,
    tiers: ['foundation'],
  },
  {
    id: 'f-name-strings',
    title: 'Name 30 random frets on the low E',
    summary: 'Just the low E. Quick recall, no looking.',
    instructions: `Without looking at the neck, name aloud the note at:

- Fret 1, 3, 5, 7, 8, 10, 12 (start with these)
- Then random frets called out by a friend or the [chromatic tuner](/tuner/advanced) (try playing the note, having the tuner confirm).

**Goal:** 30 correct names in a row. If you slip on one, restart the count.

The low E and A strings are the foundation of every barre chord on the neck. Memorizing them now saves you years of "wait, where's that chord again?" later.`,
    duration: 10,
    tiers: ['foundation'],
  },
  {
    id: 'f-pluck-each',
    title: 'Walk through C-G-Am-F',
    summary: 'The most-used progression in pop. Just the chords, in time.',
    instructions: `The C-G-Am-F progression powers thousands of songs (Let It Be, Don't Stop Believin', No Woman No Cry).

**Setup:** Metronome at 60 BPM. Each chord rings for **4 beats**.

Play through the cycle 10 times in a row, no stops. **Strum once on beat 1 of each bar** — keep it dead simple. Listen for whether each chord rings cleanly before moving on.

If you trip on the C → G transition, slow down. Don't rush. The clean transitions matter more than playing fast.`,
    duration: 12,
    tiers: ['foundation'],
  },

  // ───────────────────────── Movement ─────────────────────────
  {
    id: 'm-f-barre',
    title: 'F barre — 30 clean strums',
    summary: 'The chord that unlocks 12 keys. Make it ring.',
    instructions: `Hold a full F barre at fret 1. Strum slowly. Pluck each string individually to find the one that's muted (it's almost always the B string).

**Goal:** 30 strums in a row where all 6 strings ring cleanly.

Tactics that help:
- Roll your index finger slightly toward the thumb side (the bony edge presses harder than the pad)
- Lower your thumb behind the neck — it should push back as hard as your fingers push forward
- Don't squeeze the pick — relaxed pick hand stays loose enough to focus pressure on the fret hand

This is the chord most beginners give up on. Don't.`,
    duration: 12,
    tiers: ['movement'],
  },
  {
    id: 'm-pent-box1',
    title: 'A min pentatonic Box 1, 5 reps',
    summary: 'Up and down, alternate picking, no slips.',
    instructions: `Position your index at the 5th fret. Play A minor pentatonic Box 1 ascending (low E to high E), then descending back down.

**Use alternate picking** — down on the first note, up on the second, down on the third, etc.

**Goal:** 5 ascending-descending cycles **in a row with no mistakes**. If you slip a note, restart the count.

Speed: 60 BPM, 4 notes per beat (16th notes). Stay relaxed.`,
    duration: 10,
    tiers: ['movement'],
  },
  {
    id: 'm-c-cycle',
    title: 'CAGED — find C in 5 places',
    summary: 'C major in C-shape, A-shape, G-shape, E-shape, D-shape.',
    instructions: `Play **C major** in each of the 5 CAGED positions:

1. C-shape (open position) — `[x, 3, 2, 0, 1, 0]`
2. A-shape barred at fret 3
3. G-shape at fret 5 (hardest stretch)
4. E-shape at fret 8
5. D-shape at fret 10

**Goal:** Play each shape, hold for 4 beats, slide to the next. Connect them. Do this twice through.

You're not trying to memorize 5 chord diagrams. You're trying to *see* C major as one chord that lives in 5 places.`,
    duration: 14,
    tiers: ['movement'],
  },
  {
    id: 'm-fingerstyle-pima',
    title: 'PIMA pattern over chord changes',
    summary: 'Fingerstyle independence — thumb keeps the bass.',
    instructions: `Hold a C chord. Pluck **P-I-M-A-M-I** (thumb-index-middle-ring-middle-index). The thumb hits the bass note (string 5 root for C). I/M/A play strings 3, 2, 1.

**Drill:** Loop the pattern for 1 minute on C.

Then: change to G mid-pattern. Don't break the rhythm. Let the bass move (G's bass = string 6 fret 3) but keep the I-M-A fingers on the same strings.

Cycle: C → G → C → G, four bars each, **8 minutes total**.`,
    duration: 12,
    tiers: ['movement'],
  },
  {
    id: 'm-bend-tune',
    title: 'Bend the ♭3 to 3 — 20 reps',
    summary: 'The defining blues move. Land it in tune.',
    instructions: `Play the ♭3 of A minor pentatonic — string 3, fret 7 (G). Bend the string upward (toward the ceiling) until it sounds a half-step higher (G♯/A♭ — the major 3rd).

**Goal:** 20 bends, each one in tune. Use the [chromatic tuner](/tuner/advanced) to confirm — bend, hold, check the cents.

Most beginners under-bend. Trust your ear. The bend should sound *resolved* against an A chord ringing out.`,
    duration: 10,
    tiers: ['movement'],
  },

  // ───────────────────────── Voice ─────────────────────────
  {
    id: 'v-improv-am',
    title: 'Improvise 8 bars over Am — Box 1 only',
    summary: 'Five notes. Eight bars. Make it sound like a phrase.',
    instructions: `Loop an Am chord (or play one and let it ring; better yet, find a backing track in A minor on YouTube).

For **8 bars**, improvise using only the 5 notes of A minor pentatonic Box 1.

Constraints:
- **Leave space** — don't fill every beat
- **Bend at least one note** — the ♭3 (G) bent toward A is the move
- **End on the root** — your last note should be A
- **Repeat one phrase** — pick a 3-4 note idea and play it twice

Record yourself. Listen back. Notice what worked.`,
    duration: 14,
    tiers: ['voice'],
  },
  {
    id: 'v-travis-em-g',
    title: 'Travis pattern Em → G → C → D',
    summary: 'Bass + melody, switching chords without breaking time.',
    instructions: `Hold an Em chord. Play the Travis pattern (P-I-M-A-M-I) for 8 beats.

Switch to G. Same pattern, 8 beats. The bass pattern shifts because G's bass is on string 6 (low E) instead of Em's.

Continue: G → C → D → back to Em.

**Goal:** 4 bars per chord, 16 bars total, no break in the rhythm. The metronome at 60 BPM. The thumb keeps the pulse.

Most players freeze on the chord change. Practice the *transition* itself — that's the whole skill.`,
    duration: 14,
    tiers: ['voice'],
  },
  {
    id: 'v-ear-phrase',
    title: 'Hear a phrase, play it back',
    summary: 'The eyes-closed test. 5 phrases.',
    instructions: `Without looking at your guitar, play any 4-note phrase using A minor pentatonic. Sing it back. Then play it back from memory.

Repeat **5 times** with 5 different phrases.

Then: think of a 4-note phrase **without playing it first**. Sing it in your head. Then play what you imagined. Was it close?

This is ear training. It feels useless for the first 100 reps. Around rep 200, something clicks. Don't skip it.`,
    duration: 12,
    tiers: ['voice'],
  },
  {
    id: 'v-five-positions',
    title: 'Connect 2 pentatonic boxes',
    summary: 'Slide from Box 1 into Box 2 without breaking the line.',
    instructions: `Play A minor pentatonic Box 1 ascending. When you reach the high E string, *don't stop* — slide your hand into Box 2 (index at fret 7) and continue the ascending line up to high E in Box 2.

Then descend through Box 2 back to Box 1, slide your hand back down, and continue descending in Box 1.

**Goal:** Smooth sliding between the two boxes, 60 BPM, 4 notes per beat. The slide is the part most players never practice — but it's what makes a solo "move across the neck" instead of stay stuck in one box.

Repeat 5 times.`,
    duration: 14,
    tiers: ['voice'],
  },
  {
    id: 'v-chord-tone-walk',
    title: 'Walk chord tones — Cmaj7 to A minor',
    summary: 'Land on chord tones during chord changes.',
    instructions: `Loop **Cmaj7 → Am7** (4 bars each). Improvise using only chord tones — for Cmaj7: C E G B; for Am7: A C E G.

**Goal:** Each downbeat lands on a chord tone of whichever chord is currently sounding. Connect them with passing notes from the C major scale.

This is the foundation of jazz soloing. It's also why country/gospel solos sound so deliberate — every note is *intentional* against the harmony.

Record. Listen back for the chord-tone landings. They should sound resolved, not random.`,
    duration: 14,
    tiers: ['voice'],
  },

  // ───────────────────────── Mastery ─────────────────────────
  {
    id: 'mas-12bar-improv',
    title: '12-bar blues solo in A — record + critique',
    summary: 'Improvise. Record. Listen back. Note what to fix.',
    instructions: `Find a 12-bar blues backing track in A (Spotify, YouTube). Loop it.

**Improvise 3 full choruses** (36 bars) using A minor pentatonic + the major 3rd (C♯). Mix Box 1 and Box 2.

Phrasing rules:
- **Repeat phrases** — don't invent every bar
- **Bend the ♭3** (C → C♯) — the signature blues move
- **Land on the I, IV, V root** at the start of each respective chord (bar 1 = A, bar 5 = D, bar 9 = E)
- **Leave at least 4 bars of space** across the 36

Record. Listen. Note ONE thing you'd change. Tomorrow's practice fixes that.`,
    duration: 15,
    tiers: ['mastery'],
  },
  {
    id: 'mas-song-memory',
    title: 'Play a song from memory, no stops',
    summary: 'No tab, no video. Whole song, recorded.',
    instructions: `Pick a song you've played before. Set up a phone to record video.

Play it through, **start to finish**, no stops, no restarts, no apologies if you mess up. Recover and keep going.

**Watch the recording.** Note:
- Where you almost stopped
- Where your timing wobbled
- A section that was actually solid

That's tomorrow's targeted practice. Don't try to fix everything.`,
    duration: 15,
    tiers: ['mastery'],
  },
  {
    id: 'mas-modal-vamp',
    title: 'Solo over a D Dorian vamp',
    summary: 'Same notes as C major, centered on D. Hear the mode.',
    instructions: `Loop a Dm7 chord (or find a D Dorian vamp on YouTube — *So What* style).

Improvise using **only the C major scale** notes (C D E F G A B), centered on D. Try to make D sound like home.

The trick: emphasize **D** (root) and **B** (the 6th of D — the "Dorian sound"). Avoid resting on C — that pulls the ear back to C major.

**Goal:** 8 bars × 4 cycles. By the last cycle, the *Dorian-ness* should sound clearly different from "minor."

Modes are sounds, not formulas. This drill teaches your ear what Dorian feels like.`,
    duration: 14,
    tiers: ['mastery'],
  },
  {
    id: 'mas-rhythm-vary',
    title: 'One lick, three rhythms',
    summary: 'Same notes. Three different rhythmic phrasings.',
    instructions: `Pick any 4-note phrase (e.g., from your last solo).

Play it three different ways:
1. **Even 8th notes** — tick-tick-tick-tick
2. **Triplet feel** — three notes per beat, one note straight
3. **Anticipating the beat** — play the phrase starting on the "and" of beat 4 instead of on beat 1

**Goal:** the phrase should sound like a different lick each time, even though it's the same 4 notes.

Phrasing IS soloing. This drill builds the rhythmic flexibility that separates a "scale runner" from a soloist.`,
    duration: 12,
    tiers: ['mastery'],
  },
  {
    id: 'mas-perform-someone',
    title: 'Play a song for someone, in person',
    summary: 'Real audience, real nerves. The most important rep.',
    instructions: `Pick a song you can play at 90% accuracy alone.

Find a human (partner, friend, family). Tell them: *"I'm going to play a song. It will not be perfect."*

Play through, no stops. Don't apologize at the end.

Notice:
- Where your timing slipped (nerves do this)
- Where you tightened up
- What the audience reaction was

This is the milestone that *actually* makes you a player, not a practicer. Most guitarists skip this for years. Don't.`,
    duration: 10,
    tiers: ['mastery'],
  },

  // ───────────────────────── Craft ─────────────────────────
  {
    id: 'c-chord-tones-vamp',
    title: 'Chord-tone vamp — Am7 ↔ D7',
    summary: 'Target arpeggios, connect with passing tones.',
    instructions: `Loop **Am7 → D7** (4 bars each). Solo for 4 cycles (32 bars).

Constraints:
- On every chord change, **start your phrase on a chord tone** — Am7: A C E G; D7: D F♯ A C
- Use the **3rd and 7th** as your strongest landings — they define each chord
- Connect chord tones with **scale passing tones** (D Dorian for Am7, D Mixolydian for D7)
- **Match the rhythm** of the chord change — don't play AT the change; play THROUGH it

Record. The "chord tone landings" on each change should sound *intentional* — like the melody is *following* the harmony, not just playing in the key.`,
    duration: 15,
    tiers: ['craft'],
  },
  {
    id: 'c-hybrid-pickin',
    title: 'Hybrid picking — country lick',
    summary: 'Pick + middle finger, alternating bass + melody.',
    instructions: `Hold a G chord. Pick the low G (string 6, fret 3). Pluck the high G with your middle finger. Alternate.

Then add a B (string 2, open) plucked with your ring finger between picks.

Pattern: **pick-G / pluck-G / pluck-B / pick-G**, repeat.

Set the metronome to 80 BPM. **8 bars at this tempo, 8 bars at 100, 8 bars at 120.**

This is the building block of country chicken-pickin'. The only way through is reps. Do it daily for a week and the pick-and-finger coordination clicks.`,
    duration: 14,
    tiers: ['craft'],
  },
  {
    id: 'c-reharmonize',
    title: 'Reharmonize "Happy Birthday"',
    summary: 'Same melody, jazz chords. 16 bars.',
    instructions: `Hum *Happy Birthday* in your head. The standard chords are I-V-V-I-I-IV-I-V-I (or thereabouts).

**Replace each chord with a substitution:**
- I → vi or iii
- IV → ii7 or vi
- V → V7♭9 or tritone sub

Example in C: instead of C-G-G-C, try Am-Dm7-G7-Cmaj7.

Sing the melody on top — does it still fit? If not, swap the substitution. **Goal:** 16 bars where the original melody works but the chords are unrecognizable.

This is the move that turns a cover into an *interpretation*.`,
    duration: 15,
    tiers: ['craft'],
  },
  {
    id: 'c-compose-4bars',
    title: 'Compose 4 original bars',
    summary: 'Without the guitar first. Then translate.',
    instructions: `Put the guitar down. Pick a key (C major, say).

In your head, hum a 4-bar melody. Don't worry about how to play it. Just *imagine* it. Repeat the melody until you can hum it identically twice in a row.

Now pick up the guitar. Find the notes. Translate the melody to the fretboard.

The point: melodies that come from your *ear* are different from melodies that come from your *fingers*. Your fingers default to patterns you already know. Your ear finds new ones.

**Goal:** 4 bars, original, written down (in tab or notation). Save it. Tomorrow's challenge: harmonize it.`,
    duration: 15,
    tiers: ['craft'],
  },
  {
    id: 'c-record-take',
    title: 'Record one polished take',
    summary: 'Phone, headphones, no editing. Listen honestly.',
    instructions: `Pick a 60–90 second piece you've been working on (a chunk of a song, a riff, a fingerstyle phrase).

Set up a phone or computer mic. Quiet room. **Record one full take, all the way through.** No stopping. No re-recording.

Listen back **on headphones**.

Note honestly:
- What sounded better than expected?
- What sounded worse?
- What's one specific thing to fix tomorrow?

The microphone is the most brutal practice tool there is. Use it weekly minimum.`,
    duration: 12,
    tiers: ['craft'],
  },
]

// ────────────────────────────────────────────────────────────────────────
// Selection logic
// ────────────────────────────────────────────────────────────────────────

function simpleHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** YYYY-MM-DD in the user's local timezone. */
export function todayDateStr(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function pickChallengeFor(userId: string, dateStr: string, abilityLevel: string): DailyChallenge {
  const tiers = TIERS_FOR_ABILITY[abilityLevel] ?? TIERS_FOR_ABILITY['beginner']
  const eligible = CHALLENGES.filter(c => c.tiers.some(t => tiers.includes(t)))
  if (eligible.length === 0) return CHALLENGES[0]
  const h = simpleHash(`${userId}|${dateStr}`)
  return eligible[h % eligible.length]
}
