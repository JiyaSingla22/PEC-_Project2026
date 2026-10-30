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
      colors: {
        background: '#020617', // slate-950
        surface: 'rgba(15, 23, 42, 0.6)', // slate-900/60
        border: 'rgba(30, 41, 59, 0.8)', // slate-800
        amber: {
          brand: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.25)',
        },
        emerald: {
          audio: '#10b981',
          glow: 'rgba(16, 185, 129, 0.25)',
        },
      },
      backdropBlur: {
        xs: '2px',
        xl: '20px',
        '2xl': '32px',
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
