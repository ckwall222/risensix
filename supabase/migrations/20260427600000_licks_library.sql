-- Lick library: short curated phrases for soloing practice.
-- Each lick is a JSON note sequence: { string, fret, beat, duration }.
-- Read-only for users (no per-user state); writes are admin-only via service role.

create table if not exists public.licks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  summary text not null,
  genre text not null,                  -- blues, rock, country, jazz, folk
  key_root text not null,               -- A, B♭, etc.
  key_quality text not null default 'minor', -- major | minor | dominant | mixolydian
  difficulty smallint not null,         -- 1-5 mirroring lessons
  bpm smallint not null,                -- recommended tempo
  feel text not null default 'straight',-- straight | shuffle | swing
  bars smallint not null default 2,
  notes jsonb not null,                 -- [{ string, fret, beat, duration?, bend?, slide? }]
  instructor_notes text not null,
  position_label text,                  -- e.g. "Box 1, 5th fret"
  sort_order smallint not null default 100,
  inserted_at timestamptz not null default now()
);

create index if not exists licks_genre_idx on public.licks(genre);
create index if not exists licks_difficulty_idx on public.licks(difficulty);
create index if not exists licks_sort_idx on public.licks(sort_order);

alter table public.licks enable row level security;

drop policy if exists "licks: select all" on public.licks;
create policy "licks: select all"
  on public.licks for select using (true);

-- Seed: 12 licks across blues, rock, country, jazz, folk
insert into public.licks (slug, name, summary, genre, key_root, key_quality, difficulty, bpm, feel, bars, notes, instructor_notes, position_label, sort_order) values

-- ── Blues ────────────────────────────────────────────────
('blues-am-pent-classic',
 'Classic A minor pentatonic turnaround',
 'The lick every blues player learns first. Box 1, two bars, ends on the root.',
 'blues', 'A', 'minor', 2, 90, 'shuffle', 2,
 '[
   {"string":1,"fret":8,"beat":0,"duration":0.5},
   {"string":1,"fret":5,"beat":0.5,"duration":0.5},
   {"string":2,"fret":8,"beat":1,"duration":0.5},
   {"string":2,"fret":5,"beat":1.5,"duration":0.5},
   {"string":3,"fret":7,"beat":2,"duration":0.5},
   {"string":3,"fret":5,"beat":2.5,"duration":0.5},
   {"string":4,"fret":7,"beat":3,"duration":1},
   {"string":4,"fret":5,"beat":4,"duration":2},
   {"string":5,"fret":7,"beat":6,"duration":2}
 ]'::jsonb,
 'Phrase it like a question and an answer. The first bar climbs and falls; the second bar lands you home on A.

**Pick attack:** moderate. Let each note ring. Don''t mute aggressively — blues lives in the sustain.

**Variation:** add a half-step bend on the 7th fret of the 3rd string for the BB King flavor.',
 'A min pent · Box 1 · 5th fret', 10),

('blues-bb-king-tribute',
 'BB King box bend',
 'The signature 8th-fret bend. Two notes that say more than a hundred.',
 'blues', 'A', 'minor', 3, 80, 'shuffle', 2,
 '[
   {"string":2,"fret":8,"beat":0,"duration":1,"bend":1},
   {"string":2,"fret":8,"beat":1,"duration":1},
   {"string":3,"fret":7,"beat":2,"duration":0.5},
   {"string":3,"fret":5,"beat":2.5,"duration":1.5},
   {"string":4,"fret":5,"beat":4,"duration":4}
 ]'::jsonb,
 'The whole lick is two phrases sitting on the upper-box "BB King box" at fret 8.

**The bend:** target the 9th fret pitch (a whole step). Use your ring finger reinforced by middle and index. Don''t over-bend — listen for the destination pitch and hold there.

**The release:** just as important as the bend. Bring it down musically, don''t snap.',
 'BB King box · 8th fret', 11),

('blues-mixed-major-minor',
 'Major-minor blend',
 'Slips between A minor and A major pentatonic — the secret sauce of every great blues solo.',
 'blues', 'A', 'minor', 3, 95, 'shuffle', 2,
 '[
   {"string":3,"fret":5,"beat":0,"duration":0.5},
   {"string":3,"fret":6,"beat":0.5,"duration":0.5},
   {"string":3,"fret":7,"beat":1,"duration":0.5},
   {"string":2,"fret":5,"beat":1.5,"duration":0.5},
   {"string":2,"fret":8,"beat":2,"duration":0.5,"bend":1},
   {"string":2,"fret":5,"beat":3,"duration":0.5},
   {"string":3,"fret":7,"beat":3.5,"duration":0.5},
   {"string":3,"fret":5,"beat":4,"duration":2},
   {"string":4,"fret":7,"beat":6,"duration":2}
 ]'::jsonb,
 'The 6th fret on the 3rd string is the minor third **passing into** the major third (7th fret) — that''s the magic move.

