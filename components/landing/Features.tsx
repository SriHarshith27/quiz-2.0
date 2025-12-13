'use client';

import { motion } from 'framer-motion';
import { Card } from '../common/Card';
import { Brain, Timer, BarChart3, Users, Award, BookOpen } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <Brain className="h-8 w-8" />,
    title: 'Diverse Categories',
    description: 'Explore quizzes across science, history, technology, arts, and more.',
    color: 'from-purple-600 to-purple-400',
  },
  {
    icon: <Timer className="h-8 w-8" />,
    title: 'Timed Challenges',
    description: 'Race against the clock and test your knowledge under pressure.',
    color: 'from-emerald-600 to-emerald-400',
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: 'Track Progress',
    description: 'Monitor your performance with detailed analytics and insights.',
    color: 'from-amber-600 to-amber-400',
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Compete with Friends',
    description: 'Challenge your friends and climb the leaderboards together.',
    color: 'from-rose-600 to-rose-400',
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: 'Earn Achievements',
    description: 'Unlock badges and rewards as you progress through quizzes.',
    color: 'from-violet-600 to-violet-400',
  },
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: 'Learn & Grow',
    description: 'Discover explanations and expand your knowledge with every quiz.',
    color: 'from-teal-600 to-teal-400',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-gray-950 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-purple-400 to-emerald-400 text-transparent bg-clip-text">
              Excel
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Powerful features designed to make learning fun, engaging, and effective.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card hover padding="lg" className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-purple-500/50 transition-all duration-300 h-full group">
                <motion.div 
                  className={`inline-block p-3 bg-gradient-to-br ${feature.color} rounded-lg text-white mb-4`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
