'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Mail, Lock, User, Loader2, GraduationCap, School } from 'lucide-react';

interface RegisterFormProps {
  onSubmit: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  error: string | null;
  success?: string | null;
  loading: boolean;
}

export const RegisterForm = ({ onSubmit, error, success, loading }: RegisterFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'mentor'>('student');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    await onSubmit(email, password, fullName, role);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg backdrop-blur-sm"
        >
          <p className="text-emerald-400 text-sm font-medium">{success}</p>
        </motion.div>
      )}

      {(error || validationError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg backdrop-blur-sm"
        >
          <p className="text-red-400 text-sm">{error || validationError}</p>
        </motion.div>
      )}

      {/* Role Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`relative p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 ${role === 'student'
            ? 'bg-purple-600/20 border-purple-500 text-white'
            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
            }`}
        >
          <GraduationCap size={24} className={role === 'student' ? 'text-purple-400' : 'text-gray-500'} />
          <span className="text-xs font-medium">Student</span>
          {role === 'student' && (
            <motion.div
              layoutId="role-indicator"
              className="absolute inset-0 border-2 border-purple-500 rounded-xl"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setRole('mentor')}
          className={`relative p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 ${role === 'mentor'
            ? 'bg-emerald-600/20 border-emerald-500 text-white'
            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
            }`}
        >
          <School size={24} className={role === 'mentor' ? 'text-emerald-400' : 'text-gray-500'} />
          <span className="text-xs font-medium">Mentor</span>
          {role === 'mentor' && (
            <motion.div
              layoutId="role-indicator"
              className="absolute inset-0 border-2 border-emerald-500 rounded-xl"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          required
          icon={<User size={20} />}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          icon={<Mail size={20} />}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          required
          icon={<Lock size={20} />}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          required
          icon={<Lock size={20} />}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all duration-300"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </motion.div>
    </form>
  );
};
