'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/common/Button';
import { Loader2, ArrowLeft, BrainCircuit, AlertCircle, CheckCircle, BookOpen, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuizAnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [attempt, setAttempt] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [analysis, setAnalysis] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const supabase = createClient();

            // 1. Fetch Attempt
            const { data: attemptData, error: attemptError } = await supabase
                .from('quiz_attempts')
                .select('*, quizzes(*)')
                .eq('id', params.id)
                .single();

            if (attemptError) throw attemptError;
            setAttempt(attemptData);

            // 2. Fetch Questions
            const { data: questionsData, error: questionsError } = await supabase
                .from('questions')
                .select('*')
                .eq('quiz_id', attemptData.quiz_id)
                .order('order_index');

            if (questionsError) throw questionsError;
            setQuestions(questionsData);

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRunAnalysis = async () => {
        setAnalyzing(true);
        try {
            const res = await fetch('/api/quiz/analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attemptId: params.id })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setAnalysis(data.analysis || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Error Loading Analysis</h2>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4 text-gray-400 hover:text-white pl-0"
                    >
                        <ArrowLeft size={16} className="mr-2" /> Back to History
                    </Button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                Detailed AI Analysis
                            </h1>
                            <p className="text-gray-400 mt-1">
                                {attempt?.quizzes?.title} • Score: {attempt?.score} points
                            </p>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl">
                            <BrainCircuit className="h-8 w-8 text-purple-400" />
                        </div>
                    </div>
                </div>

                {/* Analysis Trigger Area */}
                {analysis.length === 0 && (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center backdrop-blur-sm">
                        <GraduationCap className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-3">Ready to Deep Dive?</h2>
                        <p className="text-gray-400 max-w-lg mx-auto mb-8">
                            Our AI will analyze every incorrect answer, explain the misconceptions behind your choices, and teach you the correct concepts.
                        </p>
                        <Button
                            onClick={handleRunAnalysis}
                            disabled={analyzing}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[200px] h-12 text-lg"
                        >
                            {analyzing ? (
                                <><Loader2 className="animate-spin mr-2" /> Analyzing...</>
                            ) : (
                                <><BrainCircuit className="mr-2" /> Generate Full Report</>
                            )}
                        </Button>
                    </div>
                )}

                {/* Analysis Results */}
                <div className="space-y-6">
                    {analysis.map((item, index) => {
                        const question = questions.find(q => q.id === item.questionId);
                        if (!question) return null;

                        return (
                            <motion.div
                                key={item.questionId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden"
                            >
                                <div className="p-6 border-b border-gray-800 bg-gray-900/60">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-red-500/10 text-red-400 font-bold px-3 py-1 rounded text-sm shrink-0">
                                            Q{index + 1}
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-200">
                                            {question.question_text}
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-6 grid md:grid-cols-2 gap-6">
                                    {/* Misconception */}
                                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-amber-500 font-bold text-sm mb-2">
                                            <AlertCircle size={16} /> Why you might have missed it
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {item.misconception}
                                        </p>
                                    </div>

                                    {/* Correct Concept */}
                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm mb-2">
                                            <CheckCircle size={16} /> The Correct Concept
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed mb-3">
                                            {item.correctConcept}
                                        </p>
                                        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                                            <BookOpen size={12} />
                                            Topic: {item.studyTopic}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
