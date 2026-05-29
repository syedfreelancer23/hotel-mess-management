-- ============================================================
-- Hotel Mess Management System — Supabase SQL Schema
-- Run this in your Supabase project: SQL Editor > New Query
-- ============================================================

-- 0. Enable pgcrypto for bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (role_name) VALUES ('administrator'), ('guest'), ('staff')
ON CONFLICT (role_name) DO NOTHING;

-- 2. Users table (custom auth — not Supabase Auth)
CREATE TABLE IF NOT EXISTS users 
(
    user_id   SERIAL PRIMARY KEY,
    username  VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id   INT REFERENCES roles(role_id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default users with bcrypt-hashed passwords via pgcrypto
-- Note: if you already inserted with plain-text, run:
--   UPDATE users SET password_hash = crypt('user@123', gen_salt('bf')) WHERE username = 'user';
--   UPDATE users SET password_hash = crypt('admin@12345', gen_salt('bf')) WHERE username = 'admin';
INSERT INTO users (username, password_hash, role_id) VALUES
  ('user',  crypt('user@123',     gen_salt('bf')), (SELECT role_id FROM roles WHERE role_name = 'staff')),
  ('admin', crypt('admin@12345',  gen_salt('bf')), (SELECT role_id FROM roles WHERE role_name = 'administrator'))
ON CONFLICT (username) DO NOTHING;

-- 3. Drop and recreate the main entries table
--    (created_by now references public.users instead of auth.users)
DROP TABLE IF EXISTS hotel_mess_entries CASCADE;

CREATE TABLE hotel_mess_entries (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         text        NOT NULL,
  phone_number      text        NOT NULL,
  whatsup_available boolean     DEFAULT false,
  alternate_phone   text,
  email             text,
  gender            text        CHECK (gender IN ('Male', 'Female', 'Other')),
  meal_type         text        NOT NULL CHECK (meal_type IN ('Lunch', 'Dinner', 'Lunch & Dinner')),
  mess_plan_type    text        NOT NULL CHECK (mess_plan_type IN ('Daily', 'Weekly', 'Monthly')),
  number_of_persons integer     NOT NULL DEFAULT 1 CHECK (number_of_persons >= 1),
  special_notes     text,
  status            text        NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_by        integer     NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_hotel_mess_entries_created_by ON hotel_mess_entries (created_by);
CREATE INDEX IF NOT EXISTS idx_hotel_mess_entries_meal_type  ON hotel_mess_entries (meal_type);
CREATE INDEX IF NOT EXISTS idx_hotel_mess_entries_status     ON hotel_mess_entries (status);
CREATE INDEX IF NOT EXISTS idx_hotel_mess_entries_created_at ON hotel_mess_entries (created_at DESC);

-- 5. Disable RLS — authorization is handled at the application layer via NextAuth
ALTER TABLE hotel_mess_entries DISABLE ROW LEVEL SECURITY;

-- NOTE: No DELETE policy is created intentionally.
--       Use the "status" field to soft-delete (mark Inactive) instead.

-- 6. Function: auto-update the updated_at column on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 7. Trigger: call the function before each row update
DROP TRIGGER IF EXISTS trg_hotel_mess_entries_updated_at ON hotel_mess_entries;

CREATE TRIGGER trg_hotel_mess_entries_updated_at
  BEFORE UPDATE ON hotel_mess_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();