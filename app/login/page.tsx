'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/common/Logo';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.user) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, fullName: string, role: string) => {
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      // Pass metadata to the SignUp call. The database trigger will handle the profile creation.
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (authData.user && authData.session) {
        // Successful login (Email confirmation OFF)
        router.push('/dashboard');
        router.refresh();
      } else if (authData.user && !authData.session) {
        // User created, but email confirmation required
        setError('Account created! Please check your email to confirm your account.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-all duration-300 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800/50 overflow-hidden"
        >
          {/* Logo and sparkles */}
          <div className="text-center pt-6 pb-3">
            <motion.div
              className="flex justify-center mb-3"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Logo size="md" showText={false} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 text-purple-400 mb-2"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-xs font-medium">QuizMaster</span>
              <Sparkles size={14} className="animate-pulse" />
            </motion.div>
          </div>

          {/* Custom Tab Switcher */}
          <div className="px-6 pb-4">
            <div className="relative bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
              <motion.div
                className="absolute top-1 bottom-1 left-1 bg-gradient-to-r from-purple-600 to-emerald-600 rounded-lg"
                initial={false}
                animate={{
                  x: activeTab === 'login' ? 0 : '100%',
                  width: 'calc(50% - 4px)'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />

              <div className="relative z-10 grid grid-cols-2 gap-1">
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setError(null);
                  }}
                  className={`py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors duration-200 ${activeTab === 'login' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setActiveTab('register');
                    setError(null);
                  }}
                  className={`py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors duration-200 ${activeTab === 'register' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>

          {/* Forms */}
          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-white mb-1">Welcome Back</h2>
                  <p className="text-gray-400 text-sm mb-5">Sign in to continue your learning journey</p>
                  <LoginForm
                    onSubmit={handleLogin}
                    error={error}
                    loading={loading}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
                  <p className="text-gray-400 text-sm mb-5">Join thousands of learners today</p>
                  <RegisterForm
                    onSubmit={handleRegister}
                    error={error}
                    loading={loading}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.p
          className="text-center text-gray-500 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </div>
    </div>
  );
}
