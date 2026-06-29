create table if not exists public.wellness_records (
  user_id uuid not null references auth.users (id) on delete cascade,
  day_key date not null,
  weight_kg numeric(5, 2),
  weight_note text,
  calorie_low integer check (calorie_low >= 0),
  calorie_high integer check (
    calorie_high is null
    or calorie_low is null
    or calorie_high >= calorie_low
  ),
  diet_score integer check (diet_score between 0 and 100),
  meal_highlights text[] not null default '{}',
  improvement_points text[] not null default '{}',
  exercise_note text,
  sleep_note text,
  source_note text not null default 'Imported user record.',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, day_key)
);

create index if not exists wellness_records_user_day_key_idx
  on public.wellness_records (user_id, day_key desc);

alter table public.wellness_records enable row level security;

revoke all on table public.wellness_records from anon;
revoke all on table public.wellness_records from authenticated;
grant select, insert, update, delete on table public.wellness_records to authenticated;

drop policy if exists "wellness_records_select_own" on public.wellness_records;
drop policy if exists "wellness_records_insert_own" on public.wellness_records;
drop policy if exists "wellness_records_update_own" on public.wellness_records;
drop policy if exists "wellness_records_delete_own" on public.wellness_records;

create policy "wellness_records_select_own"
  on public.wellness_records
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "wellness_records_insert_own"
  on public.wellness_records
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "wellness_records_update_own"
  on public.wellness_records
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "wellness_records_delete_own"
  on public.wellness_records
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop trigger if exists wellness_records_set_updated_at on public.wellness_records;
create trigger wellness_records_set_updated_at
before update on public.wellness_records
for each row
execute function public.set_updated_at();
