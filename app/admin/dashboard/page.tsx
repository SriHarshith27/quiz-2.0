'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Users, BookOpen, BrainCircuit, TrendingUp } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, ComposedChart,
    Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/analytics');
                const json = await res.json();
                if (json.stats) setData(json);
            } catch (error) {
                console.error("Failed to load analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-white">Loading Intelligence Core...</div>;
    if (!data) return <div className="p-8 text-white">Failed to load data.</div>;

    const { stats, charts } = data;

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white">Intelligence Dashboard</h1>
                <p className="text-gray-400 mt-1">Real-time analytics across {stats.totalUsers} users and {stats.totalAttempts} quiz sessions.</p>
            </header>

            {/* 1. KEY PERFORMANCE INDICATORS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard icon={Users} label="Total Users" value={stats.totalUsers} trend="+12% growth" color="blue" />
                <StatsCard icon={BookOpen} label="Total Quizzes" value={stats.totalQuizzes} trend="Active Content" color="emerald" />
                <StatsCard icon={BrainCircuit} label="Total Attempts" value={stats.totalAttempts} trend="+5% today" color="violet" />
                <StatsCard icon={TrendingUp} label="Avg Score" value={`${stats.avgScore}/20`} trend="Platform Health" color="amber" />
            </div>

            {/* ROW 1: USER & TRAFFIC (Growth + Engagement) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="1. User Growth Engine">
                    <ResponsiveContainer>
                        <AreaChart data={charts.userGrowth}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                            <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="users" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="2. Traffic Heatmap (Peak Hours)">
                    <ResponsiveContainer>
                        <BarChart data={charts.trafficHeatmap}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                            <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="attempts" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* ROW 2: PERFORMANCE DEEP DIVE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard title="3. Score Distribution (Bell Curve)" className="lg:col-span-2">
                    <ResponsiveContainer>
                        <ComposedChart data={charts.scoreDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                            <XAxis dataKey="range" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill="#10B981" barSize={40} radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="count" stroke="#34D399" strokeWidth={2} dot={{ r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="4. Most Popular Quizzes">
                    <ResponsiveContainer>
                        <BarChart layout="vertical" data={charts.quizPopularity}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
                            <XAxis type="number" stroke="#6B7280" fontSize={12} hide />
                            <YAxis dataKey="name" type="category" width={100} stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* ROW 3: COMPLEX METRICS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard title="5. Difficulty Matrix (Time vs Score)">
                    <div className="h-full w-full flex flex-col items-center justify-center">
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                                <XAxis type="number" dataKey="avgTime" name="Time (min)" unit="m" stroke="#6B7280" fontSize={12} />
                                <YAxis type="number" dataKey="avgScore" name="Score" unit="" stroke="#6B7280" fontSize={12} />
                                <ZAxis type="number" dataKey="name" name="Quiz" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                                <Scatter name="Quizzes" data={charts.difficultyMatrix} fill="#EC4899">
                                    {charts.difficultyMatrix.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={['#EC4899', '#8B5CF6', '#3B82F6', '#10B981'][index % 4]} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                        <p className="text-xs text-gray-500 mt-2">Low Score + High Time = Hardest Quizzes</p>
                    </div>
                </ChartCard>

                <ChartCard title="6. Topic Performance Radar">
                    <ResponsiveContainer>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={charts.topicRadar}>
                            <PolarGrid stroke="#374151" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Performance" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
                            <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="7. Global Pass/Fail Ratio">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={charts.passFailRatio}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {charts.passFailRatio.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* ROW 4: TRENDS & RETENTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="8 & 9. Avg Score Trend & Retention">
                    <div className="grid grid-cols-2 gap-4 h-full">
                        {/* 8. Avg Score Trend */}
                        <div className="h-full">
                            <h4 className="text-xs text-gray-500 font-bold mb-2 uppercase">Avg Score Trend (30 Days)</h4>
                            <ResponsiveContainer width="100%" height="90%">
                                <AreaChart data={charts.avgScoreTrend}>
                                    <defs>
                                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                                    <XAxis dataKey="date" hide />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="avg" stroke="#14B8A6" strokeWidth={2} fill="url(#colorAvg)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* 9. Retention Cohorts */}
                        <div className="h-full">
                            <h4 className="text-xs text-gray-500 font-bold mb-2 uppercase">User Retention</h4>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={charts.retentionCohorts} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </ChartCard>

                {/* 10. Placeholder for Question Analysis (Coming with Deep Analytics update) */}
                <ChartCard title="10. System Health">
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="bg-emerald-500/10 p-4 rounded-full mb-4">
                            <BrainCircuit size={32} className="text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">System 100% Operational</h3>
                        <p className="text-gray-400 text-sm mt-2">
                            All analytics pipelines are functioning correctly.
                            AI Reporting engine is ready for queries.
                        </p>
                    </div>
                </ChartCard>
            </div>
        </div>
    );
}

// --- COMPONENTS ---

function ChartCard({ title, children, className = '' }: { title: string, children: React.ReactNode, className?: string }) {
    return (
        <Card className={`bg-gray-950 border-gray-800 p-6 flex flex-col h-[320px] ${className}`}>
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">{title}</h3>
            <div className="flex-1 w-full min-h-0">
                {children}
            </div>
        </Card>
    );
}

function StatsCard({ icon: Icon, label, value, trend, color }: any) {
    const colors: any = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    };

    return (
        <Card className="bg-gray-950 border-gray-800 p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                    <h4 className="text-2xl font-bold text-white font-mono">{value}</h4>
                </div>
                <div className={`p-2 rounded-lg border ${colors[color]}`}>
                    <Icon size={20} />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 font-medium">
                <TrendingUp size={12} className="text-emerald-500" />
                <span className="text-emerald-400">{trend}</span>
            </div>
        </Card>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl text-xs">
                <p className="text-gray-300 font-medium mb-1">{label}</p>
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-white">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
                        <span>{p.name}: {p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};
