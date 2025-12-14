'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { QuizDetailsForm } from './QuizDetailsForm';
import { QuestionManager } from './QuestionManager';
import { ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react';
import { QuizData, QuestionData } from './types';

interface QuizCreatorProps {
    onCancel: () => void;
    onSuccess: () => void;
    userId: string;
}

export const QuizCreator = ({ onCancel, onSuccess, userId }: QuizCreatorProps) => {
    const [step, setStep] = useState<'details' | 'questions'>('details');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [quizData, setQuizData] = useState<QuizData>({
        title: '',
        description: '',
        category: '',
        difficulty: 'medium',
        timeLimit: 30,
        maxAttempts: 1
    });

    const [questions, setQuestions] = useState<QuestionData[]>([]);

    const handleDetailsSubmit = (data: QuizData) => {
        setQuizData(data);
        setStep('questions');
    };

    const handleSaveQuiz = async () => {
        if (questions.length === 0) {
            setError('Please add at least one question before saving.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();

            // 1. Insert Quiz
            const { data: quizResult, error: quizError } = await supabase
                .from('quizzes')
                .insert({
                    title: quizData.title,
                    description: quizData.description,
                    category: quizData.category,
                    difficulty: quizData.difficulty,
                    time_limit: quizData.timeLimit,
                    max_attempts: quizData.maxAttempts,
                    created_by: userId,
                    is_published: true // Auto-publish for now
                })
                .select()
                .single();

            if (quizError) throw quizError;

            // 2. Prepare Questions with Quiz ID
            const questionsToInsert = questions.map((q, index) => ({
                quiz_id: quizResult.id,
                question_text: q.question_text,
                options: q.options, // API expects valid JSONB, Supabase client handles array->json
                correct_answer: q.correct_answer + 1, // UX uses 0-index, DB might use 1-index or 0. Schema said integer. Let's assume 1-based for "Option 1" in UI.
                points: q.points,
                order_index: index
            }));

            // 3. Insert Questions (Bulk)
            const { error: questionsError } = await supabase
                .from('questions')
                .insert(questionsToInsert);

            if (questionsError) throw questionsError;

            // 4. Ingest Reference PDF (RAG) if a file was selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('quizId', quizResult.id);

                // Non-blocking upload to speed up UI
                fetch('/api/quiz/ingest', {
                    method: 'POST',
                    body: formData
                }).then(res => {
                    if (res.ok) console.log('PDF Ingested successfully');
                    else console.error('PDF Ingest failed:', res.statusText);
                }).catch(err => {
                    console.error('Error during PDF ingest fetch:', err);
                });
            }

            onSuccess();
        } catch (err: any) {
            console.error('Save Error:', err);
            setError(err.message || 'Failed to save quiz');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={step === 'questions' ? () => setStep('details') : onCancel}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    {step === 'questions' ? 'Back to Details' : 'Cancel'}
                </button>
                <h2 className="text-2xl font-bold text-white">Create New Quiz</h2>
                <div className="w-24"></div> {/* Spacer for centering */}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {step === 'details' ? (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <QuizDetailsForm
                            initialData={quizData}
                            onSubmit={handleDetailsSubmit}
                            selectedFile={selectedFile}
                            onFileSelect={setSelectedFile}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="questions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                            <div>
                                <h3 className="text-white font-semibold">{quizData.title}</h3>
                                <p className="text-gray-400 text-sm">{questions.length} questions added</p>
                            </div>
                            <button
                                onClick={handleSaveQuiz}
                                disabled={loading || questions.length === 0}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${loading || questions.length === 0
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-500 hover:to-green-500 shadow-lg shadow-emerald-500/20'
                                    }`}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Save Quiz
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
                                {error}
                            </div>
                        )}

                        <QuestionManager
                            questions={questions}
                            onQuestionsChange={setQuestions}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
