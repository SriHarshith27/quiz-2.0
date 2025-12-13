'use client';

import Link from 'next/link';
import { Button } from '../common/Button';
import { Brain, Zap, Trophy, Users } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <div className="absolute top-20 left-10 animate-float">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-xl">
          <Brain className="h-12 w-12 text-white" />
        </div>
      </div>

      <div className="absolute bottom-40 right-20 animate-float-delayed">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-xl">
          <Trophy className="h-12 w-12 text-yellow-300" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="inline-block mb-6">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <Zap className="h-4 w-4 text-yellow-300" />
            <span className="text-white text-sm font-semibold">Challenge Your Mind</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Master Knowledge
          <br />
          <span className="bg-gradient-to-r from-yellow-300 to-orange-300 text-transparent bg-clip-text">
            Through Quizzes
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
          Test your knowledge, compete with friends, and track your progress across thousands of engaging quizzes in various categories.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register">
            <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-2xl">
              Start Learning Free
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              See How It Works
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Users className="h-10 w-10 text-white mb-3 mx-auto" />
            <p className="text-3xl font-bold text-white mb-1">10K+</p>
            <p className="text-blue-100">Active Users</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Brain className="h-10 w-10 text-white mb-3 mx-auto" />
            <p className="text-3xl font-bold text-white mb-1">5K+</p>
            <p className="text-blue-100">Quizzes Available</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Trophy className="h-10 w-10 text-yellow-300 mb-3 mx-auto" />
            <p className="text-3xl font-bold text-white mb-1">50K+</p>
            <p className="text-blue-100">Quizzes Completed</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};
