alter table if exists public.saved_meals
add column if not exists default_metadata jsonb not null default '{}'::jsonb;
