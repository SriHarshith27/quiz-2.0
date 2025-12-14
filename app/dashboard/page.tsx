'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { LogOut, BookOpen, Trophy, Clock } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    setUser(user);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo size="md" showText />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-xl text-gray-600">Ready to test your knowledge today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card hover>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-gray-600">Quizzes Taken</p>
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-gray-600">Total Score</p>
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0h</p>
                <p className="text-gray-600">Time Spent</p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Quizzes</h2>
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">No quizzes available yet. Check back soon!</p>
            <Button variant="primary">
              Browse Categories
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
