'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Loader2, Sparkles, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ReportsPage() {
    const [prompt, setPrompt] = useState('');
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setReport('');

        try {
            const res = await fetch('/api/admin/intelligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setReport(data.report);
        } catch (error) {
            console.error(error);
            // Handle error (toast or alert)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="text-purple-400" /> Intelligence Reports
                </h1>
                <p className="text-gray-400 mt-1">Generate executive summaries using AI analysis of platform data.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Control Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-gray-900/50 border-gray-800 p-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            What would you like to know?
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ex: Analyze the fail rate of the React quiz and suggest improvements..."
                            className="w-full h-32 bg-black border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none mb-4 resize-none"
                        />
                        <Button
                            onClick={handleGenerate}
                            disabled={loading || !prompt.trim()}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" size={18} />}
                            Generate Report
                        </Button>

                        <div className="mt-6">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Prompts</h4>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setPrompt("Analyze the quiz difficulty distribution based on average scores. Which quizzes seem too hard?")}
                                    className="w-full text-left text-xs text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded transition-colors"
                                >
                                    📊 Difficulty Analysis
                                </button>
                                <button
                                    onClick={() => setPrompt("Identify which topics have the highest failure rates and suggest learning resources.")}
                                    className="w-full text-left text-xs text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded transition-colors"
                                >
                                    📉 Failure Rate Investigation
                                </button>
                                <button
                                    onClick={() => setPrompt("Summarize user growth trends over the last 30 days. Is the platform growing healthily?")}
                                    className="w-full text-left text-xs text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded transition-colors"
                                >
                                    📈 Growth Trend Report
                                </button>
                                <button
                                    onClick={() => setPrompt("Based on user retention cohorts, recommend 3 specific actions to improve student engagement.")}
                                    className="w-full text-left text-xs text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded transition-colors"
                                >
                                    👥 Improve Retention Strategy
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Report Display */}
                <div className="lg:col-span-2">
                    {report ? (
                        <div className="bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Report Header */}
                            <div className="bg-gray-50 border-b border-gray-200 p-6 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <FileText className="text-gray-400" />
                                    <span className="font-mono text-xs text-gray-500 uppercase">Generated Report</span>
                                </div>
                                <Button size="sm" variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-100">
                                    <Download size={14} className="mr-2" /> Export PDF
                                </Button>
                            </div>

                            {/* Report Content */}
                            <div className="p-8 prose prose-slate max-w-none">
                                <ReactMarkdown>{report}</ReactMarkdown>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] border-2 border-dashed border-gray-800 rounded-xl flex flex-col items-center justify-center text-gray-600">
                            <div className="bg-gray-900 p-4 rounded-full mb-4">
                                <FileText size={32} className="text-gray-700" />
                            </div>
                            <p>No report generated yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
