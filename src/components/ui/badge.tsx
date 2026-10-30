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
    default: 'bg-theme-elevated text-theme-heading border-theme-border',
    amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
    outline: 'border border-theme-border text-theme-muted bg-transparent',
    glass: 'bg-theme-surface text-theme-heading border border-theme-border',
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
