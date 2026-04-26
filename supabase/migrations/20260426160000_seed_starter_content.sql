-- Risen Six — starter content
-- 5 theory entries + 13 beginner lessons + lesson-theory links.
-- Idempotent-ish: deletes anything we'd recreate before inserting.

-- =============================================================
-- Clean slate for our seed (only deletes our seed rows)
-- =============================================================
delete from public.lesson_theory_links
  where lesson_id in (select id from public.lessons where slug like 'rs-%');
delete from public.lesson_progress
  where lesson_id in (select id from public.lessons where slug like 'rs-%');
delete from public.lessons where slug like 'rs-%';
delete from public.theory_entries where id in (
  'caged','circle-of-fifths','major-scale','minor-pentatonic','intervals'
);

-- =============================================================
-- THEORY ENTRIES
-- =============================================================
insert into public.theory_entries (id, title, summary, body, difficulty, sort_order) values
('intervals',
 'Intervals',
 'The distance between any two notes — the alphabet of music theory.',
 $md$
An **interval** is the distance between two notes. Every chord, every scale, every melody is built from intervals. Learn these and theory stops feeling like memorization.

## The 12 distances

Western music divides the octave into 12 equal half-steps (semitones). Every interval is just a count of half-steps from a starting note.

| Interval | Half-steps | From C |
|---|---|---|
| Unison | 0 | C |
| Minor 2nd | 1 | C♯ / D♭ |
| Major 2nd | 2 | D |
| Minor 3rd | 3 | D♯ / E♭ |
| Major 3rd | 4 | E |
| Perfect 4th | 5 | F |
| Tritone | 6 | F♯ / G♭ |
| Perfect 5th | 7 | G |
| Minor 6th | 8 | G♯ / A♭ |
| Major 6th | 9 | A |
| Minor 7th | 10 | A♯ / B♭ |
| Major 7th | 11 | B |
| Octave | 12 | C |

## Why guitarists should care

On a guitar, every fret is one half-step. So intervals are *spatial*. A perfect 5th from any note is **2 frets up, 1 string up** (except across the B-G boundary). A major 3rd is **1 string up, 1 fret back**.

Once you can *see* intervals on the neck, you stop memorizing chord shapes and start understanding why they work.

## Listen for them

- **Major 3rd** = the first two notes of *Oh When the Saints*
- **Perfect 5th** = the first two notes of *Twinkle Twinkle*
- **Minor 3rd** = the first two notes of *Greensleeves*
- **Octave** = *Somewhere Over the Rainbow*

Train your ear with these mnemonics. They're worth more than any chord chart.
$md$,
 1, 1),

('major-scale',
 'The Major Scale',
 'Seven notes, one formula. The blueprint behind keys, chords, and most Western music.',
 $md$
The **major scale** is the foundation that nearly every Western melody, chord progression, and song key is built on. Internalize this and the rest of theory falls into place.

## The formula

From any starting note (the *root*), the major scale follows this pattern of whole-steps (W) and half-steps (H):

> **W — W — H — W — W — W — H**

That's it. Apply this formula starting from C and you get the C major scale (no sharps or flats):

`C  D  E  F  G  A  B  C`

Apply it from G and you get one sharp (F♯):

`G  A  B  C  D  E  F♯ G`

## Scale degrees

Each note in the scale gets a number (1 through 7), called a *scale degree*:

| Degree | C major | Name |
|---|---|---|
| 1 | C | Tonic |
| 2 | D | Supertonic |
| 3 | E | Mediant |
| 4 | F | Subdominant |
| 5 | G | Dominant |
| 6 | A | Submediant |
| 7 | B | Leading tone |

Forget the fancy names for now. **Know the numbers.** When someone says *"play the 5"*, you should hear "G" in C major.

## Why it matters for guitarists

Every chord in a key is built from the scale. Every scale shape on the neck is just this pattern moved around. Learn one major scale shape, and you've effectively learned all 12 keys — just slide it.
$md$,
 2, 2),

