import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'amber' | 'emerald' | 'outline' | 'glass';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-800 text-slate-200 border-slate-700',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    outline: 'border border-slate-700 text-slate-300 bg-transparent',
    glass: 'bg-slate-900/70 backdrop-blur-md text-slate-200 border border-slate-700/80',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors border select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
