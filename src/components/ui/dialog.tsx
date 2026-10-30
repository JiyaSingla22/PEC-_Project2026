import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        ref={dialogRef}
        className={cn(
          'relative z-50 w-full rounded-2xl border-2 border-theme-border bg-theme-surface-solid p-6 sm:p-7 text-theme-body shadow-2xl animate-slide-up solid-dropdown-panel',
          maxWidthClasses[maxWidth]
        )}
        style={{ backgroundColor: 'var(--bg-surface-solid, #ffffff)', opacity: 1 }}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-4 top-4 rounded-lg p-2 text-theme-muted hover:bg-theme-elevated hover:text-theme-heading transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {(title || description) && (
          <div className="mb-5 space-y-1.5 pr-6 border-b border-theme-subtle pb-3">
            {title && <h2 className="text-lg font-editorial font-bold tracking-tight text-theme-heading">{title}</h2>}
            {description && <p className="text-xs text-theme-muted font-serif leading-relaxed">{description}</p>}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};
