'use client';

import { useState } from 'react';
import { QuestionData } from './types';
import { CSVUploader } from './CSVUploader';
import { ManualQuestionForm } from './ManualQuestionForm';
import { FileText, Plus, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionManagerProps {
    questions: QuestionData[];
    onQuestionsChange: (questions: QuestionData[]) => void;
}

export const QuestionManager = ({ questions, onQuestionsChange }: QuestionManagerProps) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');

    const handleUploadQuestions = (newQuestions: QuestionData[]) => {
        onQuestionsChange([...questions, ...newQuestions]);
    };

    const handleManualQuestionAdd = (question: QuestionData) => {
        onQuestionsChange([...questions, question]);
    };

    const removeQuestion = (index: number) => {
        const newQ = [...questions];
        newQ.splice(index, 1);
        onQuestionsChange(newQ);
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-800 pb-2">
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex items-center gap-2 pb-2 px-1 transition-colors relative ${activeTab === 'upload' ? 'text-purple-400' : 'text-gray-400 hover:text-gray-300'
                        }`}
                >
                    <FileText size={18} />
                    CSV Upload
                    {activeTab === 'upload' && (
                        <motion.div layoutId="tab" className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-purple-400" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`flex items-center gap-2 pb-2 px-1 transition-colors relative ${activeTab === 'manual' ? 'text-purple-400' : 'text-gray-400 hover:text-gray-300'
                        }`}
                >
                    <Plus size={18} />
                    Manual Entry
                    {activeTab === 'manual' && (
                        <motion.div layoutId="tab" className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-purple-400" />
                    )}
                </button>
            </div>

            {/* Action Area */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <AnimatePresence mode="wait">
                    {activeTab === 'upload' ? (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <CSVUploader onUpload={handleUploadQuestions} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="manual"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <ManualQuestionForm onAddQuestion={handleManualQuestionAdd} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Question List */}
            <div className="space-y-4">
                <h3 className="text-gray-400 font-medium">Questions ({questions.length})</h3>

                {questions.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl">
                        <p className="text-gray-600">No questions added yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {questions.map((q, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-gray-900 border border-gray-800 p-4 rounded-lg flex justify-between items-start group hover:border-gray-700 transition-colors"
                                layout
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded">Q{idx + 1}</span>
                                        <span className="text-sm text-gray-500">Points: {q.points}</span>
                                    </div>
                                    <p className="text-white font-medium mb-2">{q.question_text}</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        {q.options.map((opt, optIdx) => (
                                            <div
                                                key={optIdx}
                                                className={`px-2 py-1 rounded ${optIdx === q.correct_answer
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : 'text-gray-500 bg-gray-800/50'
                                                    }`}
                                            >
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeQuestion(idx)}
                                    className="text-gray-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
