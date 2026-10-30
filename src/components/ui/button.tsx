import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'glass' | 'amber' | 'emerald' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] min-h-[40px]';

    const variants = {
      default:
        'bg-theme-elevated hover:bg-theme-surface text-theme-heading border border-theme-border shadow-xs',
      outline:
        'border border-theme-border bg-transparent hover:bg-theme-elevated text-theme-body hover:text-theme-heading',
      ghost:
        'bg-transparent hover:bg-theme-elevated text-theme-muted hover:text-theme-heading',
      glass:
        'bg-theme-surface hover:bg-theme-elevated border border-theme-border text-theme-heading shadow-xs',
      amber:
        'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 hover:shadow-amber-500/30',
      emerald:
        'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30',
      destructive:
        'bg-rose-600 hover:bg-rose-500 text-white shadow-xs',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-9 min-h-[36px]',
      md: 'text-sm px-4 py-2.5 h-10 min-h-[40px]',
      lg: 'text-base px-6 py-3.5 h-12 min-h-[48px]',
      icon: 'h-10 w-10 min-h-[40px] min-w-[40px] p-0 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
