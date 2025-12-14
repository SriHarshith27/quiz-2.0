-- Change embedding vector size from 1536 (OpenAI) to 768 (Gemini)
-- We need to drop the column and recreate it, or alter the type if possible. 
-- For vector extension, usually ALTER COLUMN type works.

ALTER TABLE quiz_documents 
ALTER COLUMN embedding TYPE vector(768);

-- We also need to update the match_documents function to accept vector(768)
DROP FUNCTION IF EXISTS match_documents;

CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_quiz_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    quiz_documents.id,
    quiz_documents.content,
    1 - (quiz_documents.embedding <=> query_embedding) AS similarity
  FROM quiz_documents
  WHERE 1 - (quiz_documents.embedding <=> query_embedding) > match_threshold
  AND quiz_documents.quiz_id = filter_quiz_id
  ORDER BY quiz_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
