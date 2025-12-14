'use client';

import { useState } from 'react';
import { QuestionData } from './types';
import { Plus, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ManualQuestionFormProps {
    onAddQuestion: (question: QuestionData) => void;
}

export const ManualQuestionForm = ({ onAddQuestion }: ManualQuestionFormProps) => {
    const [questionText, setQuestionText] = useState('');
    const [points, setPoints] = useState(10);
    const [options, setOptions] = useState<string[]>(['', '']); // Start with 2 empty options
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length >= 6) return;
        setOptions([...options, '']);
    };

    const removeOption = (index: number) => {
        if (options.length <= 2) return;
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
        if (correctAnswerIndex >= index && correctAnswerIndex > 0) {
            setCorrectAnswerIndex(correctAnswerIndex - 1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!questionText.trim()) {
            setError('Question text is required');
            return;
        }
        if (options.some(opt => !opt.trim())) {
            setError('All options must be filled');
            return;
        }
        if (options.length < 2) {
            setError('At least 2 options are required');
            return;
        }

        const newQuestion: QuestionData = {
            question_text: questionText,
            options: options,
            correct_answer: correctAnswerIndex,
            points: points
        };

        onAddQuestion(newQuestion);

        // Reset form
        setQuestionText('');
        setPoints(10);
        setOptions(['', '']);
        setCorrectAnswerIndex(0);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
                {/* Question Text & Points */}
                <div className="grid md:grid-cols-[1fr,150px] gap-4">
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1">Question Text</label>
                        <textarea
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Type your question here..."
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1">Points</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={points}
                            onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-center font-mono"
                        />
                    </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                    <label className="block text-gray-400 text-sm font-medium">Options</label>
                    <AnimatePresence>
                        {options.map((option, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-3 group"
                            >
                                <div
                                    onClick={() => setCorrectAnswerIndex(index)}
                                    className={`cursor-pointer w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${correctAnswerIndex === index
                                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500'
                                            : 'border-gray-600 text-transparent hover:border-gray-500'
                                        }`}
                                >
                                    <Check size={14} strokeWidth={3} />
                                </div>
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    className={`flex-1 bg-gray-900/50 border rounded-lg px-4 py-2 text-white outline-none transition-all ${correctAnswerIndex === index
                                            ? 'border-emerald-500/50 focus:border-emerald-500'
                                            : 'border-gray-700 focus:border-purple-500'
                                        }`}
                                    placeholder={`Option ${index + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeOption(index)}
                                    className={`p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors ${options.length <= 2 ? 'invisible' : ''
                                        }`}
                                >
                                    <X size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {options.length < 6 && (
                        <button
                            type="button"
                            onClick={addOption}
                            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-2 pl-9 transition-colors"
                        >
                            <Plus size={16} />
                            Add Option
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <button
                type="submit"
                className="w-full bg-gray-700/50 hover:bg-gray-700 text-white font-medium py-3 rounded-xl border border-dashed border-gray-600 hover:border-gray-500 transition-all flex items-center justify-center gap-2 group"
            >
                <Plus size={20} className="group-hover:scale-110 transition-transform" />
                Add Question to List
            </button>
        </form>
    );
};
