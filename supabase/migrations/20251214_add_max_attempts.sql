-- Add max_attempts column to quizzes table
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS max_attempts integer DEFAULT 1;

-- Update existing rows to have a default value if needed (default constraint handles new rows)
-- UPDATE quizzes SET max_attempts = 1 WHERE max_attempts IS NULL;
