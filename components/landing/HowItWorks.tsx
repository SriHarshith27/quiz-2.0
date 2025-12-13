'use client';

import { motion } from 'framer-motion';
import { UserPlus, Search, Play, Trophy } from 'lucide-react';

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: <UserPlus className="h-8 w-8" />,
    title: 'Create Your Account',
    description: 'Sign up in seconds and start your learning journey today.',
  },
  {
    number: 2,
    icon: <Search className="h-8 w-8" />,
    title: 'Choose Your Quiz',
    description: 'Browse through thousands of quizzes in your favorite categories.',
  },
  {
    number: 3,
    icon: <Play className="h-8 w-8" />,
    title: 'Take the Challenge',
    description: 'Answer questions, race against time, and test your knowledge.',
  },
  {
    number: 4,
    icon: <Trophy className="h-8 w-8" />,
    title: 'Track Your Progress',
    description: 'View your scores, earn achievements, and improve your skills.',
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gray-900 relative overflow-hidden">
      {/* Background effects */}
      <motion.div 
        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It{' '}
            <span className="bg-gradient-to-r from-purple-400 to-emerald-400 text-transparent bg-clip-text">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get started in just four simple steps and begin your learning adventure.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-emerald-600 to-purple-600 transform -translate-y-1/2 opacity-30"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                className="relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <motion.div 
                  className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl text-center border border-gray-700 hover:border-purple-500/50 transition-all duration-300 h-full"
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="relative inline-block mb-4">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-full blur-lg opacity-50"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="relative bg-gradient-to-br from-purple-600 to-emerald-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-gray-900 text-purple-400 font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-purple-500">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
