import { Brain } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textColor?: string;
}

export const Logo = ({ size = 'md', showText = true, textColor = 'text-gray-900' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-2">
      
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} ${textColor}`}>
          QuizMaster
        </span>
      )}
    </div>
  );
};
