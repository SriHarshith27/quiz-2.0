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
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Timer className="h-8 w-8" />,
    title: 'Timed Challenges',
    description: 'Race against the clock and test your knowledge under pressure.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: 'Track Progress',
    description: 'Monitor your performance with detailed analytics and insights.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Compete with Friends',
    description: 'Challenge your friends and climb the leaderboards together.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: 'Earn Achievements',
    description: 'Unlock badges and rewards as you progress through quizzes.',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: 'Learn & Grow',
    description: 'Discover explanations and expand your knowledge with every quiz.',
    color: 'from-teal-500 to-cyan-500',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make learning fun, engaging, and effective.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} hover padding="lg">
              <div className={`inline-block p-3 bg-gradient-to-br ${feature.color} rounded-lg text-white mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
