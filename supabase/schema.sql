-- MotoMarket Supabase Schema
-- Run this file in Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;

-- ==============================
-- Enums
-- ==============================
do $$ begin
  create type public.app_role as enum ('customer', 'admin', 'superadmin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.motorcycle_status as enum ('available', 'pending', 'sold');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.booking_type as enum ('view', 'interested');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.inquiry_status as enum ('pending', 'replied', 'closed');
exception
  when duplicate_object then null;
end $$;

-- ==============================
-- Core Tables
-- ==============================
create table if not exists public.showrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  address text,
  phone text,
  email text,
  description text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  role public.app_role not null default 'customer',
  showroom_id uuid references public.showrooms (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.motorcycles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand text,
  model text,
  year int,
  price numeric(12,2) not null,
  currency text not null default 'IDR' check (currency in ('USD', 'EUR', 'IDR')),
  location text,
  engine_capacity text,
  mileage text,
  description text,
  image_url text,
  image_path text,
  status public.motorcycle_status not null default 'available',
  rating numeric(2,1),
  views_count int not null default 0,
  showroom_id uuid references public.showrooms (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.motorcycle_images (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles (id) on delete cascade,
  image_url text not null,
  image_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  motorcycle_id uuid not null references public.motorcycles (id) on delete cascade,
  type public.booking_type not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  motorcycle_id uuid not null references public.motorcycles (id) on delete cascade,
  showroom_id uuid references public.showrooms (id) on delete set null,
  message text,
  status public.inquiry_status not null default 'pending',
  replied_by uuid references public.profiles (id) on delete set null,
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  currency text not null default 'IDR' check (currency in ('USD', 'EUR', 'IDR')),
  theme text not null default 'light' check (theme in ('light', 'dark')),
  updated_at timestamptz not null default now()
);

-- ==============================
-- Indexes
-- ==============================
create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_profiles_showroom_id on public.profiles (showroom_id);

create index if not exists idx_motorcycles_showroom_id on public.motorcycles (showroom_id);
create index if not exists idx_motorcycles_created_by on public.motorcycles (created_by);
create index if not exists idx_motorcycles_status on public.motorcycles (status);
create index if not exists idx_motorcycles_price on public.motorcycles (price);
create index if not exists idx_motorcycles_created_at on public.motorcycles (created_at desc);

create index if not exists idx_motorcycle_images_motorcycle_id on public.motorcycle_images (motorcycle_id);

create index if not exists idx_bookings_user_id on public.bookings (user_id);
create index if not exists idx_bookings_motorcycle_id on public.bookings (motorcycle_id);
create index if not exists idx_bookings_type on public.bookings (type);
create unique index if not exists ux_bookings_user_interested
  on public.bookings (user_id, motorcycle_id)
  where type = 'interested';

create index if not exists idx_inquiries_customer_id on public.inquiries (customer_id);
create index if not exists idx_inquiries_showroom_id on public.inquiries (showroom_id);
create index if not exists idx_inquiries_status on public.inquiries (status);

-- ==============================
-- Utility Functions
-- ==============================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.get_my_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'customer'::public.app_role);
$$;

create or replace function public.get_my_showroom_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select showroom_id from public.profiles where id = auth.uid();
$$;

-- Auto-create profile and settings when new auth user is created.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    'customer'
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- ==============================
-- Triggers
-- ==============================
drop trigger if exists trg_showrooms_updated_at on public.showrooms;
create trigger trg_showrooms_updated_at
before update on public.showrooms
for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_motorcycles_updated_at on public.motorcycles;
create trigger trg_motorcycles_updated_at
before update on public.motorcycles
for each row execute function public.set_updated_at();

drop trigger if exists trg_inquiries_updated_at on public.inquiries;
create trigger trg_inquiries_updated_at
before update on public.inquiries
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_settings_updated_at on public.user_settings;
create trigger trg_user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- ==============================
-- Row Level Security
-- ==============================
alter table public.showrooms enable row level security;
alter table public.profiles enable row level security;
alter table public.motorcycles enable row level security;
alter table public.motorcycle_images enable row level security;
alter table public.bookings enable row level security;
alter table public.inquiries enable row level security;
alter table public.user_settings enable row level security;

-- Showrooms
drop policy if exists "showrooms_select_public" on public.showrooms;
create policy "showrooms_select_public"
  on public.showrooms for select
  using (true);

drop policy if exists "showrooms_admin_manage" on public.showrooms;
create policy "showrooms_admin_manage"
  on public.showrooms for all
  using (public.get_my_role() = 'superadmin')
  with check (public.get_my_role() = 'superadmin');

-- Profiles
drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.get_my_role() in ('admin', 'superadmin'));

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_superadmin_manage" on public.profiles;
create policy "profiles_superadmin_manage"
  on public.profiles for all
  using (public.get_my_role() = 'superadmin')
  with check (public.get_my_role() = 'superadmin');

-- Motorcycles
drop policy if exists "motorcycles_select_public" on public.motorcycles;
create policy "motorcycles_select_public"
  on public.motorcycles for select
  using (true);

drop policy if exists "motorcycles_admin_insert" on public.motorcycles;
create policy "motorcycles_admin_insert"
  on public.motorcycles for insert
  with check (
    public.get_my_role() in ('admin', 'superadmin')
    and created_by = auth.uid()
  );

drop policy if exists "motorcycles_admin_update_own" on public.motorcycles;
create policy "motorcycles_admin_update_own"
  on public.motorcycles for update
  using (
    (public.get_my_role() = 'admin' and created_by = auth.uid())
    or public.get_my_role() = 'superadmin'
  )
  with check (
    (public.get_my_role() = 'admin' and created_by = auth.uid())
    or public.get_my_role() = 'superadmin'
  );

drop policy if exists "motorcycles_admin_delete_own" on public.motorcycles;
create policy "motorcycles_admin_delete_own"
  on public.motorcycles for delete
  using (
    (public.get_my_role() = 'admin' and created_by = auth.uid())
    or public.get_my_role() = 'superadmin'
  );

-- Motorcycle images
drop policy if exists "motorcycle_images_select_public" on public.motorcycle_images;
create policy "motorcycle_images_select_public"
  on public.motorcycle_images for select
  using (true);

drop policy if exists "motorcycle_images_admin_manage" on public.motorcycle_images;
create policy "motorcycle_images_admin_manage"
  on public.motorcycle_images for all
  using (
    public.get_my_role() = 'superadmin'
    or exists (
      select 1
      from public.motorcycles m
      where m.id = motorcycle_id
        and m.created_by = auth.uid()
        and public.get_my_role() = 'admin'
    )
  )
  with check (
    public.get_my_role() = 'superadmin'
    or exists (
      select 1
      from public.motorcycles m
      where m.id = motorcycle_id
        and m.created_by = auth.uid()
        and public.get_my_role() = 'admin'
    )
  );

-- Bookings (customer history)
drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own"
  on public.bookings for select
  using (user_id = auth.uid());

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own"
  on public.bookings for insert
  with check (user_id = auth.uid());

drop policy if exists "bookings_delete_own" on public.bookings;
create policy "bookings_delete_own"
  on public.bookings for delete
  using (user_id = auth.uid());

-- Inquiries
drop policy if exists "inquiries_insert_customer" on public.inquiries;
create policy "inquiries_insert_customer"
  on public.inquiries for insert
  with check (
    customer_id = auth.uid()
    and public.get_my_role() = 'customer'
  );

drop policy if exists "inquiries_select_customer_own" on public.inquiries;
create policy "inquiries_select_customer_own"
  on public.inquiries for select
  using (customer_id = auth.uid());

drop policy if exists "inquiries_select_admin_showroom" on public.inquiries;
create policy "inquiries_select_admin_showroom"
  on public.inquiries for select
  using (
    public.get_my_role() = 'superadmin'
    or (
      public.get_my_role() = 'admin'
      and showroom_id = public.get_my_showroom_id()
    )
  );

drop policy if exists "inquiries_update_admin_showroom" on public.inquiries;
create policy "inquiries_update_admin_showroom"
  on public.inquiries for update
  using (
    public.get_my_role() = 'superadmin'
    or (
      public.get_my_role() = 'admin'
      and showroom_id = public.get_my_showroom_id()
    )
  )
  with check (
    public.get_my_role() = 'superadmin'
    or (
      public.get_my_role() = 'admin'
      and showroom_id = public.get_my_showroom_id()
    )
  );

-- User settings
drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
  on public.user_settings for select
  using (user_id = auth.uid());

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
  on public.user_settings for insert
  with check (user_id = auth.uid());

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
  on public.user_settings for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ==============================
-- Storage (motorcycle images)
-- ==============================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'motorcycles',
  'motorcycles',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "storage_motorcycles_public_read" on storage.objects;
create policy "storage_motorcycles_public_read"
  on storage.objects for select
  using (bucket_id = 'motorcycles');

drop policy if exists "storage_motorcycles_admin_upload" on storage.objects;
create policy "storage_motorcycles_admin_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'motorcycles'
    and public.get_my_role() in ('admin', 'superadmin')
  );

drop policy if exists "storage_motorcycles_admin_update" on storage.objects;
create policy "storage_motorcycles_admin_update"
  on storage.objects for update
  using (
    bucket_id = 'motorcycles'
    and public.get_my_role() in ('admin', 'superadmin')
  )
  with check (
    bucket_id = 'motorcycles'
    and public.get_my_role() in ('admin', 'superadmin')
  );

drop policy if exists "storage_motorcycles_admin_delete" on storage.objects;
create policy "storage_motorcycles_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'motorcycles'
    and public.get_my_role() in ('admin', 'superadmin')
  );

commit;
