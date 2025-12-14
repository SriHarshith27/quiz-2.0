'use client';

import { useState, useRef } from 'react';
import { Upload, AlertCircle, Check, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuestionData } from './types';

interface CSVUploaderProps {
    onUpload: (questions: QuestionData[]) => void;
}

export const CSVUploader = ({ onUpload }: CSVUploaderProps) => {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const parseCSV = (text: string) => {
        try {
            const lines = text.split('\n');
            const parsedQuestions: QuestionData[] = [];
            const errors: string[] = [];

            // Skip header if it exists (heuristic: check if first col is 'question' or similar)
            let startIndex = 0;
            if (lines[0].toLowerCase().includes('question')) {
                startIndex = 1;
            }

            for (let i = startIndex; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // Simple CSV split (note: doesn't handle quoted commas, but good enough for simple use)
                const cols = line.split(',').map(c => c.trim());

                // Expected format: question, opt1, opt2, opt3, opt4, correct_index (1-4)
                if (cols.length < 6) {
                    errors.push(`Line ${i + 1}: Not enough columns. Expected 6.`);
                    continue;
                }

                const questionText = cols[0];
                const options = cols.slice(1, 5);
                const correctAnswerRaw = parseInt(cols[5]);

                if (isNaN(correctAnswerRaw) || correctAnswerRaw < 1 || correctAnswerRaw > 4) {
                    errors.push(`Line ${i + 1}: Invalid correct answer index. Must be 1-4.`);
                    continue;
                }

                parsedQuestions.push({
                    question_text: questionText,
                    options: options,
                    correct_answer: correctAnswerRaw - 1, // Convert 1-based to 0-based
                    points: 10 // Default points
                });
            }

            if (errors.length > 0) {
                setError(`Found ${errors.length} errors. First error: ${errors[0]}`);
            } else if (parsedQuestions.length === 0) {
                setError("No valid questions found in CSV.");
            } else {
                onUpload(parsedQuestions);
                setError(null);
            }
        } catch (e) {
            setError("Failed to parse CSV file.");
        }
    };

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
            setError("Please upload a valid CSV file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            parseCSV(text);
        };
        reader.readAsText(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    return (
        <div className="w-full">
            <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all text-center ${dragActive
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleChange}
                />

                <div className="flex flex-col items-center gap-3">
                    <div className={`p-4 rounded-full ${dragActive ? 'bg-purple-500/20' : 'bg-gray-800'}`}>
                        <Upload className={`h-8 w-8 ${dragActive ? 'text-purple-400' : 'text-gray-400'}`} />
                    </div>
                    <div>
                        <p className="text-white font-medium text-lg">
                            Drag & drop your CSV here
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                            or <button onClick={() => fileInputRef.current?.click()} className="text-purple-400 hover:underline">browse files</button>
                        </p>
                    </div>
                </div>

                {/* Format Hint */}
                <div className="mt-6 text-xs text-gray-500 bg-gray-900/50 p-3 rounded-lg border border-gray-800 text-left mx-auto max-w-sm">
                    <p className="font-semibold mb-1 text-gray-400 flex items-center gap-2">
                        <FileText size={12} /> CSV Format Required:
                    </p>
                    <code className="block bg-black/30 p-2 rounded text-gray-300 break-all">
                        Question, Option1, Option2, Option3, Option4, CorrectAnswerIndex(1-4)
                    </code>
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3"
                >
                    <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
            )}
        </div>
    );
};
