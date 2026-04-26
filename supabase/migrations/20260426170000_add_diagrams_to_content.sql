-- Risen Six — embed fretboard + chord diagrams in lessons & theory
-- Re-runnable: each statement is an UPDATE.

-- =============================================================
-- THEORY: intervals
-- =============================================================
update public.theory_entries
set body = $md$
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

## Visualizing intervals from C

The most-used "shapes" for intervals on the fretboard. Root note is **C** at the 8th fret of the low E string.

```fretboard
{
  "title": "Intervals from C (root at low E, fret 8)",
  "frets": [6, 12],
  "notes": [
    { "string": 6, "fret": 8, "label": "R", "emphasis": "root" },
    { "string": 5, "fret": 7, "label": "M3" },
    { "string": 5, "fret": 8, "label": "P4" },
    { "string": 5, "fret": 10, "label": "P5" },
    { "string": 4, "fret": 10, "label": "8" }
  ]
}
```

Once you can *see* these intervals, you stop memorizing chord shapes and start understanding why they work. The **R + M3 + P5** in this diagram is the C major triad — every major chord ever written has this exact shape relationship somewhere.

## Listen for them

- **Major 3rd** = the first two notes of *Oh When the Saints*
- **Perfect 5th** = the first two notes of *Twinkle Twinkle*
- **Minor 3rd** = the first two notes of *Greensleeves*
- **Octave** = *Somewhere Over the Rainbow*

Train your ear with these mnemonics. They're worth more than any chord chart.
$md$
where id = 'intervals';

-- =============================================================
-- THEORY: major-scale
-- =============================================================
update public.theory_entries
set body = $md$
The **major scale** is the foundation that nearly every Western melody, chord progression, and song key is built on. Internalize this and the rest of theory falls into place.

## The formula

From any starting note (the *root*), the major scale follows this pattern of whole-steps (W) and half-steps (H):

> **W — W — H — W — W — W — H**

That's it. Apply this formula starting from C and you get the C major scale (no sharps or flats):

`C  D  E  F  G  A  B  C`

## The C major scale on one string

Start at the 8th fret of the low E (which is **C**) and walk up using the W-W-H-W-W-W-H formula. Each whole-step is **2 frets**, each half-step is **1 fret**:

```fretboard
{
  "title": "C major scale — low E string only",
  "frets": [7, 20],
  "notes": [
    { "string": 6, "fret": 8,  "label": "C",  "emphasis": "root" },
    { "string": 6, "fret": 10, "label": "D" },
    { "string": 6, "fret": 12, "label": "E" },
    { "string": 6, "fret": 13, "label": "F" },
    { "string": 6, "fret": 15, "label": "G" },
    { "string": 6, "fret": 17, "label": "A" },
    { "string": 6, "fret": 19, "label": "B" },
    { "string": 6, "fret": 20, "label": "C" }
  ]
}
```

Notice the gaps: **2-2-1-2-2-2-1** frets. That's the formula in action.

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
$md$
where id = 'major-scale';

-- =============================================================
-- THEORY: minor-pentatonic
-- =============================================================
update public.theory_entries
set body = $md$
The **minor pentatonic** scale is five notes that fit over countless songs. If the major scale is the alphabet, this is the most-used phrase in the language. Every blues, rock, and country lead guitarist relies on it.

## The formula

From the root, the minor pentatonic uses these scale degrees:

> **1 — ♭3 — 4 — 5 — ♭7**

In A minor pentatonic, that's:

`A  C  D  E  G`

Five notes. Skip the 2nd and the 6th of the scale and you have the pentatonic.

## Box 1 — the shape every guitarist learns first

Position your index finger at the 5th fret on the low E string for **A minor pentatonic**:

```fretboard
{
  "title": "A minor pentatonic — Box 1",
  "frets": [4, 9],
  "notes": [
    { "string": 6, "fret": 5, "label": "R", "emphasis": "root" },
    { "string": 6, "fret": 8, "label": "♭3" },
    { "string": 5, "fret": 5, "label": "4" },
    { "string": 5, "fret": 7, "label": "5" },
    { "string": 4, "fret": 5, "label": "♭7" },
    { "string": 4, "fret": 7, "label": "R" },
    { "string": 3, "fret": 5, "label": "♭3" },
    { "string": 3, "fret": 7, "label": "4" },
    { "string": 2, "fret": 5, "label": "5" },
    { "string": 2, "fret": 8, "label": "♭7" },
    { "string": 1, "fret": 5, "label": "R", "emphasis": "root" },
    { "string": 1, "fret": 8, "label": "♭3" }
  ]
}
```

