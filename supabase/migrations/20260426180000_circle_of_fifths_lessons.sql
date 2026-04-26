-- Risen Six — Circle of Fifths lessons + intervals fix for pentatonic
-- Re-runnable: deletes our seed rows before inserting; updates are idempotent.

-- =============================================================
-- Cleanup for re-run safety
-- =============================================================
delete from public.lesson_theory_links
  where lesson_id in (select id from public.lessons where slug like 'rs-theory-cof-%');
delete from public.lesson_progress
  where lesson_id in (select id from public.lessons where slug like 'rs-theory-cof-%');
delete from public.lessons where slug like 'rs-theory-cof-%';

-- =============================================================
-- LESSON FIX: rs-lead-pent-box1 — add intervals section
-- (the lesson links to the Intervals theory entry, but the body
--  didn't actually explain the R/♭3/4/5/♭7 labels on the diagram)
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

## Reading the labels

Each note on the diagram is tagged with its **interval** — its distance from the root. These tags are what make the shape *movable* and *meaningful*, not just memorized.

| Label | Means | In A minor pentatonic |
|---|---|---|
| **R** | Root | A |
| **♭3** | Flat (minor) third | C |
| **4** | Perfect fourth | D |
| **5** | Perfect fifth | E |
| **♭7** | Flat (minor) seventh | G |

These five intervals — **1, ♭3, 4, 5, ♭7** — *are* the minor pentatonic. Skip the 2nd and 6th of the minor scale and you have it. The labels stay constant whether you're playing A minor, B minor, or any key — only the actual pitches change with the root.

If intervals feel abstract, take a quick read of the [Intervals theory entry](/theory/intervals) — it's the foundation under everything that comes next.

## Play it ascending and descending

Slowly, one note at a time, **low to high then back down**. Use alternate picking (down-up-down-up) once it's smooth.

Your goals:
- Every note rings cleanly.
- Even rhythm — each note the same duration.
- No pauses between strings.

Aim for 60 BPM, four notes per beat.

## Movability

Slide the **whole shape up two frets** (index finger now at 7th fret) and you're playing **B minor pentatonic**. Same shape, different root. The interval tags don't change — only the pitch under each tag does.

| Index finger at | Plays the |
|---|---|
| Fret 3 | G minor pentatonic |
| Fret 5 | A minor pentatonic |
| Fret 7 | B minor pentatonic |
| Fret 8 | C minor pentatonic |
| Fret 10 | D minor pentatonic |
| Fret 12 | E minor pentatonic |

One pattern, twelve keys.

## Apply it

Loop an A minor chord (or play one and let it ring). Improvise using only these notes. You don't need to know any theory — just play notes from the shape, in any order, with feel.

Welcome to soloing.
$md$
where slug = 'rs-lead-pent-box1';

-- =============================================================
-- LESSON 1: The wheel that explains every key
-- =============================================================
insert into public.lessons
  (slug, title, focus_area_id, difficulty, duration_minutes, summary, body, sort_order)
values
('rs-theory-cof-intro',
 'The wheel — and why every guitarist eventually keeps one nearby',
 'theory', 2, 11,
 'A circular diagram of every key, every sharp, every flat — and the chord relationships that hold music together.',
 $md$
The **Circle of Fifths** looks decorative. It isn't. It's the most useful single diagram in music — once you can read it, every key, every signature, and most chord choices are right there.

## How it's organized

Start at **C** at the top. Going **clockwise**, each key is a perfect 5th higher than the last:

> **C → G → D → A → E → B → F♯ → C♯**

Going **counterclockwise** from C, each key is a perfect 4th higher (which is a 5th lower):

> **C → F → B♭ → E♭ → A♭ → D♭ → G♭ → C♭**

Twelve steps brings you back to C.

## What each step adds

Each clockwise step **adds one sharp** to the key signature. Each counterclockwise step **adds one flat**.

| Position | Key | Sharps / Flats |
|---|---|---|
| Top | C | 0 |
| 1 step clockwise | G | 1 sharp (F♯) |
| 2 steps | D | 2 sharps (F♯ C♯) |
| 3 steps | A | 3 sharps (F♯ C♯ G♯) |
| 1 step counterclockwise | F | 1 flat (B♭) |
| 2 steps CCW | B♭ | 2 flats (B♭ E♭) |

There's a pattern in the order sharps appear (F C G D A E B) and flats (B E A D G C F — exactly reversed). This isn't arbitrary; it's the geometry of the circle.

## Why guitarists care

You don't need to recite the circle out loud. You need to know **its geometry** — which keys are neighbors, which are far apart, what's diagonally across. Those positions tell you:

- Which sharps/flats a song will use
- Which chords are the safest substitutes
- Where to modulate without it sounding random
- Why some progressions feel "natural"

The next two lessons unpack what that means in practice.
$md$,
 3),

-- =============================================================
-- LESSON 2: I, IV, V — the three chords of (almost) everything
-- =============================================================
('rs-theory-cof-iv-v',
 'I, IV, V — the three chords most songs are built on',
 'theory', 2, 13,
 'Why the three most-used chords in pop, rock, blues, country, and folk are always sitting next to each other on the circle.',
 $md$
In any major key, three chords carry the weight of the song: the **I, the IV, and the V**. Strum any campfire songbook and you'll find these three chords doing 80% of the work.

The Circle of Fifths shows you, at a glance, which three chords those are in any key.

## The geometry

For any key, the **IV** is one step **counterclockwise** on the circle, and the **V** is one step **clockwise**.

| Key (I) | IV (← one step) | V (→ one step) |
|---|---|---|
| C | F | G |
| G | C | D |
| D | G | A |
| A | D | E |
| E | A | B |
| F | B♭ | C |

So if you're in **G major**, your three primary chords are **G, C, D**. In **C major**, they're **C, F, G**. In **D major**, they're **D, G, A**.

## C, F, G on guitar

The three chords of C major. Try strumming them in this order: **C → F → G → C**. That's the foundation of countless songs.

```chord
{ "name": "C", "frets": ["x", 3, 2, 0, 1, 0], "fingers": [null, 3, 2, null, 1, null] }
```

```chord
{ "name": "F (open variant)", "frets": ["x", "x", 3, 2, 1, 1], "fingers": [null, null, 3, 2, 1, 1] }
```

```chord
{ "name": "G", "frets": [3, 2, 0, 0, 0, 3], "fingers": [3, 2, null, null, null, 4] }
```

> The easier "F" voicing above is a partial. The full barre F at fret 1 is what most songs actually use, but the 4-string version is what beginners can play this week.

## G, C, D on guitar

These three are the easiest set on guitar. If you only ever learned three chords, learn these.

```chord
{ "name": "G", "frets": [3, 2, 0, 0, 0, 3], "fingers": [3, 2, null, null, null, 4] }
```

```chord
{ "name": "C", "frets": ["x", 3, 2, 0, 1, 0], "fingers": [null, 3, 2, null, 1, null] }
```

```chord
{ "name": "D", "frets": ["x", "x", 0, 2, 3, 2], "fingers": [null, null, null, 1, 3, 2] }
```

Strum **G → D → C → G** and you have the verse of about a million songs.

## D, G, A on guitar

The three chords of D major.

```chord
{ "name": "D", "frets": ["x", "x", 0, 2, 3, 2], "fingers": [null, null, null, 1, 3, 2] }
```

```chord
{ "name": "G", "frets": [3, 2, 0, 0, 0, 3], "fingers": [3, 2, null, null, null, 4] }
```

```chord
{ "name": "A", "frets": ["x", 0, 2, 2, 2, 0], "fingers": [null, null, 1, 2, 3, null] }
```

## Why this works

Songs sound stable because **I, IV, V** are the *three chords every note of the major scale wants to belong to*. Every melody can be harmonized with just those three. That's why they feel like home, and why they sit right next to each other on the wheel.

Internalize this: **"key center, neighbor left, neighbor right."** That's I, IV, V — for the rest of your life as a guitarist.
$md$,
 4),

-- =============================================================
-- LESSON 3: Modulation — sliding to a new key
-- =============================================================
('rs-theory-cof-modulation',
 'Modulation — when a song slides to a new key',
 'theory', 3, 10,
 'Why songs change keys, why most modulations move by a 5th, and how to use the wheel to predict them.',
 $md$
**Modulation** is when a song shifts to a new key. You hear it constantly in pop bridges and final choruses — and it almost always follows the geometry of the circle.

## The most common move: up to the V

The single most-used modulation in popular music: **shift up one step clockwise on the circle** — that is, modulate to the V of your current key.

If a song starts in **C major**, the most natural modulation is to **G major** (the V). Once in G, the next safe modulation is to **D**. And so on.

| Original key | Most common modulation |
|---|---|
| C | G |
| G | D |
| D | A |
| A | E |
| F | C |

Why? The V chord of any key contains the *leading tone* — a strong pull toward the new key. Your ear has been hearing "G" as the dominant chord that wants to resolve to C; once the song stays on G long enough, your ear accepts G as the new tonic.

This is *every* "key change for the final chorus" you've ever heard.

## Less common: relative minor

Every major key has a **relative minor** — the same notes, different center of gravity. Find it by going three steps clockwise from your major key (or look at the inner ring of any printed circle).

| Major | Relative minor |
|---|---|
| C | A minor |
| G | E minor |
| D | B minor |
| A | F♯ minor |
| F | D minor |

Songs often switch between a major key and its relative minor without you noticing — they share every note, so there's no friction.

## How guitarists use this

- **Songwriting**: the circle is your safety map. Want a bridge that doesn't sound forced? Move one step. Two steps gets adventurous. Three is jazz.
- **Improvisation**: when a song modulates to V, your scales shift accordingly. Pentatonic Box 1 in A minor doesn't fit a song that's now in B major — but A→B is a tritone (six steps on the circle), which tells you the relationship is "far."
- **Capo decisions**: if a song is in F and your voice prefers G, capo at fret 2 (F → G is one step on the circle). The chord shapes you'd play in F transpose directly.

Print a circle of fifths. Tape it inside your case. Eventually you won't need it — you'll *feel* it.
$md$,
 5);

-- =============================================================
-- Link new lessons to the circle-of-fifths theory entry
-- =============================================================
insert into public.lesson_theory_links (lesson_id, theory_entry_id)
select l.id, t.theory
from public.lessons l
join (values
  ('rs-theory-cof-intro',      'circle-of-fifths'),
  ('rs-theory-cof-iv-v',       'circle-of-fifths'),
  ('rs-theory-cof-iv-v',       'intervals'),
  ('rs-theory-cof-modulation', 'circle-of-fifths')
) as t(slug, theory) on l.slug = t.slug;

-- =============================================================
-- VERIFY (run this separately to check what's loaded):
-- select slug, body like '%```fretboard%' as has_fretboard, body like '%```chord%' as has_chord
--   from public.lessons where slug like 'rs-%' order by slug;
-- select id,   body like '%```fretboard%' as has_fretboard, body like '%```chord%' as has_chord
--   from public.theory_entries order by id;
-- =============================================================
