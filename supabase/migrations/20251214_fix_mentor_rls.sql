-- Allow quiz creators (Mentors) to view all attempts for their quizzes
CREATE POLICY "Quiz creators can view attempts of their quizzes"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_attempts.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );
