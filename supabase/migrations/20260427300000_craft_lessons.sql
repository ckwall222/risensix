-- Risen Six — eight Craft-stage lessons (truly advanced material)
-- Re-runnable: deletes the lessons we own before re-inserting.

delete from public.lesson_theory_links where lesson_id in (select id from public.lessons where slug like 'rs-craft-%');
delete from public.lesson_progress    where lesson_id in (select id from public.lessons where slug like 'rs-craft-%');
delete from public.lessons              where slug like 'rs-craft-%';

insert into public.lessons
  (slug, title, focus_area_id, difficulty, duration_minutes, summary, body, sort_order)
values

-- =============================================================
('rs-craft-chord-tones',
 'Chord-tone soloing — following the harmony',
 'lead', 5, 14,
 'You stop playing one scale over a whole song and start targeting the notes that belong to each chord. Solos that follow the changes.',
 $md$
Most beginner-to-intermediate soloing is **scale-over-key** — pick the right pentatonic, play any of its notes, hope it lands. Chord-tone soloing is the next level: instead of one scale for a whole song, you target the **chord tones (root, 3rd, 5th, 7th)** of each chord *as it passes*.

The result: melodies that sound *intentional*. Solos that "follow the changes." The thing every great jazz, country, and gospel guitarist does without thinking.

## The four chord tones

For any chord, the strongest melody notes are:

- **Root** — the chord's name. Sounds resolved.
- **3rd** — the chord's emotional core. Major or minor lives here.
- **5th** — supportive. Strong and stable.
- **7th** — the colour. Bluesy, dreamy, or tense depending on chord.

For **C major7**: C, E, G, B.
For **A minor7**: A, C, E, G.
For **D7**: D, F♯, A, C.

## On the fretboard

Find them visually. For a C major7 voicing rooted on string 5 fret 3:

```fretboard
{
  "title": "C major7 chord tones (root on A string fret 3)",
  "frets": [2, 8],
  "notes": [
    { "string": 5, "fret": 3, "label": "R", "emphasis": "root" },
    { "string": 4, "fret": 5, "label": "5" },
    { "string": 3, "fret": 4, "label": "7" },
    { "string": 2, "fret": 5, "label": "3" },
    { "string": 1, "fret": 3, "label": "R" }
  ]
}
```

Those five notes are *always* the safest bet over Cmaj7. Land on one and the chord supports you.

## How to actually practice this

1. **Pick a 2-chord vamp.** Loop **Am7 → D7** for 8 bars each.
2. Solo using **only the chord tones** of whichever chord is currently sounding. When Am7 plays, only A/C/E/G. When D7 plays, only D/F♯/A/C.
3. Most of your "wrong" notes will be when you keep playing Am7 tones over D7 (or vice versa). Train your ear and eyes to switch.
4. Once that feels okay, add **passing tones** between chord tones — pentatonic notes used as connecting glue between target landings.

This is how jazz solos work. It's also why country leads sound so deliberate — every melodic phrase resolves to a chord tone.

## Why this is hard

You have to *know* what chord is playing in real time AND know its chord tones AND find them on the neck AND make a melody. That's a lot of parallel processing.

The fix is reps. Loop two-chord vamps for 30 minutes a day. After a few weeks, the chord-tone landings start happening on instinct.

## What it unlocks

Once you can solo through chord tones, you can play over real songs — not just blues vamps. *Autumn Leaves*, *All The Things You Are*, *Have You Ever Seen the Rain* — anything with chord changes that *go somewhere*.

Most guitar players never get here. The ones who do are the ones who get hired.
$md$,
 10),