**Tip:** play it confident. If you sneak into the major-third, it sounds wrong. If you commit, it sounds like Clapton.',
 'Hybrid pent · 5th fret', 12),

-- ── Rock ─────────────────────────────────────────────────
('rock-am-pent-pull-off',
 'Pull-off rock fury',
 'Aggressive minor pentatonic with hammer-on/pull-off triplets. Pure rock energy.',
 'rock', 'A', 'minor', 3, 130, 'straight', 2,
 '[
   {"string":1,"fret":8,"beat":0,"duration":0.333},
   {"string":1,"fret":5,"beat":0.333,"duration":0.333},
   {"string":2,"fret":8,"beat":0.667,"duration":0.333},
   {"string":1,"fret":8,"beat":1,"duration":0.333},
   {"string":1,"fret":5,"beat":1.333,"duration":0.333},
   {"string":2,"fret":8,"beat":1.667,"duration":0.333},
   {"string":2,"fret":5,"beat":2,"duration":0.5},
   {"string":3,"fret":7,"beat":2.5,"duration":0.5},
   {"string":3,"fret":5,"beat":3,"duration":0.5},
   {"string":4,"fret":7,"beat":3.5,"duration":0.5},
   {"string":4,"fret":5,"beat":4,"duration":4}
 ]'::jsonb,
 'Triplets — three notes per beat. Each pair after the first downstroke is a pull-off.

**Pick once per group of three.** Pull-offs make the second and third notes ring without picking.

**Goal:** clean triplets with consistent volume. If the pull-off notes get quiet, dig in harder with the fret hand.',
 'A min pent · 5th fret', 20),

('rock-em-power-riff',
 'E minor power-chord climb',
 'Open-string riff. Sounds huge through any amp with a hint of distortion.',
 'rock', 'E', 'minor', 1, 110, 'straight', 2,
 '[
   {"string":6,"fret":0,"beat":0,"duration":0.5},
   {"string":6,"fret":3,"beat":0.5,"duration":0.5},
   {"string":6,"fret":5,"beat":1,"duration":0.5},
   {"string":6,"fret":0,"beat":1.5,"duration":0.5},
   {"string":5,"fret":2,"beat":2,"duration":0.5},
   {"string":5,"fret":3,"beat":2.5,"duration":0.5},
   {"string":5,"fret":5,"beat":3,"duration":0.5},
   {"string":6,"fret":0,"beat":3.5,"duration":0.5},
   {"string":6,"fret":0,"beat":4,"duration":0.5},
   {"string":6,"fret":3,"beat":4.5,"duration":0.5},
   {"string":6,"fret":5,"beat":5,"duration":0.5},
   {"string":6,"fret":7,"beat":5.5,"duration":0.5},
   {"string":6,"fret":5,"beat":6,"duration":2}
 ]'::jsonb,
 'Palm-mute the low E open string for that chunky bridge tone. Let the fretted notes ring out.

**Right hand:** rest the side of your palm just barely on the bridge. Move it forward off the strings for the fretted notes, back on for the open Es.

**Volume dynamics matter here.** The open E should be quieter than the climb, so the climb feels like it''s rising.',
 'Open position', 21),

('rock-five-note-flurry',
 'Five-note climbing run',
 'Fast Em pentatonic climb across four strings. Builds wrist speed.',
 'rock', 'E', 'minor', 4, 140, 'straight', 2,
 '[
   {"string":4,"fret":2,"beat":0,"duration":0.25},
   {"string":4,"fret":5,"beat":0.25,"duration":0.25},
   {"string":3,"fret":2,"beat":0.5,"duration":0.25},
   {"string":3,"fret":4,"beat":0.75,"duration":0.25},
   {"string":2,"fret":3,"beat":1,"duration":0.25},
   {"string":2,"fret":5,"beat":1.25,"duration":0.25},
   {"string":1,"fret":3,"beat":1.5,"duration":0.25},
   {"string":1,"fret":5,"beat":1.75,"duration":0.25},
   {"string":1,"fret":7,"beat":2,"duration":0.5,"bend":1},
   {"string":1,"fret":5,"beat":2.5,"duration":0.5},
   {"string":2,"fret":3,"beat":3,"duration":1},
   {"string":2,"fret":5,"beat":4,"duration":4}
 ]'::jsonb,
 'Strict alternate picking. Down-up-down-up, never two of the same in a row.

**Start at 80 BPM.** Only speed up when every note is clean. Speed comes from accuracy, not effort.

**The bend at the top:** full step. Land on it, sustain, then descend.',
 'E min pent · 2nd fret', 22),

