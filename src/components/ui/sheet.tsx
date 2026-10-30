import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  title?: React.ReactNode;
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  side = 'left',
  title,
  children,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed inset-y-0 z-50 flex max-w-full',
          side === 'left' ? 'left-0' : 'right-0'
        )}
      >
        <div
          ref={sheetRef}
          className={cn(
            'w-screen max-w-xs sm:max-w-sm border-theme-border bg-theme-surface-solid p-5 shadow-2xl transition-transform duration-300 flex flex-col justify-between overflow-y-auto solid-dropdown-panel',
            side === 'left' ? 'border-r' : 'border-l',
            'animate-slide-up'
          )}
          style={{ backgroundColor: 'var(--bg-surface-solid, #ffffff)', opacity: 1 }}
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-theme-subtle mb-4">
              {title ? (
                <div className="text-base font-editorial font-bold text-theme-heading">{title}</div>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                aria-label="Close drawer"
                className="rounded-lg p-1.5 text-theme-muted hover:bg-theme-elevated hover:text-theme-heading transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
