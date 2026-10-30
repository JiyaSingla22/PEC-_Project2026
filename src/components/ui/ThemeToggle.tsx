import React, { useState, useRef, useEffect } from 'react';
import { useTheme, THEMES, ThemeMode } from '../../context/ThemeContext';
import { Moon, Sun, BookOpen, Check, ChevronDown } from 'lucide-react';

export interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'dropdown', className = '' }) => {
  const { theme, setTheme, cycleTheme, activeThemeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeIcon = (mode: ThemeMode, sizeClass = 'h-4 w-4') => {
    switch (mode) {
      case 'light':
        return <Sun className={`${sizeClass} text-amber-600 dark:text-amber-400`} />;
      case 'sepia':
        return <BookOpen className={`${sizeClass} text-amber-700 dark:text-amber-300`} />;
      case 'dark':
      default:
        return <Moon className={`${sizeClass} text-amber-400`} />;
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={cycleTheme}
        aria-label={`Switch reading edition (Current: ${activeThemeConfig.name})`}
        title={`Edition: ${activeThemeConfig.name} — Click to cycle`}
        className={`relative flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 border border-theme-border bg-theme-surface hover:bg-theme-elevated text-theme-heading shadow-sm min-h-[40px] min-w-[40px] ${className}`}
      >
        {getThemeIcon(theme)}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Theme selection menu"
        title={`Current: ${activeThemeConfig.name} — Click to switch newspaper edition`}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-theme-border bg-theme-surface hover:bg-theme-elevated text-theme-heading transition-all duration-200 text-xs font-serif font-medium shadow-sm min-h-[40px]"
      >
        {getThemeIcon(theme, 'h-3.5 w-3.5')}
        <span className="font-editorial text-xs font-semibold tracking-wide hidden sm:inline">
          {activeThemeConfig.name}
        </span>
        <ChevronDown className={`h-3 w-3 text-theme-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-2xl border-2 border-theme-border solid-dropdown-panel p-2 z-50 animate-slide-up"
          style={{ backgroundColor: 'var(--bg-surface-solid, #0d1524)', opacity: 1 }}
        >
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono border-b border-theme-subtle flex items-center justify-between">
            <span>Newspaper Edition</span>
            <span className="text-[9px] opacity-70">Theme</span>
          </div>

          <div className="py-1 space-y-1">
            {THEMES.map((item) => {
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTheme(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/40 text-theme-heading font-semibold shadow-xs'
                      : 'text-theme-body hover:bg-theme-elevated hover:text-theme-heading border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-theme-elevated shrink-0 border border-theme-border">
                      {getThemeIcon(item.id, 'h-4 w-4')}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-editorial font-bold text-theme-heading leading-tight flex items-center gap-1.5">
                        <span>{item.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-theme-elevated text-theme-muted">
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-[10px] text-theme-muted truncate font-serif italic pt-0.5">
                        {item.tagline}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-amber-500 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
