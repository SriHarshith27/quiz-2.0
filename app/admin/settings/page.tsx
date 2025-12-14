'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Database, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
    const [seeding, setSeeding] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleSeed = async () => {
        setSeeding(true);
        setResult(null);
        setError('');

        try {
            const res = await fetch('/api/admin/seed', {
                method: 'POST',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to seed data');
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
                <p className="text-gray-400 mt-1">System configuration and maintenance tools.</p>
            </header>

            <div className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-800 p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Seed Analytics Data</h3>
                                <p className="text-sm text-gray-400 mt-1 max-w-md">
                                    Populate the database with mock quiz attempts for visualization testing.
                                    <span className="text-amber-400 block mt-1">Warning: This will add 500+ records to your database.</span>
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleSeed}
                            disabled={seeding}
                            className="bg-purple-600 hover:bg-purple-500 text-white min-w-[140px]"
                        >
                            {seeding ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                            {seeding ? 'Seeding...' : 'Run Seed Script'}
                        </Button>
                    </div>

                    {/* Result Feedback */}
                    {result && (
                        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-400 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle size={20} />
                            <div>
                                <p className="font-medium">Success!</p>
                                <p className="text-xs opacity-80">
                                    Users Linked: {result.usersFound} | Attempts Created: {result.attemptsCreated}
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle size={20} />
                            <div>
                                <p className="font-medium">Error</p>
                                <p className="text-xs opacity-80">{error}</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
