-- ============================================================
-- Hotel Mess Management System — Supabase SQL Schema
-- Run this in your Supabase project: SQL Editor > New Query
-- ============================================================

-- 1. Create the main table
CREATE TABLE IF NOT EXISTS hotel_mess_entries (
  id                      uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name               text         NOT NULL,
  phone_number            text         NOT NULL,
  alternate_phone         text,
  email                   text,
  gender                  text         CHECK (gender IN ('Male', 'Female', 'Other')),
  nationality             text,
  emirates_id_or_passport text,
  meal_type               text         NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Full Board')),
  mess_plan_type          text         NOT NULL CHECK (mess_plan_type IN ('Daily', 'Weekly', 'Monthly')),
  number_of_persons       integer      NOT NULL DEFAULT 1 CHECK (number_of_persons >= 1),
  special_notes           text,
  status                  text         NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_by              uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at              timestamptz  NOT NULL DEFAULT now(),
  updated_at              timestamptz  NOT NULL DEFAULT now()
);

-- 2. Create an index for fast lookups by creator and status
CREATE INDEX IF NOT EXISTS idx_hotel_mess_entries_created_by
  ON hotel_mess_entries (created_by);

CREATE INDEX IF NOT EXISTS idx_hotel_mess_entries_status
  ON hotel_mess_entries (status);

CREATE INDEX IF NOT EXISTS idx_hotel_mess_entries_created_at
  ON hotel_mess_entries (created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE hotel_mess_entries ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Users can SELECT only their own rows
CREATE POLICY "Users can view own entries"
  ON hotel_mess_entries
  FOR SELECT
  USING (auth.uid() = created_by);

-- 5. RLS Policy: Users can INSERT rows only where created_by = their uid
CREATE POLICY "Users can insert own entries"
  ON hotel_mess_entries
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- 6. RLS Policy: Users can UPDATE only their own rows
CREATE POLICY "Users can update own entries"
  ON hotel_mess_entries
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- NOTE: No DELETE policy is created intentionally.
--       Use the "status" field to soft-delete (mark Inactive) instead.

-- 7. Function: auto-update the updated_at column on every UPDATE
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

-- 8. Trigger: call the function before each row update
DROP TRIGGER IF EXISTS trg_hotel_mess_entries_updated_at ON hotel_mess_entries;

CREATE TRIGGER trg_hotel_mess_entries_updated_at
  BEFORE UPDATE ON hotel_mess_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
