'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '../common/Button';
import { Brain, Zap, Trophy, Users, Sparkles } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Animated background orbs */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div 
        className="absolute top-20 left-10"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div 
          className="bg-purple-500/10 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-purple-500/30"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Brain className="h-12 w-12 text-purple-400" />
        </motion.div>
      </motion.div>

      <motion.div 
        className="absolute bottom-40 right-20"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div 
          className="bg-emerald-500/10 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-emerald-500/30"
          whileHover={{ scale: 1.1, rotate: -5 }}
        >
          <Trophy className="h-12 w-12 text-emerald-400" />
        </motion.div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <motion.div 
          className="inline-block mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-500/40">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-gray-100 text-sm font-semibold">Challenge Your Mind</span>
          </div>
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Master Knowledge
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-emerald-400 to-purple-400 text-transparent bg-clip-text animate-gradient">
            Through Quizzes
          </span>
        </motion.h1>

        <motion.p 
          className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Test your knowledge, compete with friends, and track your progress across thousands of engaging quizzes in various categories.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="/register">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="primary" size="lg" className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white shadow-2xl shadow-purple-900/50">
                Start Learning Free
              </Button>
            </motion.div>
          </Link>
          <Link href="#how-it-works">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" className="border-gray-600 text-gray-200 hover:bg-gray-800 hover:border-purple-500">
                See How It Works
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div 
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {[
            { icon: Users, count: '10K+', label: 'Active Users', color: 'purple' },
            { icon: Brain, count: '5K+', label: 'Quizzes Available', color: 'emerald' },
            { icon: Trophy, count: '50K+', label: 'Quizzes Completed', color: 'amber' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ delay: index * 0.1 }}
            >
              <stat.icon className={`h-10 w-10 text-${stat.color}-400 mb-3 mx-auto`} />
              <p className="text-3xl font-bold text-white mb-1">{stat.count}</p>
              <p className="text-gray-300">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, rgba(147, 51, 234, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        @keyframes gradient {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};
