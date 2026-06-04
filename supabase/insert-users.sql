-- =============================================================================
-- Insert Dummy Admin and User into Supabase auth.users
-- =============================================================================
-- Copy dan Paste script ini di Supabase Dashboard -> SQL Editor -> New Query
-- Pastikan kamu menjalankan ini agar akun bisa dipakai untuk login.
-- =============================================================================

-- Pastikan ekstensi pgcrypto aktif (digunakan untuk encrypt password)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Insert Admin (admin@showroom.com / admin123)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@showroom.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin Showroom", "role": "admin"}',
  now(),
  now()
);

-- 2) Insert User (user@showroom.com / user123)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'user@showroom.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Regular User", "role": "user"}',
  now(),
  now()
);

-- Catatan:
-- Begitu row dimasukkan ke auth.users, trigger handle_new_user yang
-- ada di schema.sql kamu akan otomatis menembak dan membuatkan row
-- di public.profiles dan public.user_preferences untuk mereka.