('minor-pentatonic',
 'The Minor Pentatonic',
 'Five notes that work over almost everything. The most-used scale in rock and blues.',
 $md$
The **minor pentatonic** scale is five notes that fit over countless songs. If the major scale is the alphabet, this is the most-used phrase in the language. Every blues, rock, and country lead guitarist relies on it.

## The formula

From the root, the minor pentatonic uses these scale degrees:

> **1 — ♭3 — 4 — 5 — ♭7**

In A minor pentatonic, that's:

`A  C  D  E  G`

Five notes. Skip the 2nd and the 6th of the scale and you have the pentatonic.

## The first box shape (Box 1)

This is the shape every guitarist learns first. Position your index finger at the 5th fret on the low E string for **A minor pentatonic**:

```
e |---5---8---|
B |---5---8---|
G |---5---7---|
D |---5---7---|
A |---5---7---|
E |---5---8---|
```

Two notes per string. Five strings worth of patterns. Slide it up and down to change keys — same shape, different root.

## Why it works

Pentatonic scales have **no half-step dissonances**. You can play any note over any chord in the key and it will sound at minimum okay, often great. That's why beginners can sound like they know what they're doing within an hour of learning this shape.

## Try it

Loop an A minor chord (or any A minor backing track) and play these notes in any order. You're already soloing.
$md$,
 2, 3),

('caged',
 'The CAGED System',
 'Five movable shapes that map every major chord and scale across the entire fretboard.',
 $md$
**CAGED** is a system that connects the five basic open-position chord shapes — **C, A, G, E, D** — to every position on the neck. Once you see it, the fretboard stops being mysterious.

## The five shapes

Take the open-position **C, A, G, E, D** chord shapes you already know. CAGED says: any major chord can be played using one of those five shapes, somewhere on the neck.

For example, an **E major chord** can be played as:

| Shape | Position |
|---|---|
| Open **E** shape | open (frets 0-2) |
| **D** shape | barred at fret 2 |
| **C** shape | barred at fret 4 |
| **A** shape | barred at fret 7 |
| **G** shape | barred at fret 9 |

Five different places to play E major, all up and down the neck.

## How they connect

The shapes connect *in order* up the neck — C → A → G → E → D → back to C. The end of one shape is the start of the next.

Picture it like a chain: each shape covers a few frets, the next shape starts where the last ended.

## Why guitarists need this

Without CAGED, you're stuck playing every song in the same position. With it:

- You can solo over a chord progression *inside* the chord shape — your scale and your chord live in the same place.
- You can substitute voicings to find smoother chord transitions.
- You stop memorizing 60 chord diagrams and start *seeing* the neck.

## Practical first step

Pick one major chord (E is a good choice). Find all five CAGED positions for it on the neck. Play each, slowly. Then connect them — slide from one to the next.

That single exercise unlocks the entire CAGED concept. Everything after is variation.
$md$,
 3, 4),

('circle-of-fifths',
 'The Circle of Fifths',
 'A roadmap of how keys, chords, and notes relate. The most useful diagram in music theory.',
 $md$
The **Circle of Fifths** is a circular diagram that shows the 12 musical keys arranged so each step is a perfect 5th. It looks decorative, but it's the most practical tool in theory.

## The circle

Starting from **C** at the top (no sharps, no flats), going clockwise — each key adds **one sharp**:

> C → G → D → A → E → B → F♯ → ...

Going counterclockwise from C, each key adds **one flat**:

> C → F → B♭ → E♭ → A♭ → ...

After 12 steps you're back where you started.

## What it tells you

### Key signatures
The number of sharps/flats in each key. C major has zero. G major has 1 sharp (F♯). D major has 2 (F♯, C♯). Pattern: each step clockwise adds the next sharp.

### Chord relationships
In any major key, the **I, IV, V** chords (the three most-used chords in pop, rock, country, blues) are right next to each other on the circle.

In **C major**:
- I = C (the key center)
- IV = F (one step counterclockwise)
- V = G (one step clockwise)

These three chords appear together for almost every basic strummed song.

### Modulation
Songs that change keys usually move by a 5th — one step on the circle. That's why a key change "sounds like a key change" — your ear is familiar with the circle's geometry whether you know it or not.

## How guitarists use it

- **Transposing**: capo or shift to another key? Move the same distance on the circle.
- **Songwriting**: pick a key, look at neighbors for chord candidates that will sound natural.
- **Improvising**: any chord adjacent on the circle is a "safe" substitute.

Print one out. Tape it to your guitar case.
$md$,
 3, 5);

