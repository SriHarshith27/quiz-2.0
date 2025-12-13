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
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in just four simple steps and begin your learning adventure.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-xl text-center">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-lg opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white text-blue-500 font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
