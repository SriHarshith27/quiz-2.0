-- Add answers column to quiz_attempts table to store user responses
ALTER TABLE quiz_attempts
ADD COLUMN IF NOT EXISTS answers jsonb DEFAULT '{}'::jsonb;
