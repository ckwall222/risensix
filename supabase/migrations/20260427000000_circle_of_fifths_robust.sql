-- Risen Six — flesh out Circle of Fifths content with the actual wheel diagram
-- and substantial worked examples.
-- All UPDATEs (idempotent, safe to re-run).

-- =============================================================
-- THEORY ENTRY: circle-of-fifths
-- =============================================================
update public.theory_entries
set body = $md$
The **Circle of Fifths** is the most useful single diagram in music. It packs the relationships between every key, every chord, and every common progression into one visual — once you can read it, theory stops being abstract.

## The wheel itself

```cof
{ "title": "The Circle of Fifths" }
```

**Outer ring** = the 12 major keys. **Inner ring** = each major's relative minor (same notes, different home base). **Numbers outside** = the count of sharps or flats in that key.

Reading clockwise from C:

> **C → G → D → A → E → B → F♯**

Each step is a perfect 5th higher than the last. Each step also adds **one sharp** to the key signature.

Counterclockwise from C:

> **C → F → B♭ → E♭ → A♭ → D♭ → G♭**

Each step is a perfect 4th higher (a 5th lower). Each step adds **one flat**.

After 12 steps in either direction you're back where you started.

## How to read any key

Pick a key. Every related fact lives at a specific position around that key.

For **C major** (top of the wheel):

- **One step right** (G) is the **V chord** (dominant). Strong pull back to C.
- **One step left** (F) is the **IV chord** (subdominant).
- **Three steps clockwise** lands on the **relative minor** in the inner ring (A minor). Same notes; different home.
- **Directly across** (F♯/G♭) is the *most distant* key — six half-steps away. This is the tritone — the awkward, unstable interval.

That geometry is identical for every other major key. Move the wheel mentally; the relationships don't change.

## Worked examples

### Finding the chords in a key

For **G major**:

```cof
{ "title": "Reading G major", "highlightI": "G", "highlightIV": "C", "highlightV": "D", "highlightVi": "G" }
```

The orange wedge is **G** (the I). The two amber wedges flanking it are **C** (IV, one step left) and **D** (V, one step right). The relative minor on the inner ring at G's position is **Em**.

### Finding key signatures

The number outside each major key tells you how many sharps or flats. **D major** has `2♯` outside it on the wheel — meaning D major has two sharps (F♯ and C♯). **B♭ major** has `2♭` — B♭ and E♭.

### Finding "safe" chord substitutions

Adjacent keys on the wheel sound related; distant keys sound foreign. If a song is in C major and you want a chord that's *almost* C but a little different, try **G** or **F** (the immediate neighbors) before reaching for **F♯** (the opposite of the wheel — clashes hard).

## How guitarists actually use it

- **Capo decisions** — moving from F to G is one step on the circle, so it's a 2-fret capo.
- **Songwriting** — a bridge that modulates one step on the wheel sounds natural; one that jumps three steps sounds adventurous; one that jumps six sounds jazz.
- **Improvisation** — when a song moves to its V (one step clockwise), your scale moves with it.
- **Ear training** — most modulations you hear in pop, country, and rock follow the wheel's geometry.

Print one out. Tape it inside your case. Eventually you'll feel it without looking.
$md$
where id = 'circle-of-fifths';

-- =============================================================
-- LESSON: rs-theory-cof-intro — robust intro with the wheel
-- =============================================================
update public.lessons
set body = $md$
The **Circle of Fifths** looks decorative. It isn't. It's the most useful single diagram in music — once you can read it, every key, every signature, and most chord choices are right there in front of you.

## Look at it

```cof
{ "title": "The Circle of Fifths" }
```

Twelve keys arranged in a circle. The **outer ring** is major keys; the **inner ring** is relative minors (same notes as their major neighbor, different home base). The **numbers outside** tell you how many sharps or flats are in each key.

## How it's organized — the geometry

Start at **C** at the top. Going **clockwise**, each key is a perfect 5th higher than the last:

> **C → G → D → A → E → B → F♯ → C♯/D♭ → A♭ → E♭ → B♭ → F → C**

Going **counterclockwise** from C, each key is a perfect 4th higher (which equals a perfect 5th lower):

> **C → F → B♭ → E♭ → A♭ → D♭ → G♭/F♯ → C♭/B → E → A → D → G → C**

Twelve steps in either direction wraps you back to C.

## Each step adds one sharp or flat