-- =============================================================
-- LESSONS (all slugs prefixed with rs-)
-- =============================================================
insert into public.lessons
  (slug, title, focus_area_id, difficulty, duration_minutes, summary, body, sort_order)
values

-- ---- TECHNIQUE ----
('rs-tech-holding',
 'Holding the guitar',
 'technique', 1, 8,
 'Posture, neck angle, where the body sits. The boring stuff that makes everything else possible.',
 $md$
Before any chord or scale, get your body right. Most beginners struggle for weeks because their guitar is fighting them.

## Sitting position (recommended for practice)

1. Sit on a firm chair with no arms, feet flat on the floor.
2. Rest the **lower bout** (the curved part of the body) on your right thigh (left thigh if left-handed — but all examples here are right-handed).
3. The neck angles **upward and away from you**, around 30–45 degrees from horizontal. Don't let it sag.
4. The headstock should be roughly at shoulder height.

## What you're checking

- **Right elbow** rests on the upper bout, naturally.
- **Right hand** falls over the strings near the soundhole (acoustic) or between pickups (electric).
- **Left wrist** is straight or slightly arched. If it's *kinked* (palm facing you), you'll cramp within 5 minutes.
- **Left thumb** sits on the *back* of the neck, not wrapped over. Save the thumb-over technique for later.

## Common mistakes

- **Slouching forward to look at your fingers.** Trust the feel; don't fold over.
- **Neck pointing down.** Tilt it up. Your wrist will thank you.
- **Strap too long when standing.** Shorten until the guitar is at the same height standing as it is sitting. (Slash style looks cool, plays terribly.)

## Try this

Hold the guitar for 60 seconds without playing anything. Adjust until nothing aches and you can see all six strings without straining your neck. *That* is your home position.
$md$,
 1),

('rs-tech-strings',
 'Naming the strings',
 'technique', 1, 5,
 'Six strings, six names. Memorize them now or pay for it forever.',
 $md$
The six strings, from **thickest to thinnest** (low pitch to high pitch):

| String # | Letter name | Memory |
|---|---|---|
| 6 | **E** (low E) | Eddie |
| 5 | **A** | Ate |
| 4 | **D** | Dynamite |
| 3 | **G** | Good |
| 2 | **B** | Bye |
| 1 | **E** (high E) | Eddie |

> *"Eddie Ate Dynamite, Good Bye Eddie."*

That's the standard mnemonic. There are spicier versions floating around — find one that sticks.

## Numbering convention

When you see "**6th string**" in any guitar lesson, it's the **thickest** one (low E). When you see "**1st string**", it's the **thinnest** (high E). This is universal — books, videos, tabs — once you know it, you're fluent in every guitar resource.

## Tab orientation

Guitar tablature shows strings as horizontal lines. The **thickest string is at the BOTTOM** of the tab, **thinnest at the top**. This trips up everyone the first time:

```
e |--------|   ← high E (string 1)
B |--------|
G |--------|
D |--------|
A |--------|
E |--------|   ← low E (string 6)
```

It's reversed from how you'd "look down" at the guitar in your lap. Just memorize it: **top of tab = highest pitch.**

## Practice

Say the names aloud as you pluck each open string — slowly, six times. Then again pointing at strings without plucking. Three minutes a day for a week and it's permanent.
$md$,
 2),

