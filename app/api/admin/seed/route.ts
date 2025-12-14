import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    // BYPASS RLS: Use Service Role Key to insert data for ANY user
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return NextResponse.json({
            error: 'Missing SUPABASE_SERVICE_ROLE_KEY in .env.local. Required to seed other users data.'
        }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    try {
        // 1. Create Mock Quizzes (if fewer than 5 exist)
        const { count: quizCount } = await supabase.from('quizzes').select('*', { count: 'exact', head: true });

        let quizzes = [];
        if ((quizCount || 0) < 5) {
            // Need an admin to "own" these quizzes
            const { data: adminUser } = await supabase.from('profiles').select('id').eq('role', 'admin').limit(1).single();
            const creatorId = adminUser?.id;

            if (creatorId) {
                const categories = ['React', 'JavaScript', 'Python', 'System Design', 'CSS', 'SQL', 'Algorithms', 'Security'];
                const mockQuizzes = categories.map((cat, i) => ({
                    title: `${cat} Mastery Level ${i % 3 + 1}`,
                    description: `Test your advanced knowledge in ${cat}.`,
                    category: cat,
                    difficulty: i % 3 === 0 ? 'hard' : (i % 3 === 1 ? 'medium' : 'easy'),
                    time_limit: 30,
                    is_published: true,
                    created_by: creatorId
                }));

                const { data: newQuizzes, error: qError } = await supabase.from('quizzes').insert(mockQuizzes).select();
                if (qError) {
                    console.error("Quiz create error:", qError);
                } else {
                    quizzes = newQuizzes || [];
                }
            } else {
                console.warn("No admin found to create quizzes. Using existing.");
                const { data } = await supabase.from('quizzes').select('id');
                quizzes = data || [];
            }
        } else {
            const { data } = await supabase.from('quizzes').select('id, title');
            quizzes = data || [];
        }

        // 2. Create Mock Users (using Auth Admin)
        const newUserIdList: string[] = [];

        // Only create if we have fewer than 20 users to avoid spamming
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

        if ((userCount || 0) < 20) {
            const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Kevin', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peggy', 'Quentin', 'Rupert', 'Sybil', 'Ted'];

            for (const name of names) {
                const email = `mock.${name.toLowerCase()}.${Math.floor(Math.random() * 10000)}@test.com`;
                const { data: user, error: authError } = await supabase.auth.admin.createUser({
                    email: email,
                    password: 'password123',
                    email_confirm: true,
                    user_metadata: { full_name: `${name} Mock`, role: 'student' } // Trigger will create profile
                });

                if (authError) {
                    console.error("Auth create error for " + email, authError);
                } else if (user.user) {
                    newUserIdList.push(user.user.id);
                }
            }
        } else {
            // Fetch existing users if we didn't create new ones
            const { data: existing } = await supabase.from('profiles').select('id');
            if (existing) newUserIdList.push(...existing.map(p => p.id));
        }

        // 3. Create Mock Attempts
        const mockAttempts = [];
        // Ensure we have users and quizzes
        if (quizzes.length > 0 && newUserIdList.length > 0) {
            for (let i = 0; i < 500; i++) {
                const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
                const userId = newUserIdList[Math.floor(Math.random() * newUserIdList.length)];

                // Score Logic: Bias towards passing (>12/20) but include some failures
                // 0-20
                const baseScore = Math.floor(Math.random() * 21);
                // Bias slightly
                const weightedScore = Math.min(20, Math.max(0, baseScore + (Math.random() > 0.5 ? 2 : -2)));

                mockAttempts.push({
                    quiz_id: quiz.id,
                    user_id: userId,
                    score: weightedScore,
                    total_questions: 20,
                    completed_at: getRandomDate(30).toISOString(),
                    time_taken: Math.floor(Math.random() * 600) + 60
                });
            }

            const { error: attemptError } = await supabase
                .from('quiz_attempts')
                .insert(mockAttempts);

            if (attemptError) throw attemptError;
        }

        return NextResponse.json({
            success: true,
            message: `Database populated with ${newUserIdList.length} users context (total) and ${mockAttempts.length} attempts.`
        });

    } catch (error: any) {
        console.error('Seed Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function getRandomDate(daysBack: number) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    date.setHours(Math.floor(Math.random() * 24));
    return date;
}
