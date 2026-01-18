import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'deep' | 'outline' | 'ghost' | 'secondary' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all transition-transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none rounded-xl';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 shadow-lg shadow-primary/20',
    deep: 'bg-deep text-white hover:bg-black shadow-lg shadow-deep/10',
    outline: 'bg-white border-2 border-slate-100 text-slate-600 hover:border-blue-200',
    ghost: 'bg-transparent text-slate-400 hover:text-primary hover:bg-slate-50',
    secondary: 'bg-mist text-deep hover:bg-blue-100',
    white: 'bg-white/90 backdrop-blur-sm text-deep border border-blue-200 hover:bg-white shadow-md'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs uppercase tracking-widest',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xs uppercase tracking-[0.2em]'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