-- =============================================================
('rs-craft-read-notation',
 'Reading standard notation fluently',
 'theory', 5, 13,
 'Tab tells you where. Notation tells you what, when, and how. Sight-reading sheet music turns you into a musician other musicians can play with.',
 $md$
Every guitarist eventually meets sheet music: a chart at a wedding gig, a collaborator who only writes in notation, a piece in a method book that has no tab. Reading **standard notation** at sight is a skill, and it's the line between "guitar player" and "musician."

## What notation tells you that tab doesn't

Tab tells you the position. Notation tells you:

- **Pitch** — the note in absolute terms (not just "string 3 fret 5")
- **Duration** — exactly how long each note rings
- **Rhythm** — beat-by-beat structure
- **Dynamics** — how loud (pp, mf, ff)
- **Articulation** — staccato, legato, accents
- **Phrasing** — slurs, ties, fermatas

Tab gives you "fret 5." Notation gives you "an A on beat 2, held for two beats, played softly."

## The bare minimum to start

1. **The treble clef staff** — five lines, four spaces. Lines from bottom to top: **E G B D F** ("Every Good Boy Does Fine"). Spaces from bottom to top: **F A C E** (just *FACE*).
2. **Note durations** — whole, half, quarter, eighth, sixteenth. Each is half the duration of the previous.
3. **Time signature** — top number = beats per bar; bottom = which note gets the beat (4 = quarter note).
4. **Key signature** — sharps or flats at the start of every line.

That's enough to read 80% of guitar music.

## How to practice

1. **Day 1-7**: every day, sight-read a single line of melody. *Use a beginner method book* (Hal Leonard's Guitar Method Book 1 or *Modern Method for Guitar* by William Leavitt are gold). Slowly. Out loud. Counting beats aloud.
2. **Day 8-30**: read at-tempo melodies in C major. No accidentals, no key changes. Just locked-in time.
3. **Day 30-90**: add keys (G, D, F). Add accidentals. Add 8th notes.
4. **Day 90+**: read what's in front of you. Whatever piece you encounter, work through it.

Don't translate to tab in your head. The goal is **see note → play note**. With reps, that becomes automatic.

## What it unlocks

Anything written for guitar in any era — classical, jazz, film score, lead sheets, big-band horn lines you want to play on guitar. Plus you can learn material from books and resources tab can't reach.

It's the single biggest "musician credibility" skill, and it takes 90 days of daily practice to get to functional.
$md$,
 11),

-- =============================================================
('rs-craft-hybrid-picking',
 'Hybrid picking — pick + fingers together',
 'technique', 5, 12,
 'Hold the pick between thumb and index. Use middle and ring fingers to pluck the higher strings. Twice the texture, half the effort.',
 $md$
**Hybrid picking** is exactly what it sounds like: a pick in your hand AND your fingers picking strings at the same time. You get the attack of a flatpick on the lower strings AND the independence of fingerstyle on the higher strings.

It's the sound behind country chicken-pickin', most modern jazz fusion, a lot of progressive rock, and almost every great session player on call in Nashville.

## The hand position

- Hold the pick the normal way (thumb + index).
- The index pick grip is **smaller** than usual — only a tiny bit of pick sticks out.
- Curl your **middle (m)** and **ring (a)** fingers loosely — they hover above the higher strings.
- Pinky usually rests on the body or floats free.

The hand should feel like a relaxed claw hovering over the strings.

## Your first hybrid pattern

Hold a **G major** chord. Try this:

```
Pick:    DOWN     —     —     —
Middle:    —     M     —     —
Ring:      —     —     A     —
Middle:    —     —     —     M

String:    6     3     2     3
Note:    bass    G     B     G
```

Your pick plays the bass note (string 6). Middle plucks string 3. Ring plucks string 2. Middle plucks string 3 again. **One bass, three high notes** — a familiar country feel.

Repeat over a chord change to **C major**: pick string 5 instead (C's bass note). Same finger pattern.

## What's hard about it

Your pick hand has been doing one thing your whole guitar life. Adding fingers introduces new motor patterns. The first week feels impossible — fingers crash into the pick, the pattern stalls, your hand cramps.

**The fix is slow practice.** 50 BPM. One pluck per click. Eyes on the picking hand. After 10 minutes you'll feel a switch flip.

## Where it unlocks

- Country leads with bass-note + chord stab patterns
- Banjo rolls on guitar
- Fast arpeggios (faster than alternate picking can manage)
- Bass-and-melody pieces (the fingerstyle territory) — but with the punch of a pick on the bass
- Chord-melody jazz — pick the bass, fingers handle the chord voicing

## After you have the basics

Steve Morse, Brent Mason, Albert Lee, Tom Bukovac — the masters of hybrid picking. Steal one lick from each. Slowly.
$md$,
 12),

-- =============================================================
('rs-craft-reharmonize',
 'Reharmonize a song you know',
 'theory', 5, 14,
 'Same melody, different chords underneath. The single biggest jump from "playing songs" to "writing songs."',
 $md$
**Reharmonization** is replacing the chords of a song while keeping the melody intact. You take *Twinkle Twinkle* and put jazz chords under it — same kid's tune, suddenly sounds like a Chet Baker arrangement. That's reharmonization.

Done well, it transforms a song. Done poorly, it sounds like you're fighting the melody. Like everything advanced, it's about *intention*.

## The substitution toolkit

### 1. Diatonic substitution

Within a key, certain chords share tones and feel similar. The **vi chord** can usually substitute for the I (they share two notes). The **iii** can sub for the I or the V. The **ii** can sub for the IV.

In **C major**: where you'd play C, try **Am**. Where you'd play G, try **Em**. Where you'd play F, try **Dm7**.

```chord
{ "name": "Am (sub for C)", "frets": ["x", 0, 2, 2, 1, 0], "fingers": [null, null, 2, 3, 1, null] }
```

```chord
{ "name": "Em (sub for G)", "frets": [0, 2, 2, 0, 0, 0], "fingers": [null, 2, 3, null, null, null] }
```

### 2. Tritone substitution

Replace a dominant 7 chord with a different dominant 7 whose root is a **tritone (6 half-steps) away**. **G7** and **D♭7** share the same 3rd and 7th — they sound similarly tense and resolve similarly.

This is the move that turns a country song into a jazz song.

### 3. Modal interchange

Borrow a chord from the parallel minor key. In **C major**, you can borrow **Fm** from C minor — the IV becomes minor, instantly creating that "hopeful-then-melancholy" sound (you've heard it in *Creep*, *Wonderwall*, half of Beatles songs).

### 4. Secondary dominants

Insert a V chord that resolves to ANY chord in the key, not just the I. In C major, before going to Am, play **E7** — it's the V of Am, creating a strong pull.

## How to actually do it

1. Take a song with simple chords (e.g., *Happy Birthday* in C: C, G, F).
2. Play through with the original chords first.
3. **One at a time**, swap a chord. Try Am where C was. Try Dm7 where F was.
4. **Sing the melody on top.** If the melody still sounds right, the substitution works.
5. Keep the substitutions you like; revert the ones that fight the melody.

It's a process of trial and ear training. After 50 reharmonizations you start to *predict* what subs will sound good.

## What it unlocks

Every great cover artist — Jeff Buckley's *Hallelujah*, Cassandra Wilson's takes on standards, Bill Frisell on anything — does this. Reharmonization is what turns a cover into an *interpretation*.
$md$,
 13),

-- =============================================================
('rs-craft-compose-piece',
 'Composing an original piece, start to finish',
 'theory', 5, 15,
 'Most guitarists noodle. Composing is making something that has a beginning, a middle, an end, and finishes. Then doing it again.',
 $md$
The hardest part of writing music isn't generating ideas. It's *finishing*. Most guitarists have a hundred half-songs and zero finished ones. Crossing from "fragment" to "complete piece" is its own milestone.

## The smallest viable structure

Pick a form before you write a note. Two of the easiest:

**A-A-B-A** (32 bars):
- A: 8-bar verse melody
- A: 8 bars, repeat
- B: 8-bar bridge (different key center, different feel)
- A: 8 bars, return

**Verse-Chorus-Verse-Chorus-Bridge-Chorus**:
- 16-bar verse
- 16-bar chorus
- repeat verse
- repeat chorus
- 16-bar bridge
- chorus to end

Most pop is some variant. Pick one and *commit before composing*. The structure forces you to finish.

## A 7-day composition challenge

This is the protocol that gets a piece done.

**Day 1:** Pick a key and form. Write down **the chord progression for the A section** (or verse). 4 chords, 8 bars. Do not move on.

**Day 2:** Write a **melody** over those 8 bars. Just hum it. Record into your phone. Don't transcribe yet.

**Day 3:** Translate the melody to guitar. Play it 5 times in a row, identical, with no fragments missing. (This is the day most people quit. Push through.)

**Day 4:** Compose the **B section** (bridge). Different key center, different melody. 8 bars.

**Day 5:** Stitch them together: A-A-B-A, played slowly, no stops.

**Day 6:** Refine. Adjust 2-3 notes that bothered you. Decide on dynamics.

**Day 7:** Record yourself playing it. Listen back. *Don't* re-record if it's slightly rough — accept it. Date the file. Move it to your "finished pieces" folder.

You now have one finished original. The next one will be easier.

## Why this matters

Once you've finished one piece, you've broken the spell. The next piece doesn't feel impossible. After ten pieces, you have an *album*. After fifty, you have a *style*.

But it all starts with finishing the first one.

## Reminder

Finished is better than perfect. *Always*.
$md$,
 14),

-- =============================================================
('rs-craft-record-track',
 'Recording a track that holds up',
 'technique', 5, 12,
 'Your playing on its own is one thing. Hearing it back, bare, in headphones, is another. Recording forces you to listen like a stranger.',
 $md$
**Recording** is the most brutal practice tool ever invented. The microphone hears every timing slip, every buzz, every breath. Tracks that sound great when you're *playing* them often sound thin and unsteady on playback.

The first time you record yourself well, you become a different player.

## The minimal recording setup

You don't need a studio. You need:

1. **A phone or computer with a microphone.** Both are fine for a starting point.
2. **A quiet room.** Close windows, turn off the AC, mute notifications.
3. **A recording app.** Voice Memos works (truly). For more control: GarageBand (free), Audacity (free), Reaper ($60), Logic Pro ($200).
4. **For electric:** an audio interface (Scarlett 2i2 ~$130) + your guitar plugged in. Or use AmpliTube/Neural DSP for amp simulation.

Total minimum cost: $0 if you already own a phone.

## The first take

Pick a song you've practiced. Play through it once, recording. Don't stop, don't restart, don't punch in fixes. Save the take.

**Now listen back in headphones.**

You will hear:
- A timing wobble in bar 4 you swore wasn't there
- A buzz on the C chord you never noticed
- A rushed bridge
- One section that's actually pretty good

This is the tape's gift. It's showing you exactly what to practice.

## The real practice loop

1. Record a take.
2. Listen back, take notes on what to fix.
3. Practice ONE thing that was wrong.
4. Record again.
5. Compare.

Iterate this for a week on a single song. The improvement is dramatic.

## When to call it "done"

A track holds up when:
- You can listen to it all the way through without flinching at a specific moment
- The timing is steady (use a metronome track)
- The dynamics breathe (it's not all the same volume)
- The performance is *committed* (no apologies, no half-strums)

That's the bar. It doesn't have to be radio-ready — just honest.

## After your first finished track

Make ten more. Different songs, different days. Save them all. After ten you'll see the arc of your own playing develop in a way no practice mirror can show.
$md$,
 15),

-- =============================================================
('rs-craft-gig-prep',
 'Playing a paid gig — what nobody tells you',
 'technique', 5, 14,
 'Practicing alone is one job. Playing for paying strangers is a completely different one. The gap is bigger than most players expect.',
 $md$
Practicing in your bedroom and playing for money are different skills. The first you build with reps. The second you build with **gigs**.

This lesson is about the second.

## What a paid gig actually demands

Things that don't matter when you practice but matter on stage:

- **Setlist length.** A bar-band set is 45 minutes. A wedding gig is 4 hours. You need that much *prepared* material — and a margin extra.
- **Recovery.** You will mess up live. Your job is to recover so smoothly the audience doesn't notice. Not stop. Not apologize. Land on the next downbeat.
- **Tone in the room.** Your bedroom tone doesn't translate. Stage tone is darker, less bright — it cuts through other instruments and PA.
- **Stamina.** Three hours of barre chords with light strings can leave your hand cramping. Train for endurance, not just accuracy.
- **Repertoire breadth.** A bride wants *Wonderful Tonight*. A drunk uncle wants *Sweet Home Alabama*. A bartender wants something quiet at midnight. Have all three.

## The first gig — how to actually book it

1. **Open mics first.** Every town has them. Free, low-stakes, 2-3 song slots. Do five open mics before you book anything paying. Learn how a stage feels.
2. **Coffee shops, breweries, restaurants.** Email the manager. "Hi, I'm a local guitarist who'd like to play your Tuesday evenings. I'd play for tips + a free meal." That's a real first paid gig — you traded a meal for stage time.
3. **Weddings, parties.** Once you have a 3-hour repertoire and a clean enough sound, post on Thumbtack, Bash, GigSalad. Charge $150-300 for the first few. Move up as you get reviews.
4. **Subbing in for a band.** Local bands lose members. Get on Facebook groups in your scene. Be the easy, reliable, non-drama-causing player. The work comes.

## What you'll learn from your first 5 gigs

- That you don't actually need 5,000 songs — you need *50 great ones*.
- That tuning between songs is a skill (the gig tuner you built into this app helps).
- That breaking a string mid-song is recoverable.
- That audiences don't care about technical perfection. They care about *feel* and *commitment*.
- That getting paid for music — even $100 — changes your relationship to the instrument forever.

## The honest reality

Gigging is harder than practice but easier than the version in your head. Every player who eventually got paid started where you are now: terrified, under-rehearsed, unsure if they were "ready."

You're as ready as you'll be. Book one.
$md$,
 16),

-- =============================================================
('rs-craft-teach-others',
 'Teaching someone else to play',
 'technique', 4, 11,
 'Until you''ve tried to teach someone an open chord, you don''t actually understand the open chord. Teaching is the deepest form of learning.',
 $md$
There's a saying in education: *to learn, teach*. Until you've sat across from a beginner and tried to explain how to fret a clean E minor, you don't really understand E minor.

Teaching another guitarist is the milestone that closes the loop on everything else.

## You are ready when

You don't need to be advanced to teach a beginner. You need to be **one chapter ahead of them**.

If you can play 5 open chords and switch between them, you can teach someone their first chord. If you can read tab, you can teach someone how. The threshold for being a useful teacher is *much lower* than people think.

## Who to teach

- A friend or partner who's expressed interest
- A nephew, niece, or younger sibling
- A coworker
- A stranger via volunteer at a community center, school, or rehab program
- (Eventually, paid lessons — when you're a year or two ahead of beginners and can teach for $30-50/hour)

Pick the first person who fits and asks.

## The first lesson plan (60 minutes)

This is a complete beginner's first session.

**0:00-5:00** — Chat. Get to know them. What kind of music do they want to play?

**5:00-10:00** — Hold the guitar. Posture. *They* hold it.

**10:00-15:00** — Name the strings (E A D G B E). They name them aloud.

**15:00-25:00** — One chord. **E minor.** Two fingers, all six strings. Get them to make it ring cleanly. Don't introduce a second chord this lesson.

**25:00-35:00** — Strumming. Down strums on the click of a metronome at 60 BPM. Just one chord, plus a steady down-strum, in time.

**35:00-45:00** — Tab. Show them what tab is. Let them play one note from a tab.

**45:00-55:00** — Pick a song. *Have them pick.* The motivation matters more than the lesson plan.

**55:00-60:00** — What to practice this week. Send them away with three things, not ten. (Em chord clean. Strum in time. Pluck individual strings.)

## What you'll learn

- How much you take for granted. Holding a pick, fretting clean — these are *huge* for a beginner.
- That patience is teachable. Yours expands the more you teach.
- That every student is different. What works for one bores another.
- That your own playing reveals itself in new ways when you describe it. You'll catch your own bad habits by trying to NOT teach them.

## Why this is the milestone

Most guitarists never teach. They stay alone with the instrument forever. Teaching someone else is the moment guitar stops being just yours and starts being part of a longer line of musicians, each handing it to the next.

Every guitarist who ever became any good was taught by someone. Pay it back.
$md$,
 17);

-- =============================================================
-- Theory links (where applicable)
-- =============================================================
insert into public.lesson_theory_links (lesson_id, theory_entry_id)
select l.id, t.theory
from public.lessons l
join (values
  ('rs-craft-chord-tones', 'intervals'),
  ('rs-craft-chord-tones', 'caged'),
  ('rs-craft-reharmonize', 'circle-of-fifths'),
  ('rs-craft-reharmonize', 'intervals'),
  ('rs-craft-compose-piece', 'circle-of-fifths'),
  ('rs-craft-compose-piece', 'major-scale'),
  ('rs-craft-read-notation', 'major-scale')
) as t(slug, theory) on l.slug = t.slug;
