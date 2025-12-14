import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 500 });
    }

    try {
        const { attemptId } = await req.json();

        if (!attemptId) {
            return NextResponse.json({ error: 'Missing attemptId' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Fetch Attempt Data
        const { data: attempt, error: attemptError } = await supabase
            .from('quiz_attempts')
            .select('*, quizzes(*)')
            .eq('id', attemptId)
            .single();

        if (attemptError || !attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }

        // 2. Fetch Questions
        const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('quiz_id', attempt.quiz_id)
            .order('order_index', { ascending: true });

        if (questionsError || !questions) {
            return NextResponse.json({ error: 'Questions not found' }, { status: 404 });
        }

        const userAnswers = attempt.answers || {};

        // 3. Filter for Incorrect Answers only
        const incorrectQuestions = questions.filter(q => {
            const userAns = userAnswers[q.id];
            return userAns !== q.correct_answer;
        });

        if (incorrectQuestions.length === 0) {
            return NextResponse.json({
                message: "Perfect score! No incorrect answers to analyze.",
                analysis: []
            });
        }

        // 4. Construct Prompt
        const questionsText = incorrectQuestions.map((q, index) => {
            const userAnsIdx = userAnswers[q.id];
            const userAnsText = userAnsIdx !== undefined ? q.options[userAnsIdx] : 'Skipped';
            const correctAnsText = q.options[q.correct_answer];

            return `
            Question ID: ${q.id}
            Question: "${q.question_text}"
            User Answer: "${userAnsText}"
            Correct Answer: "${correctAnsText}"
            Topic: ${q.category || 'General'}
            `;
        }).join('\n----------------\n');

        const prompt = `
        You are an expert tutor. Analyze the following incorrect quiz answers.
        For each question, explain:
        1. The likely misconception or reason why the user chose their answer (if skipped, explain why it might be difficult).
        2. The correct concept in simple terms.

        Input Data:
        ${questionsText}

        Return a JSON object with a single key "analysis" which is a list of objects.
        Each object must have:
        - "questionId": (string, matches input ID)
        - "misconception": (string, 1-2 sentences explain why user was wrong)
        - "correctConcept": (string, 1-2 sentences explaining the right answer)
        - "studyTopic": (string, 2-3 words, the core topic to review)

        Return ONLY the JSON.
        `;

        // 5. Call Groq
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI tutor. helper. Output valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content;
        if (!content) throw new Error("No analysis generated");

        const result = JSON.parse(content);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Analysis API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
