-- Risen Six — admin role + subscription scaffolding
-- Idempotent: re-runnable. Apply via Supabase Dashboard → SQL Editor.

-- =============================================================
-- 1. Profiles: add role + subscription columns
-- =============================================================
alter table public.profiles
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin')),
  add column if not exists subscription_status text not null default 'free'
    check (subscription_status in ('free', 'trialing', 'active', 'past_due', 'canceled', 'expired')),
  add column if not exists plan text,
  add column if not exists stripe_customer_id text unique,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_ends_at timestamptz;

-- =============================================================
-- 2. Helper: is the current authed user an admin?
-- Used by RLS policies and the admin RPCs below.
-- =============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =============================================================
-- 3. Trigger: prevent non-admins from changing protected fields
-- =============================================================
create or replace function public.prevent_protected_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role then
    raise exception 'role can only be changed by an admin';
  end if;
  if new.subscription_status is distinct from old.subscription_status then
    raise exception 'subscription_status can only be changed by an admin or the billing webhook';
  end if;
  if new.plan is distinct from old.plan then
    raise exception 'plan can only be changed by an admin or the billing webhook';
  end if;
  if new.stripe_customer_id is distinct from old.stripe_customer_id then
    raise exception 'stripe_customer_id can only be changed by an admin or the billing webhook';
  end if;
  if new.stripe_subscription_id is distinct from old.stripe_subscription_id then
    raise exception 'stripe_subscription_id can only be changed by an admin or the billing webhook';
  end if;
  if new.subscription_ends_at is distinct from old.subscription_ends_at then
    raise exception 'subscription_ends_at can only be changed by an admin or the billing webhook';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_admin_fields on public.profiles;
create trigger profiles_protect_admin_fields
  before update on public.profiles
  for each row execute procedure public.prevent_protected_profile_changes();

-- =============================================================
-- 4. Row-level security on profiles
-- =============================================================
alter table public.profiles enable row level security;

drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "admins read all profiles" on public.profiles;
drop policy if exists "admins update all profiles" on public.profiles;

create policy "users read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "users update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "admins read all profiles"
  on public.profiles
  for select
  using (public.is_admin());

create policy "admins update all profiles"
  on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================
-- 5. Admin RPC: list all users with their email
-- profiles alone doesn't expose email (lives in auth.users) — this
-- function joins them and is callable only by admins.
-- =============================================================
create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  display_name text,
  role text,
  subscription_status text,
  plan text,
  stripe_customer_id text,
  subscription_ends_at timestamptz,
  ability_level text,
  onboarded_at timestamptz,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'unauthorized';
  end if;
  return query
    select
      p.id,
      u.email::text,
      p.display_name,
      p.role,
      p.subscription_status,
      p.plan,
      p.stripe_customer_id,
      p.subscription_ends_at,
      p.ability_level,
      p.onboarded_at,
      p.created_at,
      u.last_sign_in_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

grant execute on function public.admin_list_users() to authenticated;

-- =============================================================
-- 6. Elevate ck.wall@icloud.com to admin
-- =============================================================
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'ck.wall@icloud.com');
