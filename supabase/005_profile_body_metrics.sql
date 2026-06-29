alter table if exists public.profiles
add column if not exists sex text
  check (sex in ('male', 'female')),
add column if not exists age int
  check (age > 0),
add column if not exists height_cm numeric
  check (height_cm > 0),
add column if not exists weight_kg numeric
  check (weight_kg > 0),
add column if not exists activity_level text
  check (
    activity_level in (
      'sedentary',
      'light',
      'moderate',
      'active',
      'very_active'
    )
  ),
add column if not exists protein_goal int
  check (protein_goal >= 0);
