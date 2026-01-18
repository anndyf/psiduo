import React from 'react';

interface OptionButtonProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  textAlign?: 'left' | 'center';
}

export const OptionButton = ({ 
  selected, 
  onClick, 
  children, 
  className = '',
  size = 'md',
  textAlign = 'center'
}: OptionButtonProps) => {
  const baseStyles = 'rounded-xl font-bold transition-all border-2 flex items-center justify-between';
  
  const selectedStyles = 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]';
  const unselectedStyles = 'bg-white text-slate-600 border-slate-100 hover:border-blue-200';
  
  const ghostSelectedStyles = 'bg-primary/5 text-primary border-primary/30';

  const sizes = {
    sm: 'py-4 px-5 text-sm md:text-base font-bold',
    md: 'py-5 px-6 text-sm md:text-base font-bold',
    lg: 'p-6 text-sm md:text-base font-bold'
  };

  const alignStyles = textAlign === 'center' ? 'justify-center' : 'justify-between';

  return (
    <button
      onClick={onClick}
      className={`
        ${baseStyles} 
        ${selected ? (textAlign === 'left' ? ghostSelectedStyles : selectedStyles) : unselectedStyles} 
        ${sizes[size]} 
        ${alignStyles} 
        ${className}
      `}
    >
      {children}
      {selected && textAlign === 'left' && (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
};
