/*
  # Add Role to Profiles

  1. Changes
    - Add `role` column to `profiles` table
    - Default value: 'student'
    - Type: text (to support 'student', 'mentor')
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'student';
  END IF;
END $$;
