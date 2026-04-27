-- Risen Six — fill out the missing milestone lessons across Movement, Voice, and Mastery.
-- Re-runnable: deletes the lessons we own before re-inserting.

delete from public.lesson_theory_links
  where lesson_id in (select id from public.lessons where slug like 'rs-mvt-%' or slug like 'rs-voice-%' or slug like 'rs-master-%');
delete from public.lesson_progress
  where lesson_id in (select id from public.lessons where slug like 'rs-mvt-%' or slug like 'rs-voice-%' or slug like 'rs-master-%');
delete from public.lessons where slug like 'rs-mvt-%' or slug like 'rs-voice-%' or slug like 'rs-master-%';

-- =============================================================
-- MOVEMENT — first barre chord
-- =============================================================
insert into public.lessons
  (slug, title, focus_area_id, difficulty, duration_minutes, summary, body, sort_order)
values
('rs-mvt-first-barre',
 'Your first barre chord — F major',
 'rhythm', 2, 12,
 'The unlock for the entire fretboard. F is the hardest of the easy chords, and learning it cleanly opens up every key on every neck.',
 $md$
The barre chord is the unlock for guitar. Once you can play a clean F major, you have access to **12 keys with a single shape** — and the entire neck opens up.

It will feel impossible for two weeks. Then it suddenly works. Stick with it.

## What a barre chord is

In a barre chord, your **index finger acts as a movable nut**, pressing all six (or five) strings at once. The other fingers form a familiar chord shape on top.

The F major shape: hold an E-major shape with fingers 2, 3, 4 (instead of 1, 2, 3), then bar your index finger across all 6 strings at the 1st fret.

```chord
{ "name": "F major", "frets": [1, 3, 3, 2, 1, 1], "fingers": [1, 3, 4, 2, 1, 1], "barre": { "fret": 1, "from": 1, "to": 6 } }
```

## Why F is the hardest of the easy chords

F is at fret 1 — where string tension is highest. Even a small amount of action (string height) makes it physically harder than the same shape played higher up. The G barre at fret 3 is *easier*. The B♭ barre at fret 6 is easier still. F is uniquely hard because of where it sits.

## Five steps to a clean F

1. **Bar finger first.** Press your index finger flat across all 6 strings at fret 1. Don't add any other fingers. Strum slowly. Some strings will ring; others will buzz. Goal: get all 6 ringing with just the bar.
2. **Use the side of the finger, not the pad.** Roll your index slightly toward the thumb side. The bony edge is more rigid than the soft pad — you press harder with less effort.
3. **Lower your thumb.** Your fretting-hand thumb should sit roughly opposite your middle finger, pressing hard against the BACK of the neck. Thumb pressure replaces finger strain.
4. **Add the rest of the shape.** With the bar locked in, add fingers 3 (string 5, fret 3), 4 (string 4, fret 3), and 2 (string 3, fret 2). Strum.
5. **Check each string.** Most beginner F-chords have a muted B string — your bar isn't pressing exactly there. Roll your finger slightly until the B rings.

## Don't expect speed

The first time you switch from G to F, it'll take 2 seconds. That's fine. Practice the transition for 5 minutes. Don't move on. In a week, it'll take 1 second. In two weeks, you won't have to think about it.

## What it unlocks

Once F is clean, every barre chord is just F slid up the neck:

| Index finger fret | Major chord |
|---|---|
| 1 | F |
| 3 | G |
| 5 | A |
| 7 | B |
| 8 | C |
| 10 | D |

Same is true for the **minor barre shape** (E-minor shape barred). Two shapes, twelve keys each. **Twenty-four chords from learning two shapes.**
$md$,
 4),

