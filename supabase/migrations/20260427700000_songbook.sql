-- Songbook: public-domain folk songs with inline-chord lyrics.
-- Lyrics use a [Chord] marker syntax: "[Am]House of the [C]rising [D]sun".
-- Sections are { label, lines: ["...", "..."] }.

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  composer text,                          -- attribution where known
  era text,                               -- "trad", "1779", "1848"
  key_root text not null,
  key_quality text not null default 'major',
  bpm smallint not null default 90,
  time_signature text not null default '4/4',
  capo smallint not null default 0,
  difficulty smallint not null default 2,
  intro text,                             -- short intro / playing notes (markdown)
  sections jsonb not null,                -- [{ label, lines: [...] }]
  source_note text,                       -- "trad. American folk"
  sort_order smallint not null default 100,
  inserted_at timestamptz not null default now()
);

create index if not exists songs_difficulty_idx on public.songs(difficulty);
create index if not exists songs_sort_idx on public.songs(sort_order);

alter table public.songs enable row level security;

drop policy if exists "songs: select all" on public.songs;
create policy "songs: select all"
  on public.songs for select using (true);

-- ───────────── Seed: 12 public-domain songs ─────────────

insert into public.songs (slug, title, composer, era, key_root, key_quality, bpm, capo, difficulty, intro, sections, source_note, sort_order) values

('house-of-the-rising-sun',
 'The House of the Rising Sun',
 null, 'trad. American folk', 'A', 'minor', 76, 0, 2,
 'Arpeggiate each chord — don''t strum. Eight beats per chord. The original is in 6/8 but 4/4 with eighth-note arpeggios works fine.',
 '[
   {"label":"Verse 1","lines":[
     "There [Am]is a [C]house in [D]New Or[F]leans",
     "They [Am]call the [C]Rising [E7]Sun",
     "And it''s [Am]been the [C]ruin of [D]many a poor [F]boy",
     "And [Am]God I [E7]know I''m [Am]one"
   ]},
   {"label":"Verse 2","lines":[
     "My [Am]mother [C]was a [D]tailor[F]",
     "She [Am]sewed my [C]new blue [E7]jeans",
     "My [Am]father [C]was a [D]gamblin'' [F]man",
     "Down in [Am]New Or[E7]leans[Am]"
   ]}
 ]'::jsonb,
 'Traditional American folk ballad, public domain. Made famous by The Animals (1964) but predates them by decades.', 10),

('wayfaring-stranger',
 'Wayfaring Stranger',
 null, 'trad. American spiritual', 'E', 'minor', 70, 0, 2,
 'Slow and reverent. Let chords ring as long as possible. Em is home — every phrase wants to come back to it.',
 '[
   {"label":"Verse 1","lines":[
     "I''m just a [Em]poor wayfaring [Am]stranger",
     "Travelin'' [B7]through this world of [Em]woe",
     "But there''s no [Em]sickness, toil, or [Am]danger",
     "In that [Em]bright land [B7]to which I [Em]go"
   ]},
   {"label":"Chorus","lines":[
     "I''m goin'' [Em]there to see my [Am]father",
     "I''m goin'' [B7]there no more to [Em]roam",
     "I''m only [Em]goin'' over [Am]Jordan",
     "I''m only [Em]goin'' [B7]over [Em]home"
   ]}
 ]'::jsonb,
 'Traditional American spiritual, public domain.', 20),

('scarborough-fair',
 'Scarborough Fair',
 null, 'trad. English ballad (16th c.)', 'D', 'minor', 72, 0, 3,
 'Fingerpick or arpeggiate — strumming kills the mood. The melody sits over the chord changes; let it breathe.',
 '[
   {"label":"Verse 1","lines":[
     "[Dm]Are you going to [C]Scarborough [Dm]Fair",
     "[Dm]Parsley, [F]sage, rose[C]mary, and [Dm]thyme",
     "Re[F]member me [Dm]to one who [C]lives [F]there",
     "[Dm]She once [C]was a true love of [Dm]mine"
   ]},
   {"label":"Verse 2","lines":[
     "[Dm]Tell her to make me a [C]cambric [Dm]shirt",
     "[Dm]Parsley, [F]sage, rose[C]mary, and [Dm]thyme",
     "With[F]out no seam nor [Dm]needle[C]work [F]",
     "[Dm]Then she''ll [C]be a true love of [Dm]mine"
   ]}
 ]'::jsonb,
 'Traditional English ballad, originating in the late Middle Ages. The Simon & Garfunkel arrangement (1966) is copyrighted but this melody and lyrics are public domain.', 30),

