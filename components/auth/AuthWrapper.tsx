'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface AuthWrapperProps {
    children: React.ReactNode;
    allowedRoles?: ('student' | 'mentor')[];
}

export function AuthWrapper({ children, allowedRoles }: AuthWrapperProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            // If roles are specified, check user role
            if (allowedRoles && allowedRoles.length > 0) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (!profile || !allowedRoles.includes(profile.role)) {
                    // Unauthorized role
                    router.push('/dashboard'); // Or some unauthorized page
                    // For now, if they are on a specific dashboard but wrong role, push to main dashboard
                    // If they are on main dashboard but wrong role (rare if strictly keyed), handle gracefully
                    // But main dashboard should adapt. 
                    // If we use this wrapper for specific sub-routes, this redirect is important.
                    // If allowedRoles is NOT passed, we just check login (which we did).
                }
            }

            setIsAuthorized(true);
        } catch (error) {
            console.error('Auth check failed', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return isAuthorized ? <>{children}</> : null;
}
