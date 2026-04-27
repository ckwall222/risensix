-- Practice sessions: log of completed daily routines.
-- One row per user per day; records total minutes and which blocks were done.

create table if not exists public.practice_sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_on date not null,
  total_minutes smallint not null,
  routine_id text not null,         -- which routine variant was generated
  blocks jsonb not null,            -- [{ type, title, duration_min, link?, completed }]
  inserted_at timestamptz not null default now(),
  primary key (user_id, completed_on)
);

create index if not exists practice_sessions_recent_idx
  on public.practice_sessions(user_id, completed_on desc);

alter table public.practice_sessions enable row level security;

drop policy if exists "practice: select own" on public.practice_sessions;
drop policy if exists "practice: insert own" on public.practice_sessions;
drop policy if exists "practice: update own" on public.practice_sessions;
drop policy if exists "practice: delete own" on public.practice_sessions;

create policy "practice: select own"
  on public.practice_sessions for select using (auth.uid() = user_id);
create policy "practice: insert own"
  on public.practice_sessions for insert with check (auth.uid() = user_id);
create policy "practice: update own"
  on public.practice_sessions for update using (auth.uid() = user_id);
create policy "practice: delete own"
  on public.practice_sessions for delete using (auth.uid() = user_id);