('amazing-grace',
 'Amazing Grace',
 'John Newton (lyrics)', '1779', 'G', 'major', 72, 0, 1,
 'Three chords. The simplest hymn ever, and one of the most powerful. Play it slow, mean it.',
 '[
   {"label":"Verse 1","lines":[
     "A[G]mazing [G7]grace, how [C]sweet the [G]sound",
     "That [G]saved a [Em]wretch like [D]me",
     "I [G]once was [G7]lost, but [C]now am [G]found",
     "Was [G]blind, but [D]now I [G]see"
   ]},
   {"label":"Verse 2","lines":[
     "''Twas [G]grace that [G7]taught my [C]heart to [G]fear",
     "And [G]grace my [Em]fears re[D]lieved",
     "How [G]precious [G7]did that [C]grace ap[G]pear",
     "The [G]hour I [D]first be[G]lieved"
   ]}
 ]'::jsonb,
 'Lyrics by John Newton (1779). Melody traditional. Public domain.', 40),

('greensleeves',
 'Greensleeves',
 null, 'trad. English (1580)', 'A', 'minor', 88, 0, 4,
 'Fingerstyle with a strong thumb-bass. The dance feel is a slow 6/8 — count "1-2-3, 4-5-6". Notated here in 4/4 for simplicity.',
 '[
   {"label":"Verse 1","lines":[
     "A[Am]las my [G]love you [F]do me [E7]wrong",
     "To [Am]cast me [G]off dis[F]courteously [E7]",
     "And [Am]I have [G]loved you [F]oh so [E7]long",
     "De[Am]lighting [E7]in your [Am]company"
   ]},
   {"label":"Chorus","lines":[
     "Green[C]sleeves was [G]all my [F]joy [E7]",
     "Green[Am]sleeves was [G]my de[F]light [E7]",
     "Green[C]sleeves was my [G]heart of [F]gold [E7]",
     "And [Am]who but my [E7]lady Green[Am]sleeves"
   ]}
 ]'::jsonb,
 'Traditional English ballad, registered 1580. Public domain.', 50),

('the-water-is-wide',
 'The Water Is Wide',
 null, 'trad. Scottish folk', 'D', 'major', 76, 0, 2,
 'Tender and slow. Each chord wants to ring. The G/B and D/F♯ inversions in some arrangements add a walking bass — your call whether to add them.',
 '[
   {"label":"Verse 1","lines":[
     "The [D]water is [G]wide, I [D]cannot cross [Bm]over",
     "And [G]neither have [D]I wings to [A]fly[A7]",
     "[D]Build me a [G]boat that can [D]carry [Bm]two",
     "And [G]both shall [D]row, my [A]love and [D]I"
   ]},
   {"label":"Verse 2","lines":[
     "There [D]is a [G]ship and [D]she sails the [Bm]sea",
     "She''s [G]loaded [D]deep as [A]deep can [A7]be",
     "But [D]not so [G]deep as the [D]love I''m [Bm]in",
     "I [G]know not [D]how I [A]sink or [D]swim"
   ]}
 ]'::jsonb,
 'Traditional Scottish folk song, public domain.', 60),

('wildwood-flower',
 'Wildwood Flower',
 null, '1860 (Maud Irving / Joseph Webster)', 'C', 'major', 100, 0, 2,
 'Country waltz feel — boom-chick-a strum. The Carter Family made this famous; the song itself predates them.',
 '[
   {"label":"Verse 1","lines":[
     "Oh [C]I''ll twine with my [G]mingles and [C]waving black hair",
     "With the [C]roses so red and the [G]lilies so [C]fair",
     "And the [C]myrtles so bright with the [G]emerald [C]hue",
     "And the [C]pale aronatus with [G]eyes of [C]blue"
   ]},
   {"label":"Verse 2","lines":[
     "I''ll [C]dance and I''ll [G]sing and my [C]life shall be gay",
     "I''ll [C]charm every heart in this [G]crown I''ll dis[C]play",
     "I''ll [C]live yet to see him re[G]gret the dark [C]hour",
     "When he [C]won then ne''glect me, this [G]frail wildwood [C]flower"
   ]}
 ]'::jsonb,
 'Lyrics 1860, music 1860 by Joseph Philbrick Webster. Public domain.', 70),

