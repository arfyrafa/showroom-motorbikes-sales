-- =============================================================================
-- Showroom Motorbikes — Supabase schema (database + storage)
-- =============================================================================
-- Mapping ke kode project:
--   • motorcycles (listing_status) + motorcycle_images + bucket Storage → hooks/use-motorcycles.ts
--   • motorcycle_bookings                         → hooks/use-bookings.ts (saat ini AsyncStorage)
--   • profiles + user_preferences                → hooks/use-user-settings.ts (saat ini AsyncStorage)
--   • auth.users + trigger                        → lib/auth-context.tsx (mock; siap pakai Supabase Auth)
--
-- Database (public) dan Storage (storage.*) boleh satu file; urutan: tabel → RLS → bucket.
-- Jalankan di: Supabase Dashboard → SQL → New query → paste → Run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Katalog motor + gambar
-- -----------------------------------------------------------------------------

create table if not exists public.motorcycles (
  motorcycle_id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null check (price >= 0),
  brand text,
  description text,
  stock integer not null default 1 check (stock >= 0),
  listing_status text not null default 'available',
  created_at timestamptz not null default now(),
  constraint motorcycles_listing_status_check check (listing_status in ('available', 'sold_out'))
);

-- Proyek yang sudah punya tabel lama tanpa listing_status:
alter table public.motorcycles
  add column if not exists listing_status text not null default 'available';

alter table public.motorcycles
  drop constraint if exists motorcycles_listing_status_check;

alter table public.motorcycles
  add constraint motorcycles_listing_status_check check (listing_status in ('available', 'sold_out'));

create table if not exists public.motorcycle_images (
  image_id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles (motorcycle_id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists motorcycle_images_motorcycle_id_idx
  on public.motorcycle_images (motorcycle_id);

comment on table public.motorcycles is 'Katalog motor; dipakai hook use-motorcycles (select + insert admin).';
comment on table public.motorcycle_images is 'URL gambar (biasanya public URL Supabase Storage).';

-- -----------------------------------------------------------------------------
-- 2) Riwayat minat / lihat motor (setara BookingRecord di use-bookings.ts)
--     Kolom client_session_id = UUID perangkat (nanti dari app) bila belum login.
-- -----------------------------------------------------------------------------

create table if not exists public.motorcycle_bookings (
  booking_id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles (motorcycle_id) on delete cascade,
  interaction_type text not null check (interaction_type in ('view', 'interested')),
  client_session_id text,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists motorcycle_bookings_motorcycle_id_idx
  on public.motorcycle_bookings (motorcycle_id);

create index if not exists motorcycle_bookings_user_id_idx
  on public.motorcycle_bookings (user_id);

create index if not exists motorcycle_bookings_created_at_idx
  on public.motorcycle_bookings (created_at desc);

comment on table public.motorcycle_bookings is 'Minat/lihat motor; app saat ini pakai AsyncStorage — tabel ini untuk sync ke DB nanti.';

-- -----------------------------------------------------------------------------
-- 3) Profil & preferensi (setara use-user-settings.ts) — per user Supabase Auth
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  mobile text,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  currency text not null default 'IDR' check (currency in ('USD', 'EUR', 'IDR')),
  theme text not null default 'light' check (theme in ('light', 'dark')),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Profil pengguna; sinkron dengan UserProfile setelah pakai Supabase Auth.';
comment on table public.user_preferences is 'Preferensi (mata uang, tema); sinkron dengan UserPreferences.';

-- -----------------------------------------------------------------------------
-- 4) Trigger: saat user baru daftar lewat Supabase Auth, buat baris profil + preferensi
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
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
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 5) Row Level Security — public
-- -----------------------------------------------------------------------------

alter table public.motorcycles enable row level security;
alter table public.motorcycle_images enable row level security;
alter table public.motorcycle_bookings enable row level security;
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;

-- --- motorcycles + images (app pakai anon key untuk katalog + admin upload) ---

drop policy if exists "motorcycles_select_public" on public.motorcycles;
create policy "motorcycles_select_public"
  on public.motorcycles
  for select
  to anon, authenticated
  using (true);

drop policy if exists "motorcycles_insert_public" on public.motorcycles;
create policy "motorcycles_insert_public"
  on public.motorcycles
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "motorcycles_update_public" on public.motorcycles;
create policy "motorcycles_update_public"
  on public.motorcycles
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "motorcycle_images_select_public" on public.motorcycle_images;
create policy "motorcycle_images_select_public"
  on public.motorcycle_images
  for select
  to anon, authenticated
  using (true);

drop policy if exists "motorcycle_images_insert_public" on public.motorcycle_images;
create policy "motorcycle_images_insert_public"
  on public.motorcycle_images
  for insert
  to anon, authenticated
  with check (true);

-- --- bookings: anon bisa catat event (setara perilaku publik); perketat saat production ---

drop policy if exists "motorcycle_bookings_select_public" on public.motorcycle_bookings;
create policy "motorcycle_bookings_select_public"
  on public.motorcycle_bookings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "motorcycle_bookings_insert_public" on public.motorcycle_bookings;
create policy "motorcycle_bookings_insert_public"
  on public.motorcycle_bookings
  for insert
  to anon, authenticated
  with check (true);

-- --- profiles + preferences: hanya pemilik baris (butuh user login Supabase Auth) ---

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "user_preferences_select_own" on public.user_preferences;
create policy "user_preferences_select_own"
  on public.user_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_preferences_insert_own" on public.user_preferences;
create policy "user_preferences_insert_own"
  on public.user_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_preferences_update_own" on public.user_preferences;
create policy "user_preferences_update_own"
  on public.user_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 6) Storage — bucket + policy (schema storage)
-- -----------------------------------------------------------------------------
-- Kode app: supabase.storage.from('motorcycles').upload('admin-uploads/...')

insert into storage.buckets (id, name, public)
values ('motorcycles', 'motorcycles', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "motorcycles_storage_select" on storage.objects;
create policy "motorcycles_storage_select"
  on storage.objects
  for select
  to public
  using (bucket_id = 'motorcycles');

drop policy if exists "motorcycles_storage_insert" on storage.objects;
create policy "motorcycles_storage_insert"
  on storage.objects
  for insert
  to public
  with check (bucket_id = 'motorcycles');

drop policy if exists "motorcycles_storage_update" on storage.objects;
create policy "motorcycles_storage_update"
  on storage.objects
  for update
  to public
  using (bucket_id = 'motorcycles')
  with check (bucket_id = 'motorcycles');

drop policy if exists "motorcycles_storage_delete" on storage.objects;
create policy "motorcycles_storage_delete"
  on storage.objects
  for delete
  to public
  using (bucket_id = 'motorcycles');
