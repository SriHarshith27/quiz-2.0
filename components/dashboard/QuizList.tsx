'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Clock, BarChart, BookOpen, ChevronRight, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuizListProps {
    onStartQuiz: (quizId: string) => void;
}

interface Quiz {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    time_limit: number;
    max_attempts: number;
    questions?: { count: number }[];
}

export const QuizList = ({ onStartQuiz }: QuizListProps) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [userAttempts, setUserAttempts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch quizzes
                const { data: quizzesData, error: quizzesError } = await supabase
                    .from('quizzes')
                    .select('*, questions(count)')
                    .eq('is_published', true)
                    .order('created_at', { ascending: false });

                if (quizzesError) throw quizzesError;

                // Fetch user attempts
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: attemptsData, error: attemptsError } = await supabase
                        .from('quiz_attempts')
                        .select('quiz_id')
                        .eq('user_id', user.id);

                    if (!attemptsError && attemptsData) {
                        const attemptsCount: Record<string, number> = {};
                        attemptsData.forEach(a => {
                            attemptsCount[a.quiz_id] = (attemptsCount[a.quiz_id] || 0) + 1;
                        });
                        setUserAttempts(attemptsCount);
                    }
                }

                setQuizzes(quizzesData || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getDifficultyColor = (diff: string) => {
        switch (diff.toLowerCase()) {
            case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 rounded-2xl bg-gray-900/50 animate-pulse border border-gray-800"></div>
                ))}
            </div>
        );
    }

    if (quizzes.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
                <BookOpen className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 mb-6 text-lg">No quizzes available at the moment.</p>
                <p className="text-sm text-gray-600">Please check back later!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => {
                const attempts = userAttempts[quiz.id] || 0;
                const isMaxAttemptsReached = attempts >= (quiz.max_attempts || 1);

                return (
                    <motion.div
                        key={quiz.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="group relative bg-gray-900/50 hover:bg-gray-800/80 backdrop-blur-sm border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getDifficultyColor(quiz.difficulty)}`}>
                                    {quiz.difficulty}
                                </span>
                                <span className="text-xs font-medium text-gray-500 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                                    {quiz.category}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                                {quiz.title}
                            </h3>
                            <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-1">
                                {quiz.description}
                            </p>

                            <div className="flex items-center justify-between mb-6 text-sm text-gray-500 border-t border-gray-800 pt-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={16} className="text-blue-400" />
                                        {quiz.time_limit}m
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <BarChart size={16} className="text-purple-400" />
                                        {quiz.questions?.[0]?.count || 0}Q
                                    </div>
                                </div>
                                <div className={`text-xs px-2 py-0.5 rounded border ${isMaxAttemptsReached ? 'text-red-400 border-red-400/20 bg-red-400/10' : 'text-gray-400 border-gray-700'}`}>
                                    {attempts}/{quiz.max_attempts || 1} Runs
                                </div>
                            </div>

                            <Button
                                onClick={() => onStartQuiz(quiz.id)}
                                disabled={isMaxAttemptsReached}
                                className={`w-full flex items-center justify-center gap-2 transition-all duration-300 ${isMaxAttemptsReached
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700'
                                    : 'bg-gray-800 hover:bg-blue-600 text-white border-gray-700 hover:border-blue-500 group-hover:shadow-lg lg:opacity-0 lg:group-hover:opacity-100'}`}
                            >
                                {isMaxAttemptsReached ? (
                                    <>Max Attempts Reached</>
                                ) : (
                                    <>
                                        <PlayCircle size={18} />
                                        Start Quiz
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