-- =============================================================
-- VOICE — CAGED across the neck (E major)
-- =============================================================
('rs-voice-caged-positions',
 'CAGED across the neck — E major in five places',
 'theory', 3, 14,
 'Five positions for a single major chord. After you can do this for E, you can do it for any chord — and the fretboard becomes a map.',
 $md$
The CAGED system is how you turn the entire fretboard into one chord. Once you can play E major in all five positions, you can do it for any major chord — and the neck stops feeling like a mystery.

This lesson assumes you've read the [CAGED theory entry](/theory/caged) — give that a quick look first if not.

## The five shapes for E major

### E shape — open position

```chord
{ "name": "E (E shape)", "frets": [0, 2, 2, 1, 0, 0], "fingers": [null, 2, 3, 1, null, null] }
```

The familiar open E. Your starting point on the neck.

### D shape — at fret 2

```chord
{ "name": "E (D shape, top 4 strings)", "frets": ["x", "x", 2, 4, 5, 4], "fingers": [null, null, 1, 2, 4, 3] }
```

The D-major shape, fingered up at fret 2. Strings 5 and 6 are muted in this voicing — most players use this 4-string version because the full barred D shape is brutal.

### C shape — at fret 4

```chord
{ "name": "E (C shape)", "frets": ["x", 7, 6, 4, 5, 4], "fingers": [null, 4, 3, 1, 2, 1] }
```

C-major shape pushed up to fret 4. Trickiest of the five — the partial barre and finger spread take work.

### A shape — at fret 7

```chord
{ "name": "E (A shape, barred)", "frets": ["x", 7, 9, 9, 9, 7], "fingers": [null, 1, 2, 3, 4, 1], "barre": { "fret": 7, "from": 1, "to": 5 }, "startFret": 5 }
```

Hold an A-major shape, barre at fret 7. This is a workhorse moveable shape — you'll use it for every key.

### G shape — at fret 9

```chord
{ "name": "E (G shape, full barre)", "frets": [9, 11, 9, 9, 9, 12], "fingers": [1, 3, 1, 1, 1, 4], "barre": { "fret": 9, "from": 1, "to": 6 }, "startFret": 7 }
```

Hardest of the five — biggest finger stretch. Many players skip it in early practice. Knowing it exists is enough at first.

## How to practice CAGED

1. Play one shape. Make sure every note rings. Don't move on until it's clean.
2. **Slide the same shape up the neck**. Same shape, different fret = different chord. This builds the mental link between shape and root.
3. **Then** add the next CAGED shape. Play it in isolation. Make it ring.
4. Switch between just the first two shapes. Slowly.
5. Add a third. And so on.

It will take weeks. Normal.

## Why this is worth the work

After CAGED clicks for E major, repeat the process for A, D, C, and G. After about a month of slow practice, **every chord lives in five places on the neck** for you. Improvising over a chord change becomes about *moving inside the chord*, not running scales over it.

This is the difference between memorizing songs and actually understanding the guitar.
$md$,
 6),

