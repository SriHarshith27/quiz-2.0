'use client';

import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Mail, Lock, User, Loader2 } from 'lucide-react';

interface RegisterFormProps {
  onSubmit: (email: string, password: string, fullName: string) => Promise<void>;
  error: string | null;
  loading: boolean;
}

export const RegisterForm = ({ onSubmit, error, loading }: RegisterFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
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

    await onSubmit(email, password, fullName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(error || validationError) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 text-sm">{error || validationError}</p>
        </div>
      )}

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

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={loading}
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
    </form>
  );
};
