grant usage on schema public to authenticated;

revoke all on table public.profiles from authenticated;
revoke all on table public.meal_logs from authenticated;
revoke all on table public.saved_meals from authenticated;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.meal_logs to authenticated;
grant select, insert, update, delete on table public.saved_meals to authenticated;

revoke all on table public.profiles from anon;
revoke all on table public.meal_logs from anon;
revoke all on table public.saved_meals from anon;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.meal_logs enable row level security;
alter table public.saved_meals enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "meal_logs_select_own" on public.meal_logs;
drop policy if exists "meal_logs_insert_own" on public.meal_logs;
drop policy if exists "meal_logs_update_own" on public.meal_logs;
drop policy if exists "meal_logs_delete_own" on public.meal_logs;

create policy "meal_logs_select_own"
  on public.meal_logs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "meal_logs_insert_own"
  on public.meal_logs
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "meal_logs_update_own"
  on public.meal_logs
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "meal_logs_delete_own"
  on public.meal_logs
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "saved_meals_select_own" on public.saved_meals;
drop policy if exists "saved_meals_insert_own" on public.saved_meals;
drop policy if exists "saved_meals_update_own" on public.saved_meals;
drop policy if exists "saved_meals_delete_own" on public.saved_meals;

create policy "saved_meals_select_own"
  on public.saved_meals
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "saved_meals_insert_own"
  on public.saved_meals
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "saved_meals_update_own"
  on public.saved_meals
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "saved_meals_delete_own"
  on public.saved_meals
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
