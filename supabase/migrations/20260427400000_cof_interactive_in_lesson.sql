-- Embed the interactive Circle of Fifths widget inside the theory entry
-- and the rs-theory-cof-intro lesson. The static `cof` highlights still
-- appear elsewhere as worked examples; the interactive widget at the top
-- lets students click any key and see its diatonic chords on the spot.

update public.theory_entries
set body = $md$
The **Circle of Fifths** is the most useful single diagram in music. It packs the relationships between every key, every chord, and every common progression into one visual — once you can read it, theory stops being abstract.

## Try the wheel

Click any major key on the wheel. The selected key's chord set, scale notes, and relative minor populate underneath. This is the toolkit you'll actually reach for when you're working out a song you only half-know.

```cof-tool
{}
```

## How it's organized

**Outer ring** = the 12 major keys. **Inner ring** = each major's relative minor (same notes, different home base).

Reading clockwise from C:

> **C → G → D → A → E → B → F♯**

Each step is a perfect 5th higher than the last. Each step also adds **one sharp** to the key signature.

Counterclockwise from C:

> **C → F → B♭ → E♭ → A♭ → D♭ → G♭**

Each step is a perfect 4th higher (a 5th lower). Each step adds **one flat**.

## How to read any key

Pick a key on the wheel above. Every related fact lives at a specific position around it.

For **C major** (top of the wheel):

- **One step right** (G) is the **V chord** (dominant). Strong pull back to C.
- **One step left** (F) is the **IV chord** (subdominant).
- **Three steps clockwise** lands on the **relative minor** in the inner ring (A minor). Same notes; different home.
- **Directly across** (F♯/G♭) is the *most distant* key — six half-steps away. This is the tritone — the awkward, unstable interval.

That geometry is identical for every other major key. Click G on the wheel and the same relationships hold — V is D, IV is C, relative minor is Em.

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

-- Embed the interactive widget in the intro lesson too
update public.lessons
set body = $md$
The **Circle of Fifths** looks decorative. It isn't. It's the most useful single diagram in music — once you can read it, every key, every signature, and most chord choices are right there in front of you.

## Try it yourself

Click any key on the wheel. The seven chords in that key, the notes of its scale, and its relative minor all populate underneath. Try a few — the geometry repeats for every key.

```cof-tool
{}
```

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

## A simple test

Without using the wheel above, answer:

1. What's the V chord in **D major**?
2. What's the IV chord in **A major**?
3. What's the relative minor of **F major**?

Click the wheel above to check yourself. (Answers: A, D, Dm.)

## Why guitarists care

You don't need to recite the wheel out loud. You need to know **its geometry** — which keys are neighbors, which are far apart, what's diagonally across. Those positions tell you:

- Which sharps/flats a song will use
- Which chords are the safest substitutes
- Where to modulate without it sounding random
- Why some progressions feel "natural" and others sound like an accident

The next two lessons unpack what that means in practice.
$md$
where slug = 'rs-theory-cof-intro';
