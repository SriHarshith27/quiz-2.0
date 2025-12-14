import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// Initialize Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    if (!process.env.GEMINI_API_KEY || !process.env.GROQ_API_KEY) {
        return NextResponse.json({
            error: 'Missing API Keys: Ensure GEMINI_API_KEY and GROQ_API_KEY are set.'
        }, { status: 500 });
    }

    try {
        const { quizId, question, userAnswer, correctAnswer } = await req.json();

        // 1. Generate Query Embedding (Gemini)
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(question);
        const queryEmbedding = result.embedding.values;

        // 2. Similarity Search via Supabase RPC
        const supabase = await createClient();
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5, // Adjust threshold
            match_count: 3,
            filter_quiz_id: quizId
        });

        if (error) {
            console.error('Vector search error:', error);
            // Fallback to explaining without context if search fails
        }

        // 3. Construct Context
        const contextText = documents?.map((doc: any) => doc.content).join('\n\n') || "No reference material found.";

        // 4. Generate Explanation (Groq)
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a helpful teaching assistant.
                    Explain why the user's answer to the quiz question is incorrect (or correct) based on the provided Reference Material.
                    
                    Reference Material:
                    ${contextText}
                    
                    Keep the explanation concise (max 3 sentences) and encouraging.`
                },
                {
                    role: "user",
                    content: `Question: ${question}
                    User Answer: ${userAnswer}
                    Correct Answer: ${correctAnswer}
                    
                    Please explain.`
                }
            ],
            model: "llama-3.3-70b-versatile", // Fast and capable
            temperature: 0.7,
            max_tokens: 300,
        });

        const explanation = chatCompletion.choices[0]?.message?.content || "Could not generate explanation.";

        return NextResponse.json({ explanation });
    } catch (error: any) {
        console.error('Explain API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
