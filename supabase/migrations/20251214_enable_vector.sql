-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table to store quiz documents/summaries for RAG
CREATE TABLE IF NOT EXISTS quiz_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  content text,
  embedding vector(1536), -- OpenAI embeddings are 1536 dimensions
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on the documents table
ALTER TABLE quiz_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Quiz creators can insert/manage their own documents
CREATE POLICY "Creators can manage their quiz documents"
  ON quiz_documents
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_documents.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_documents.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );

-- Policy: Everyone (authenticated) can read documents if they can read the quiz (simplification for RAG)
-- Ideally, RAG only searches on server side (service key), but if we use client search:
CREATE POLICY "Users can read doc embeddings"
  ON quiz_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_documents.quiz_id
      AND (quizzes.is_published = true OR quizzes.created_by = auth.uid())
    )
  );

-- Create a function to similarity search for documents
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
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
