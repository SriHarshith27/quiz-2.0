'use client';

import { useState } from 'react';
import { QuizData } from './types';
import { ArrowRight, Upload } from 'lucide-react'; // Added Upload icon

interface QuizDetailsFormProps {
    initialData: QuizData;
    onSubmit: (data: QuizData) => void;
    onFileSelect?: (file: File | null) => void; // Added onFileSelect prop
    selectedFile?: File | null; // Added selectedFile prop
}

export const QuizDetailsForm = ({ initialData, onSubmit, onFileSelect, selectedFile }: QuizDetailsFormProps) => {
    const [formData, setFormData] = useState<QuizData>(initialData);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onFileSelect && e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        } else if (onFileSelect) {
            onFileSelect(null); // Clear selected file if none is chosen
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="space-y-4">
                <div>
                    <label className="block text-gray-400 text-sm font-medium mb-1">Quiz Title</label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g., Introduction to React Patterns"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 text-sm font-medium mb-1">Description</label>
                    <textarea
                        required
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        placeholder="Brief overview of what this quiz covers..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1">Category</label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="" disabled>Select Category</option>
                            <option value="Programming">Programming</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Science">Science</option>
                            <option value="History">History</option>
                            <option value="General Knowledge">General Knowledge</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1">Difficulty</label>
                        <select
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-gray-400 text-sm font-medium mb-1">Time Limit (minutes)</label>
                    <input
                        type="number"
                        min="1"
                        max="180"
                        value={formData.timeLimit}
                        onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 text-sm font-medium mb-1">Max Attempts</label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.maxAttempts}
                        onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* New File Input Field */}
                {onFileSelect && (
                    <div className="border border-dashed border-gray-700 rounded-lg p-4 bg-gray-800/30">
                        <label className="block text-sm font-medium text-purple-400 mb-2 flex items-center gap-2">
                            <Upload size={16} /> Reference Material (PDF - Optional)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Upload a PDF to enable AI explanations for students.</p>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-purple-500/10 file:text-purple-400
                                hover:file:bg-purple-500/20
                                cursor-pointer"
                        />
                        {selectedFile && <p className="text-xs text-green-400 mt-2">Selected: {selectedFile.name}</p>}
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]"
                >
                    Next Step
                    <ArrowRight size={20} />
                </button>
            </div>
        </form>
    );
};
