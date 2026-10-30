import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light' | 'sepia';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  tagline: string;
  icon: 'moon' | 'sun' | 'book';
  badge: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'dark',
    name: 'Midnight Edition',
    tagline: 'Obsidian ink & pastel champagne accents',
    icon: 'moon',
    badge: 'Night Dispatch',
  },
  {
    id: 'light',
    name: 'Morning Broadsheet',
    tagline: 'Authentic eggshell newsprint & charcoal print',
    icon: 'sun',
    badge: 'City Print',
  },
  {
    id: 'sepia',
    name: 'Vintage Gazette',
    tagline: 'Warm antique parchment & espresso ink',
    icon: 'book',
    badge: 'Archive Edition',
  },
];

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
  activeThemeConfig: ThemeConfig;
  isDark: boolean;
  isEditorial: boolean;
  isSepia: boolean;
  themeLabel: string;
}

const STORAGE_KEY = 'incogniread-theme-preference';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = (localStorage.getItem(STORAGE_KEY) || localStorage.getItem('incogniread_theme')) as ThemeMode | null;
      if (saved && (saved === 'dark' || saved === 'light' || saved === 'sepia')) {
        return saved;
      }
      // Check OS preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark'; // Midnight Edition default
  });

  const applyThemeToDOM = (mode: ThemeMode) => {
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute('data-theme', mode);
    body.setAttribute('data-theme', mode);

    // Synchronize Tailwind dark mode class and custom theme classes
    root.classList.remove('dark', 'light', 'sepia', 'theme-editorial', 'theme-sepia');
    body.classList.remove('dark', 'light', 'sepia', 'theme-editorial', 'theme-sepia');

    if (mode === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else if (mode === 'light') {
      root.classList.add('light', 'theme-editorial');
      body.classList.add('light', 'theme-editorial');
    } else if (mode === 'sepia') {
      root.classList.add('sepia', 'theme-sepia');
      body.classList.add('sepia', 'theme-sepia');
    }

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Storage access may be restricted in sandboxes
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    applyThemeToDOM(mode);
  };

  const cycleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'sepia';
      return 'dark';
    });
  };

  const activeThemeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        cycleTheme,
        activeThemeConfig,
        isDark: theme === 'dark',
        isEditorial: theme === 'light',
        isSepia: theme === 'sepia',
        themeLabel: activeThemeConfig.name,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