('rs-tech-fretting',
 'Your fretting hand',
 'technique', 1, 10,
 'Where to press, how hard, and why your fingertips hurt for two weeks.',
 $md$
Your left hand (fretting hand) does the pitch-shaping work. Get the fundamentals right and chords feel natural; get them wrong and every chord feels like a fight.

## Finger numbering

| Finger | Number |
|---|---|
| Index | 1 |
| Middle | 2 |
| Ring | 3 |
| Pinky | 4 |

Thumb is unnumbered (mostly stays on the back of the neck for now).

Tabs and chord charts use these numbers. *"3rd finger on the 3rd fret of the A string"* = ring finger, 3rd fret, string 5.

## Where to press

**Press just behind the fret wire — not on it, not in the middle of the fret.** Pressing right behind the wire gives the cleanest tone with the least force. Press in the middle and you'll either get a buzzy note or have to squeeze hard enough to bend the string sharp.

Picture each fret as a section of the string. The wire at the top of the section is what stops the string from vibrating. You're shortening the string by clamping it just behind that wire.

## Pressure

**Use the minimum pressure that produces a clean note.**

Test it: fret a note on the 5th fret of the B string with your index finger. Pluck. Loosen pressure gradually until you hear buzz, then tighten until it's clean again. *That* level of pressure is your target. Most beginners use 2–3× more than needed.

## Thumb position

Behind the neck, roughly opposite your middle finger, pointing toward the headstock. **Not** wrapped around the top.

You'll hear "thumb-over" technique mentioned later (Hendrix used it constantly). It's a real and useful technique — but it's terrible for learning, because it lets you cheat your hand position. Lock your thumb behind the neck for the first six months.

## Why your fingertips hurt

For the first 1–3 weeks, your fingertips will feel raw or even blister. This is normal. Your skin is thickening into calluses. Practice 10–20 minutes a day rather than one 2-hour session — the skin needs time to adapt between sessions.

Once calluses form (usually 3–6 weeks of regular practice), discomfort vanishes. Don't shortcut this.
$md$,
 3),

('rs-tech-picking',
 'Your picking hand',
 'technique', 1, 8,
 'How to hold a pick. Yes, there''s a right way.',
 $md$
The right hand (or "picking hand") attacks the strings. Most picking-hand problems trace back to two things: how you hold the pick, and where your wrist anchors.

## Holding the pick

1. Make a **loose fist** with your right hand, like you're holding a small hammer.
2. Lay the pick **flat on the side of your index finger**, pointed end facing toward your pinky.
3. Place your thumb on top, *covering most of the pick*. Only ~⅓ of the pick should stick out past your thumb.
4. The pick is held by **friction between thumb and the side of the index**, NOT by clenching.

## Grip pressure

**Loose enough that the pick can rotate slightly if it catches on a string.**

Tight grip = stiffness, fatigue, and a thin tone. Loose grip = the pick can *flex* on contact, giving you a fuller sound and effortless speed.

Test: hold the pick correctly. Now poke the tip with your other hand. If it pivots a little, your grip is right. If it doesn't budge, you're choking it.

## Where to strike

For most playing, you pick **between the soundhole and the bridge** on an acoustic, or between the pickups on an electric. Closer to the bridge = brighter, harder. Closer to the neck = warmer, softer.

There's no wrong place — it's a tone choice. Start in the middle and experiment.

## Down vs. up strokes

A **downstroke** is pulling the pick toward the floor across a string. An **upstroke** is the reverse — toward the ceiling.

Most beginners play almost everything with downstrokes. That's fine for a few weeks. Soon you'll alternate down-up-down-up — *alternate picking* — for speed and even tone.

## Drill

Place the pick correctly. Play **20 downstrokes** on the open low E string at a slow, even tempo. Watch your hand. The motion should come from the **wrist**, not the elbow or fingers. Wrist motion is small, efficient, and fast. Elbow motion is sloppy and tiring.
$md$,
 4),