-- =============================================================
-- VOICE — All five pentatonic boxes
-- =============================================================
('rs-voice-all-pent-boxes',
 'All five minor pentatonic boxes',
 'lead', 3, 13,
 'Box 1 connects to Box 2 connects to Box 3. After learning all five, no corner of the fretboard is unfamiliar.',
 $md$
You already know **Box 1** of the minor pentatonic. There are four more — and they cover the entire neck. Connected to each other, they let you solo anywhere on the neck without running out of notes.

Below: all five boxes for **A minor pentatonic**. Same five notes (A C D E G) — five different positions.

## Box 1 — fret 5

```fretboard
{
  "title": "Box 1 (Am pentatonic)",
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

## Box 2 — fret 7

```fretboard
{
  "title": "Box 2 (Am pentatonic)",
  "frets": [6, 11],
  "notes": [
    { "string": 6, "fret": 8, "label": "♭3" },
    { "string": 6, "fret": 10, "label": "4" },
    { "string": 5, "fret": 7, "label": "5" },
    { "string": 5, "fret": 10, "label": "♭7" },
    { "string": 4, "fret": 7, "label": "R", "emphasis": "root" },
    { "string": 4, "fret": 10, "label": "♭3" },
    { "string": 3, "fret": 7, "label": "4" },
    { "string": 3, "fret": 9, "label": "5" },
    { "string": 2, "fret": 8, "label": "♭7" },
    { "string": 2, "fret": 10, "label": "R" },
    { "string": 1, "fret": 8, "label": "♭3" },
    { "string": 1, "fret": 10, "label": "4" }
  ]
}
```

## Box 3 — fret 10

```fretboard
{
  "title": "Box 3 (Am pentatonic)",
  "frets": [9, 13],
  "notes": [
    { "string": 6, "fret": 10, "label": "4" },
    { "string": 6, "fret": 12, "label": "5" },
    { "string": 5, "fret": 10, "label": "♭7" },
    { "string": 5, "fret": 12, "label": "R", "emphasis": "root" },
    { "string": 4, "fret": 10, "label": "♭3" },
    { "string": 4, "fret": 12, "label": "4" },
    { "string": 3, "fret": 9, "label": "5" },
    { "string": 3, "fret": 12, "label": "♭7" },
    { "string": 2, "fret": 10, "label": "R" },
    { "string": 2, "fret": 13, "label": "♭3" },
    { "string": 1, "fret": 10, "label": "4" },
    { "string": 1, "fret": 12, "label": "5" }
  ]
}
```

## Box 4 — fret 12

```fretboard
{
  "title": "Box 4 (Am pentatonic)",
  "frets": [11, 15],
  "notes": [
    { "string": 6, "fret": 12, "label": "5" },
    { "string": 6, "fret": 15, "label": "♭7" },
    { "string": 5, "fret": 12, "label": "R", "emphasis": "root" },
    { "string": 5, "fret": 15, "label": "♭3" },
    { "string": 4, "fret": 12, "label": "4" },
    { "string": 4, "fret": 14, "label": "5" },
    { "string": 3, "fret": 12, "label": "♭7" },
    { "string": 3, "fret": 14, "label": "R" },
    { "string": 2, "fret": 13, "label": "♭3" },
    { "string": 2, "fret": 15, "label": "4" },
    { "string": 1, "fret": 12, "label": "5" },
    { "string": 1, "fret": 15, "label": "♭7" }
  ]
}
```

## Box 5 — fret 14

```fretboard
{
  "title": "Box 5 (Am pentatonic)",
  "frets": [13, 17],
  "notes": [
    { "string": 6, "fret": 15, "label": "♭7" },
    { "string": 6, "fret": 17, "label": "R", "emphasis": "root" },
    { "string": 5, "fret": 15, "label": "♭3" },
    { "string": 5, "fret": 17, "label": "4" },
    { "string": 4, "fret": 14, "label": "5" },
    { "string": 4, "fret": 17, "label": "♭7" },
    { "string": 3, "fret": 14, "label": "R" },
    { "string": 3, "fret": 17, "label": "♭3" },
    { "string": 2, "fret": 15, "label": "4" },
    { "string": 2, "fret": 17, "label": "5" },
    { "string": 1, "fret": 15, "label": "♭7" },
    { "string": 1, "fret": 17, "label": "R" }
  ]
}
```

## Connecting the boxes

Each box overlaps with the next by one or two notes. **The last note of Box 1 (string 1 fret 8) is the same note as the first of Box 2.** That's how you slide across the neck — find a shared note, slide your hand into the next box, keep playing.

## How to practice

- One box per day for five days. Up and down each box, slowly, with a metronome.
- After all five feel ok, **connect** Box 1 → Box 2 → Box 3 by playing Box 1 ascending, then sliding into Box 2 ascending, etc.
- Eventually you stop "thinking in boxes" and just play across the whole neck.
$md$,
 3),

-- =============================================================
-- VOICE — phrase by ear
-- =============================================================
('rs-voice-phrase-by-ear',
 'Playing a phrase by ear',
 'lead', 3, 11,
 'You hear four notes. You play them back. The single most underrated skill on the guitar.',
 $md$
Ear training is the difference between a guitarist who reads tab and one who *plays* music. With a trained ear, you can:

- Pick up a song without tab
- Hear what someone else is playing and respond
- Improvise in a way that sounds intentional
- Compose without an instrument in hand

It's also the slowest skill to develop. There are no shortcuts — only repetition.

## A daily 5-minute exercise

1. Play any single note on your guitar. Pick a string and a fret randomly.
2. Sing the note. Hum it if singing feels weird.
3. Pick a target — *another* note on the same string, 2 frets up.
4. Sing what you THINK that note will sound like, before playing it.
5. Play it. Were you right?

Three rounds a day. For weeks. Until "what does the note 2 frets up sound like" is automatic.

## The pentatonic ear trick

Once you know **Box 1** of the minor pentatonic, all five notes have a *feel*:

- The **root** sounds resolved — it's home.
- The **♭3** is the bluesy, melancholy note.
- The **4** is restless — wants to move.
- The **5** is strong, almost like a second home.
- The **♭7** is the bluesy lift — wants to fall back to the root.

Loop an A minor chord. Pick any pentatonic note in Box 1. *Listen* to how it feels against the chord. After a few weeks, you can name a phrase you hear before you play it — because you've heard those exact notes a thousand times.

## A simple test you can do today

Loop an A minor chord (or open Em — close enough). Play this phrase, then **stop and look away**:

```
e |--------------------|
B |---8---5----5---5---|
G |--------7---7-------|
D |--------------------|
A |--------------------|
E |--------------------|
```

Now sing it from memory. Then close your eyes and **find the same notes on the guitar**. Don't peek at the tab — feel for them.

It will be slow. That's the practice. Do it once a day for a month.

## Why most guitarists skip this

Ear training has zero immediate payoff. You can't show it off. There's no diagram of "I have good ears now." So most players never do it. The ones who do are the ones who write songs that don't sound like anyone else.
$md$,
 4),

-- =============================================================
-- MASTERY — 12-bar blues solo
-- =============================================================
('rs-master-twelve-bar',
 'Improvising over a 12-bar blues',
 'lead', 4, 15,
 'The most important song form in 20th-century music. Twelve bars, three chords, and a lifetime of phrases to find inside it.',
 $md$
The **12-bar blues** is the form. Hundreds of thousands of songs use it — *Sweet Home Chicago*, *Pride and Joy*, *The Thrill is Gone*, *Johnny B. Goode*. If you can play a coherent solo over a 12-bar in any key, you can sit in with almost any band.

## The form

In **A**, the 12-bar blues progression is:

| Bar | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Chord | A7 | A7 | A7 | A7 | D7 | D7 | A7 | A7 | E7 | D7 | A7 | E7 |

**I, IV, V** (A, D, E) — but with a flatted seventh added to each (A7, D7, E7) for that bluesy tension.

The **dominant 7th** chords are critical. Plain A major over a blues sounds wrong; A7 sounds like home.

```chord
{ "name": "A7", "frets": ["x", 0, 2, 0, 2, 0], "fingers": [null, null, 2, null, 3, null] }
```

```chord
{ "name": "D7", "frets": ["x", "x", 0, 2, 1, 2], "fingers": [null, null, null, 2, 1, 3] }
```

```chord
{ "name": "E7", "frets": [0, 2, 0, 1, 0, 0], "fingers": [null, 2, null, 1, null, null] }
```

## Soloing — what to play over the form

For an A blues, your scale is **A minor pentatonic** in any of its five boxes — the same five notes work the entire 12 bars. (Yes, A minor pentatonic over an A *major* chord — the bluesy clash IS the genre.)

For more sophistication, switch to **A major pentatonic** over the I chord, then **A minor pentatonic** over the IV and V. That's the trick that makes a solo sound *bluesy* instead of *generic-rock*.

## Phrasing principles

1. **Leave space.** Most beginners play too many notes. The best blues players let phrases breathe — silence is a note.
2. **Repeat phrases.** Play a 4-note phrase. Play it again. Play it slightly differently the third time. That's how solos *develop* a story.
3. **Bend the ♭3 toward the 3.** This is the single most-used blues move. The bend creates the tension that resolves.
4. **End on the root.** A solo that ends on the home note feels finished. One that ends in the middle of a phrase feels unfinished.

## Practice

Find a backing track in A. Loop it. **Improvise for 12 bars at a time.** Stop after each round. Reflect on what worked, what didn't. Don't try to make the whole solo perfect — make one phrase you'd want to play again.

This is the work that takes years. Worth every minute.
$md$,
 3),

-- =============================================================
-- MASTERY — song from memory
-- =============================================================
('rs-master-song-memory',
 'Playing a song from memory, start to finish',
 'rhythm', 4, 9,
 'No tab. No video. The whole thing — beginning, middle, end. The first time you do this, something clicks.',
 $md$
There's a difference between *playing a song* and *playing through a song*. Playing through is checking the tab. Playing it from memory is when the song lives in you.

## What you need

A song you've actually picked. Doesn't matter what — *Wonderwall*, *House of the Rising Sun*, *Hallelujah*, *Wish You Were Here*. Pick one you love. Three to five chords. Ideally one you've already practiced in pieces.

## Three stages

### Stage 1 — Chunk it

Break the song into **sections**: intro, verse, chorus, bridge, outro. Most songs have 3-5 sections, and most reuse them ("verse 1 = verse 2"). Memorize ONE section first. Loop it until you can play it without checking the tab.

### Stage 2 — Connect

Now play **two sections back-to-back** without stopping. Verse → chorus. The transitions are where most beginners stumble — practice the *handoff* deliberately, not the sections in isolation.

### Stage 3 — Whole song, no safety net

Set up a chair. Pretend you have an audience. Start the song. Play through every mistake. **Don't stop, don't restart, don't check the tab.** When you mess up, recover and keep going.

This third stage is the actual practice. Performers practice recovery, not perfection.

## What you'll discover

The first run will be ugly. Maybe 70% accurate. That's normal. The act of playing it through — without help — is what burns the structure into your hands.

The second run will be 80%. The fifth, 95%. By the tenth, you'll feel it instead of think it.

## Why this milestone matters

Until now, every lesson has been a piece. Anatomy, chords, scales, theory — building blocks. **A song you can play from memory is the first time those pieces become music.** It's the first time you're a player, not a student.

Pick the song. Do the work. The day you nail it cold is the day you cross over.
$md$,
 4),

-- =============================================================
-- MASTERY — fingerstyle piece
-- =============================================================
('rs-master-fingerstyle-piece',
 'A fingerstyle piece — Travis pattern over chord changes',
 'fingerstyle', 4, 14,
 'Bass and melody at once, on a single instrument, performed for human ears. The fingerstyle test.',
 $md$
The **Travis pattern** (named for Merle Travis) is the foundation of country, folk, and a lot of singer-songwriter fingerstyle. The thumb plays a steady alternating bass; the fingers pluck a melody on top. Two voices from one player.

## The pattern, slowed down

Over a single chord (try **C major**), the Travis pattern goes:

| Beat | 1 | + | 2 | + | 3 | + | 4 | + |
|---|---|---|---|---|---|---|---|---|
| Thumb (P) | bass note | — | mid bass | — | bass note | — | mid bass | — |
| Fingers (I, M) | — | I (G) | — | M (B) | — | I (G) | — | M (B) |

The thumb alternates between two bass strings (root and 5th of the chord). The fingers pluck melody/rhythm on top. Once the pattern is automatic, you can change chords without losing the bass.

## Try it on C, F, G

Hold each chord and run the Travis pattern through it.

```chord
{ "name": "C", "frets": ["x", 3, 2, 0, 1, 0], "fingers": [null, 3, 2, null, 1, null] }
```

For C: **bass alternates string 5 (root, fret 3) and string 4 (fret 2)**. Fingers play strings 3 and 2.

```chord
{ "name": "G", "frets": [3, 2, 0, 0, 0, 3], "fingers": [3, 2, null, null, null, 4] }
```

For G: **bass alternates string 6 (root, fret 3) and string 4 (open D)**. Fingers play strings 3 and 2.

```chord
{ "name": "F (simplified)", "frets": ["x", "x", 3, 2, 1, 1], "fingers": [null, null, 3, 2, 1, 1] }
```

For F: **bass alternates string 4 (root, fret 3) and string 3 (fret 2)**. Fingers play strings 2 and 1.

## Building to a piece

1. Get the pattern clean on **one** chord.
2. Loop it for two minutes without your fingers tangling.
3. **Switch chords mid-pattern**. The thumb keeps going during the change — that's the test.
4. Pick a song with the pattern in it (e.g., *Dust in the Wind*, *Landslide*, *The Boxer*) and learn the verse.
5. Play the verse, slowly, no stopping.
6. Speed up.

## The performance test

When you can play 30+ seconds of a piece without stopping, **play it for someone**. A partner, a friend, a family member, a video camera. Not for review — just to do it.

The act of playing for an audience is half the skill. Don't skip it.
$md$,
 5),

-- =============================================================
-- MASTERY — modes
-- =============================================================
('rs-master-modes',
 'Hearing modes — Dorian, Mixolydian, Phrygian',
 'theory', 5, 16,
 'Modes feel mysterious because they''re taught wrong. They''re not theory — they''re sounds. Once you hear them, the mystery disappears.',
 $md$
**Modes** are sounds. They feel mysterious because most courses teach them as scale formulas (Phrygian = 1 ♭2 ♭3 4 5 ♭6 ♭7) — which makes them feel like math, not music. Forget the formulas. Listen.

## What a mode actually is

Take the **C major scale**: C D E F G A B C.

If you center music around C, it sounds like **C Ionian** (the major scale). All major-key pop songs.

If you center music around D — using the same seven notes — it sounds like **D Dorian**. Slightly minor, but with a hopeful lift. *So What* by Miles Davis. *Scarborough Fair*.

Same notes. Different home base. Different feel.

## The seven modes — the ones worth learning first

For most guitarists, three modes do 90% of the work:

### Dorian — the cool minor
Like minor, but with a major 6th — sounds smoother, less melancholy. Famous: *So What*, *Riders on the Storm*, *Smoke on the Water*.

### Mixolydian — the bluesy major
Like major, but with a flat 7th. Sounds like blues, country, classic rock. Famous: *Sweet Home Alabama* (sort of), *Norwegian Wood*, most Allman Brothers.

### Phrygian — the dark minor
Like minor, but with a flat 2nd. Sounds Spanish, metal, ominous. Famous: most flamenco, *War* by Joe Satriani, lots of metal.

## How to actually hear them

The fastest way: **loop a single chord** that anchors a mode, and play around with the matching scale.

For **D Dorian**: loop a Dm chord. Play C major scale notes (D-E-F-G-A-B-C-D), centering everything on D. Dorian.

```fretboard
{
  "title": "D Dorian (C major scale, centered on D)",
  "frets": [4, 12],
  "notes": [
    { "string": 6, "fret": 5, "label": "R", "emphasis": "root" },
    { "string": 6, "fret": 7, "label": "2" },
    { "string": 6, "fret": 8, "label": "♭3" },
    { "string": 6, "fret": 10, "label": "4" },
    { "string": 6, "fret": 12, "label": "5" }
  ]
}
```

For **G Mixolydian**: loop a G7. Play C major scale notes. Center on G. Mixolydian.

For **E Phrygian**: loop an Em. Play C major scale notes. Center on E. Phrygian.

Same C-major notes. Different chord underneath. Different mode.

## The shortcut

You don't need to learn 7 different fingerings for 7 modes. **They're all the same scale, just centered differently.** Learn the C major scale shapes once. Loop a different chord and the mode changes by itself.

After a month of this, you'll start to *hear* a song's mode the way you hear major or minor.
$md$,
 7),

-- =============================================================
-- MASTERY — played for someone
-- =============================================================
('rs-master-played-for-someone',
 'Playing for someone — the milestone that matters most',
 'technique', 3, 10,
 'Anyone — a friend, a partner, a stranger on a porch. Until you''ve played in front of human ears, you haven''t actually played.',
 $md$
Every other milestone in this curriculum is mechanical. This one is the only one that matters.

You can practice for ten years in a closet and you will still freeze the first time someone watches you play. That freeze is information. It tells you that *what you do alone is not what you do in front of someone*. The only fix is reps.

## What "playing for someone" means

It does not mean perfect. It does not mean a stage.

It means: another human being is in the room (or on a video call), and you are playing the guitar, and they are listening.

That's it. That's the milestone. Anyone counts:

- A partner sitting on the couch
- A friend over coffee
- A family member on FaceTime
- A nephew who doesn't know what's good
- Yourself, recorded on your phone, then watched

## The first time

Pick a song you can play 95% accurately when alone. Drop your accuracy expectation to 70% in front of someone — your hands WILL betray you a little. That's normal.

Tell them in advance: *"I'm going to play a song. It will not be perfect. Don't react until I'm done."*

Play it through. Don't stop. When you mess up, keep going. Don't apologize.

When you finish, breathe.

## What you'll learn

You'll learn what mistakes feel like in front of someone vs. alone. Your timing changes. Your nerves shape your dynamics. You'll discover that the parts you thought were solid aren't, and parts you thought were shaky come out fine.

This is data nobody can give you in a tutorial.

## How often

Once a week, minimum. Find a recurring listener — partner, friend, weekly call.

Or **video yourself** weekly. Watch the playback. Cringe. Adjust.

The artists who got good fast didn't have more talent than you. They had more reps in front of human ears.

## You're not really a player until

You can sit down with a friend, pick up the guitar, and play a song without it being a *thing*. That's the line.

Cross it.
$md$,
 6);

-- =============================================================
-- LESSON ↔ THEORY LINKS for the new lessons
-- =============================================================
insert into public.lesson_theory_links (lesson_id, theory_entry_id)
select l.id, t.theory
from public.lessons l
join (values
  ('rs-mvt-first-barre',           'caged'),
  ('rs-mvt-first-barre',           'intervals'),
  ('rs-voice-caged-positions',     'caged'),
  ('rs-voice-caged-positions',     'intervals'),
  ('rs-voice-all-pent-boxes',      'minor-pentatonic'),
  ('rs-voice-all-pent-boxes',      'intervals'),
  ('rs-voice-phrase-by-ear',       'minor-pentatonic'),
  ('rs-master-twelve-bar',         'minor-pentatonic'),
  ('rs-master-twelve-bar',         'circle-of-fifths'),
  ('rs-master-fingerstyle-piece',  'caged'),
  ('rs-master-modes',              'major-scale'),
  ('rs-master-modes',              'intervals')
) as t(slug, theory) on l.slug = t.slug;