-- ── Country ──────────────────────────────────────────────
('country-g-double-stop',
 'G major double-stop',
 'Two-note country bend that sounds like a pedal-steel cry. Sweet and twangy.',
 'country', 'G', 'major', 3, 100, 'straight', 2,
 '[
   {"string":3,"fret":7,"beat":0,"duration":0.5,"bend":1},
   {"string":2,"fret":8,"beat":0,"duration":0.5},
   {"string":3,"fret":7,"beat":0.5,"duration":0.5},
   {"string":2,"fret":8,"beat":0.5,"duration":0.5},
   {"string":3,"fret":7,"beat":1,"duration":0.5},
   {"string":2,"fret":8,"beat":1,"duration":0.5},
   {"string":1,"fret":7,"beat":2,"duration":0.5},
   {"string":2,"fret":8,"beat":2.5,"duration":0.5},
   {"string":3,"fret":7,"beat":3,"duration":1},
   {"string":4,"fret":5,"beat":4,"duration":4}
 ]'::jsonb,
 'Bend the 3rd string up a whole step **while holding** the 2nd string steady. The two strings rub against each other — that pedal-steel sound.

**Picking:** strike both strings together with one downstroke. Use a hybrid grip if you have one (pick + middle finger).

**Tip:** Brad Paisley and Brent Mason live here. So can you.',
 'G major · 7th fret', 30),

('country-chicken-pickin',
 'Chicken-pickin staccato',
 'Hybrid-picked staccato G major. Crisp, percussive, pure Telecaster.',
 'country', 'G', 'major', 4, 120, 'straight', 2,
 '[
   {"string":3,"fret":4,"beat":0,"duration":0.25},
   {"string":2,"fret":3,"beat":0.5,"duration":0.25},
   {"string":1,"fret":3,"beat":1,"duration":0.25},
   {"string":2,"fret":3,"beat":1.5,"duration":0.25},
   {"string":3,"fret":4,"beat":2,"duration":0.25},
   {"string":2,"fret":3,"beat":2.5,"duration":0.25},
   {"string":3,"fret":7,"beat":3,"duration":0.5,"bend":0.5},
   {"string":3,"fret":4,"beat":3.5,"duration":0.5},
   {"string":4,"fret":5,"beat":4,"duration":4}
 ]'::jsonb,
 'Each note is short — like clipped speech. Mute with your right-hand palm right after each strike.

**Hybrid picking:** use the pick on the 3rd and 4th strings, your middle finger to snap the 1st and 2nd.

**That snap is the chicken cluck.** The middle-finger pluck literally pulls the string up and lets it slap against the fret.',
 'G major · open + 4th fret', 31),

-- ── Jazz ─────────────────────────────────────────────────
('jazz-251-resolution',
 'ii-V-I bebop resolution',
 'Classic bebop scale run resolving onto a Cmaj7. Plays through Dm7 → G7 → Cmaj7.',
 'jazz', 'C', 'major', 4, 140, 'swing', 2,
 '[
   {"string":4,"fret":5,"beat":0,"duration":0.5},
   {"string":3,"fret":4,"beat":0.5,"duration":0.5},
   {"string":3,"fret":5,"beat":1,"duration":0.5},
   {"string":3,"fret":7,"beat":1.5,"duration":0.5},
   {"string":2,"fret":5,"beat":2,"duration":0.5},
   {"string":2,"fret":6,"beat":2.5,"duration":0.5},
   {"string":2,"fret":8,"beat":3,"duration":0.5},
   {"string":1,"fret":5,"beat":3.5,"duration":0.5},
   {"string":1,"fret":8,"beat":4,"duration":0.5},
   {"string":1,"fret":7,"beat":4.5,"duration":0.5},
   {"string":1,"fret":5,"beat":5,"duration":0.5},
   {"string":2,"fret":5,"beat":5.5,"duration":0.5},
   {"string":3,"fret":5,"beat":6,"duration":2}
 ]'::jsonb,
 'The Dm7 phrase outlines the chord tones (D, F, A, C). The G7 phrase chromatically approaches the major-third of C (the 5th fret of the 1st string). Resolution to Cmaj7 lands on E (the major 3rd).

**Swing the eighths.** Long-short-long-short feel — not even.

**The chromatic approach** (8 → 7 → 5 on string 1) is the jazz vocabulary that distinguishes a bebop line from a pentatonic run.',
 'C major · 5th-8th fret', 40),

-- ── Folk / fingerstyle ───────────────────────────────────
('folk-travis-pattern',
 'Travis-picking C → G',
 'Alternating-bass fingerpicking pattern. The foundation of folk and country fingerstyle.',
 'folk', 'C', 'major', 3, 95, 'straight', 2,
 '[
   {"string":5,"fret":3,"beat":0,"duration":0.5},
   {"string":3,"fret":0,"beat":0.5,"duration":0.5},
   {"string":4,"fret":2,"beat":1,"duration":0.5},
   {"string":2,"fret":1,"beat":1.5,"duration":0.5},
   {"string":5,"fret":3,"beat":2,"duration":0.5},
   {"string":1,"fret":0,"beat":2.5,"duration":0.5},
   {"string":4,"fret":2,"beat":3,"duration":0.5},
   {"string":2,"fret":1,"beat":3.5,"duration":0.5},
   {"string":6,"fret":3,"beat":4,"duration":0.5},
   {"string":3,"fret":0,"beat":4.5,"duration":0.5},
   {"string":4,"fret":0,"beat":5,"duration":0.5},
   {"string":2,"fret":0,"beat":5.5,"duration":0.5},
   {"string":6,"fret":3,"beat":6,"duration":0.5},
   {"string":1,"fret":3,"beat":6.5,"duration":0.5},
   {"string":4,"fret":0,"beat":7,"duration":0.5},
   {"string":2,"fret":0,"beat":7.5,"duration":0.5}
 ]'::jsonb,
 'Thumb plays bass notes (strings 4-6), fingers pluck treble strings (1-3).

**Right-hand assignments:** thumb = string 5 or 6, index = string 3, middle = string 2, ring = string 1.

**The trick:** the thumb keeps a steady quarter-note pulse no matter what the fingers do. Practice the thumb alone first — make it relentless.',
 'Open position', 50),

('folk-em-arpeggio',
 'Em arpeggio cascade',
 'Open-string ringing arpeggio. Beautiful for intros and breakdowns.',
 'folk', 'E', 'minor', 2, 80, 'straight', 2,
 '[
   {"string":6,"fret":0,"beat":0,"duration":0.5},
   {"string":4,"fret":2,"beat":0.5,"duration":0.5},
   {"string":3,"fret":0,"beat":1,"duration":0.5},
   {"string":2,"fret":0,"beat":1.5,"duration":0.5},
   {"string":1,"fret":0,"beat":2,"duration":0.5},
   {"string":2,"fret":3,"beat":2.5,"duration":0.5},
   {"string":1,"fret":0,"beat":3,"duration":0.5},
   {"string":2,"fret":0,"beat":3.5,"duration":0.5},
   {"string":3,"fret":0,"beat":4,"duration":0.5},
   {"string":4,"fret":2,"beat":4.5,"duration":0.5},
   {"string":5,"fret":2,"beat":5,"duration":0.5},
   {"string":6,"fret":0,"beat":5.5,"duration":0.5},
   {"string":3,"fret":2,"beat":6,"duration":2}
 ]'::jsonb,
 'Let every note ring as long as physically possible. Don''t lift your fretting fingers between notes.

**Pick or fingers:** either works. Fingerstyle gives a softer sound. Pick gives more attack and clarity.

**The 3rd-fret note on string 2** (G) is the magic — it adds the ♭6 against the Em chord tones, creating that wistful, almost minor-key-sad feeling.',
 'Open position', 51),

-- ── Mastery showcase ─────────────────────────────────────
('blues-stevie-ray-shuffle',
 'SRV-style shuffle riff',
 'Texas blues shuffle. Sliding sixths and aggressive double-stops.',
 'blues', 'E', 'minor', 5, 110, 'shuffle', 2,
 '[
   {"string":6,"fret":0,"beat":0,"duration":0.333},
   {"string":5,"fret":2,"beat":0.333,"duration":0.333},
   {"string":4,"fret":2,"beat":0.667,"duration":0.333},
   {"string":6,"fret":0,"beat":1,"duration":0.5},
   {"string":5,"fret":3,"beat":1.5,"duration":0.5},
   {"string":6,"fret":0,"beat":2,"duration":0.333},
   {"string":5,"fret":2,"beat":2.333,"duration":0.333},
   {"string":4,"fret":2,"beat":2.667,"duration":0.333},
   {"string":3,"fret":1,"beat":3,"duration":0.5},
   {"string":2,"fret":3,"beat":3.5,"duration":0.5},
   {"string":1,"fret":3,"beat":4,"duration":0.5,"bend":1},
   {"string":1,"fret":0,"beat":5,"duration":0.5},
   {"string":2,"fret":0,"beat":5.5,"duration":0.5},
   {"string":3,"fret":0,"beat":6,"duration":2}
 ]'::jsonb,
 'Big sound, hard pick attack. SRV used heavy strings tuned down a half step — you don''t have to, but pick like you do.

**The shuffle feel:** triplets where the middle note is silent. Long-rest-short, long-rest-short.

**The bend at fret 3 of string 1** is going to feel stiff with light strings. Reinforce with two fingers behind it.

This is a Stage 5 lick. Don''t expect to nail it on day one.',
 'Open + 1st-3rd fret', 60);
