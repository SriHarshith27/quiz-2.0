import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
}: CardProps) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClass = hover ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : '';

  return (
    <div
      className={`rounded-xl shadow-lg ${paddingClasses[padding]} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
};
