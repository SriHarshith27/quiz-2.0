'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface Question {
    id: string;
    question_text: string;
    options: string[];
    correct_answer: number;
    points: number;
}

interface QuizTakerProps {
    quizId: string;
    userId: string;
    onComplete: () => void;
    onExit: () => void;
}

export const QuizTaker = ({ quizId, userId, onComplete, onExit }: QuizTakerProps) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [totalPoints, setTotalPoints] = useState(0);

    const supabase = createClient();

    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                // Fetch quiz details for time limit
                const { data: quizData, error: quizError } = await supabase
                    .from('quizzes')
                    .select('time_limit')
                    .eq('id', quizId)
                    .single();

                if (quizError) throw quizError;
                if (quizData) setTimeLeft(quizData.time_limit * 60);

                // Fetch questions
                const { data: questionsData, error: questionsError } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('quiz_id', quizId)
                    .order('order_index', { ascending: true });

                if (questionsError) throw questionsError;

                if (questionsData) {
                    setQuestions(questionsData);
                    const total = questionsData.reduce((acc, q) => acc + (q.points || 10), 0);
                    setTotalPoints(total);
                }
            } catch (error) {
                console.error('Error fetching quiz:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizData();
    }, [quizId]);

    useEffect(() => {
        if (timeLeft <= 0 || score !== null) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, score]);

    const handleAnswerSelect = (optionIndex: number) => {
        setAnswers({ ...answers, [currentQuestionIndex]: optionIndex });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        let currentScore = 0;
        let earnedPoints = 0;

        const savedAnswers: Record<string, number> = {};
        questions.forEach((q, index) => {
            if (answers[index] !== undefined) {
                savedAnswers[q.id] = answers[index];
            }
            if (answers[index] === q.correct_answer) {
                currentScore++;
                earnedPoints += (q.points || 10);
            }
        });

        try {
            const { error } = await supabase
                .from('quiz_attempts')
                .insert({
                    user_id: userId,
                    quiz_id: quizId,
                    score: earnedPoints,
                    total_questions: questions.length,
                    time_taken: (questions.length * 60) - timeLeft, // Approximate
                    answers: savedAnswers
                });

            if (error) throw error;
            setScore(earnedPoints);
        } catch (error) {
            console.error('Error submitting quiz:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (score !== null) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700 shadow-2xl"
                >
                    <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
                    <p className="text-gray-400 mb-8">Great job on finishing the quiz.</p>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                            <p className="text-sm text-gray-500 mb-1">Your Score</p>
                            <p className="text-4xl font-bold text-emerald-400">{score}</p>
                            <p className="text-xs text-gray-500">out of {totalPoints}</p>
                        </div>
                        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                            <p className="text-sm text-gray-500 mb-1">Accuracy</p>
                            <p className="text-4xl font-bold text-blue-400">
                                {Math.round((score / totalPoints) * 100)}%
                            </p>
                        </div>
                    </div>

                    <Button onClick={onExit} className="w-full py-4 text-lg">
                        Return to Dashboard
                    </Button>
                </motion.div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 bg-gray-900/50 p-4 rounded-xl border border-gray-800 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-400">
                        Question {currentQuestionIndex + 1}/{questions.length}
                    </span>
                    <div className="h-4 w-px bg-gray-700"></div>
                    <span className="text-sm font-medium text-emerald-400">
                        {currentQuestion.points || 10} Points
                    </span>
                </div>
                <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
                    <Clock size={20} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question Card */}
            <motion.div
                key={currentQuestion.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 mb-8"
            >
                <h3 className="text-2xl font-bold text-white mb-8 leading-relaxed">
                    {currentQuestion.question_text}
                </h3>

                <div className="grid gap-4">
                    {currentQuestion.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswerSelect(idx)}
                            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group flex items-center justify-between ${answers[currentQuestionIndex] === idx
                                ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-lg shadow-blue-500/10'
                                : 'bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                                }`}
                        >
                            <span className="flex items-center gap-4">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${answers[currentQuestionIndex] === idx
                                    ? 'bg-blue-500 border-blue-400 text-white'
                                    : 'bg-gray-800 border-gray-700 text-gray-500 group-hover:border-gray-500'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                {option}
                            </span>
                            {answers[currentQuestionIndex] === idx && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <CheckCircle className="text-blue-400" size={20} />
                                </motion.div>
                            )}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Previous
                </Button>

                {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-8"
                    >
                        {isSubmitting ? 'Submitting...' : 'Finish Quiz'}
                    </Button>
                ) : (
                    <Button
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8"
                    >
                        Next Question
                        <ArrowRight size={18} className="ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
};
