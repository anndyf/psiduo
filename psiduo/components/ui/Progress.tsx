import React from 'react';

interface ProgressProps {
  value: number; // 0 to 100
  label?: string;
  step?: number;
  totalSteps?: number;
  className?: string;
}

export const Progress = ({ value, label, step, totalSteps, className = '' }: ProgressProps) => {
  return (
    <div className={`w-full ${className}`}>
      {(label || step) && (
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            {step && totalSteps ? `Passo ${step} de ${totalSteps}: ` : ''}{label}
          </span>
          <span className="text-[10px] font-black text-slate-400">
            {Math.round(value)}%
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};
