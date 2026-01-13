"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, hint, suffix, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-2.5 rounded-lg border bg-white
              ${error ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-solar-yellow focus:ring-solar-yellow/30"}
              focus:ring-2 transition-all
              ${suffix ? "pr-12" : ""}
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
              {suffix}
            </span>
          )}
        </div>
        {hint && !error && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
