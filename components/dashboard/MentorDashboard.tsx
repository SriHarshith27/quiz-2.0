import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { LogOut, Upload, FileText, BarChart2, PlusCircle, Activity } from 'lucide-react';
import { QuizCreator } from '../quiz/QuizCreator';

interface MentorDashboardProps {
    profile: any;
    onLogout: () => void;
}

interface DashboardStats {
    activeQuizzes: number;
    totalAttempts: number;
    avgScore: number;
}

interface QuizPerformance {
    id: string;
    title: string;
    attempts: number;
    avgScore: number;
    difficulty: string;
}

export const MentorDashboard = ({ profile, onLogout }: MentorDashboardProps) => {
    const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({ activeQuizzes: 0, totalAttempts: 0, avgScore: 0 });
    const [recentQuizzes, setRecentQuizzes] = useState<QuizPerformance[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!profile?.id) return;

            try {
                // 1. Fetch Mentor's Quizzes
                const { data: quizzes, error: quizError } = await supabase
                    .from('quizzes')
                    .select('id, title, difficulty')
                    .eq('created_by', profile.id)
                    .order('created_at', { ascending: false });

                if (quizError) throw quizError;

                if (!quizzes || quizzes.length === 0) {
                    setLoading(false);
                    return;
                }

                // 2. Fetch Attempts for these quizzes
                const quizIds = quizzes.map(q => q.id);
                const { data: attempts, error: attemptsError } = await supabase
                    .from('quiz_attempts')
                    .select('quiz_id, score, user_id')
                    .in('quiz_id', quizIds);

                if (attemptsError) throw attemptsError;

                // 3. Process Data
                const totalAttempts = attempts?.length || 0;
                const totalScore = attempts?.reduce((acc, curr) => acc + curr.score, 0) || 0;
                const grandAvgScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;

                setStats({
                    activeQuizzes: quizzes.length,
                    totalAttempts: totalAttempts,
                    avgScore: grandAvgScore
                });

                // 4. Process Per-Quiz Performance
                const processedQuizzes = quizzes.map(quiz => {
                    const quizAttempts = attempts?.filter(a => a.quiz_id === quiz.id) || [];
                    const quizTotalScore = quizAttempts.reduce((acc, curr) => acc + curr.score, 0);
                    const avg = quizAttempts.length > 0 ? Math.round(quizTotalScore / quizAttempts.length) : 0;

                    return {
                        id: quiz.id,
                        title: quiz.title,
                        difficulty: quiz.difficulty,
                        attempts: quizAttempts.length,
                        avgScore: avg
                    };
                });

                setRecentQuizzes(processedQuizzes);

            } catch (error) {
                console.error('Error fetching mentor stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [profile?.id, isCreatingQuiz]); // Re-fetch when creating quiz finishes

    if (isCreatingQuiz) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-6">
                <main className="max-w-7xl mx-auto">
                    <QuizCreator
                        userId={profile?.id}
                        onCancel={() => setIsCreatingQuiz(false)}
                        onSuccess={() => setIsCreatingQuiz(false)}
                    />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
            <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Logo size="md" showText textColor="text-white" />
                            <span className="bg-purple-500/10 text-purple-400 text-xs px-2 py-1 rounded-full font-medium border border-purple-500/20">
                                Mentor
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onLogout}
                            className="text-gray-300 border-gray-700 hover:text-white hover:bg-gray-800"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{profile?.full_name || 'Mentor'}</span>!
                        </h1>
                        <p className="text-xl text-gray-400">Manage your quizzes and track student progress.</p>
                    </div>
                    <Button
                        variant="primary"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0 shadow-lg shadow-purple-500/20"
                        onClick={() => setIsCreatingQuiz(true)}
                    >
                        <PlusCircle size={20} className="mr-2" />
                        Create New Quiz
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Card hover className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-500/30">
                                <FileText className="h-6 w-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.activeQuizzes}</p>
                                <p className="text-gray-400">Active Quizzes</p>
                            </div>
                        </div>
                    </Card>

                    <Card hover className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                                <BarChart2 className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.totalAttempts}</p>
                                <p className="text-gray-400">Total Attempts</p>
                            </div>
                        </div>
                    </Card>

                    <Card hover className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-500/20 p-3 rounded-lg border border-emerald-500/30">
                                <Activity className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.avgScore}</p>
                                <p className="text-gray-400">Avg Global Score</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="w-full">
                    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Quiz Performance</h2>
                            <span className="text-sm text-gray-500">Recent Activity</span>
                        </div>

                        {recentQuizzes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-gray-500 border border-dashed border-gray-800 rounded-xl">
                                <FileText className="h-10 w-10 mb-3 opacity-20" />
                                <p>No performance data available.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 px-4 mb-2">
                                    <div className="col-span-6">Quiz Title</div>
                                    <div className="col-span-2 text-center">Difficulty</div>
                                    <div className="col-span-2 text-center">Attempts</div>
                                    <div className="col-span-2 text-right">Avg Score</div>
                                </div>
                                <div className="overflow-y-auto max-h-[400px] pr-2 space-y-3 custom-scrollbar">
                                    {recentQuizzes.map((quiz) => (
                                        <div key={quiz.id} className="grid grid-cols-12 gap-4 items-center p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors">
                                            <div className="col-span-6">
                                                <p className="font-medium text-white">{quiz.title}</p>
                                            </div>
                                            <div className="col-span-2 text-center">
                                                <span className={`text-xs px-2 py-0.5 rounded border ${quiz.difficulty === 'hard' ? 'text-red-400 border-red-400/20 bg-red-400/10' :
                                                        quiz.difficulty === 'medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' :
                                                            'text-emerald-400 border-emerald-400/20 bg-emerald-400/10'
                                                    }`}>
                                                    {quiz.difficulty}
                                                </span>
                                            </div>
                                            <div className="col-span-2 text-center text-gray-400">
                                                {quiz.attempts}
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <p className="font-bold text-emerald-400">{quiz.avgScore}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
};