-- ---- RHYTHM ----
('rs-rhythm-em',
 'Your first chord: E minor',
 'rhythm', 1, 7,
 'Two fingers, six strings, one of the most beautiful chords in music.',
 $md$
**E minor** (Em) is the easiest chord on the guitar — and one of the most-used in popular music. It's a great first chord because:

- Only two fingers
- All six strings ring out
- It sounds *full* immediately

## The shape

```
e |---0---|  open
B |---0---|  open
G |---0---|  open
D |---2---|  2nd finger, 2nd fret
A |---2---|  3rd finger, 2nd fret
E |---0---|  open
```

- **Middle finger (2)** on the 2nd fret of the **D string** (4th string).
- **Ring finger (3)** on the 2nd fret of the **A string** (5th string).
- All other strings are played open.

## Strum it

Strum all six strings from low E to high E, slowly, with a downstroke. Listen for:

- **All six strings ringing clearly.** Any muted or buzzing string = pressure or finger-curl issue.
- **No string ringing dead.** That usually means another finger is touching it — check your finger angle.

## The check-each-string drill

Before strumming, pluck each string one at a time:

1. Low E (open) → should ring clearly.
2. A (2nd fret, ring finger) → ring clearly.
3. D (2nd fret, middle finger) → ring clearly.
4. G (open) → ring clearly. *If muted, your middle finger is leaning into it — straighten the knuckle.*
5. B (open) → ring clearly.
6. High E (open) → ring clearly.

If any string is dead, isolate the problem before strumming. Strumming hides which finger is the culprit.

## Why this matters

You'll use Em in literally thousands of songs. *House of the Rising Sun*, *Hurt*, *Wonderwall*, *Stairway to Heaven* — all open with or rely on this chord. Lock it in clean before moving to the next.
$md$,
 1),

('rs-rhythm-counting',
 'Counting in 4/4 time',
 'rhythm', 1, 6,
 'Almost every song you''ve heard is in 4/4. Internalize the count before you internalize the strum.',
 $md$
**Time signature** tells you how the rhythm is organized. The vast majority of pop, rock, blues, country, and folk songs are in **4/4** — four beats per measure, each beat a quarter note.

## The basic count

Out loud, evenly spaced:

> **1 — 2 — 3 — 4 — 1 — 2 — 3 — 4 — ...**

Each number is one **beat**. Four beats make one **measure** (or "bar"). Then it repeats.

## Tap your foot

Set a metronome to **60 BPM** (one beat per second). Tap your foot on every click. Count "1, 2, 3, 4" out loud as you tap.

Easy, right? But here's the key: **the count must be unwavering**. If your "1" is too late or too early, the whole measure shifts. Music holds together because everyone agrees on the count.

## Counting "and"s

Halfway between each beat is the **"and"** (often written **"+"**):

> **1 — and — 2 — and — 3 — and — 4 — and**

So you have eight equal slices per measure. The numbers are *on the beat*; the "and"s are *off the beat*. Strumming patterns use both.

## Why this is foundational

Once you can keep the count rock-steady while doing other things — talking, walking, switching chords — your rhythm playing will sound musical. Skip this and you'll fight rhythm forever.

## Drill

1. Play one Em chord on every "1." Strum down. Count out loud.
2. Now strum on "1" and "3."
3. Now strum on every beat: "1, 2, 3, 4."

Use a metronome. Don't let it drift.
$md$,
 2),

