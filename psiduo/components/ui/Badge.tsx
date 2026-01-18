import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'green' | 'slate' | 'blue' | 'deep';
  className?: string;
}

export const Badge = ({ children, variant = 'primary', className = '' }: BadgeProps) => {
  const variants = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-50 text-green-600',
    slate: 'bg-slate-100 text-slate-500',
    blue: 'bg-blue-50 text-primary',
    deep: 'bg-deep text-white'
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