| Position | Key | Sharps / Flats |
|---|---|---|
| Top | C | 0 |
| 1 step clockwise | G | 1 sharp (F♯) |
| 2 | D | 2 sharps (F♯ C♯) |
| 3 | A | 3 sharps (F♯ C♯ G♯) |
| 4 | E | 4 sharps |
| 5 | B | 5 sharps |
| 6 | F♯ | 6 sharps |
| 1 step CCW | F | 1 flat (B♭) |
| 2 | B♭ | 2 flats (B♭ E♭) |
| 3 | E♭ | 3 flats |
| 4 | A♭ | 4 flats |

There's a pattern in the order of sharps as you go clockwise: **F C G D A E B**. Flats are exactly that order reversed: **B E A D G C F**. Not a coincidence — both sequences are themselves a circle of fifths.

## How to read a single key

Pick any key. Every relationship lives at a fixed angular distance.

```cof
{ "title": "Reading G major", "highlightI": "G", "highlightIV": "C", "highlightV": "D", "highlightVi": "G" }
```

The orange wedge is **G** itself (your tonic — the I chord). The amber wedges flanking it are:

- **C** — the IV chord (one step counterclockwise)
- **D** — the V chord (one step clockwise)

And on the inner ring at G's position you'll see **Em** — G major's *relative minor*. Same seven notes as G major, just centered on E instead of G.

## A simple test

Without using the wheel above, answer:

1. What's the V chord in **D major**?
2. What's the IV chord in **A major**?
3. What's the relative minor of **F major**?

Answers (don't peek): A, D, Dm. (The pattern holds every time: V is one clockwise step, IV is one counterclockwise, relative minor is the inner-ring entry at the same angular position.)

## Why guitarists care

You don't need to recite the wheel out loud. You need to know **its geometry** — which keys are neighbors, which are far apart, what's diagonally across. Those positions tell you:

- Which sharps/flats a song will use
- Which chords are the safest substitutes
- Where to modulate without it sounding random
- Why some progressions feel "natural" and others sound like an accident

The next two lessons unpack what that means in practice.
$md$
where slug = 'rs-theory-cof-intro';

-- =============================================================
-- LESSON: rs-theory-cof-iv-v — I, IV, V with three different keys
-- =============================================================
update public.lessons
set body = $md$
In any major key, three chords carry the weight: the **I**, the **IV**, and the **V**. Strum any campfire songbook and you'll find these three chords doing 80% of the work.

The Circle of Fifths shows you, at a glance, which three chords those are in any key.

## The geometry

For any key on the outer ring, the **IV** is one step **counterclockwise**, and the **V** is one step **clockwise**.

| Key (I) | IV (← one step) | V (→ one step) |
|---|---|---|
| C | F | G |
| G | C | D |
| D | G | A |
| A | D | E |
| E | A | B |
| F | B♭ | C |
| B♭ | E♭ | F |

So in **G major**, your three primary chords are **G, C, D**. In **C major**, they're **C, F, G**. In **D major**, they're **D, G, A**. The shape on the wheel is always the same — a 3-segment slice with your tonic in the middle.

## Three keys, three slices

### C, F, G — the three chords of C major

```cof
{ "title": "I, IV, V in C major", "highlightI": "C", "highlightIV": "F", "highlightV": "G", "highlightVi": "C" }
```

```chord
{ "name": "C", "frets": ["x", 3, 2, 0, 1, 0], "fingers": [null, 3, 2, null, 1, null] }
```

```chord
{ "name": "F (open variant)", "frets": ["x", "x", 3, 2, 1, 1], "fingers": [null, null, 3, 2, 1, 1] }
```

```chord
{ "name": "G", "frets": [3, 2, 0, 0, 0, 3], "fingers": [3, 2, null, null, null, 4] }
```

Strum **C → F → G → C**. That's the foundation of countless songs. The relative minor of C is **Am** (inner ring at C's position) — a great substitute for moments when the C feels too bright.

### G, C, D — the three chords of G major

```cof
{ "title": "I, IV, V in G major", "highlightI": "G", "highlightIV": "C", "highlightV": "D", "highlightVi": "G" }
```

```chord
{ "name": "G", "frets": [3, 2, 0, 0, 0, 3], "fingers": [3, 2, null, null, null, 4] }
```

```chord
{ "name": "C", "frets": ["x", 3, 2, 0, 1, 0], "fingers": [null, 3, 2, null, 1, null] }
```

```chord
{ "name": "D", "frets": ["x", "x", 0, 2, 3, 2], "fingers": [null, null, null, 1, 3, 2] }
```

