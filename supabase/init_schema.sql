begin;

create extension if not exists "pgcrypto";

-- Keep booking types aligned with app behavior.
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'booking_type' and n.nspname = 'public'
  ) then
    create type public.booking_type as enum ('view', 'interested');
  end if;
end
$$;

create table if not exists public.motorcycles (
  id text primary key,
  title text not null,
  price numeric(12,2) not null check (price >= 0),
  location text not null,
  image text not null,
  rating numeric(2,1) check (rating between 0 and 5),
  year int not null check (year between 1900 and 2100),
  engine_capacity text not null,
  mileage text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default 'John',
  last_name text not null default 'Doe',
  email text not null,
  mobile text not null default '+1 234 567 8900',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  currency text not null default 'IDR' check (currency in ('USD', 'EUR', 'IDR')),
  theme text not null default 'light' check (theme in ('light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.motorcycle_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  motorcycle_id text not null references public.motorcycles (id) on delete cascade,
  type public.booking_type not null default 'view',
  created_at timestamptz not null default now()
);

create index if not exists idx_motorcycle_bookings_user_id
  on public.motorcycle_bookings (user_id);

create index if not exists idx_motorcycle_bookings_motorcycle_id
  on public.motorcycle_bookings (motorcycle_id);

create index if not exists idx_motorcycle_bookings_created_at
  on public.motorcycle_bookings (created_at desc);

create unique index if not exists uq_motorcycle_bookings_interested_once
  on public.motorcycle_bookings (user_id, motorcycle_id)
  where type = 'interested';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_motorcycles_set_updated_at on public.motorcycles;
create trigger trg_motorcycles_set_updated_at
before update on public.motorcycles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_user_preferences_set_updated_at on public.user_preferences;
create trigger trg_user_preferences_set_updated_at
before update on public.user_preferences
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (user_id) do update
    set email = excluded.email,
        updated_at = now();

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.motorcycles enable row level security;
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.motorcycle_bookings enable row level security;

-- Public read for listings.
drop policy if exists "Public can read motorcycles" on public.motorcycles;
create policy "Public can read motorcycles"
  on public.motorcycles
  for select
  to anon, authenticated
  using (true);

-- Profile policies.
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Preference policies.
drop policy if exists "Users can read own preferences" on public.user_preferences;
create policy "Users can read own preferences"
  on public.user_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own preferences" on public.user_preferences;
create policy "Users can insert own preferences"
  on public.user_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own preferences" on public.user_preferences;
create policy "Users can update own preferences"
  on public.user_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Booking policies.
drop policy if exists "Users can read own bookings" on public.motorcycle_bookings;
create policy "Users can read own bookings"
  on public.motorcycle_bookings
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own bookings" on public.motorcycle_bookings;
create policy "Users can insert own bookings"
  on public.motorcycle_bookings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own bookings" on public.motorcycle_bookings;
create policy "Users can delete own bookings"
  on public.motorcycle_bookings
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.motorcycles to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.user_preferences to authenticated;
grant select, insert, delete on public.motorcycle_bookings to authenticated;

-- No seed motorcycles in this init schema.
-- Motorcycle records are expected to be created by admin from the app.

commit;
