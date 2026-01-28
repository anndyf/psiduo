import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="text-micro text-slate-400 block mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-slate-50 border-b-2 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-deep transition-all rounded-t-lg ${
          error ? 'border-danger bg-red-50' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-danger text-[10px] font-bold uppercase mt-1 block">
          {error}
        </span>
      )}
    </div>
  );
};
