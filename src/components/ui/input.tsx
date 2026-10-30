import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, icon, ...props }, ref) => {
    return (
      <div className="w-full relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex h-11 min-h-[44px] w-full rounded-xl border border-theme-border bg-theme-input px-3.5 py-2 text-sm text-theme-heading placeholder:text-theme-muted transition-colors font-serif',
            'focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-10',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
