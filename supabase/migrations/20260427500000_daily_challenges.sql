-- Daily challenge completion tracking
-- One row per user per day; user_id + completed_on is the natural key.

create table if not exists public.daily_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_on date not null,
  challenge_id text not null,
  inserted_at timestamptz not null default now(),
  primary key (user_id, completed_on)
);

alter table public.daily_completions enable row level security;

create policy "daily: select own"
  on public.daily_completions for select using (auth.uid() = user_id);
create policy "daily: insert own"
  on public.daily_completions for insert with check (auth.uid() = user_id);
create policy "daily: update own"
  on public.daily_completions for update using (auth.uid() = user_id);
create policy "daily: delete own"
  on public.daily_completions for delete using (auth.uid() = user_id);
