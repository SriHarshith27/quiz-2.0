'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, FileText, LogOut, ShieldAlert, Users, Settings } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login');
            return;
        }

        // Verify Admin Role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            router.push('/dashboard'); // Kick non-admins back to student dash
            return;
        }

        setIsAuthorized(true);
        setLoading(false);
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Verifying Access...</div>;
    if (!isAuthorized) return null;

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/admin/dashboard' },
        { icon: FileText, label: 'Intelligence Reports', href: '/admin/reports' },
        { icon: Users, label: 'User Management', href: '/admin/users' }, // Future placeholder
        { icon: Settings, label: 'Settings', href: '/admin/settings' }, // Future placeholder
    ];

    return (
        <div className="flex h-screen bg-black text-white font-sans antialiased">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r border-gray-800 bg-gray-950 flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-2 text-rose-500 mb-1">
                        <ShieldAlert size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Admin Portal</span>
                    </div>
                    <Logo size="md" textColor="text-white" showText />
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <button
                                key={item.href}
                                onClick={() => router.push(item.href)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                        : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-950/30 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-black">
                {children}
            </main>
        </div>
    );
}
