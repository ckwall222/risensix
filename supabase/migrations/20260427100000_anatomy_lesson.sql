-- Risen Six — add 'Anatomy of a guitar' as the first Technique lesson
-- Re-runnable: deletes its own row before inserting.

delete from public.lesson_progress where lesson_id in (select id from public.lessons where slug = 'rs-tech-anatomy');
delete from public.lesson_theory_links where lesson_id in (select id from public.lessons where slug = 'rs-tech-anatomy');
delete from public.lessons where slug = 'rs-tech-anatomy';

insert into public.lessons
  (slug, title, focus_area_id, difficulty, duration_minutes, summary, body, sort_order)
values
('rs-tech-anatomy',
 'Anatomy of a guitar — what every part is called',
 'technique', 1, 9,
 'Tap any part of an acoustic or electric guitar to see what it''s called and what it does. The vocabulary every other lesson assumes you know.',
 $md$
Before you can hold a guitar comfortably or fret a clean chord, you should be able to name what your hands are touching. Every lesson on this site (and every guitar book and YouTube tutorial) uses these terms.

Most parts work the same way on both acoustic and electric guitars. The body, the bridge style, and how the sound is produced are where they diverge.

## Acoustic guitar

```guitar-anatomy
{ "variant": "acoustic" }
```

## Electric guitar

```guitar-anatomy
{ "variant": "electric" }
```

## The shortlist of vocabulary you'll see most

| Term | What it is | Why it matters |
|---|---|---|
| **Headstock** | Top of the guitar with the tuning machines | Where you tune |
| **Nut** | Grooved strip at the start of the fretboard | Defines the open-string position |
| **Fretboard** | Wooden surface along the neck | Where you press notes |
| **Fret** | Metal wire across the fretboard | Pressing behind one shortens the string by a half-step |
| **Bridge** | Where the strings anchor on the body | Transfers vibration to the top (acoustic) or grounds the strings (electric) |
| **Saddle / saddles** | Strip(s) where strings cross the bridge | Sets string height and intonation |
| **Soundhole** *(acoustic)* | Round opening in the top | How the sound projects |
| **Pickup** *(electric)* | Magnetic transducer under the strings | Converts vibration to an electrical signal |

## What a luthier notices

Most lessons teach what to play. A luthier-built course like this one also teaches *why your guitar feels and sounds the way it does* — which means we'll come back to these parts repeatedly:

- The **nut** and **saddle** together set your *action* — how high the strings sit. Too high and chords are exhausting; too low and you'll buzz.
- The **truss rod** inside the neck adjusts curvature. A guitar that "fights you" often has a neck issue, not a player issue.
- The **soundhole** placement and body bracing decide how an acoustic projects.
- A **pickup**'s position decides how warm or bright a note sounds before any knob, pedal, or amp.

You don't need to memorize the diagrams. You need to know the words exist — and to recognize the parts when you hear them named in later lessons.
$md$,
 0);
