import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});




export async function POST(req: NextRequest) {
    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 500 });
    }

    try {
        const { prompt } = await req.json();
        const supabase = await createServerClient();

        // 1. Check Admin Permissions
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // 2. Aggregate Data (Using Service Role to bypass RLS)
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!SUPABASE_SERVICE_KEY) throw new Error("Missing Service Role Key for Intelligence API");

        const adminClient = createServiceClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        const { data: attempts } = await adminClient.from('quiz_attempts').select('score, completed_at, quiz_id, quizzes(title)');
        const { count: totalUsers } = await adminClient.from('profiles').select('*', { count: 'exact', head: true });

        const contextData = {
            totalUsers,
            totalAttempts: attempts?.length || 0,
            recentActivity: attempts?.slice(0, 50).map((a: any) => ({
                quiz: Array.isArray(a.quizzes) ? a.quizzes[0]?.title : (a.quizzes as any)?.title,
                score: a.score,
                date: a.completed_at // Correct column
            }))
        };

        const systemPrompt = `
        You are the Chief Data Officer for an EdTech platform.
        Generate a professional, markdown-formatted executive summary based on the provided dataset and user prompt.
        
        Dataset Context:
        - Total Users: ${contextData.totalUsers}
        - Total Attempts: ${contextData.totalAttempts}
        - Recent Sample Data (Last 50): ${JSON.stringify(contextData.recentActivity)}

        Guidelines:
        - Use specific numbers from the data.
        - Identify trends (e.g., "Scores are improving", "High engagement on React Quiz").
        - Use professional headings (#, ##) and bullet points.
        - Be concise but insightful.
        `;

        // 3. Call Groq
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `User Request: ${prompt}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
        });

        const report = chatCompletion.choices[0]?.message?.content;

        return NextResponse.json({ report });

    } catch (error: any) {
        console.error('Intelligence API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