Strum **G → D → C → G** and you've played the verse of about a million songs. *Knockin' on Heaven's Door*. *Sweet Home Alabama*. *Bad Moon Rising*. The relative minor is **Em** — also extremely common as a fourth chord.

### D, G, A — the three chords of D major

```cof
{ "title": "I, IV, V in D major", "highlightI": "D", "highlightIV": "G", "highlightV": "A", "highlightVi": "D" }
```

```chord
{ "name": "D", "frets": ["x", "x", 0, 2, 3, 2], "fingers": [null, null, null, 1, 3, 2] }
```

```chord
{ "name": "G", "frets": [3, 2, 0, 0, 0, 3], "fingers": [3, 2, null, null, null, 4] }
```

```chord
{ "name": "A", "frets": ["x", 0, 2, 2, 2, 0], "fingers": [null, null, 1, 2, 3, null] }
```

Notice anything? The same chord shapes recur from key to key — **G** is the IV in D major *and* the V in C major *and* the I in G major. That's the wheel showing through into your fingers.

## Why it works

Songs sound stable because **I, IV, V** are the three chords every note of the major scale wants to belong to. Every melody can be harmonized using just those three. That's why they feel like home — and why they always sit right next to each other on the wheel.

Internalize this: **"key center, neighbor left, neighbor right."** That's I, IV, V — for the rest of your life as a guitarist.
$md$
where slug = 'rs-theory-cof-iv-v';

-- =============================================================
-- LESSON: rs-theory-cof-modulation — modulation with the wheel
-- =============================================================
update public.lessons
set body = $md$
**Modulation** is when a song shifts to a new key. You hear it constantly in pop bridges and final choruses — and it almost always follows the geometry of the circle.

## The most common move: up to the V

The single most-used modulation in popular music: **shift up one step clockwise on the circle** — that is, modulate to the V of your current key.

If a song starts in **C major**, the most natural modulation is to **G major** (the V). Once in G, the next natural modulation is to **D**. And so on.

```cof
{ "title": "C → G — moving one step clockwise", "highlightI": "C", "highlightV": "G" }
```

The current tonic (C, orange) shifts to the new tonic (G, amber). The V of C *becomes* the I of the new key.

| Original key | Most common modulation |
|---|---|
| C | G |
| G | D |
| D | A |
| A | E |
| F | C |

This is *every* "key change for the final chorus" you've ever heard.

## Why one step works so well

The V chord of any key contains the **leading tone** — a strong pull toward the new tonic. Your ear has been hearing G as the dominant chord that wants to resolve to C; once the song stays on G long enough, your ear accepts G as the new tonic. The transition feels inevitable rather than abrupt.

## The relative minor — sliding without changing notes

Every major key has a **relative minor**. Same notes, different home base. It lives on the inner ring at the same angular position as its major.

```cof
{ "title": "C major and its relative minor (Am)", "highlightI": "C", "highlightVi": "C" }
```

| Major | Relative minor |
|---|---|
| C | A minor |
| G | E minor |
| D | B minor |
| A | F♯ minor |
| F | D minor |

Songs often switch between a major key and its relative minor without you noticing — they share every note, so there's no friction. Listen for the chord that the verse "wants" to land on. If it's the I (C major in C major) the song's centered there; if it's the vi (Am) the song has shifted into the minor mode.

## Less common: distant keys

Modulating to a key that's **far away on the wheel** (three or more steps) feels adventurous. Two steps might suggest a jazz harmonic move. Six steps (the tritone) sounds like the song just changed genre.

```cof
{ "title": "C → A — two steps clockwise", "highlightI": "C", "highlightV": "A" }
```

Songs that pull this off (David Bowie, Stevie Wonder, classical composers) earn it with smooth voice leading. Most pop songs stick to one-step modulations because they're foolproof.

## How guitarists use this

- **Songwriting** — the circle is your safety map. Want a bridge that doesn't sound forced? Move one step. Two gets adventurous. Three is jazz.
- **Improvisation** — when a song modulates to V, your scales shift accordingly. Pentatonic Box 1 in A minor doesn't fit a song that's now in B major — but A→B is six steps on the circle, so you know instantly the relationship is "far."
- **Capo decisions** — if a song is in F and your voice prefers G, capo at fret 2 (F → G is one step on the circle). The chord shapes you'd play in F transpose directly.
- **Hearing it** — pick three songs you know with key changes. Try to spot where they go. Most go to the V. Train this and the wheel becomes obvious without a printed copy.

Print a circle of fifths. Tape it inside your case. Eventually you won't need it — you'll *feel* it.
$md$
where slug = 'rs-theory-cof-modulation';
