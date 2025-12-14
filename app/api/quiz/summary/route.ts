import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 500 });
    }

    try {
        const { questions, userAnswers, score, totalPoints } = await req.json();

        // 1. Format the data for the AI
        const performanceData = questions.map((q: any, index: number) => {
            const userAnswerIdx = userAnswers[q.id];
            const isCorrect = userAnswerIdx === q.correct_answer;
            return `
            Q${index + 1}: ${q.question_text}
            - Topic: ${q.category || 'General'}
            - User Answer: ${userAnswerIdx !== undefined ? q.options[userAnswerIdx] : 'Skipped'}
            - Correct Answer: ${q.options[q.correct_answer]}
            - Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}
            `;
        }).join('\n');

        const prompt = `
        Analyze the following quiz performance for a student.
        
        Total Score: ${score}/${totalPoints}
        
        Detailed Question Log:
        ${performanceData}

        Please provide a structured summary in JSON format with exactly these three fields:
        1. "strengths": A list of 2 things the student did well (topics or specific skills).
        2. "weaknesses": A list of 2 areas where the student struggled.
        3. "recommendation": One specific, actionable study recommendation (max 2 sentences).

        Return ONLY the raw JSON object. Do not include markdown formatting like \`\`\`json.
        `;

        // 2. Call Groq
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert educational AI. Analyze quiz results and provide constructive feedback in valid JSON format."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            response_format: { type: "json_object" } // Force JSON mode
        });

        const content = chatCompletion.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content received from AI');
        }

        const summary = JSON.parse(content);

        return NextResponse.json(summary);

    } catch (error: any) {
        console.error('Summary API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