('down-in-the-valley',
 'Down in the Valley',
 null, 'trad. American folk', 'G', 'major', 90, 0, 1,
 'Two chords. Easiest song in the book. Sing it slow, like a lullaby.',
 '[
   {"label":"Verse 1","lines":[
     "[G]Down in the valley, the [D]valley so low",
     "[D]Hang your head over, [G]hear the wind blow",
     "[G]Hear the wind blow, dear, [D]hear the wind blow",
     "[D]Hang your head over, [G]hear the wind blow"
   ]},
   {"label":"Verse 2","lines":[
     "[G]Roses love sunshine, [D]violets love dew",
     "[D]Angels in heaven [G]know I love you",
     "[G]Know I love you, dear, [D]know I love you",
     "[D]Angels in heaven [G]know I love you"
   ]}
 ]'::jsonb,
 'Traditional American folk song, public domain. Recorded thousands of times since the 1920s.', 80),

('in-the-pines',
 'In the Pines',
 null, 'trad. American folk', 'E', 'minor', 80, 0, 2,
 'Dark and haunting. Hammer-on the second fret of the A string for that classic mountain-folk lick after Em.',
 '[
   {"label":"Verse 1","lines":[
     "Black [Em]girl, black girl, [B7]don''t lie to [Em]me",
     "Tell me [Am]where did you [Em]sleep last [B7]night",
     "[Em]In the pines, in the pines, [B7]where the sun don''t ever [Em]shine",
     "I shi[Am]vered the [B7]whole night [Em]through"
   ]},
   {"label":"Verse 2","lines":[
     "My [Em]husband was a [B7]hard-working [Em]man",
     "Killed a [Am]mile and a [Em]half from [B7]here",
     "[Em]His head was found in the [B7]driver''s wheel",
     "But his [Am]body never [B7]was [Em]found"
   ]}
 ]'::jsonb,
 'Traditional American folk ballad. Lead Belly''s 1944 version is copyrighted; this older form is public domain.', 90),

('oh-susanna',
 'Oh Susanna',
 'Stephen Foster', '1848', 'C', 'major', 120, 0, 1,
 'Bouncy minstrel tune. Strum on every beat with extra emphasis on 1 and 3.',
 '[
   {"label":"Verse 1","lines":[
     "I [C]come from Alabama with a [G7]banjo on my knee",
     "I''m [C]going to Louisiana, my [G7]true love for to [C]see"
   ]},
   {"label":"Chorus","lines":[
     "Oh [C]Susanna, oh [G7]don''t you cry for me",
     "For I [C]come from Alabama with a [G7]banjo on my [C]knee"
   ]}
 ]'::jsonb,
 'Stephen Foster, 1848. Public domain.', 100),

('john-henry',
 'John Henry',
 null, 'trad. American work song', 'A', 'major', 110, 0, 2,
 'Hard-driving folk. Strum down on every beat. Add palm-muting on the verses for tension; open up on the chorus.',
 '[
   {"label":"Verse 1","lines":[
     "When [A]John Henry was a [D]little baby",
     "[A]Sittin'' on his daddy''s [E7]knee",
     "[A]He picked up a [D]hammer and a little piece of steel",
     "Said this [A]hammer''s gonna [E7]be the death of [A]me"
   ]},
   {"label":"Verse 2","lines":[
     "John [A]Henry said to his [D]captain",
     "A [A]man ain''t nothin'' but a [E7]man",
     "And be[A]fore I let your [D]steam drill beat me down",
     "I''ll die [A]with this hammer [E7]in my [A]hand"
   ]}
 ]'::jsonb,
 'Traditional American work song / ballad, public domain.', 110),

('red-river-valley',
 'Red River Valley',
 null, 'trad. American/Canadian folk', 'G', 'major', 100, 0, 1,
 'Cowboy waltz feel. Three chords, gentle strum.',
 '[
   {"label":"Verse 1","lines":[
     "From this [G]valley they [C]say you are [G]going",
     "We will [G]miss your bright [D]eyes and sweet [D7]smile",
     "For they [G]say you are [C]taking the [G]sunshine",
     "That has [G]brightened our [D]pathway a [G]while"
   ]},
   {"label":"Chorus","lines":[
     "Come and [G]sit by my [C]side if you [G]love me",
     "Do not [G]hasten to [D]bid me a[D7]dieu",
     "Just re[G]member the [C]Red River [G]Valley",
     "And the [G]cowboy who [D]loved you so [G]true"
   ]}
 ]'::jsonb,
 'Traditional, late 19th-century North American folk song. Public domain.', 120);