('rs-rhythm-strum-1',
 'Your first strumming pattern',
 'rhythm', 1, 9,
 'Down, down, up, up, down, up — the most useful pattern you''ll ever learn.',
 $md$
Most beginner songbooks introduce a single strumming pattern that fits hundreds of songs. Learn it and you can play through real music almost immediately.

## The pattern

Over a 4/4 measure, count: **1 — and — 2 — and — 3 — and — 4 — and.**

Strum like this:

| Count | 1 | + | 2 | + | 3 | + | 4 | + |
|---|---|---|---|---|---|---|---|---|
| Action | **D** | — | **D** | **U** | — | **U** | **D** | **U** |

> **D = downstroke, U = upstroke. A dash means *no strum* (skip that count, but keep your hand moving).**

## The hand always moves

This is the #1 thing beginners get wrong. **Your strumming hand should keep swinging down-up-down-up the entire time, like a metronome arm.** When the pattern says "skip," you simply *miss the strings* on that swing. Your hand doesn't stop; it just brushes air.

This is what makes strumming feel locked in. Stopping and starting your hand for each strum makes everything sound stilted and rhythmically wrong.

## Try it

1. Hold an Em chord.
2. Set a metronome to **70 BPM**.
3. Count "1 + 2 + 3 + 4 +" out loud, twice through, with no playing.
4. Now strum the pattern above. Your hand swings on every count *and* every "+", but you only contact the strings on the marked beats.

Slow it down to 50 BPM if 70 feels frantic. Speed comes later. **Steady is the goal**, not fast.

## Apply it

This pattern works on virtually any 4/4 song. Try it on Em — then on any other chord you know. The pattern doesn't care which chord you're holding.
$md$,
 3),

-- ---- LEAD ----
('rs-lead-pent-box1',
 'The Minor Pentatonic — Box 1',
 'lead', 2, 12,
 'Five frets, two strings each, every blues lick ever written.',
 $md$
Box 1 of the minor pentatonic is the most-played shape in popular music. Every guitar hero has used it — Hendrix, Page, Slash, Mayer, Gilmour — and you'll use it for the rest of your playing life.

This lesson assumes you've read the [Minor Pentatonic theory entry](/theory/minor-pentatonic) — give that a quick look first if not.

## The shape (A minor pentatonic)

Position your **index finger at the 5th fret**. The shape spans frets **5 and 7-8**:

```
e |---5---8---|
B |---5---8---|
G |---5---7---|
D |---5---7---|
A |---5---7---|
E |---5---8---|
```

- All "5"s use your **index finger**.
- "7"s use your **ring finger**.
- "8"s use your **pinky**.

Two notes per string. Six strings. **A** is the lowest and highest note (root) — frets 5 on the low E and high E.

## Play it ascending and descending

Slowly, one note at a time, **low to high then back down**. Use alternate picking (down-up-down-up) once it's smooth.

Your goals:
- Every note rings cleanly.
- Even rhythm — each note the same duration.
- No pauses between strings.

Aim for 60 BPM, four notes per beat.

## Movability

Slide the **whole shape up two frets** (index finger now at 7th fret) and you're playing **B minor pentatonic**. Same shape, different root.

The fret your index finger is on = the root note name. So:
- Index at 5 = A minor pentatonic
- Index at 7 = B minor pentatonic
- Index at 8 = C minor pentatonic

This is what *movable shapes* mean. One pattern, twelve keys.

## Apply it

Loop an A minor chord (or play one and let it ring). Improvise using only these notes. You don't need to know any theory — just play notes from the shape, in any order, with feel.

Welcome to soloing.
$md$,
 1),

('rs-lead-first-phrase',
 'Your first lead phrase',
 'lead', 2, 8,
 'Five notes, played with intention. The difference between scales and music.',
 $md$
Knowing a scale is not the same as making music with it. This lesson teaches one short phrase using only the **A minor pentatonic Box 1** — and how to make it *sound* like a real lick instead of an exercise.

## The phrase

```
e |--------------------------|
B |---8---5----------5---5---|
G |-------------7---7--------|
D |--------------------------|
A |--------------------------|
E |--------------------------|
```

Spell out: **8 (B string), 5 (B string), 7 (G string), 5 (B string), 5 (B string).**

Five notes. Played in time, with the right *feel*, this sounds like a real blues phrase.

## How to make it sound musical

**1. Don't play it stiffly.** The first two notes (8 → 5 on the B string) want to flow into each other. Try sliding from 8 down to 5 instead of picking both notes — slide your ring finger down to your index finger.

**2. Bend the 7.** When you reach the 7th fret on the G string, bend the string up about a half-step (just push it sideways toward the ceiling). This gives the lick blues character. Just a small bend — you'll feel it in tune by ear.

**3. Repeat the last note with vibrato.** End the phrase by holding the 5 on the B string and gently *shaking* your finger — moving the string up and down by tiny amounts. This is **vibrato**, and it's what makes a held note feel alive.

**4. Leave space.** Don't rush to play the next phrase. Silence is part of the music.

## Practice

Loop the phrase over an A minor chord (or backing track) for 5 minutes. Play it the same way each time. Then try varying:
- Change the rhythm.
- Add a bend on a different note.
- Pause longer between repetitions.

You're improvising. With five notes.

## Why this matters

Most lead playing is just small phrases like this, repeated and varied. Learn how to milk one phrase before chasing dozens. Phrasing is what separates someone who plays scales from someone who plays *music*.
$md$,
 2),

