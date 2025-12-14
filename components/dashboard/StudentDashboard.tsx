import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { LogOut, BookOpen, Trophy, Clock, History, Eye, ArrowLeft, BrainCircuit } from 'lucide-react';
import { QuizList } from './QuizList';
import { QuizTaker } from '@/components/quiz/QuizTaker';
import { QuizResultModal } from './QuizResultModal';

interface StudentDashboardProps {
    profile: any;
    onLogout: () => void;
}

type ViewState = 'home' | 'quiz' | 'history';

export const StudentDashboard = ({ profile, onLogout }: StudentDashboardProps) => {
    const [view, setView] = useState<ViewState>('home');
    const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
    const [stats, setStats] = useState({ quizzesTaken: 0, totalScore: 0, timeSpentMinutes: 0 });
    const [history, setHistory] = useState<any[]>([]);

    // Modal State
    const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
    const [reviewQuestions, setReviewQuestions] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        const fetchUserData = async () => {
            if (!profile?.id) return;

            // Fetch attempts with quiz details
            const { data, error } = await supabase
                .from('quiz_attempts')
                .select('*, quizzes(title)')
                .eq('user_id', profile.id)
                .order('completed_at', { ascending: false });

            if (!error && data) {
                const totalScore = data.reduce((acc, curr) => acc + (curr.score || 0), 0);
                const totalTimeSeconds = data.reduce((acc: number, curr: { time_taken: number | null }) => acc + (curr.time_taken || 0), 0);

                setStats({
                    quizzesTaken: data.length,
                    totalScore,
                    timeSpentMinutes: Math.floor(totalTimeSeconds / 60)
                });
                setHistory(data);
            }
        };

        fetchUserData();
    }, [profile?.id, activeQuizId]); // Re-fetch after a quiz

    const handleStartQuiz = (quizId: string) => {
        setActiveQuizId(quizId);
        setView('quiz');
    };

    const handleExitQuiz = () => {
        setActiveQuizId(null);
        setView('home');
    };

    const handleReview = async (attempt: any) => {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('quiz_id', attempt.quiz_id)
                .order('order_index', { ascending: true });

            if (!error && data) {
                setReviewQuestions(data);
                setSelectedAttempt(attempt);
                setIsModalOpen(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // View: Quiz Taker
    if (view === 'quiz' && activeQuizId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
                <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex justify-between items-center">
                            <Logo size="md" showText textColor="text-white" />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExitQuiz}
                                className="text-gray-300 border-gray-700 hover:text-white hover:bg-gray-800"
                            >
                                Cancel Quiz
                            </Button>
                        </div>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <QuizTaker
                        quizId={activeQuizId}
                        userId={profile?.id}
                        onComplete={() => { }} // Confetti or msg handled in component
                        onExit={handleExitQuiz}
                    />
                </main>
            </div>
        );
    }

    // View: History List
    if (view === 'history') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
                <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex justify-between items-center">
                            <Logo size="md" showText textColor="text-white" />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setView('home')}
                                className="text-gray-300 border-gray-700 hover:text-white hover:bg-gray-800"
                            >
                                <ArrowLeft size={16} className="mr-2" />
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Quiz History</h1>
                        <p className="text-gray-400">Review your past attempts and learn from mistakes.</p>
                    </div>

                    {history.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
                            <History className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No attempts yet.</p>
                            <Button variant="ghost" onClick={() => setView('home')} className="mt-2 text-blue-400">
                                Take a quiz now
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {history.map((attempt) => (
                                <div key={attempt.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between hover:border-gray-700 transition-colors">
                                    <div className="mb-4 md:mb-0 text-center md:text-left">
                                        <h3 className="text-xl font-medium text-white mb-1">{attempt.quizzes?.title || 'Unknown Quiz'}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-400 justify-center md:justify-start">
                                            <span className="flex items-center gap-1"><Clock size={14} /> {new Date(attempt.completed_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>Time: {Math.floor((attempt.time_taken || 0) / 60)}m {(attempt.time_taken || 0) % 60}s</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-emerald-400">{attempt.score}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Score</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => window.location.href = `/dashboard/history/${attempt.id}/analysis`}
                                                variant="outline"
                                                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                                            >
                                                <BrainCircuit size={18} className="mr-2" />
                                                AI Analysis
                                            </Button>
                                            <Button
                                                onClick={() => handleReview(attempt)}
                                                className="bg-blue-600 hover:bg-blue-500 text-white border-0"
                                            >
                                                <Eye size={18} className="mr-2" />
                                                Review
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <QuizResultModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        attempt={selectedAttempt}
                        questions={reviewQuestions}
                    />
                </main>
            </div>
        );
    }

    // View: Home Dashboard
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
            <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <Logo size="md" showText textColor="text-white" />
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
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{profile?.full_name || 'Student'}</span>!
                    </h1>
                    <p className="text-xl text-gray-400">Ready to test your knowledge today?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Card hover className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                                <BookOpen className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.quizzesTaken}</p>
                                <p className="text-gray-400">Quizzes Taken</p>
                            </div>
                        </div>
                    </Card>

                    <Card hover className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-500/20 p-3 rounded-lg border border-emerald-500/30">
                                <Trophy className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.totalScore}</p>
                                <p className="text-gray-400">Total Score</p>
                            </div>
                        </div>
                    </Card>

                    <Card hover className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-amber-500/20 p-3 rounded-lg border border-amber-500/30">
                                <Clock className="h-6 w-6 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {stats.timeSpentMinutes < 60
                                        ? `${stats.timeSpentMinutes}m`
                                        : `${(stats.timeSpentMinutes / 60).toFixed(1)}h`}
                                </p>
                                <p className="text-gray-400">Time Spent</p>
                            </div>
                        </div>
                    </Card>

                    <Card
                        hover
                        className="bg-gray-900/50 border-gray-800 backdrop-blur-sm cursor-pointer group"
                        onClick={() => setView('history')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-500/30 group-hover:bg-purple-500/30 transition-colors">
                                <History className="h-6 w-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">View History</p>
                                <p className="text-gray-400 text-sm">Review Attempts</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">Available Quizzes</h2>
                    <QuizList onStartQuiz={handleStartQuiz} />
                </div>
            </main>
        </div>
    );
};
