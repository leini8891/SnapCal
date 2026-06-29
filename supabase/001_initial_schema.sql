create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  daily_calorie_goal integer not null default 1650
    check (daily_calorie_goal between 1200 and 2600),
  goal_pace text not null default 'steady'
    check (goal_pace in ('gentle', 'steady', 'focused')),
  membership_plan text not null default 'free'
    check (membership_plan in ('free', 'pro')),
  onboarding_completed_at timestamptz,
  pricing_gate_seen_at timestamptz,
  locale text not null default 'en-SG',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_name text not null,
  source text not null check (source in ('camera', 'gallery', 'text')),
  logged_at timestamptz not null,
  kcal_low integer not null check (kcal_low >= 0),
  kcal_high integer not null check (kcal_high >= kcal_low),
  modifiers text[] not null default '{}',
  notes text,
  draft_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.saved_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  shortcut_key text not null,
  meal_name text not null,
  default_modifiers text[] not null default '{}',
  default_metadata jsonb not null default '{}'::jsonb,
  kcal_low integer not null check (kcal_low >= 0),
  kcal_high integer not null check (kcal_high >= kcal_low),
  times_used integer not null default 0 check (times_used >= 0),
  last_used_at timestamptz not null default timezone('utc', now()),
  is_pinned boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists meal_logs_user_logged_at_idx
  on public.meal_logs (user_id, logged_at desc);

create index if not exists meal_logs_user_created_at_idx
  on public.meal_logs (user_id, created_at desc);

create index if not exists saved_meals_user_times_used_idx
  on public.saved_meals (user_id, times_used desc, updated_at desc);

create unique index if not exists saved_meals_user_shortcut_key_idx
  on public.saved_meals (user_id, shortcut_key);

alter table public.profiles enable row level security;
alter table public.meal_logs enable row level security;
alter table public.saved_meals enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "meal_logs_select_own"
  on public.meal_logs
  for select
  using (auth.uid() = user_id);

create policy "meal_logs_insert_own"
  on public.meal_logs
  for insert
  with check (auth.uid() = user_id);

create policy "meal_logs_update_own"
  on public.meal_logs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "meal_logs_delete_own"
  on public.meal_logs
  for delete
  using (auth.uid() = user_id);

create policy "saved_meals_select_own"
  on public.saved_meals
  for select
  using (auth.uid() = user_id);

create policy "saved_meals_insert_own"
  on public.saved_meals
  for insert
  with check (auth.uid() = user_id);

create policy "saved_meals_update_own"
  on public.saved_meals
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "saved_meals_delete_own"
  on public.saved_meals
  for delete
  using (auth.uid() = user_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists meal_logs_set_updated_at on public.meal_logs;
create trigger meal_logs_set_updated_at
before update on public.meal_logs
for each row
execute function public.set_updated_at();

drop trigger if exists saved_meals_set_updated_at on public.saved_meals;
create trigger saved_meals_set_updated_at
before update on public.saved_meals
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
