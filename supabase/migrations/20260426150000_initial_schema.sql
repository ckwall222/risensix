-- Risen Six — initial database schema
-- Run this in Supabase Dashboard → SQL Editor → New Query → Paste → Run.

-- =============================================================
-- 1. profiles — extends auth.users with curriculum-specific data
-- =============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  ability_level text check (ability_level in (
    'absolute_beginner', 'beginner', 'novice', 'intermediate', 'advanced'
  )) default 'absolute_beginner',
  preferred_styles text[] default '{}',          -- ['rock','blues','folk',...]
  reads_tab boolean default false,
  has_played_chord boolean default false,
  has_acoustic boolean default false,
  has_electric boolean default false,
  onboarded_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================
-- 2. focus_areas — static lookup (Technique, Rhythm, Lead, etc.)
-- =============================================================
create table public.focus_areas (
  id text primary key,
  name text not null,
  description text,
  icon_name text,
  sort_order int default 0
);

insert into public.focus_areas (id, name, description, icon_name, sort_order) values
  ('technique',   'Technique',           'Picking, fretting, posture, and the mechanics that make playing feel effortless.', 'hand', 1),
  ('rhythm',      'Rhythm & Strumming',  'Time, groove, and rhythmic vocabulary — from open-chord strumming to syncopation.', 'music', 2),
  ('lead',        'Lead & Soloing',      'Scales, phrasing, bending, and improvising over chord changes.',                    'flame', 3),
  ('fingerstyle', 'Fingerstyle',         'Independence, arpeggios, and self-accompanied playing.',                            'fingerprint', 4),
  ('theory',      'Theory',              'CAGED, the circle of fifths, modes, intervals — the why behind the what.',          'book-open', 5);

-- =============================================================
-- 3. theory_entries — browsable theory topics (also linked to lessons)
-- =============================================================
create table public.theory_entries (
  id text primary key,
  title text not null,
  summary text,
  body text,                       -- markdown
  difficulty int default 1 check (difficulty between 1 and 5),
  sort_order int default 0,
  created_at timestamptz default now()
);

-- =============================================================
-- 4. lessons
-- =============================================================
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  focus_area_id text references public.focus_areas(id) on delete restrict,
  difficulty int default 1 check (difficulty between 1 and 5),
  duration_minutes int,
  summary text,
  body text,                       -- markdown
  video_url text,
  tab_url text,
  sort_order int default 0,
  required_ability_level text,
  created_at timestamptz default now()
);

-- =============================================================
-- 5. lesson_theory_links — many-to-many lesson ↔ theory
-- =============================================================
create table public.lesson_theory_links (
  lesson_id uuid references public.lessons(id) on delete cascade,
  theory_entry_id text references public.theory_entries(id) on delete cascade,
  primary key (lesson_id, theory_entry_id)
);

-- =============================================================
-- 6. lesson_progress — per-user per-lesson tracking
-- =============================================================
create table public.lesson_progress (
  user_id uuid references auth.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  status text check (status in ('not_started', 'in_progress', 'completed')) default 'not_started',
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz default now(),
  primary key (user_id, lesson_id)
);

-- =============================================================
-- Row-level security
-- =============================================================
alter table public.profiles         enable row level security;
alter table public.focus_areas      enable row level security;
alter table public.theory_entries   enable row level security;
alter table public.lessons          enable row level security;
alter table public.lesson_theory_links enable row level security;
alter table public.lesson_progress  enable row level security;

-- Profiles: own only
create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- Lesson progress: own only
create policy "lesson_progress: select own" on public.lesson_progress
  for select using (auth.uid() = user_id);
create policy "lesson_progress: insert own" on public.lesson_progress
  for insert with check (auth.uid() = user_id);
create policy "lesson_progress: update own" on public.lesson_progress
  for update using (auth.uid() = user_id);
create policy "lesson_progress: delete own" on public.lesson_progress
  for delete using (auth.uid() = user_id);

-- Static curriculum content: world-readable
create policy "focus_areas: public read"          on public.focus_areas         for select using (true);
create policy "lessons: public read"              on public.lessons             for select using (true);
create policy "theory_entries: public read"       on public.theory_entries      for select using (true);
create policy "lesson_theory_links: public read"  on public.lesson_theory_links for select using (true);