Two notes per string. Five strings worth of patterns. Slide it up and down to change keys — same shape, different root.

**Fingering:** index finger covers the 5th fret. Ring finger covers the 7th fret. Pinky covers the 8th fret.

## Why it works

Pentatonic scales have **no half-step dissonances**. You can play any note over any chord in the key and it will sound at minimum okay, often great. That's why beginners can sound like they know what they're doing within an hour of learning this shape.

## Movability

Slide the **whole shape up two frets** (index finger now at 7th fret) and you're playing **B minor pentatonic**. Same shape, different root.

| Index finger at | Plays the |
|---|---|
| Fret 3 | G minor pentatonic |
| Fret 5 | A minor pentatonic |
| Fret 7 | B minor pentatonic |
| Fret 8 | C minor pentatonic |
| Fret 10 | D minor pentatonic |
| Fret 12 | E minor pentatonic |

One pattern, twelve keys.

## Try it

Loop an A minor chord (or any A minor backing track) and play these notes in any order. You're already soloing.
$md$
where id = 'minor-pentatonic';

-- =============================================================
-- THEORY: caged
-- =============================================================
update public.theory_entries
set body = $md$
**CAGED** is a system that connects the five basic open-position chord shapes — **C, A, G, E, D** — to every position on the neck. Once you see it, the fretboard stops being mysterious.

## The five open shapes

These are the five chords every beginner learns. Each is the foundation of one CAGED position.

```chord
{ "name": "C", "frets": ["x", 3, 2, 0, 1, 0], "fingers": [null, 3, 2, null, 1, null] }
```

```chord
{ "name": "A", "frets": ["x", 0, 2, 2, 2, 0], "fingers": [null, null, 1, 2, 3, null] }
```

```chord
{ "name": "G", "frets": [3, 2, 0, 0, 0, 3], "fingers": [3, 2, null, null, null, 4] }
```

```chord
{ "name": "E", "frets": [0, 2, 2, 1, 0, 0], "fingers": [null, 2, 3, 1, null, null] }
```

```chord
{ "name": "D", "frets": ["x", "x", 0, 2, 3, 2], "fingers": [null, null, null, 1, 3, 2] }
```

## What CAGED says

Any major chord can be played using one of these five shapes, *somewhere* on the neck. The shapes connect *in order* up the neck — **C → A → G → E → D → back to C**.

For example, an **E major chord** can be played as:

| Shape | Position |
|---|---|
| Open **E** shape | open (frets 0-2) |
| **D** shape | barred at fret 2 |
| **C** shape | barred at fret 4 |
| **A** shape | barred at fret 7 |
| **G** shape | barred at fret 9 |

Five different places to play E major, all up and down the neck. The end of one shape is the start of the next.

## Why guitarists need this

Without CAGED, you're stuck playing every song in the same position. With it:

- You can solo over a chord progression *inside* the chord shape — your scale and your chord live in the same place.
- You can substitute voicings to find smoother chord transitions.
- You stop memorizing 60 chord diagrams and start *seeing* the neck.

## Practical first step

Pick one major chord (E is a good choice). Find all five CAGED positions for it on the neck. Play each, slowly. Then connect them — slide from one to the next.

That single exercise unlocks the entire CAGED concept. Everything after is variation.
$md$
where id = 'caged';

-- =============================================================
-- THEORY: circle-of-fifths
-- =============================================================
update public.theory_entries
set body = $md$
The **Circle of Fifths** is a circular diagram that shows the 12 musical keys arranged so each step is a perfect 5th. It looks decorative, but it's the most practical tool in theory.

## The circle

Starting from **C** at the top (no sharps, no flats), going clockwise — each key adds **one sharp**:

> C → G → D → A → E → B → F♯ → ...

Going counterclockwise from C, each key adds **one flat**:

> C → F → B♭ → E♭ → A♭ → ...

After 12 steps you're back where you started.

## I, IV, V on the fretboard

In any major key, the **I, IV, V** chords are right next to each other on the circle. In **C major**, that's C (I), F (IV), G (V). On the fretboard, these three chord roots cluster like this:

```fretboard
{
  "title": "C / F / G — the I, IV, V of C major",
  "frets": [0, 5],
  "notes": [
    { "string": 5, "fret": 3, "label": "I (C)", "emphasis": "root" },
    { "string": 6, "fret": 1, "label": "IV (F)" },
    { "string": 6, "fret": 3, "label": "V (G)" }
  ]
}
```

These three chords appear together for almost every basic strummed song.

## What it tells you

### Key signatures
The number of sharps/flats in each key. C major has zero. G major has 1 sharp (F♯). D major has 2 (F♯, C♯). Pattern: each step clockwise adds the next sharp.

### Chord relationships
The **I, IV, V** chords (the three most-used chords in pop, rock, country, blues) are right next to each other on the circle.

### Modulation
Songs that change keys usually move by a 5th — one step on the circle. That's why a key change "sounds like a key change" — your ear is familiar with the circle's geometry whether you know it or not.

## How guitarists use it

- **Transposing**: capo or shift to another key? Move the same distance on the circle.
- **Songwriting**: pick a key, look at neighbors for chord candidates that will sound natural.
- **Improvising**: any chord adjacent on the circle is a "safe" substitute.

Print one out. Tape it to your guitar case.
$md$
where id = 'circle-of-fifths';

-- =============================================================
-- LESSON: rs-tech-strings (Naming the strings)
-- =============================================================
update public.lessons
set body = $md$
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

## All six strings, open

```fretboard
{
  "title": "Open strings · standard tuning",
  "frets": [0, 3],
  "notes": [
    { "string": 6, "fret": 0, "label": "E", "emphasis": "open" },
    { "string": 5, "fret": 0, "label": "A", "emphasis": "open" },
    { "string": 4, "fret": 0, "label": "D", "emphasis": "open" },
    { "string": 3, "fret": 0, "label": "G", "emphasis": "open" },
    { "string": 2, "fret": 0, "label": "B", "emphasis": "open" },
    { "string": 1, "fret": 0, "label": "E", "emphasis": "open" }
  ]
}
```

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
$md$
where slug = 'rs-tech-strings';

-- =============================================================
-- LESSON: rs-rhythm-em (E minor — first chord)
-- =============================================================
update public.lessons
set body = $md$
**E minor** (Em) is the easiest chord on the guitar — and one of the most-used in popular music. It's a great first chord because:

- Only two fingers
- All six strings ring out
- It sounds *full* immediately

## The shape

```chord
{
  "name": "E minor",
  "frets": [0, 2, 2, 0, 0, 0],
  "fingers": [null, 2, 3, null, null, null]
}
```

- **Middle finger (2)** on the 2nd fret of the **A string** (string 5).
- **Ring finger (3)** on the 2nd fret of the **D string** (string 4).
- All other strings are played open.

## Strum it

Strum all six strings from low E to high E, slowly, with a downstroke. Listen for:

- **All six strings ringing clearly.** Any muted or buzzing string = pressure or finger-curl issue.
- **No string ringing dead.** That usually means another finger is touching it — check your finger angle.

## The check-each-string drill

Before strumming, pluck each string one at a time:

1. Low E (open) → should ring clearly.
2. A (2nd fret, middle finger) → ring clearly.
3. D (2nd fret, ring finger) → ring clearly.
4. G (open) → ring clearly. *If muted, your ring finger is leaning into it — straighten the knuckle.*
5. B (open) → ring clearly.
6. High E (open) → ring clearly.

If any string is dead, isolate the problem before strumming. Strumming hides which finger is the culprit.

## Why this matters

You'll use Em in literally thousands of songs. *House of the Rising Sun*, *Hurt*, *Wonderwall*, *Stairway to Heaven* — all open with or rely on this chord. Lock it in clean before moving to the next.
$md$
where slug = 'rs-rhythm-em';

-- =============================================================
-- LESSON: rs-lead-pent-box1 (Minor Pentatonic Box 1)
-- =============================================================
update public.lessons
set body = $md$
Box 1 of the minor pentatonic is the most-played shape in popular music. Every guitar hero has used it — Hendrix, Page, Slash, Mayer, Gilmour — and you'll use it for the rest of your playing life.

This lesson assumes you've read the [Minor Pentatonic theory entry](/theory/minor-pentatonic) — give that a quick look first if not.

## The shape — A minor pentatonic, Box 1

