import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Sparkles, Loader2, BrainCircuit, ThumbsUp, TrendingUp, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface Question {
    id: string;
    question_text: string;
    options: string[];
    correct_answer: number;
    points: number;
    quiz_id: string;
    category?: string;
}

interface QuizResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    attempt: any;
    questions: Question[];
}

export const QuizResultModal = ({ isOpen, onClose, attempt, questions }: QuizResultModalProps) => {
    const [explainingId, setExplainingId] = useState<string | null>(null);
    const [explanations, setExplanations] = useState<Record<string, string>>({});

    // AI Summary State
    const [aiSummary, setAiSummary] = useState<any>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        try {
            const res = await fetch('/api/quiz/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    score: attempt.score,
                    totalPoints: questions.reduce((acc, q) => acc + (q.points || 1), 0),
                    questions: questions,
                    userAnswers: attempt.answers || {}
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setAiSummary(data);
        } catch (error) {
            console.error("Summary Generation Error:", error);
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    if (!isOpen || !attempt) return null;

    const userAnswers = attempt.answers || {};

    const handleAskAI = async (question: Question, userAnswerIndex: number | undefined) => {
        setExplainingId(question.id);
        try {
            const res = await fetch('/api/quiz/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizId: attempt.quiz_id,
                    question: question.question_text,
                    userAnswer: userAnswerIndex !== undefined ? question.options[userAnswerIndex] : 'Skipped',
                    correctAnswer: question.options[question.correct_answer]
                })
            });
            const data = await res.json();
            if (data.explanation) {
                setExplanations(prev => ({ ...prev, [question.id]: data.explanation }));
            }
        } catch (error) {
            console.error('AI Error:', error);
        } finally {
            setExplainingId(null);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gray-900 border border-gray-800 w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl"
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-800">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">Attempt Review</h2>
                            <p className="text-sm text-gray-400">
                                Score: <span className="text-emerald-400 font-bold">{attempt.score} points</span> •
                                Time: {Math.floor(attempt.time_taken / 60)}m {attempt.time_taken % 60}s
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                            <X className="text-gray-400" />
                        </button>
                    </div>

                    {/* AI Performance Summary Section */}
                    <div className="px-6 pt-6 mb-2">
                        {!aiSummary && !isGeneratingSummary ? (
                            <Button
                                onClick={handleGenerateSummary}
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white p-4 h-auto rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
                            >
                                <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                                <div className="text-left">
                                    <div className="font-bold text-lg">Generate AI Performance Report</div>
                                    <div className="text-xs text-indigo-200 font-normal">Get personalized strengths, weaknesses, and study recommendations</div>
                                </div>
                                <ArrowRight className="ml-auto opacity-50" />
                            </Button>
                        ) : isGeneratingSummary ? (
                            <div className="w-full bg-gray-800/50 rounded-xl p-8 flex flex-col items-center justify-center text-center border border-gray-700">
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                                <h3 className="text-white font-medium">Analyzing your performance...</h3>
                                <p className="text-sm text-gray-400">Reviewing {questions.length} questions and answers</p>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-800/40 border border-gray-700 rounded-xl overflow-hidden"
                            >
                                <div className="p-4 bg-gray-800/80 border-b border-gray-700 flex items-center gap-2">
                                    <BrainCircuit className="text-indigo-400 w-5 h-5" />
                                    <h3 className="font-bold text-white">AI Analysis Report</h3>
                                </div>
                                <div className="p-5 grid gap-6 md:grid-cols-2">
                                    {/* Strengths & Weaknesses */}
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <ThumbsUp size={14} /> Strengths
                                            </h4>
                                            <ul className="space-y-2">
                                                {aiSummary.strengths.map((s: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300 bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                                                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <TrendingUp size={14} /> Areas for Improvement
                                            </h4>
                                            <ul className="space-y-2">
                                                {aiSummary.weaknesses.map((w: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300 bg-amber-500/5 p-2 rounded border border-amber-500/10">
                                                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                        {w}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Recommendation */}
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex flex-col">
                                        <h4 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                                            <Lightbulb className="w-4 h-4" /> Recommendation
                                        </h4>
                                        <p className="text-indigo-200 text-sm leading-relaxed mb-4 flex-1">
                                            {aiSummary.recommendation}
                                        </p>
                                        <div className="mt-auto pt-4 border-t border-indigo-500/20 text-xs text-indigo-400/60 font-mono">
                                            Powered by Groq Llama-3
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8 custom-scrollbar">
                        {questions.map((q, index) => {
                            const userAnswer = userAnswers[q.id];
                            const isCorrect = userAnswer === q.correct_answer;
                            const isSkipped = userAnswer === undefined;
                            const explanation = explanations[q.id];

                            return (
                                <div key={q.id} className={`p-6 rounded-xl border ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' :
                                    isSkipped ? 'border-gray-700 bg-gray-800/20' :
                                        'border-red-500/20 bg-red-500/5'
                                    }`}>
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' :
                                            isSkipped ? 'bg-gray-700 text-gray-400' :
                                                'bg-red-500 text-white'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-lg font-medium text-white mb-2">{q.question_text}</p>
                                            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                                                {isCorrect && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={14} /> Correct</span>}
                                                {!isCorrect && !isSkipped && <span className="text-red-400 flex items-center gap-1"><AlertCircle size={14} /> Incorrect</span>}
                                                {isSkipped && <span className="text-gray-500">Skipped</span>}
                                            </div>
                                        </div>
                                        <div className="ml-auto text-sm text-gray-500 font-mono">
                                            {isCorrect ? `+${q.points}` : '0'} pts
                                        </div>
                                    </div>

                                    <div className="grid gap-2 pl-12 mb-4">
                                        {q.options.map((opt, optIdx) => {
                                            const isSelected = userAnswer === optIdx;
                                            const isAnswer = q.correct_answer === optIdx;

                                            let style = "border-gray-800 bg-gray-900/50 text-gray-400";
                                            if (isAnswer) style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                                            else if (isSelected && !isCorrect) style = "border-red-500/50 bg-red-500/10 text-red-300";

                                            return (
                                                <div key={optIdx} className={`p-3 rounded-lg border text-sm flex items-center justify-between ${style}`}>
                                                    <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                                    {isAnswer && <CheckCircle size={16} className="text-emerald-500" />}
                                                    {isSelected && !isAnswer && <X size={16} className="text-red-500" />}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* AI Explanation Area */}
                                    {!isCorrect && (
                                        <div className="pl-12">
                                            {!explanation ? (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleAskAI(q, userAnswer)}
                                                    disabled={explainingId === q.id}
                                                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20"
                                                >
                                                    {explainingId === q.id ? (
                                                        <><Loader2 className="animate-spin mr-2" size={16} /> AI Thinking...</>
                                                    ) : (
                                                        <><Sparkles className="mr-2" size={16} /> Explain with AI</>
                                                    )}
                                                </Button>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-sm text-purple-200"
                                                >
                                                    <div className="flex items-center gap-2 mb-2 font-bold text-purple-400">
                                                        <Sparkles size={16} /> AI Explanation
                                                    </div>
                                                    <p className="leading-relaxed">{explanation}</p>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