-- ---- FINGERSTYLE ----
('rs-finger-pima',
 'Fingerpicking: P-I-M-A',
 'fingerstyle', 2, 10,
 'Four fingers, four strings, the foundation of all fingerstyle playing.',
 $md$
**Fingerstyle** is playing with your fingers instead of (or in addition to) a pick. Each finger gets a job. Once independence develops, you can play melody, bass, and harmony all at once on a single instrument.

## The naming convention

Classical fingerstyle uses Spanish letters for the picking-hand fingers:

| Finger | Letter | Job |
|---|---|---|
| Thumb | **P** (*pulgar*) | Bass strings: 6, 5, 4 |
| Index | **I** (*índice*) | G string (3) |
| Middle | **M** (*medio*) | B string (2) |
| Ring | **A** (*anular*) | High E (1) |

Pinky usually doesn't pick — it rests on the body or hangs free.

## Hand position

- Wrist relaxed, fingers curved.
- Each finger floats above its assigned string.
- Thumb sits *higher* and *farther forward* than your other fingers (think of it crossing OVER your other fingers, not under).

This is awkward at first. It looks like a claw. After a few weeks it feels natural.

## Your first pattern

On any chord (Em is great), pluck this sequence repeatedly:

> **P — I — M — A — M — I**

Translated:
- Thumb plucks the bass note (low E or A, depending on chord).
- Index plucks G string.
- Middle plucks B string.
- Ring plucks high E.
- Middle plucks B again.
- Index plucks G again.

That's six plucks. Each finger does *its assigned string* — never reaches across to a different one.

## Drill

1. Hold an Em chord.
2. Pluck **P-I-M-A-M-I** at 50 BPM (one pluck per click). Stay even.
3. Watch your fingers — does each one strike its own string? If your middle is wandering to the G string, slow down and reset.
4. Loop for 5 minutes.

This is one of those skills that feels impossible for the first three days and then suddenly clicks.

## Once it clicks

Try changing chords (Em → G → C → D, say) while keeping the picking pattern going. Now you're playing fingerstyle accompaniment.
$md$,
 1),