```fretboard
{
  "title": "A minor pentatonic — Box 1",
  "frets": [4, 9],
  "notes": [
    { "string": 6, "fret": 5, "label": "R", "emphasis": "root" },
    { "string": 6, "fret": 8, "label": "♭3" },
    { "string": 5, "fret": 5, "label": "4" },
    { "string": 5, "fret": 7, "label": "5" },
    { "string": 4, "fret": 5, "label": "♭7" },
    { "string": 4, "fret": 7, "label": "R" },
    { "string": 3, "fret": 5, "label": "♭3" },
    { "string": 3, "fret": 7, "label": "4" },
    { "string": 2, "fret": 5, "label": "5" },
    { "string": 2, "fret": 8, "label": "♭7" },
    { "string": 1, "fret": 5, "label": "R", "emphasis": "root" },
    { "string": 1, "fret": 8, "label": "♭3" }
  ]
}
```

- All "5"s use your **index finger**.
- All "7"s use your **ring finger**.
- All "8"s use your **pinky**.

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
$md$
where slug = 'rs-lead-pent-box1';

-- =============================================================
-- LESSON: rs-lead-first-phrase (first lead phrase)
-- =============================================================
update public.lessons
set body = $md$
Knowing a scale is not the same as making music with it. This lesson teaches one short phrase using only the **A minor pentatonic Box 1** — and how to make it *sound* like a real lick instead of an exercise.

## The phrase

Five notes from Box 1, played in this order:

```fretboard
{
  "title": "Phrase order — play 1, 2, 3, 4, 5",
  "frets": [4, 9],
  "notes": [
    { "string": 2, "fret": 8, "label": "1", "emphasis": "root" },
    { "string": 2, "fret": 5, "label": "2" },
    { "string": 3, "fret": 7, "label": "3" },
    { "string": 2, "fret": 5, "label": "4" },
    { "string": 2, "fret": 5, "label": "5" }
  ]
}
```

Spelled out as tab:

```
e |--------------------------|
B |---8---5----------5---5---|
G |-------------7---7--------|
D |--------------------------|
A |--------------------------|
E |--------------------------|
```

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
$md$
where slug = 'rs-lead-first-phrase';

-- =============================================================
-- LESSON: rs-finger-pima (PIMA fingerstyle)
-- =============================================================
update public.lessons
set body = $md$
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

## Your first pattern over Em

Hold this E minor chord — the same one from the rhythm lesson:

```chord
{
  "name": "E minor",
  "frets": [0, 2, 2, 0, 0, 0],
  "fingers": [null, 2, 3, null, null, null]
}
```

Now pluck this picking-hand sequence repeatedly:

> **P — I — M — A — M — I**

Translated:
- Thumb plucks the bass note (low E for Em).
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
$md$
where slug = 'rs-finger-pima';

-- =============================================================
-- LESSON: rs-theory-fretboard (How notes repeat)
-- =============================================================
update public.lessons
set body = $md$
The musical alphabet has **12 notes** — that's it. Every other note in every song you've ever heard is a repetition of one of these 12, just at a higher or lower octave.

## The 12 notes

> **A — A♯/B♭ — B — C — C♯/D♭ — D — D♯/E♭ — E — F — F♯/G♭ — G — G♯/A♭ — (back to A)**

Two important things:
- The "♯" and "♭" notes are the **same note with two names**. C♯ and D♭ are the same fret. Which name you use depends on the key you're in.
- **There is no sharp/flat between B & C, or between E & F.** B → C is a half-step. E → F is a half-step. Everywhere else there's a sharp/flat between letter names.

## Every natural note on the low E string

```fretboard
{
  "title": "Natural notes on the low E string",
  "frets": [0, 12],
  "notes": [
    { "string": 6, "fret": 0,  "label": "E",  "emphasis": "open" },
    { "string": 6, "fret": 1,  "label": "F" },
    { "string": 6, "fret": 3,  "label": "G" },
    { "string": 6, "fret": 5,  "label": "A" },
    { "string": 6, "fret": 7,  "label": "B" },
    { "string": 6, "fret": 8,  "label": "C" },
    { "string": 6, "fret": 10, "label": "D" },
    { "string": 6, "fret": 12, "label": "E", "emphasis": "root" }
  ]
}
```

**Each fret is one half-step.** The gaps between dots are the sharps/flats — everywhere except B→C (frets 7→8) and E→F (frets 0→1, 12→13), which are half-steps with no sharp between them.

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
$md$
where slug = 'rs-theory-fretboard';
