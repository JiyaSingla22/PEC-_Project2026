/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',    // Tablet breakpoint
      'lg': '1024px',   // Desktop 3-column breakpoint
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        headline: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        editorial: ['"Playfair Display"', 'Newsreader', 'Georgia', 'serif'],
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        masthead: ['Cinzel', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        background: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        border: 'var(--border-color)',
        'theme-base': 'var(--bg-base)',
        'theme-surface': 'var(--bg-surface)',
        'theme-surface-solid': 'var(--bg-surface-solid)',
        'theme-elevated': 'var(--bg-elevated)',
        'theme-border': 'var(--border-color)',
        'theme-subtle': 'var(--border-subtle)',
        'theme-rule': 'var(--border-newspaper)',
        'theme-heading': 'var(--text-heading)',
        'theme-body': 'var(--text-body)',
        'theme-muted': 'var(--text-muted)',
        'theme-gold': 'var(--accent-gold)',
        'theme-sage': 'var(--accent-sage)',
        'theme-rose': 'var(--accent-rose)',
        'theme-lavender': 'var(--accent-lavender)',
        pastel: {
          champagne: '#e2cba8',
          sand: '#d8b988',
          sage: '#a3c9a8',
          mint: '#b5d5bb',
          rose: '#deb3ad',
          lavender: '#b8c0e0',
          cream: '#f8f4ec',
          slate: '#8c9bb0',
        },
        paper: {
          DEFAULT: '#fcfaf3',
          cream: '#ffffff',
          warm: '#f2ece0',
          ink: '#0c0a09',
          lead: '#292524',
          muted: '#57534e',
          border: '#d6ccba',
          rule: '#1c1917',
        },
        sepia: {
          DEFAULT: '#f3ecd6',
          card: '#faf3e2',
          ink: '#22160d',
          muted: '#6f5945',
          border: '#cebfa1',
          rule: '#382517',
        },
        // Classy Muted Pastel Champagne Palette (replaces harsh neon orange)
        amber: {
          50: '#faf7f2',
          100: '#f4ede1',
          200: '#e8dcbe',
          300: '#dec796',
          400: '#e2cba8', // Pastel Champagne
          500: '#d8b988', // Muted Sand Gold
          600: '#c49e68',
          700: '#a7814e',
          800: '#86653c',
          900: '#6c5130',
          950: '#3b2b18',
          brand: '#e2cba8',
          glow: 'rgba(226, 203, 168, 0.20)',
        },
        // Classy Muted Pastel Sage Palette (replaces harsh neon green)
        emerald: {
          50: '#f4f8f5',
          100: '#e5f1e8',
          200: '#cce3d1',
          300: '#a3c9a8', // Pastel Sage
          400: '#8ebf95',
          500: '#75a87d', // Muted Botanical Sage
          600: '#5c8b64',
          700: '#486d4e',
          800: '#3a563f',
          900: '#304734',
          950: '#18251a',
          glow: 'rgba(163, 201, 168, 0.20)',
        },
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