-- ---- THEORY (focus area, not theory_entries) ----
('rs-theory-tab',
 'Reading guitar tab',
 'theory', 1, 7,
 'Six lines, some numbers, and a few squiggles. The fastest path from "song you want to learn" to "song you''re learning."',
 $md$
**Tablature** (or "tab") is guitar-specific notation. Where standard notation tells you *what pitch* to play, tab tells you *where on the neck* to play it. For guitarists, tab is faster to read and more intuitive.

## The six lines

```
e |------------|
B |------------|
G |------------|
D |------------|
A |------------|
E |------------|
```

Each line is one string. **The bottom line is the lowest-pitched string (low E)**. The top line is the highest (high E). This is upside-down compared to how you "look at" the guitar in your lap, which throws everyone the first time. You'll get used to it quickly.

## Numbers = frets

A number on a line means "press that fret on that string and play it."

```
e |---3---|
B |-------|
G |-------|
D |-------|
A |-------|
E |-------|
```

This says: **3rd fret on the high E string, played alone.**

Multiple numbers stacked vertically = a chord (play simultaneously):

```
e |---3---|
B |---3---|
G |---0---|
D |---0---|
A |---2---|
E |---3---|
```

That's a **G major** chord — six strings played at once.

## Numbers in a line = melody

```
e |--------------|
B |--------------|
G |--------------|
D |---0--2--4--5-|
A |--------------|
E |--------------|
```

This says: play the open D string, then 2nd fret, 4th fret, 5th fret of the D string — one note at a time. That's the start of the **D major scale**, melody-style.

## Common symbols

| Symbol | Meaning |
|---|---|
| **h** | hammer-on (sound the next note without re-picking) |
| **p** | pull-off (the reverse) |
| **/** | slide up |
| **\\** | slide down |
| **b** | bend |
| **r** | release a bend |
| **~** | vibrato |
| **x** | muted/dead note |

Example: `5h7` means *fret 5, then hammer onto fret 7*. `7b9` means *fret 7, bend until it sounds like fret 9*.

## What tab doesn't tell you

- **Rhythm**. Tab shows pitch and position, not timing. You need to know the song or hear it to play it in time.
- **Tone or expression**. Two players reading the same tab can sound completely different.

That's why tab is great as a starting point but limited as a complete system. The combination of "I've heard this song before" + "I have the tab" is what makes it work.
$md$,
 1),

('rs-theory-fretboard',
 'How notes repeat on the fretboard',
 'theory', 1, 9,
 'There are only 12 notes. Then they repeat. Forever. The fretboard is less mysterious than it looks.',
 $md$
The musical alphabet has **12 notes** — that's it. Every other note in every song you've ever heard is a repetition of one of these 12, just at a higher or lower octave.

## The 12 notes

> **A — A♯/B♭ — B — C — C♯/D♭ — D — D♯/E♭ — E — F — F♯/G♭ — G — G♯/A♭ — (back to A)**

Two important things:
- The "♯" and "♭" notes are the **same note with two names**. C♯ and D♭ are the same fret. Which name you use depends on the key you're in.
- **There is no sharp/flat between B & C, or between E & F.** B → C is a half-step. E → F is a half-step. Everywhere else there's a sharp/flat between letter names.

## On the fretboard

**Each fret is one half-step.** So if you start on any open string and walk up, you cycle through the 12 notes in order, then repeat:

Low E string, fret by fret:

| Fret | Note |
|---|---|
| 0 (open) | **E** |
| 1 | **F** |
| 2 | F♯ / G♭ |
| 3 | **G** |
| 4 | G♯ / A♭ |
| 5 | **A** |
| 6 | A♯ / B♭ |
| 7 | **B** |
| 8 | **C** |
| 9 | C♯ / D♭ |
| 10 | **D** |
| 11 | D♯ / E♭ |
| 12 | **E** (one octave up from open) |

**Fret 12 of every string is the same note as the open string, one octave higher.** From there, the entire pattern repeats.

## Why this matters

Once you know the notes on the **6th string (low E)** and the **5th string (A)**, you can locate any chord root anywhere on the neck. That's the foundation of moveable chord shapes (barre chords, CAGED, all of it).

## Drill: name notes on the low E

Without looking, name the note at:
- Fret 3 on low E
- Fret 7 on low E
- Fret 10 on low E

Answers: G, B, D. (If you got those, you know the open chords' root frets — useful for almost everything.)

Spend 5 minutes a day naming random frets out loud. After two weeks, the low E and A strings will be permanent in your memory. Once those two are locked, the rest of the fretboard becomes a series of short relationships, not a sea of dots.
$md$,
 2);

-- =============================================================
-- LESSON ↔ THEORY LINKS
-- =============================================================
insert into public.lesson_theory_links (lesson_id, theory_entry_id)
select l.id, t.theory
from public.lessons l
join (values
  ('rs-lead-pent-box1',     'minor-pentatonic'),
  ('rs-lead-pent-box1',     'intervals'),
  ('rs-lead-first-phrase',  'minor-pentatonic'),
  ('rs-theory-fretboard',   'intervals'),
  ('rs-rhythm-em',          'intervals'),
  ('rs-finger-pima',        'intervals')
) as t(slug, theory) on l.slug = t.slug;
