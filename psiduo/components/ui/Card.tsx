import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'white' | 'deep' | 'outline' | 'ghost';
  hover?: boolean;
}

export const Card = ({ children, className = '', variant = 'white', hover = true }: CardProps) => {
  const variants = {
    white: 'bg-white shadow-sm border border-slate-100',
    deep: 'bg-deep text-white shadow-[0_20px_50px_-12px_rgba(30,41,59,0.5)] border border-blue-800/50',
    outline: 'bg-white border-2 border-slate-100',
    ghost: 'bg-mist border border-transparent'
  };

  const hoverStyle = hover ? 'hover:shadow-xl transition-all duration-300' : '';

  return (
    <div className={`rounded-3xl p-6 ${variants[variant]} ${hoverStyle} ${className}`}>
      {children}
    </div>
  );
};
