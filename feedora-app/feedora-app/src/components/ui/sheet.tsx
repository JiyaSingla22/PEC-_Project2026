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
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-fade-in"
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
            'w-screen max-w-xs sm:max-w-sm border-slate-800 bg-slate-900/95 backdrop-blur-2xl p-5 shadow-2xl transition-transform duration-300 flex flex-col justify-between overflow-y-auto',
            side === 'left' ? 'border-r' : 'border-l',
            'animate-slide-up'
          )}
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              {title ? (
                <div className="text-base font-bold text-white tracking-tight">{title}</div>
              ) : (
                <span />
              )}
              <button
                onClick={onClose}
                aria-label="Close sheet"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="py-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
