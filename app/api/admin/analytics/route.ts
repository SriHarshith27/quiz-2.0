import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
    const supabase = await createServerClient();

    try {
        // 1. SECURITY: Check Admin Auth using the User's Session (Cookies)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // 2. DATA ACCESS: Use Service Role Key to bypass RLS (Admins need to see ALL data)
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!SUPABASE_SERVICE_KEY) {
            throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY. Cannot fetch global stats.");
        }

        const adminClient = createServiceClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Fetch Data Parallelly using adminClient
        const [
            { count: totalUsers },
            { count: totalQuizzes },
            { data: attempts, error: attemptsError },
            { data: profiles, error: profilesError },
            { data: quizzes, error: quizzesError }
        ] = await Promise.all([
            adminClient.from('profiles').select('*', { count: 'exact', head: true }),
            adminClient.from('quizzes').select('*', { count: 'exact', head: true }),
            adminClient.from('quiz_attempts').select('id, score, completed_at, time_taken, quiz_id, user_id, quizzes(title, category)'),
            adminClient.from('profiles').select('created_at'),
            adminClient.from('quizzes').select('id, title, category')
        ]);

        if (attemptsError || profilesError || quizzesError) {
            console.error("Fetch Error:", { attemptsError, profilesError, quizzesError });
            throw new Error("Database error while fetching analytics.");
        }


        if (!attempts || !profiles || !quizzes) throw new Error("Failed to fetch analytics data");

        // --- PROCESSING DATA FOR 10 GRAPHS ---

        // 1. User Growth (Last 30 Days)
        const userGrowth = processUserGrowth(profiles);

        // 2. Traffic Heatmap (Hour of Day)
        const trafficHeatmap = processTrafficHeatmap(attempts);

        // 3. Score Distribution (Bell Curve)
        const scoreDistribution = processScoreDistribution(attempts);

        // 4. Quiz Popularity
        const quizPopularity = processQuizPopularity(attempts);

        // 5. Difficulty Matrix (Avg Score vs Avg Time)
        const difficultyMatrix = processDifficultyMatrix(attempts);

        // 6. Topic Radar
        const topicRadar = processTopicRadar(attempts);

        // 7. Pass/Fail Ratio
        const passFailRatio = processPassFail(attempts);

        // 8. Avg Score Trend
        const avgScoreTrend = processAvgScoreTrend(attempts);

        // 9. Retention Cohorts (Users by # of attempts)
        const retentionCohorts = processRetention(attempts);

        // 10. Completion Rate (Proxy using attempts vs distinct users/quizzes potential)
        // Hard to calculate without "Start" event. We will swap for "Category Performance" or distinct breakdown.
        // Let's stick to the ones above and fill the 10th with "Top Users"

        return NextResponse.json({
            stats: {
                totalUsers,
                totalQuizzes,
                totalAttempts: attempts.length,
                avgScore: Math.round(attempts.reduce((acc, c) => acc + (c.score || 0), 0) / attempts.length)
            },
            charts: {
                userGrowth,
                trafficHeatmap,
                scoreDistribution,
                quizPopularity,
                difficultyMatrix,
                topicRadar,
                passFailRatio,
                avgScoreTrend,
                retentionCohorts
            }
        });

    } catch (error: any) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// --- HELPER FUNCTIONS ---

function processUserGrowth(profiles: any[]) {
    const last30Days = [...Array(30)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toISOString().split('T')[0];
    });

    return last30Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        users: profiles.filter(p => p.created_at?.startsWith(date)).length
    }));
}

function processTrafficHeatmap(attempts: any[]) {
    const hours = [...Array(24)].map((_, i) => i);
    return hours.map(h => ({
        hour: `${h}:00`,
        attempts: attempts.filter(a => new Date(a.completed_at).getHours() === h).length
    }));
}

function processScoreDistribution(attempts: any[]) {
    const ranges = [
        { name: '0-4', min: 0, max: 4 },
        { name: '5-9', min: 5, max: 9 },
        { name: '10-14', min: 10, max: 14 },
        { name: '15-19', min: 15, max: 19 },
        { name: '20', min: 20, max: 20 },
    ];
    return ranges.map(r => ({
        range: r.name,
        count: attempts.filter(a => a.score >= r.min && a.score <= r.max).length
    }));
}

function processQuizPopularity(attempts: any[]) {
    const counts: Record<string, number> = {};
    attempts.forEach(a => {
        const title = a.quizzes?.title || 'Unknown';
        counts[title] = (counts[title] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
}

function processDifficultyMatrix(attempts: any[]) {
    // Group by Quiz
    const quizStats: Record<string, { totalScore: number, totalTime: number, count: number }> = {};

    attempts.forEach(a => {
        const title = a.quizzes?.title || 'Unknown';
        if (!quizStats[title]) quizStats[title] = { totalScore: 0, totalTime: 0, count: 0 };
        quizStats[title].totalScore += a.score;
        quizStats[title].totalTime += (a.time_taken || 0);
        quizStats[title].count += 1;
    });

    return Object.entries(quizStats).map(([name, stats]) => ({
        name,
        avgScore: Math.round(stats.totalScore / stats.count),
        avgTime: Math.round(stats.totalTime / stats.count / 60) // in minutes
    }));
}

function processTopicRadar(attempts: any[]) {
    const categories: Record<string, { total: number, count: number }> = {};
    attempts.forEach(a => {
        const cat = a.quizzes?.category || 'General';
        if (!categories[cat]) categories[cat] = { total: 0, count: 0 };
        categories[cat].total += a.score;
        categories[cat].count += 1;
    });

    return Object.entries(categories).map(([subject, stats]) => ({
        subject,
        score: Math.round((stats.total / stats.count / 20) * 100) // Normalized to 100
    }));
}

function processPassFail(attempts: any[]) {
    const passThreshold = 12; // 60% of 20
    const passed = attempts.filter(a => a.score >= passThreshold).length;
    return [
        { name: 'Passed', value: passed, fill: '#10B981' }, // Emerald
        { name: 'Failed', value: attempts.length - passed, fill: '#EF4444' } // Red
    ];
}

function processAvgScoreTrend(attempts: any[]) {
    const last30Days = [...Array(30)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
        const dayAttempts = attempts.filter(a => a.completed_at.startsWith(date));
        const total = dayAttempts.reduce((acc: any, curr: any) => acc + curr.score, 0);
        return {
            date: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            avg: dayAttempts.length ? Math.round(total / dayAttempts.length) : 0
        };
    });
}

function processRetention(attempts: any[]) {
    const userCounts: Record<string, number> = {};
    attempts.forEach(a => {
        userCounts[a.user_id] = (userCounts[a.user_id] || 0) + 1;
    });

    let one = 0, twoToFive = 0, sixPlus = 0;
    Object.values(userCounts).forEach(c => {
        if (c === 1) one++;
        else if (c <= 5) twoToFive++;
        else sixPlus++;
    });

    return [
        { name: '1 Attempt', value: one },
        { name: '2-5 Attempts', value: twoToFive },
        { name: '6+ Attempts', value: sixPlus }
    ];
}
