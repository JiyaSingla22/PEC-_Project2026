# IncogniRead — Complete Frontend Source Code
> Application: PS-003 Small Web Reader: Anonymous Discovery for Independent Blogs
> Generated: 2026-10-30 02:47:20

---

## File: `package.json`

``json
{
  "name": "feedora",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@splinetool/react-spline": "^4.0.0",
    "@splinetool/runtime": "^1.9.0",
    "clsx": "^2.1.1",
    "dompurify": "^3.2.4",
    "fast-xml-parser": "^4.5.3",
    "idb": "^8.0.2",
    "lucide-react": "^0.469.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/dompurify": "^3.0.5",
    "@types/node": "^26.6.6",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "vite": "^6.0.7"
  }
}

``

---

## File: `index.html`

``html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' fill='none'><rect width='48' height='48' rx='12' fill='%23f59e0b'/><path d='M13 18C14.5 12.5 19.5 11 24 13C28.5 11 33.5 12.5 35 18C31 18.8 17 18.8 13 18Z' fill='%23090d16'/><path d='M8 21.5C14 18.5 34 18.5 40 21.5C35 23.5 13 23.5 8 21.5Z' fill='%23090d16'/><circle cx='17.5' cy='28' r='4.2' fill='%23090d16'/><circle cx='30.5' cy='28' r='4.2' fill='%23090d16'/><path d='M21.7 27C23 25.5 25 25.5 26.3 27' stroke='%23090d16' stroke-width='1.8'/><path d='M10 36C15 34.2 21 34.6 24 37V41C21 38.6 15 38.2 10 40V36Z' fill='%23090d16'/><path d='M38 36C33 34.2 27 34.6 24 37V41C27 38.6 33 38.2 38 40V36Z' fill='%23090d16'/></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>IncogniRead — Privacy-First Offline RSS Reader with TTS Narration</title>
    <meta name="description" content="IncogniRead: Privacy-first offline RSS/Atom feed reader with client-side parsing, sanitized readability, anonymous co-subscription discovery, and interactive paragraph-synced TTS narration." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500;1,6..72,600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body class="antialiased selection:bg-amber-500/20 selection:text-amber-500 min-h-screen overflow-x-hidden font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

``

---

## File: `vite.config.ts`

``typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fetchHandler from './api/fetch';
import discoveryHandler from './api/discovery';

// Helper to buffer request body for POST/PUT/DELETE
function readRequestBody(req: any): Promise<{ raw: string; body: any }> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      let parsed = {};
      try {
        parsed = JSON.parse(data);
      } catch {
        parsed = data;
      }
      resolve({ raw: data, body: parsed });
    });
    req.on('error', () => {
      resolve({ raw: '', body: {} });
    });
  });
}

function decorateResponse(res: any) {
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };
  res.send = (body: any) => {
    res.end(body);
  };
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'incogniread-ps003-api-middleware',
      configureServer(server) {
        // Universal API middleware for PS-003 Small Web Reader
        server.middlewares.use(async (req: any, res: any, next: any) => {
          const url = req.url || '';

          if (!url.startsWith('/api/')) {
            return next();
          }

          decorateResponse(res);

          const urlObj = new URL(url, `http://${req.headers.host || 'localhost'}`);
          req.query = Object.fromEntries(urlObj.searchParams.entries());

          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
            const { raw, body } = await readRequestBody(req);
            req.rawBody = raw;
            req.body = body;
          }

          try {
            if (url.startsWith('/api/fetch')) {
              await fetchHandler(req, res);
            } else if (url.startsWith('/api/discovery')) {
              await discoveryHandler(req, res);
            } else {
              res.status(404).json({ error: 'Endpoint not found' });
            }
          } catch (err: any) {
            console.error('[API Middleware Error]:', err);
            if (!res.writableEnded) {
              res.status(500).json({ error: 'Internal Server Error', details: err?.message });
            }
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
    open: false,
  },
});

``

---

## File: `tailwind.config.js`

``javascript
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
        masthead: ['Cinzel', 'Playfair Display', 'serif'],
        editorial: ['"Playfair Display"', 'Newsreader', 'Georgia', 'serif'],
        serif: ['Newsreader', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
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
        'theme-audio': 'var(--accent-audio)',
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
        'equalizer-1': 'eq1 1s ease-in-out infinite alternate',
        'equalizer-2': 'eq2 0.8s ease-in-out infinite alternate 0.2s',
        'equalizer-3': 'eq3 1.2s ease-in-out infinite alternate 0.1s',
        'equalizer-4': 'eq4 0.9s ease-in-out infinite alternate 0.3s',
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
        eq1: {
          '0%': { height: '4px' },
          '100%': { height: '16px' },
        },
        eq2: {
          '0%': { height: '14px' },
          '100%': { height: '6px' },
        },
        eq3: {
          '0%': { height: '6px' },
          '100%': { height: '18px' },
        },
        eq4: {
          '0%': { height: '12px' },
          '100%': { height: '4px' },
        },
      },
    },
  },
  plugins: [],
};

``

---

## File: `tsconfig.json`

``json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client", "node"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "api"]
}

``

---

## File: `src\types\index.ts`

``typescript
// -----------------------------------------------------------------------------
// Feedora Application Domain Type Definitions
// -----------------------------------------------------------------------------

export interface Feed {
  id: string;
  title: string;
  siteUrl: string;
  feedUrl: string;
  description?: string;
  folder: string; // e.g. "Tech & AI", "Design", "News", "Uncategorized"
  unreadCount: number;
  lastFetchedAt: string;
  iconUrl?: string;
  isFavorite?: boolean;
}

export interface Article {
  id: string; // Hash of link/guid
  feedId: string;
  feedTitle: string;
  title: string;
  link: string;
  author?: string;
  publishedAt: string;
  contentRaw: string;
  contentClean: string; // Sanitized by DOMPurify
  excerpt: string;
  paragraphs: string[]; // Tokenized sentences/paragraphs for real-time TTS sync
  isRead: boolean;
  isBookmarked: boolean;
  estimatedReadMinutes: number;
  audioProgressSeconds?: number;
  audioDurationSeconds?: number;
}

export interface AudioQueueItem {
  id: string;
  articleId: string;
  title: string;
  feedTitle: string;
  excerpt: string;
  estimatedReadMinutes: number;
  currentPositionSeconds: number;
  dateAdded: string;
}

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended';

export interface TTSState {
  currentArticle: Article | null;
  playbackState: PlaybackState;
  activeParagraphIndex: number; // For highlighting active spoken paragraph in Reader View
  activeSentenceText: string;
  currentTime: number;
  duration: number;
  playbackRate: number; // 0.75, 1.0, 1.25, 1.5, 2.0
  volume: number; // 0.0 - 1.0
  queue: AudioQueueItem[];
  selectedVoice: string | null;
}

export interface DiscoveryRecommendation {
  feedUrl: string;
  title: string;
  description: string;
  siteUrl: string;
  category: string;
  popularityScore: number;
  reason: string;
}

export interface Folder {
  id: string;
  name: string;
  count: number;
}


// -----------------------------------------------------------------------------
// Backend Production Service Types (Auth, Resources, Webhooks)
// -----------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  feedTitle: string;
  category: string;
  authorId: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEvent {
  id: string;
  event: string;
  timestamp: string;
  payload: any;
  signatureVerified: boolean;
  status: 'PROCESSED' | 'FAILED' | 'DUPLICATE';
  receivedAt: string;
}

``

---

## File: `src\main.tsx`

``tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { FeedProvider } from './context/FeedContext';
import { AudioProvider } from './context/AudioContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <AudioProvider>
        <FeedProvider>
          <App />
        </FeedProvider>
      </AudioProvider>
    </ThemeProvider>
  </React.StrictMode>
);

``

---

## File: `src\App.tsx`

``tsx
import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RightPanel } from './components/layout/RightPanel';
import { MobileNav } from './components/layout/MobileNav';
import { SplineHero } from './components/feed/SplineHero';
import { UnifiedTimeline } from './components/feed/UnifiedTimeline';
import { ReaderView } from './components/feed/ReaderView';
import { FloatingAudioPlayer } from './components/audio/FloatingAudioPlayer';
import { AddFeedModal } from './components/feed/AddFeedModal';
import { OPMLModal } from './components/discovery/OPMLModal';
import { AnonymousDiscovery } from './components/discovery/AnonymousDiscovery';
import { Dialog } from './components/ui/dialog';
import { useFeeds } from './context/FeedContext';

export const App: React.FC = () => {
  const { activeFilter, activeFolder } = useFeeds();
  const [isAddFeedOpen, setIsAddFeedOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [isOPMLOpen, setIsOPMLOpen] = useState(false);

  return (
    <div className="min-h-screen bg-theme-base text-theme-body flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-500 transition-colors duration-200">
      {/* Background ambient lighting glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 dark:opacity-100 transition-opacity">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="absolute top-1/2 -right-40 h-[650px] w-[650px] rounded-full bg-emerald-500/5 blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[140px]" />
      </div>

      {/* Top Navbar */}
      <Navbar
        onOpenAddFeed={() => setIsAddFeedOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenDiscovery={() => setIsDiscoveryOpen(true)}
        onOpenOPML={() => setIsOPMLOpen(true)}
      />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenAddFeed={() => setIsAddFeedOpen(true)}
        onOpenDiscovery={() => setIsDiscoveryOpen(true)}
        onOpenOPML={() => setIsOPMLOpen(true)}
      />

      {/* 3-Column Responsive Shell */}
      <div className="relative z-10 flex-1 flex w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Column: Subscriptions & Folders Sidebar (Desktop >= 1024px) */}
        <Sidebar
          onOpenAddFeed={() => setIsAddFeedOpen(true)}
          onOpenDiscovery={() => setIsDiscoveryOpen(true)}
          onOpenOPML={() => setIsOPMLOpen(true)}
        />

        {/* Central Column: Unified Timeline / Reading Feed */}
        <main className="flex-1 min-w-0 px-2 sm:px-6 py-6 pb-32">
          {/* Hero only on general 'all' view */}
          {activeFilter === 'all' && activeFolder === 'all' && (
            <SplineHero
              onOpenAddFeed={() => setIsAddFeedOpen(true)}
              onExploreDiscovery={() => setIsDiscoveryOpen(true)}
            />
          )}

          <UnifiedTimeline />
        </main>

        {/* Right Column: Audio Queue & Anonymous Discovery (Desktop >= 1280px) */}
        <RightPanel />
      </div>

      {/* Persistent Floating Audio Player (Sticky bottom) */}
      <FloatingAudioPlayer />

      {/* Distraction-Free Reader View */}
      <ReaderView />

      {/* Add Feed Modal */}
      <AddFeedModal
        isOpen={isAddFeedOpen}
        onClose={() => setIsAddFeedOpen(false)}
      />

      {/* OPML Import / Export Modal (PS-003 Bonus) */}
      <OPMLModal
        isOpen={isOPMLOpen}
        onClose={() => setIsOPMLOpen(false)}
      />

      {/* Anonymous Discovery Modal */}
      <Dialog
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        maxWidth="xl"
        title="Anonymous Co-Subscription Discovery"
        description="Collective recommendation engine with transparent reasoning, co-subscription graph view, and zero accounts."
      >
        <AnonymousDiscovery />
      </Dialog>
    </div>
  );
};

export default App;

``

---

## File: `src\index.css`

``css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root, [data-theme="dark"] {
    --bg-base: #090d16;
    --bg-surface: #111827;
    --bg-surface-solid: #111827;
    --bg-elevated: #1e293b;
    --bg-input: #111827;
    --border-color: #27354a;
    --border-subtle: #1e293b;
    --border-newspaper: #475569;
    --text-heading: #ffffff;
    --text-body: #e2e8f0;
    --text-muted: #94a3b8;
    --accent-gold: #f59e0b;
    --accent-gold-hover: #d97706;
    --accent-gold-subtle: rgba(245, 158, 11, 0.15);
    --accent-audio: #10b981;
    --accent-audio-subtle: rgba(16, 185, 129, 0.15);
    --reader-bg: #090d16;
    --reader-card: #111827;
    --scrollbar-track: #090d16;
    --scrollbar-thumb: #1e293b;
    --scrollbar-thumb-hover: #334155;
  }

  [data-theme="light"] {
    --bg-base: #f5f3ec;
    --bg-surface: #ffffff;
    --bg-surface-solid: #ffffff;
    --bg-elevated: #eae6dc;
    --bg-input: #ffffff;
    --border-color: #d8d3c5;
    --border-subtle: #e5e0d3;
    --border-newspaper: #18181b;
    --text-heading: #0f172a;
    --text-body: #334155;
    --text-muted: #64748b;
    --accent-gold: #d97706;
    --accent-gold-hover: #b45309;
    --accent-gold-subtle: rgba(217, 119, 6, 0.12);
    --accent-audio: #059669;
    --accent-audio-subtle: rgba(5, 150, 105, 0.12);
    --reader-bg: #f5f3ec;
    --reader-card: #ffffff;
    --scrollbar-track: #f5f3ec;
    --scrollbar-thumb: #d3ccc0;
    --scrollbar-thumb-hover: #b8af9f;
  }

  [data-theme="sepia"] {
    --bg-base: #f0e6cf;
    --bg-surface: #faf3e3;
    --bg-surface-solid: #faf3e3;
    --bg-elevated: #e4d8be;
    --bg-input: #faf6ee;
    --border-color: #cfbe9e;
    --border-subtle: #dbcaa9;
    --border-newspaper: #2d1e12;
    --text-heading: #20150d;
    --text-body: #423022;
    --text-muted: #6e5847;
    --accent-gold: #a14e0f;
    --accent-gold-hover: #823c09;
    --accent-gold-subtle: rgba(161, 78, 15, 0.14);
    --accent-audio: #1b6343;
    --accent-audio-subtle: rgba(27, 99, 67, 0.14);
    --reader-bg: #f0e6cf;
    --reader-card: #faf3e3;
    --scrollbar-track: #f0e6cf;
    --scrollbar-thumb: #c8b593;
    --scrollbar-thumb-hover: #a89470;
  }

  body {
    background-color: var(--bg-base);
    color: var(--text-body);
    font-feature-settings: "rlig" 1, "calt" 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  :focus-visible {
    outline: 2px solid var(--accent-gold);
    outline-offset: 2px;
  }
}

/* Custom Sleek Scrollbar */
::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}

::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* Newspaper specific styling */
.newspaper-double-rule {
  border-top: 3px double var(--border-newspaper);
  border-bottom: 1px solid var(--border-newspaper);
}

.newspaper-rule {
  border-color: var(--border-newspaper);
}

.newspaper-drop-cap::first-letter {
  font-family: 'Playfair Display', Georgia, serif;
  float: left;
  font-size: 3.8rem;
  line-height: 0.85;
  padding-top: 4px;
  padding-right: 12px;
  padding-bottom: 2px;
  font-weight: 800;
  color: var(--accent-gold);
}

/* Hide scrollbar utility */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

``

---

## File: `src\context\ThemeContext.tsx`

``tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light' | 'sepia';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  tagline: string;
  icon: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'dark',
    name: 'Midnight Edition',
    tagline: 'Deep slate ink & warm amber gold',
    icon: 'moon',
  },
  {
    id: 'light',
    name: 'Morning Paper',
    tagline: 'Crisp ivory broadsheet & charcoal print',
    icon: 'sun',
  },
  {
    id: 'sepia',
    name: 'Vintage Gazette',
    tagline: 'Warm antique parchment & espresso ink',
    icon: 'book',
  },
];

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
  activeThemeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'incogniread-theme-preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved && (saved === 'dark' || saved === 'light' || saved === 'sepia')) {
        return saved;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  });

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);

    // Maintain dark class for tailwind dark: variants when on dark mode
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light', 'sepia');
    } else if (mode === 'light') {
      root.classList.remove('dark', 'sepia');
      root.classList.add('light');
    } else {
      root.classList.remove('dark', 'light');
      root.classList.add('sepia');
    }
  };

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // LocalStorage might be disabled
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
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
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, activeThemeConfig }}>
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

``

---

## File: `src\context\FeedContext.tsx`

``tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Feed, Article, Folder } from '../types';
import {
  getAllFeedsFromDB,
  saveFeedToDB,
  deleteFeedFromDB,
  getAllArticlesFromDB,
  saveArticlesToDB,
  updateArticleStateInDB,
} from '../lib/db';
import { fetchAndParseFeed, autodiscoverFeedUrl } from '../lib/feed-parser';
import { generateId } from '../lib/utils';

interface FeedContextValue {
  feeds: Feed[];
  articles: Article[];
  folders: Folder[];
  activeFilter: string; // 'all' | 'unread' | 'bookmarks' | feedId
  activeFolder: string; // 'all' | folderName
  searchQuery: string;
  isSyncing: boolean;
  syncProgress: { current: number; total: number };
  isOnline: boolean;
  readingArticle: Article | null;
  setActiveFilter: (filter: string) => void;
  setActiveFolder: (folder: string) => void;
  setSearchQuery: (query: string) => void;
  setReadingArticle: (article: Article | null) => void;
  addNewFeed: (urlOrDomain: string, folderName?: string) => Promise<Feed>;
  deleteFeed: (feedId: string) => Promise<void>;
  markAsRead: (articleId: string) => Promise<void>;
  toggleBookmark: (articleId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  syncAllFeeds: () => Promise<void>;
}

const DEFAULT_FEEDS: Array<{ url: string; folder: string }> = [
  { url: 'https://overreacted.io/rss.xml', folder: 'Engineering & AI' },
  { url: 'https://simonwillison.net/atom/entries/', folder: 'Engineering & AI' },
  { url: 'https://news.ycombinator.com/rss', folder: 'Tech Journalism' },
  { url: 'https://www.theverge.com/rss/index.xml', folder: 'Tech Journalism' },
];

const FeedContext = createContext<FeedContextValue | undefined>(undefined);

export const FeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial local-first database hydration
  useEffect(() => {
    async function initStorage() {
      try {
        const storedFeeds = await getAllFeedsFromDB();
        const storedArticles = await getAllArticlesFromDB();

        if (storedFeeds.length > 0) {
          setFeeds(storedFeeds);
          setArticles(storedArticles);
        } else {
          // First-run seed: Auto-subscribe to starter privacy & tech feeds
          await seedInitialFeeds();
        }
      } catch (err) {
        console.error('[FeedContext] DB initialization error:', err);
      }
    }

    initStorage();
  }, []);

  const seedInitialFeeds = async () => {
    setIsSyncing(true);
    const initialFeeds: Feed[] = [];
    const initialArticles: Article[] = [];

    for (let i = 0; i < DEFAULT_FEEDS.length; i++) {
      const item = DEFAULT_FEEDS[i];
      setSyncProgress({ current: i + 1, total: DEFAULT_FEEDS.length });

      try {
        const parsed = await fetchAndParseFeed(item.url, item.folder);
        const feedId = generateId('feed');
        const newFeed: Feed = { ...parsed.feed, id: feedId };

        const mappedArticles: Article[] = parsed.articles.map((art) => ({
          ...art,
          id: generateId('art'),
          feedId: newFeed.id,
          feedTitle: newFeed.title,
        }));

        await saveFeedToDB(newFeed);
        await saveArticlesToDB(mappedArticles);

        initialFeeds.push(newFeed);
        initialArticles.push(...mappedArticles);
      } catch (err) {
        console.warn(`[FeedContext] Seeding failed for ${item.url}:`, err);
      }
    }

    setFeeds(initialFeeds);
    setArticles(initialArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
    setIsSyncing(false);
  };

  // Sync all subscribed feeds
  const syncAllFeeds = useCallback(async () => {
    if (isSyncing || feeds.length === 0 || !navigator.onLine) return;
    setIsSyncing(true);
    setSyncProgress({ current: 0, total: feeds.length });

    const allNewArticles: Article[] = [];
    const updatedFeeds: Feed[] = [];

    for (let i = 0; i < feeds.length; i++) {
      const feed = feeds[i];
      setSyncProgress({ current: i + 1, total: feeds.length });

      try {
        const parsed = await fetchAndParseFeed(feed.feedUrl, feed.folder);
        const newArticles: Article[] = parsed.articles.map((art) => ({
          ...art,
          id: generateId('art'),
          feedId: feed.id,
          feedTitle: feed.title,
        }));

        await saveArticlesToDB(newArticles);
        allNewArticles.push(...newArticles);

        const updatedFeed: Feed = {
          ...feed,
          title: parsed.feed.title || feed.title,
          description: parsed.feed.description || feed.description,
          lastFetchedAt: new Date().toISOString(),
          unreadCount: newArticles.filter((a) => !a.isRead).length,
        };
        await saveFeedToDB(updatedFeed);
        updatedFeeds.push(updatedFeed);
      } catch (err) {
        console.warn(`[FeedContext] Refresh error for ${feed.title}:`, err);
        updatedFeeds.push(feed);
      }
    }

    setFeeds(updatedFeeds);
    const refreshedArticles = await getAllArticlesFromDB();
    setArticles(refreshedArticles);
    setIsSyncing(false);
  }, [feeds, isSyncing]);

  const addNewFeed = async (urlOrDomain: string, folderName = 'General'): Promise<Feed> => {
    setIsSyncing(true);
    try {
      const discoveredUrl = await autodiscoverFeedUrl(urlOrDomain);
      const parsed = await fetchAndParseFeed(discoveredUrl, folderName);

      const feedId = generateId('feed');
      const newFeed: Feed = { ...parsed.feed, id: feedId };

      const mappedArticles: Article[] = parsed.articles.map((art) => ({
        ...art,
        id: generateId('art'),
        feedId: newFeed.id,
        feedTitle: newFeed.title,
      }));

      await saveFeedToDB(newFeed);
      await saveArticlesToDB(mappedArticles);

      setFeeds((prev) => [newFeed, ...prev]);
      setArticles((prev) => [...mappedArticles, ...prev].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));

      return newFeed;
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteFeed = async (feedId: string) => {
    await deleteFeedFromDB(feedId);
    setFeeds((prev) => prev.filter((f) => f.id !== feedId));
    setArticles((prev) => prev.filter((a) => a.feedId !== feedId));
    if (activeFilter === feedId) setActiveFilter('all');
  };

  const markAsRead = async (articleId: string) => {
    await updateArticleStateInDB(articleId, { isRead: true });
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, isRead: true } : a))
    );
    if (readingArticle?.id === articleId) {
      setReadingArticle((prev) => (prev ? { ...prev, isRead: true } : null));
    }
  };

  const toggleBookmark = async (articleId: string) => {
    const target = articles.find((a) => a.id === articleId);
    if (!target) return;
    const newState = !target.isBookmarked;
    await updateArticleStateInDB(articleId, { isBookmarked: newState });
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, isBookmarked: newState } : a))
    );
    if (readingArticle?.id === articleId) {
      setReadingArticle((prev) => (prev ? { ...prev, isBookmarked: newState } : null));
    }
  };

  const markAllAsRead = async () => {
    for (const article of articles) {
      if (!article.isRead) {
        await updateArticleStateInDB(article.id, { isRead: true });
      }
    }
    setArticles((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  // Derive folders list from feeds
  const folderNames = Array.from(new Set(feeds.map((f) => f.folder || 'General')));
  const folders: Folder[] = folderNames.map((name) => ({
    id: name,
    name,
    count: feeds.filter((f) => f.folder === name).length,
  }));

  return (
    <FeedContext.Provider
      value={{
        feeds,
        articles,
        folders,
        activeFilter,
        activeFolder,
        searchQuery,
        isSyncing,
        syncProgress,
        isOnline,
        readingArticle,
        setActiveFilter,
        setActiveFolder,
        setSearchQuery,
        setReadingArticle,
        addNewFeed,
        deleteFeed,
        markAsRead,
        toggleBookmark,
        markAllAsRead,
        syncAllFeeds,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
};

export function useFeeds() {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeeds must be used within a FeedProvider');
  }
  return context;
}

``

---

## File: `src\context\AudioContext.tsx`

``tsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Article, AudioQueueItem, PlaybackState } from '../types';
import {
  getAudioQueueFromDB,
  addToAudioQueueInDB,
  removeFromAudioQueueInDB,
  savePlaybackProgressInDB,
  getPlaybackProgressFromDB,
} from '../lib/db';
import { generateId } from '../lib/utils';

interface AudioContextValue {
  currentArticle: Article | null;
  playbackState: PlaybackState;
  activeParagraphIndex: number;
  activeSentence: string;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  queue: AudioQueueItem[];
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  playArticle: (article: Article, startParagraphIndex?: number) => void;
  togglePlayPause: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skip: (seconds: number) => void;
  nextParagraph: () => void;
  previousParagraph: () => void;
  seekToParagraph: (paragraphIndex: number) => void;
  seekToProgress: (ratio: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
  addToQueue: (article: Article) => Promise<void>;
  removeFromQueue: (itemId: string) => Promise<void>;
  playNextInQueue: () => void;
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number>(0);
  const [activeSentence, setActiveSentence] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setRate] = useState<number>(1.0);
  const [volume, setVol] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [queue, setQueue] = useState<AudioQueueItem[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoiceState] = useState<SpeechSynthesisVoice | null>(null);

  // References to guarantee zero stale-closure issues during asynchronous Web Speech calls
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const currentParagraphIndexRef = useRef<number>(0);
  const currentParagraphsRef = useRef<string[]>([]);
  const playbackRateRef = useRef<number>(1.0);
  const volumeRef = useRef<number>(1.0);
  const isMutedRef = useRef<boolean>(false);
  const previousVolumeRef = useRef<number>(1.0);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const currentArticleRef = useRef<Article | null>(null);
  currentArticleRef.current = currentArticle;

  // Initialize SpeechSynthesis and load offline queue from IndexedDB
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        setAvailableVoices(voices);

        // Prefer high quality English voices
        const defaultVoice =
          voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Premium'))) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];

        if (defaultVoice) {
          selectedVoiceRef.current = defaultVoice;
          setSelectedVoiceState(defaultVoice);
        }
      };

      updateVoices();
      if (synthRef.current?.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = updateVoices;
      }
    }

    // Load persistent offline audio queue
    getAudioQueueFromDB()
      .then(setQueue)
      .catch((err) => console.warn('[AudioContext] Could not load offline audio queue:', err));

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      synthRef.current?.cancel();
    };
  }, []);

  // Periodic persistence of playback progress to IndexedDB
  useEffect(() => {
    if (!currentArticle || playbackState === 'idle') return;

    const interval = setInterval(() => {
      if (currentTime > 0 && duration > 0) {
        savePlaybackProgressInDB(currentArticle.id, currentTime, duration).catch(() => {});
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentArticle, currentTime, duration, playbackState]);

  // Plays a specific paragraph in sequence with explicit options or fallback to refs
  const speakParagraph = useCallback(
    (
      paragraphs: string[],
      index: number,
      options?: { rate?: number; volume?: number; isMuted?: boolean }
    ) => {
      if (!synthRef.current || index >= paragraphs.length) {
        setPlaybackState('ended');
        setActiveSentence('');
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        return;
      }

      currentParagraphsRef.current = paragraphs;
      currentParagraphIndexRef.current = index;
      setActiveParagraphIndex(index);

      const paragraphText = paragraphs[index];
      const utterance = new SpeechSynthesisUtterance(paragraphText);
      utteranceRef.current = utterance;

      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }

      const effectiveRate = options?.rate ?? playbackRateRef.current;
      const effectiveIsMuted = options?.isMuted ?? isMutedRef.current;
      const effectiveVolume = effectiveIsMuted ? 0 : (options?.volume ?? volumeRef.current);

      utterance.rate = Math.max(0.5, Math.min(3.0, effectiveRate));
      utterance.volume = Math.max(0, Math.min(1.0, effectiveVolume));

      // Real-time boundary tracking for sentence synchronization
      utterance.onboundary = (event) => {
        if (event.name === 'sentence' || event.name === 'word') {
          const charIndex = event.charIndex;
          const sentenceChunk = paragraphText.substring(charIndex, charIndex + 50);
          setActiveSentence(sentenceChunk);
        }
      };

      utterance.onend = () => {
        // Automatically speak next paragraph
        if (currentParagraphIndexRef.current + 1 < paragraphs.length) {
          speakParagraph(paragraphs, currentParagraphIndexRef.current + 1);
        } else {
          setPlaybackState('ended');
          playNextInQueue();
        }
      };

      utterance.onerror = (err) => {
        if (err.error !== 'canceled' && err.error !== 'interrupted') {
          console.warn('[AudioContext] Utterance error:', err.error);
        }
      };

      // Ensure prior utterances are canceled and audio device buffer is clean
      setTimeout(() => {
        if (synthRef.current) {
          synthRef.current.speak(utterance);
        }
      }, 40);
    },
    []
  );

  const playArticle = useCallback(
    async (article: Article, startParagraphIndex = 0) => {
      if (!synthRef.current) {
        alert('Web Speech API is not supported in this browser.');
        return;
      }

      // Stop existing speech
      synthRef.current.cancel();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      setCurrentArticle(article);
      setPlaybackState('playing');

      const currentRate = playbackRateRef.current;
      // Estimate duration (words / 150 wpm * 60 seconds)
      const totalWords = article.paragraphs.join(' ').split(/\s+/).length;
      const estimatedDurationSeconds = Math.max(30, Math.round((totalWords / (150 * currentRate)) * 60));
      setDuration(estimatedDurationSeconds);

      // Check saved progress in IndexedDB
      const savedPosition = await getPlaybackProgressFromDB(article.id);
      if (savedPosition && startParagraphIndex === 0) {
        setCurrentTime(savedPosition);
      } else {
        const paragraphRatio = article.paragraphs.length > 0 ? startParagraphIndex / article.paragraphs.length : 0;
        setCurrentTime(Math.round(paragraphRatio * estimatedDurationSeconds));
      }

      // Start tick timer
      timerIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => Math.min(prev + 1, estimatedDurationSeconds));
      }, 1000);

      const paragraphsToSpeak =
        article.paragraphs.length > 0 ? article.paragraphs : [article.title, article.excerpt];

      speakParagraph(paragraphsToSpeak, startParagraphIndex);
    },
    [speakParagraph]
  );

  const pause = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.pause();
      setPlaybackState('paused');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, []);

  const resume = useCallback(() => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setPlaybackState('playing');
      timerIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => Math.min(prev + 1, duration));
      }, 1000);
    } else if (currentArticleRef.current) {
      // Chrome Windows resume workaround: if not resumed within 100ms, cleanly re-speak
      const paragraphs = currentArticleRef.current.paragraphs.length > 0
        ? currentArticleRef.current.paragraphs
        : [currentArticleRef.current.title, currentArticleRef.current.excerpt];
      playArticle(currentArticleRef.current, currentParagraphIndexRef.current);
    }
  }, [duration, playArticle]);

  const togglePlayPause = useCallback(() => {
    if (playbackState === 'playing') {
      pause();
    } else {
      resume();
    }
  }, [playbackState, pause, resume]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setPlaybackState('idle');
    setActiveSentence('');
    setCurrentTime(0);
  }, []);

  const seekToParagraph = useCallback(
    (paragraphIndex: number) => {
      if (!currentArticleRef.current) return;
      const paragraphs = currentArticleRef.current.paragraphs.length > 0
        ? currentArticleRef.current.paragraphs
        : [currentArticleRef.current.title, currentArticleRef.current.excerpt];

      const safeIndex = Math.max(0, Math.min(paragraphIndex, paragraphs.length - 1));
      synthRef.current?.cancel();

      const progressFraction = safeIndex / Math.max(1, paragraphs.length);
      setCurrentTime(Math.round(progressFraction * duration));
      setPlaybackState('playing');

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => Math.min(prev + 1, duration));
      }, 1000);

      speakParagraph(paragraphs, safeIndex);
    },
    [duration, speakParagraph]
  );

  const nextParagraph = useCallback(() => {
    if (!currentArticleRef.current) return;
    seekToParagraph(currentParagraphIndexRef.current + 1);
  }, [seekToParagraph]);

  const previousParagraph = useCallback(() => {
    if (!currentArticleRef.current) return;
    seekToParagraph(Math.max(0, currentParagraphIndexRef.current - 1));
  }, [seekToParagraph]);

  const skip = useCallback(
    (secondsDelta: number) => {
      if (!currentArticleRef.current) return;
      const paragraphs = currentArticleRef.current.paragraphs;
      if (paragraphs.length === 0) return;

      const paragraphDelta = Math.sign(secondsDelta) * Math.max(1, Math.round(Math.abs(secondsDelta) / 18));
      const targetIndex = Math.max(0, Math.min(currentParagraphIndexRef.current + paragraphDelta, paragraphs.length - 1));

      seekToParagraph(targetIndex);
    },
    [seekToParagraph]
  );

  const seekToProgress = useCallback(
    (ratio: number) => {
      if (!currentArticleRef.current) return;
      const safeRatio = Math.max(0, Math.min(1, ratio));
      const targetSeconds = Math.round(safeRatio * duration);
      setCurrentTime(targetSeconds);

      const paragraphs = currentArticleRef.current.paragraphs.length > 0
        ? currentArticleRef.current.paragraphs
        : [currentArticleRef.current.title, currentArticleRef.current.excerpt];

      const targetIndex = Math.floor(safeRatio * paragraphs.length);
      seekToParagraph(targetIndex);
    },
    [duration, seekToParagraph]
  );

  // Speed Change: Updates ref + state + immediate restart of current utterance at new speed
  const setPlaybackRate = useCallback(
    (rate: number) => {
      const clampedRate = Math.max(0.5, Math.min(3.0, Number(rate.toFixed(2))));
      playbackRateRef.current = clampedRate;
      setRate(clampedRate);

      if (currentArticleRef.current) {
        const totalWords = currentArticleRef.current.paragraphs.join(' ').split(/\s+/).length;
        const newDuration = Math.max(30, Math.round((totalWords / (150 * clampedRate)) * 60));
        setDuration(newDuration);
      }

      // If speech is in progress, cancel and immediately re-speak with new speed
      if (synthRef.current && (synthRef.current.speaking || playbackState === 'playing') && currentArticleRef.current) {
        synthRef.current.cancel();
        const paras = currentArticleRef.current.paragraphs.length > 0
          ? currentArticleRef.current.paragraphs
          : [currentArticleRef.current.title, currentArticleRef.current.excerpt];
        speakParagraph(paras, currentParagraphIndexRef.current, { rate: clampedRate });
      }
    },
    [playbackState, speakParagraph]
  );

  // Volume Change: Updates ref + state + immediate volume re-application
  const setVolume = useCallback(
    (vol: number) => {
      const clamped = Math.max(0, Math.min(1.0, Number(vol.toFixed(2))));
      volumeRef.current = clamped;
      setVol(clamped);

      if (clamped === 0) {
        isMutedRef.current = true;
        setIsMuted(true);
      } else {
        previousVolumeRef.current = clamped;
        isMutedRef.current = false;
        setIsMuted(false);
      }

      if (synthRef.current && (synthRef.current.speaking || playbackState === 'playing') && currentArticleRef.current) {
        synthRef.current.cancel();
        const paras = currentArticleRef.current.paragraphs.length > 0
          ? currentArticleRef.current.paragraphs
          : [currentArticleRef.current.title, currentArticleRef.current.excerpt];
        speakParagraph(paras, currentParagraphIndexRef.current, { volume: clamped, isMuted: clamped === 0 });
      }
    },
    [playbackState, speakParagraph]
  );

  // Mute Toggle: Instantly silences or restores audio
  const toggleMute = useCallback(() => {
    if (isMutedRef.current) {
      // Unmuting
      isMutedRef.current = false;
      setIsMuted(false);
      const restored = previousVolumeRef.current > 0 ? previousVolumeRef.current : 1.0;
      volumeRef.current = restored;
      setVol(restored);

      if (synthRef.current && (synthRef.current.speaking || playbackState === 'playing') && currentArticleRef.current) {
        synthRef.current.cancel();
        const paras = currentArticleRef.current.paragraphs.length > 0
          ? currentArticleRef.current.paragraphs
          : [currentArticleRef.current.title, currentArticleRef.current.excerpt];
        speakParagraph(paras, currentParagraphIndexRef.current, { volume: restored, isMuted: false });
      }
    } else {
      // Muting
      previousVolumeRef.current = volumeRef.current > 0 ? volumeRef.current : 1.0;
      isMutedRef.current = true;
      setIsMuted(true);
      setVol(0);

      if (synthRef.current && (synthRef.current.speaking || playbackState === 'playing') && currentArticleRef.current) {
        synthRef.current.cancel();
        const paras = currentArticleRef.current.paragraphs.length > 0
          ? currentArticleRef.current.paragraphs
          : [currentArticleRef.current.title, currentArticleRef.current.excerpt];
        // Speaks with volume 0 to preserve paragraph sync in pure silence
        speakParagraph(paras, currentParagraphIndexRef.current, { volume: 0, isMuted: true });
      }
    }
  }, [playbackState, speakParagraph]);

  const setSelectedVoice = (voice: SpeechSynthesisVoice) => {
    selectedVoiceRef.current = voice;
    setSelectedVoiceState(voice);
  };

  const addToQueue = async (article: Article) => {
    const queueItem: AudioQueueItem = {
      id: generateId('queue'),
      articleId: article.id,
      title: article.title,
      feedTitle: article.feedTitle,
      excerpt: article.excerpt,
      estimatedReadMinutes: article.estimatedReadMinutes,
      currentPositionSeconds: 0,
      dateAdded: new Date().toISOString(),
    };

    setQueue((prev) => [...prev, queueItem]);
    await addToAudioQueueInDB(queueItem);
  };

  const removeFromQueue = async (itemId: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== itemId));
    await removeFromAudioQueueInDB(itemId);
  };

  const playNextInQueue = useCallback(() => {
    if (queue.length === 0) return;
    const [nextItem, ...remaining] = queue;
    setQueue(remaining);
    removeFromAudioQueueInDB(nextItem.id);
  }, [queue]);

  // Global Keyboard Shortcuts (Space for Play/Pause, M for Mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space' && currentArticleRef.current && playbackState !== 'idle') {
        e.preventDefault();
        togglePlayPause();
      } else if ((e.key === 'm' || e.key === 'M') && currentArticleRef.current && playbackState !== 'idle') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playbackState, togglePlayPause, toggleMute]);

  return (
    <AudioContext.Provider
      value={{
        currentArticle,
        playbackState,
        activeParagraphIndex,
        activeSentence,
        currentTime,
        duration,
        playbackRate,
        volume,
        isMuted,
        queue,
        availableVoices,
        selectedVoice,
        playArticle,
        togglePlayPause,
        pause,
        resume,
        stop,
        skip,
        nextParagraph,
        previousParagraph,
        seekToParagraph,
        seekToProgress,
        setPlaybackRate,
        setVolume,
        toggleMute,
        setSelectedVoice,
        addToQueue,
        removeFromQueue,
        playNextInQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

``

---

## File: `src\lib\db.ts`

``typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Feed, Article, AudioQueueItem } from '../types';

interface FeedoraDB extends DBSchema {
  feeds: {
    key: string;
    value: Feed;
    indexes: { 'by-folder': string };
  };
  articles: {
    key: string;
    value: Article;
    indexes: {
      'by-feed': string;
      'by-published': string;
      'by-read': number; // 0 or 1
      'by-bookmarked': number;
    };
  };
  audioQueue: {
    key: string;
    value: AudioQueueItem;
    indexes: { 'by-added': string };
  };
  playbackProgress: {
    key: string; // articleId
    value: {
      articleId: string;
      positionSeconds: number;
      durationSeconds: number;
      updatedAt: string;
    };
  };
}

const DB_NAME = 'feedora_offline_v1';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<FeedoraDB>> | null = null;

function getDb(): Promise<IDBPDatabase<FeedoraDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FeedoraDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Feeds store
        if (!db.objectStoreNames.contains('feeds')) {
          const feedStore = db.createObjectStore('feeds', { keyPath: 'id' });
          feedStore.createIndex('by-folder', 'folder');
        }

        // Articles store
        if (!db.objectStoreNames.contains('articles')) {
          const articleStore = db.createObjectStore('articles', { keyPath: 'id' });
          articleStore.createIndex('by-feed', 'feedId');
          articleStore.createIndex('by-published', 'publishedAt');
          articleStore.createIndex('by-read', 'isRead');
          articleStore.createIndex('by-bookmarked', 'isBookmarked');
        }

        // Audio Queue store
        if (!db.objectStoreNames.contains('audioQueue')) {
          const queueStore = db.createObjectStore('audioQueue', { keyPath: 'id' });
          queueStore.createIndex('by-added', 'dateAdded');
        }

        // Playback progress store
        if (!db.objectStoreNames.contains('playbackProgress')) {
          db.createObjectStore('playbackProgress', { keyPath: 'articleId' });
        }
      },
    });
  }
  return dbPromise;
}

// Feeds CRUD
export async function getAllFeedsFromDB(): Promise<Feed[]> {
  const db = await getDb();
  return db.getAll('feeds');
}

export async function saveFeedToDB(feed: Feed): Promise<void> {
  const db = await getDb();
  await db.put('feeds', feed);
}

export async function deleteFeedFromDB(feedId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['feeds', 'articles'], 'readwrite');
  await tx.objectStore('feeds').delete(feedId);

  // Cascade delete feed articles
  const articleIndex = tx.objectStore('articles').index('by-feed');
  let cursor = await articleIndex.openCursor(feedId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

// Articles CRUD
export async function getAllArticlesFromDB(): Promise<Article[]> {
  const db = await getDb();
  const articles = await db.getAllFromIndex('articles', 'by-published');
  return articles.reverse(); // Newest first
}

export async function getArticlesByFeedFromDB(feedId: string): Promise<Article[]> {
  const db = await getDb();
  const articles = await db.getAllFromIndex('articles', 'by-feed', feedId);
  return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function saveArticlesToDB(articles: Article[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('articles', 'readwrite');
  for (const article of articles) {
    // Preserve read & bookmark states if article already existed
    const existing = await tx.store.get(article.id);
    if (existing) {
      await tx.store.put({
        ...article,
        isRead: existing.isRead,
        isBookmarked: existing.isBookmarked,
        audioProgressSeconds: existing.audioProgressSeconds,
      });
    } else {
      await tx.store.put(article);
    }
  }
  await tx.done;
}

export async function updateArticleStateInDB(
  articleId: string,
  updates: Partial<Pick<Article, 'isRead' | 'isBookmarked' | 'audioProgressSeconds'>>
): Promise<void> {
  const db = await getDb();
  const article = await db.get('articles', articleId);
  if (article) {
    await db.put('articles', { ...article, ...updates });
  }
}

// Audio Queue & Playback persistence
export async function getAudioQueueFromDB(): Promise<AudioQueueItem[]> {
  const db = await getDb();
  const queue = await db.getAllFromIndex('audioQueue', 'by-added');
  return queue;
}

export async function addToAudioQueueInDB(item: AudioQueueItem): Promise<void> {
  const db = await getDb();
  await db.put('audioQueue', item);
}

export async function removeFromAudioQueueInDB(itemId: string): Promise<void> {
  const db = await getDb();
  await db.delete('audioQueue', itemId);
}

export async function clearAudioQueueInDB(): Promise<void> {
  const db = await getDb();
  await db.clear('audioQueue');
}

export async function savePlaybackProgressInDB(
  articleId: string,
  positionSeconds: number,
  durationSeconds: number
): Promise<void> {
  const db = await getDb();
  await db.put('playbackProgress', {
    articleId,
    positionSeconds,
    durationSeconds,
    updatedAt: new Date().toISOString(),
  });
}

export async function getPlaybackProgressFromDB(articleId: string): Promise<number> {
  const db = await getDb();
  const record = await db.get('playbackProgress', articleId);
  return record?.positionSeconds || 0;
}

``

---

## File: `src\lib\feed-parser.ts`

``typescript
import { XMLParser } from 'fast-xml-parser';
import { Feed, Article } from '../types';
import { extractArticleContent } from './readability';
import { generateId } from './utils';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  cdataPropName: '__cdata',
  trimValues: true,
});

export interface ParsedFeedResult {
  feed: Omit<Feed, 'id'>;
  articles: Omit<Article, 'id' | 'feedId' | 'feedTitle'>[];
}

/**
 * Autodiscovers RSS/Atom feeds from a website domain or HTML page.
 * Enhanced with multi-stage fallback:
 * 1. Checks if URL itself is XML.
 * 2. Checks <link rel="alternate" type="application/rss+xml|atom+xml"> in HTML.
 * 3. Probes common domain feed endpoints (/feed, /rss, /rss.xml, /atom.xml).
 */
export async function autodiscoverFeedUrl(inputUrl: string): Promise<string> {
  let targetUrl = inputUrl.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  // If already directly an XML/RSS file or feed endpoint, return as-is (unless oembed)
  if (
    (/\.(xml|rss|atom)$/i.test(targetUrl) && !targetUrl.includes('oembed')) ||
    targetUrl.endsWith('/feed') ||
    targetUrl.endsWith('/feed/')
  ) {
    return targetUrl;
  }

  try {
    const proxyUrl = `/api/fetch?url=${encodeURIComponent(targetUrl)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) return targetUrl;

    const bodyText = await response.text();

    // Check if the response itself is already valid XML and not oEmbed
    if (
      (bodyText.includes('<rss') || bodyText.includes('<feed') || bodyText.includes('xmlns="http://www.w3.org/2005/Atom"')) &&
      !bodyText.includes('wp-json/oembed') &&
      !bodyText.includes('<oembed')
    ) {
      return targetUrl;
    }

    // 1. Search for <link rel="alternate"> in the HTML head (strictly excluding oEmbed)
    const parser = new DOMParser();
    const doc = parser.parseFromString(bodyText, 'text/html');
    const candidateLinks = Array.from(
      doc.querySelectorAll('link[rel="alternate"], link[rel="feed"]')
    );

    for (const link of candidateLinks) {
      const type = (link.getAttribute('type') || '').toLowerCase();
      const href = link.getAttribute('href');
      if (!href) continue;

      // STRICTLY EXCLUDE oEmbed, JSON, search, or non-feed alternates
      if (
        type.includes('oembed') ||
        type.includes('json') ||
        href.includes('wp-json/oembed') ||
        (href.includes('format=xml') && href.includes('oembed'))
      ) {
        continue;
      }

      // Match genuine RSS / Atom types
      if (
        type === 'application/rss+xml' ||
        type === 'application/atom+xml' ||
        type === 'application/rdf+xml'
      ) {
        // Exclude comments feed if possible
        const title = (link.getAttribute('title') || '').toLowerCase();
        if (title.includes('comment') || href.includes('/comments/')) {
          continue;
        }
        return new URL(href, targetUrl).href;
      }
    }

    // 2. Intelligent Domain Probing: If page is a deep article or landing page, probe common feed endpoints
    const origin = new URL(targetUrl).origin;
    const cleanPath = targetUrl.replace(/\/+$/, '');
    const candidateEndpoints = [
      `${cleanPath}/feed/`,
      `${cleanPath}/feed`,
      `${origin}/feed/`,
      `${origin}/feed`,
      `${origin}/rss.xml`,
      `${origin}/rss`,
      `${origin}/atom.xml`,
      `${origin}/index.xml`,
    ];

    const distinctCandidates = Array.from(new Set(candidateEndpoints));

    for (const candidate of distinctCandidates) {
      try {
        const probeRes = await fetch(`/api/fetch?url=${encodeURIComponent(candidate)}`);
        if (probeRes.ok) {
          const probeText = await probeRes.text();
          if (
            (probeText.includes('<rss') || probeText.includes('<feed') || probeText.includes('xmlns="http://www.w3.org/2005/Atom"')) &&
            !probeText.includes('<oembed') &&
            !probeText.includes('wp-json/oembed')
          ) {
            console.log(`[feed-parser] Autodiscovered feed candidate: ${candidate}`);
            return candidate;
          }
        }
      } catch {
        // Continue probing next candidate
      }
    }
  } catch (err) {
    console.warn('[feed-parser] Autodiscovery search encountered error:', err);
  }

  return targetUrl;
}

/**
 * Fetches and parses an RSS 2.0 or Atom XML feed via the SSRF-protected /api/fetch proxy.
 */
export async function fetchAndParseFeed(feedUrl: string, folderName = 'General', isRetry = false): Promise<ParsedFeedResult> {
  const proxyUrl = `/api/fetch?url=${encodeURIComponent(feedUrl)}`;
  const response = await fetch(proxyUrl);

  if (!response.ok) {
    let errorDetails = `HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorDetails = `${errJson.error}: ${errJson.details || ''}`;
    } catch {}
    throw new Error(`Feed fetch failed: ${errorDetails}`);
  }

  const rawText = await response.text();

  // If the document is an HTML webpage or oembed rather than XML, attempt autodiscovery!
  const isHtml =
    rawText.trim().toLowerCase().startsWith('<!doctype html') ||
    rawText.includes('<html') ||
    rawText.includes('<head>') ||
    rawText.includes('<body>');

  const isOembed = rawText.includes('<oembed') || rawText.includes('wp-json/oembed');
  const isNotRssOrAtom = !rawText.includes('<rss') && !rawText.includes('<feed');

  if ((isHtml || isOembed || isNotRssOrAtom) && !isRetry) {
    const discovered = await autodiscoverFeedUrl(feedUrl);
    if (discovered && discovered !== feedUrl) {
      return fetchAndParseFeed(discovered, folderName, true);
    }
  }

  if (isHtml && isNotRssOrAtom) {
    throw new Error(
      `No active RSS or Atom feed found at this address. Please provide the direct RSS link (e.g. ending in /feed or .xml).`
    );
  }

  let parsedObj: any;
  try {
    parsedObj = xmlParser.parse(rawText);
  } catch (err: any) {
    throw new Error(`XML Syntax Error: Could not parse feed document (${err.message}).`);
  }

  // 1. Check for RSS 2.0
  if (parsedObj.rss?.channel) {
    return parseRssChannel(parsedObj.rss.channel, feedUrl, folderName);
  }

  // 2. Check for Atom feed
  if (parsedObj.feed) {
    return parseAtomFeed(parsedObj.feed, feedUrl, folderName);
  }

  // 3. Check for RDF / RSS 1.0
  if (parsedObj['rdf:RDF']?.channel) {
    return parseRssChannel(parsedObj['rdf:RDF'].channel, feedUrl, folderName, parsedObj['rdf:RDF'].item);
  }

  // If parsing didn't match and we haven't retried yet, try origin autodiscovery
  if (!isRetry) {
    try {
      const origin = new URL(feedUrl).origin;
      const discovered = await autodiscoverFeedUrl(origin);
      if (discovered && discovered !== feedUrl) {
        return fetchAndParseFeed(discovered, folderName, true);
      }
    } catch {}
  }

  throw new Error(
    'Unrecognized feed format. Expected standard RSS 2.0 or Atom XML data, but received incompatible structure.'
  );
}

function parseRssChannel(channel: any, feedUrl: string, folder: string, overrideItems?: any): ParsedFeedResult {
  const title = getCleanString(channel.title) || 'Untitled Feed';
  const siteUrl = getCleanString(channel.link) || feedUrl;
  const description = getCleanString(channel.description) || '';

  const rawItems = overrideItems || channel.item;
  const itemsArray = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  const articles = itemsArray.map((item: any) => {
    const itemTitle = getCleanString(item.title) || 'Untitled Article';
    const itemLink = getCleanString(item.link) || item.guid?.['#text'] || siteUrl;
    const itemAuthor = getCleanString(item['dc:creator'] || item.author || channel['dc:creator']);
    const rawDate = item.pubDate || item.date || item['dc:date'] || new Date().toISOString();
    const publishedAt = new Date(rawDate).toISOString();

    const rawContent = getCleanString(item['content:encoded'] || item.description || item.summary || '');
    const extracted = extractArticleContent(itemTitle, rawContent, itemAuthor);

    return {
      title: itemTitle,
      link: itemLink,
      author: itemAuthor,
      publishedAt,
      contentRaw: rawContent,
      contentClean: extracted.contentClean,
      excerpt: extracted.excerpt,
      paragraphs: extracted.paragraphs,
      isRead: false,
      isBookmarked: false,
      estimatedReadMinutes: extracted.estimatedMinutes,
    };
  });

  return {
    feed: {
      title,
      siteUrl,
      feedUrl,
      description,
      folder,
      unreadCount: articles.length,
      lastFetchedAt: new Date().toISOString(),
      iconUrl: getFaviconUrl(siteUrl),
    },
    articles,
  };
}

function parseAtomFeed(feed: any, feedUrl: string, folder: string): ParsedFeedResult {
  const title = getCleanString(feed.title) || 'Untitled Atom Feed';
  let siteUrl = feedUrl;
  if (Array.isArray(feed.link)) {
    const altLink = feed.link.find((l: any) => l['@_rel'] === 'alternate' || !l['@_rel']);
    if (altLink) siteUrl = altLink['@_href'] || siteUrl;
  } else if (feed.link?.['@_href']) {
    siteUrl = feed.link['@_href'];
  }

  const description = getCleanString(feed.subtitle) || '';
  const entriesArray = Array.isArray(feed.entry) ? feed.entry : feed.entry ? [feed.entry] : [];

  const articles = entriesArray.map((entry: any) => {
    const itemTitle = getCleanString(entry.title) || 'Untitled Entry';
    let itemLink = siteUrl;
    if (Array.isArray(entry.link)) {
      const alt = entry.link.find((l: any) => l['@_rel'] === 'alternate' || !l['@_rel']);
      if (alt) itemLink = alt['@_href'] || itemLink;
    } else if (entry.link?.['@_href']) {
      itemLink = entry.link['@_href'];
    }

    const itemAuthor = getCleanString(entry.author?.name || feed.author?.name);
    const rawDate = entry.published || entry.updated || new Date().toISOString();
    const publishedAt = new Date(rawDate).toISOString();

    const rawContent = getCleanString(entry.content?.['#text'] || entry.content || entry.summary?.['#text'] || entry.summary || '');
    const extracted = extractArticleContent(itemTitle, rawContent, itemAuthor);

    return {
      title: itemTitle,
      link: itemLink,
      author: itemAuthor,
      publishedAt,
      contentRaw: rawContent,
      contentClean: extracted.contentClean,
      excerpt: extracted.excerpt,
      paragraphs: extracted.paragraphs,
      isRead: false,
      isBookmarked: false,
      estimatedReadMinutes: extracted.estimatedMinutes,
    };
  });

  return {
    feed: {
      title,
      siteUrl,
      feedUrl,
      description,
      folder,
      unreadCount: articles.length,
      lastFetchedAt: new Date().toISOString(),
      iconUrl: getFaviconUrl(siteUrl),
    },
    articles,
  };
}

function getCleanString(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val.trim();
  if (val['__cdata']) return String(val['__cdata']).trim();
  if (val['#text']) return String(val['#text']).trim();
  return String(val).trim();
}

function getFaviconUrl(domain: string): string {
  try {
    const url = new URL(domain);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
  } catch {
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${domain}`;
  }
}

``

---

## File: `src\lib\readability.ts`

``typescript
import { sanitizeHtml, stripHtmlToPlainText } from './sanitizer';
import { estimateReadingTime } from './utils';

export interface ExtractedArticle {
  title: string;
  byline?: string;
  excerpt: string;
  contentClean: string;
  paragraphs: string[];
  estimatedMinutes: number;
}

/**
 * Extracts reader-friendly article content and prepares tokenized paragraphs for TTS sync.
 */
export function extractArticleContent(
  rawTitle: string,
  rawContent: string,
  rawAuthor?: string
): ExtractedArticle {
  const contentClean = sanitizeHtml(rawContent);

  // Parse HTML into virtual DOM to extract paragraphs cleanly
  const parser = new DOMParser();
  const doc = parser.parseFromString(contentClean, 'text/html');

  // Strip script, style, nav, footer artifacts if any remained
  const elementsToRemove = doc.querySelectorAll('script, style, nav, footer, header, form, svg');
  elementsToRemove.forEach((el) => el.remove());

  // Extract paragraphs (or split blocks)
  const pNodes = Array.from(doc.querySelectorAll('p, blockquote, li, h2, h3, h4'));
  let paragraphs: string[] = [];

  if (pNodes.length > 0) {
    paragraphs = pNodes
      .map((node) => node.textContent?.trim() || '')
      .filter((text) => text.length > 25); // Avoid tiny menu remnants
  }

  // If no <p> tags exist (e.g. plain text or single blob), split by double newline
  if (paragraphs.length === 0) {
    const plainText = stripHtmlToPlainText(rawContent);
    paragraphs = plainText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 15);
  }

  // Generate short excerpt from the first paragraph
  const firstParagraph = paragraphs[0] || stripHtmlToPlainText(rawContent);
  const excerpt = firstParagraph.length > 180 ? `${firstParagraph.substring(0, 180).trim()}...` : firstParagraph;

  const totalPlainText = paragraphs.join(' ');
  const estimatedMinutes = estimateReadingTime(totalPlainText || rawTitle);

  return {
    title: rawTitle,
    byline: rawAuthor,
    excerpt,
    contentClean,
    paragraphs,
    estimatedMinutes,
  };
}

``

---

## File: `src\lib\sanitizer.ts`

``typescript
import DOMPurify from 'dompurify';

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
    'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i', 'code',
    'pre', 'img', 'figure', 'figcaption', 'table', 'thead',
    'tbody', 'tr', 'th', 'td', 'hr', 'br', 'span', 'sub', 'sup'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'target', 'rel', 'src', 'alt', 'width',
    'height', 'class', 'loading'
  ],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target', 'rel'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  RETURN_TRUSTED_TYPE: false,
};

/**
 * Strips malicious XSS vectors and formats outbound links securely.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';

  // Setup hook to guarantee external links open safely in blank tab with noopener
  DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    if (node.tagName === 'A' && node.hasAttribute('href')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer nofollow');
    }
  });

  return String(DOMPurify.sanitize(dirtyHtml, SANITIZE_CONFIG));
}

/**
 * Strips all HTML tags to pure text (ideal for Text-To-Speech audio engine).
 */
export function stripHtmlToPlainText(html: string): string {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = String(DOMPurify.sanitize(html));
  return tempDiv.textContent || tempDiv.innerText || '';
}

``

---

## File: `src\lib\opml.ts`

``typescript
import { Feed } from '../types';

export interface OPMLFeedItem {
  title: string;
  feedUrl: string;
  siteUrl?: string;
  folder?: string;
}

/**
 * Generates standard OPML 2.0 XML string from active subscriptions.
 */
export function exportToOPML(feeds: Feed[]): string {
  const dateStr = new Date().toUTCString();

  // Group feeds by folder
  const folderMap = new Map<string, Feed[]>();
  for (const feed of feeds) {
    const folder = feed.folder || 'Subscriptions';
    if (!folderMap.has(folder)) {
      folderMap.set(folder, []);
    }
    folderMap.get(folder)!.push(feed);
  }

  let bodyContent = '';
  for (const [folderName, folderFeeds] of folderMap.entries()) {
    const escapedFolder = escapeXml(folderName);
    bodyContent += `    <outline text="${escapedFolder}" title="${escapedFolder}">\n`;
    for (const f of folderFeeds) {
      const escapedTitle = escapeXml(f.title);
      const escapedXmlUrl = escapeXml(f.feedUrl);
      const escapedHtmlUrl = escapeXml(f.siteUrl || '');
      bodyContent += `      <outline type="rss" text="${escapedTitle}" title="${escapedTitle}" xmlUrl="${escapedXmlUrl}" htmlUrl="${escapedHtmlUrl}" />\n`;
    }
    bodyContent += `    </outline>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>IncogniRead Subscriptions Export</title>
    <dateCreated>${dateStr}</dateCreated>
    <docs>http://opml.org/spec2.opml</docs>
  </head>
  <body>
${bodyContent}  </body>
</opml>`;
}

/**
 * Triggers a browser file download of the OPML export.
 */
export function downloadOPML(feeds: Feed[], filename = 'incogniread-subscriptions.opml'): void {
  const xmlContent = exportToOPML(feeds);
  const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parses an OPML 1.0 or 2.0 XML string into subscription feed items.
 */
export function parseOPML(opmlXml: string): OPMLFeedItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(opmlXml, 'text/xml');
  const items: OPMLFeedItem[] = [];

  const outlines = Array.from(doc.querySelectorAll('outline'));
  for (const outline of outlines) {
    const xmlUrl = outline.getAttribute('xmlUrl') || outline.getAttribute('xmlurl');
    if (!xmlUrl) continue;

    const title =
      outline.getAttribute('title') ||
      outline.getAttribute('text') ||
      outline.getAttribute('description') ||
      'Untitled Feed';

    const siteUrl =
      outline.getAttribute('htmlUrl') ||
      outline.getAttribute('htmlurl') ||
      new URL(xmlUrl).origin;

    // Determine folder from parent outline if nested
    let folder = 'Imported';
    const parentOutline = outline.parentElement?.closest('outline');
    if (parentOutline) {
      folder = parentOutline.getAttribute('text') || parentOutline.getAttribute('title') || 'Imported';
    }

    items.push({
      title: title.trim(),
      feedUrl: xmlUrl.trim(),
      siteUrl: siteUrl.trim(),
      folder: folder.trim(),
    });
  }

  return items;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

``

---

## File: `src\lib\ssrf.ts`

``typescript
import dns from 'dns';
import { promisify } from 'util';
import ipaddr from 'net';

const lookupAsync = promisify(dns.lookup);

/**
 * Checks if an IPv4 or IPv6 string is private, loopback, or reserved.
 */
export function isPrivateOrReservedIP(ip: string): boolean {
  // Normalize IPv6-mapped IPv4
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // IPv4 Checks
  if (ipaddr.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;

    // 0.0.0.0/8 (Broadcast/Current network)
    if (a === 0) return true;
    // 10.0.0.0/8 (Private)
    if (a === 10) return true;
    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 169.254.0.0/16 (Link-local / Cloud metadata AWS/GCP/Azure)
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12 (Private)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (a === 192 && b === 168) return true;
    // 224.0.0.0/4 (Multicast)
    if (a >= 224) return true;

    return false;
  }

  // IPv6 Checks
  if (ipaddr.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::' || lower.startsWith('fe80:') || lower.startsWith('fc00:') || lower.startsWith('fd00:')) {
      return true;
    }
    return false;
  }

  return true; // Unknown format, treat as unsafe
}

/**
 * Validates target URL against SSRF attacks before initiating network requests.
 */
export async function validateTargetUrl(rawUrl: string): Promise<{ valid: boolean; reason?: string; resolvedUrl?: URL }> {
  try {
    const parsed = new URL(rawUrl);

    // 1. Protocol validation
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, reason: 'Disallowed protocol: Only HTTP and HTTPS are permitted.' };
    }

    // 2. Port validation (block internal admin/service ports)
    const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
    if (![80, 443, 8080, 8443].includes(port)) {
      return { valid: false, reason: `Disallowed port: Port ${port} is restricted.` };
    }

    // 3. Hostname checks for well-known localhost aliases
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === 'metadata.google.internal'
    ) {
      return { valid: false, reason: 'Target hostname targets local or cloud metadata domain.' };
    }

    // 4. DNS resolution verification (detect DNS rebinding or resolving to internal IPs)
    const addresses = await lookupAsync(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateOrReservedIP(addr.address)) {
        return { valid: false, reason: `Target resolves to private or restricted IP address: ${addr.address}` };
      }
    }

    return { valid: true, resolvedUrl: parsed };
  } catch (err: any) {
    return { valid: false, reason: `Invalid URL format or DNS resolution failed: ${err.message}` };
  }
}

``

---

## File: `src\lib\utils.ts`

``typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function timeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'recently';
  }
}

export function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  // Average adult reading speed: 200 words per minute
  return Math.max(1, Math.ceil(words / 200));
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

``

---

## File: `src\components\layout\Navbar.tsx`

``tsx
import React from 'react';
import { useFeeds } from '../../context/FeedContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { IncogniReadLogo } from '../ui/IncogniReadLogo';
import { Button } from '../ui/button';
import {
  Rss,
  Search,
  Plus,
  Wifi,
  WifiOff,
  RefreshCw,
  Menu,
  Compass,
  FileCode,
} from 'lucide-react';

export interface NavbarProps {
  onOpenAddFeed: () => void;
  onOpenMobileMenu: () => void;
  onOpenDiscovery: () => void;
  onOpenOPML: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddFeed,
  onOpenMobileMenu,
  onOpenDiscovery,
  onOpenOPML,
}) => {
  const { searchQuery, setSearchQuery, isOnline, isSyncing, syncAllFeeds } = useFeeds();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-theme-border bg-theme-surface-solid/90 backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open navigation drawer"
            className="lg:hidden rounded-xl p-2.5 text-theme-muted hover:bg-theme-elevated hover:text-theme-heading transition-colors border border-theme-border min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="cursor-pointer select-none">
            <IncogniReadLogo showText={true} />
          </div>
        </div>

        {/* Global Search Input Box */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search articles & blog subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 min-h-[40px] pl-10 pr-4 rounded-xl border border-theme-border bg-theme-surface/70 backdrop-blur-md text-xs sm:text-sm text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-amber-500 transition-colors font-serif"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-theme-muted hover:text-theme-heading font-serif"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Discover, OPML, Theme Toggle, Online Status, Sync & Add Feed */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Offline / Online Pill */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono select-none ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
            }`}
            title={isOnline ? 'Online: Live proxy enabled' : 'Offline: Serving local IndexedDB cache'}
          >
            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span className="text-[10px] font-bold">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          {/* Anonymous Discovery Trigger Button */}
          <Button
            variant="glass"
            size="sm"
            onClick={onOpenDiscovery}
            className="h-10 px-2.5 sm:px-3 text-xs font-serif font-bold text-theme-heading hover:text-amber-500 hover:border-amber-500/40 gap-1.5"
            title="Anonymous Co-Subscription Discovery & Graph"
          >
            <Compass className="h-4 w-4 text-amber-500" />
            <span className="hidden sm:inline">Discover</span>
          </Button>

          {/* OPML Import / Export Trigger Button (PS-003 Bonus) */}
          <Button
            variant="glass"
            size="sm"
            onClick={onOpenOPML}
            className="h-10 px-2 sm:px-2.5 text-xs font-serif font-bold text-theme-heading hover:text-amber-500 hover:border-amber-500/40 gap-1.5 hidden md:inline-flex"
            title="OPML Subscriptions Import & Export"
          >
            <FileCode className="h-3.5 w-3.5 text-theme-muted" />
            <span>OPML</span>
          </Button>

          {/* Theme Selector Toggle */}
          <ThemeToggle variant="dropdown" />

          {/* Sync Button */}
          <Button
            variant="glass"
            size="sm"
            onClick={syncAllFeeds}
            isLoading={isSyncing}
            className="hidden sm:inline-flex min-h-[40px] min-w-[40px] p-2"
            title="Sync all feeds"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-amber-500' : 'text-theme-muted'}`} />
          </Button>

          {/* Add Feed Button */}
          <Button
            variant="amber"
            size="sm"
            onClick={onOpenAddFeed}
            className="gap-1.5 min-h-[40px] text-xs font-serif font-bold shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Blog</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

``

---

## File: `src\components\layout\Sidebar.tsx`

``tsx
import React, { useState } from 'react';
import { useFeeds } from '../../context/FeedContext';
import { Badge } from '../ui/badge';
import {
  Rss,
  Folder as FolderIcon,
  ChevronDown,
  ChevronRight,
  Inbox,
  Bookmark,
  Sparkles,
  Trash2,
  Plus,
  Compass,
  FileCode,
} from 'lucide-react';

export interface SidebarProps {
  onOpenAddFeed: () => void;
  onOpenDiscovery: () => void;
  onOpenOPML: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenAddFeed,
  onOpenDiscovery,
  onOpenOPML,
}) => {
  const {
    feeds,
    articles,
    folders,
    activeFilter,
    activeFolder,
    setActiveFilter,
    setActiveFolder,
    deleteFeed,
  } = useFeeds();

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'Engineering & AI': true,
    'Tech Journalism': true,
    'Web Development': true,
  });

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const unreadTotal = articles.filter((a) => !a.isRead).length;

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col justify-between border-r border-theme-border bg-theme-surface/60 backdrop-blur-xl p-4 min-h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto transition-colors duration-200">
      <div className="space-y-6">
        {/* Core Views Filter */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-theme-muted mb-2">
            Feed Views
          </p>

          <button
            onClick={() => {
              setActiveFilter('all');
              setActiveFolder('all');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-serif font-semibold transition-all min-h-[40px] ${
              activeFilter === 'all' && activeFolder === 'all'
                ? 'bg-amber-500/15 border border-amber-500/30 text-theme-heading font-bold'
                : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="h-4 w-4 text-amber-500" />
              <span>All Articles</span>
            </div>
            <span className="font-mono text-[10px] text-theme-muted">{articles.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter('unread')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-serif font-semibold transition-all min-h-[40px] ${
              activeFilter === 'unread'
                ? 'bg-amber-500/15 border border-amber-500/30 text-theme-heading font-bold'
                : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Unread</span>
            </div>
            {unreadTotal > 0 && (
              <Badge variant="amber" className="text-[10px] py-0 px-1.5 font-mono">
                {unreadTotal}
              </Badge>
            )}
          </button>

          <button
            onClick={() => setActiveFilter('bookmarks')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-serif font-semibold transition-all min-h-[40px] ${
              activeFilter === 'bookmarks'
                ? 'bg-amber-500/15 border border-amber-500/30 text-theme-heading font-bold'
                : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className="h-4 w-4 text-amber-500" />
              <span>Saved Clippings</span>
            </div>
            <span className="font-mono text-[10px] text-theme-muted">
              {articles.filter((a) => a.isBookmarked).length}
            </span>
          </button>

          {/* Anonymous Discovery Trigger */}
          <button
            onClick={onOpenDiscovery}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-serif font-semibold transition-all min-h-[40px] text-theme-muted hover:text-theme-heading hover:bg-theme-elevated/70 group"
          >
            <div className="flex items-center gap-2.5">
              <Compass className="h-4 w-4 text-amber-500" />
              <span>Discover Blogs</span>
            </div>
            <Badge variant="amber" className="text-[10px] py-0 px-1.5 font-mono">
              Auto
            </Badge>
          </button>

          {/* OPML Subscriptions Tool */}
          <button
            onClick={onOpenOPML}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-serif font-semibold transition-all min-h-[40px] text-theme-muted hover:text-theme-heading hover:bg-theme-elevated/70 group"
          >
            <div className="flex items-center gap-2.5">
              <FileCode className="h-4 w-4 text-amber-500" />
              <span>OPML Export/Import</span>
            </div>
          </button>
        </div>

        {/* Folders & Feeds Tree */}
        <div className="space-y-3 pt-3 border-t border-theme-subtle">
          <div className="flex items-center justify-between px-3">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-theme-muted">
              Subscriptions ({feeds.length})
            </p>
            <button
              onClick={onOpenAddFeed}
              className="p-1 text-theme-muted hover:text-amber-500 transition-colors"
              title="Add blog feed"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {folders.map((folder) => {
              const folderFeeds = feeds.filter((f) => (f.folder || 'General') === folder.name);
              const isExpanded = expandedFolders[folder.name] ?? true;
              const isFolderActive = activeFolder === folder.name;

              return (
                <div key={folder.id} className="space-y-1">
                  <div
                    onClick={() => {
                      setActiveFolder(isFolderActive ? 'all' : folder.name);
                      setActiveFilter('all');
                    }}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-serif cursor-pointer transition-colors ${
                      isFolderActive
                        ? 'bg-amber-500/10 text-amber-500 font-bold'
                        : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder(folder.name);
                        }}
                        className="p-0.5 text-theme-muted hover:text-theme-heading"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <FolderIcon className="h-3.5 w-3.5 text-amber-500/80 shrink-0" />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    <span className="text-[10px] text-theme-muted font-mono">{folderFeeds.length}</span>
                  </div>

                  {isExpanded && (
                    <div className="pl-6 space-y-0.5 border-l border-theme-subtle ml-3">
                      {folderFeeds.map((feed) => {
                        const isFeedActive = activeFilter === feed.id;
                        const feedUnread = articles.filter(
                          (a) => a.feedId === feed.id && !a.isRead
                        ).length;

                        return (
                          <div
                            key={feed.id}
                            onClick={() => {
                              setActiveFilter(feed.id);
                              setActiveFolder('all');
                            }}
                            className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-serif cursor-pointer transition-colors ${
                              isFeedActive
                                ? 'bg-amber-500/20 text-amber-500 font-bold'
                                : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated/40'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              {feed.iconUrl ? (
                                <img
                                  src={feed.iconUrl}
                                  alt=""
                                  className="h-3.5 w-3.5 rounded shrink-0 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Rss className="h-3.5 w-3.5 text-amber-500/70 shrink-0" />
                              )}
                              <span className="truncate">{feed.title}</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {feedUnread > 0 && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-theme-elevated text-theme-muted font-mono">
                                  {feedUnread}
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Unsubscribe from ${feed.title}?`)) {
                                    deleteFeed(feed.id);
                                  }
                                }}
                                title="Unsubscribe"
                                className="opacity-0 group-hover:opacity-100 p-1 text-theme-muted hover:text-rose-500 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-theme-subtle text-[11px] text-theme-muted space-y-1 font-serif">
        <p className="font-bold text-theme-heading flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>PS-003 Small Web Reader</span>
        </p>
        <p className="text-[10px] leading-tight text-theme-muted">
          100% offline-first IndexedDB cache. Zero accounts, zero tracking.
        </p>
      </div>
    </aside>
  );
};

``

---

## File: `src\components\layout\RightPanel.tsx`

``tsx
import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useFeeds } from '../../context/FeedContext';
import { AnonymousDiscovery } from '../discovery/AnonymousDiscovery';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  ListMusic,
  Compass,
  Play,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const RightPanel: React.FC = () => {
  const { queue, removeFromQueue, playArticle } = useAudio();
  const { articles } = useFeeds();
  const [activeTab, setActiveTab] = useState<'queue' | 'discovery'>('discovery');

  const handlePlayQueueItem = (articleId: string) => {
    const article = articles.find((a) => a.id === articleId);
    if (article) {
      playArticle(article);
    }
  };

  return (
    <aside className="hidden xl:flex w-72 shrink-0 flex-col border-l border-theme-border bg-theme-surface/60 backdrop-blur-xl p-4 min-h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto transition-colors duration-200">
      {/* Tab Switcher: Discovery vs Audio Queue */}
      <div className="flex p-1 rounded-2xl bg-theme-elevated border border-theme-border mb-5">
        <button
          onClick={() => setActiveTab('discovery')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-serif font-semibold transition-all min-h-[36px] ${
            activeTab === 'discovery'
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 shadow-xs font-bold'
              : 'text-theme-muted hover:text-theme-heading'
          }`}
        >
          <Compass className="h-3.5 w-3.5 text-amber-500" />
          <span>Discover</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-serif font-semibold transition-all min-h-[36px] ${
            activeTab === 'queue'
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 shadow-xs font-bold'
              : 'text-theme-muted hover:text-theme-heading'
          }`}
        >
          <ListMusic className="h-3.5 w-3.5 text-amber-500" />
          <span>Audio Queue</span>
          {queue.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[9px] rounded-full bg-amber-500 text-slate-950 font-bold font-mono">
              {queue.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'discovery' ? (
        <AnonymousDiscovery />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-serif font-bold uppercase tracking-wider text-theme-muted px-1">
            <span>Play Later Queue</span>
            <span className="text-[10px] font-mono text-amber-500">{queue.length} articles</span>
          </div>

          {queue.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-theme-border p-8 text-center space-y-2 bg-theme-surface/30">
              <ListMusic className="h-6 w-6 text-theme-muted mx-auto" />
              <p className="text-xs text-theme-muted font-serif">Your audio queue is empty.</p>
              <p className="text-[11px] text-theme-muted font-serif italic">
                Click “+” on any story to queue articles for uninterrupted narration.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {queue.map((item, idx) => (
                <div
                  key={item.id}
                  className="group p-3 rounded-2xl border border-theme-border bg-theme-surface/70 hover:bg-theme-surface hover:border-amber-500/30 transition-all text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-editorial font-bold text-theme-heading line-clamp-2 leading-snug">
                      {item.title}
                    </span>
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="p-1 text-theme-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from queue"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-theme-muted pt-1 border-t border-theme-subtle">
                    <span className="text-amber-600 dark:text-amber-400 font-mono text-[10px] truncate max-w-[120px]">
                      {item.feedTitle}
                    </span>
                    <button
                      onClick={() => handlePlayQueueItem(item.articleId)}
                      className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-serif font-semibold"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Play Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

``

---

## File: `src\components\layout\MobileNav.tsx`

``tsx
import React from 'react';
import { Sheet } from '../ui/sheet';
import { useFeeds } from '../../context/FeedContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { IncogniReadLogo } from '../ui/IncogniReadLogo';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Rss,
  Folder as FolderIcon,
  Inbox,
  Bookmark,
  Compass,
  Plus,
  RefreshCw,
  FileCode,
} from 'lucide-react';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddFeed: () => void;
  onOpenDiscovery: () => void;
  onOpenOPML: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  onOpenAddFeed,
  onOpenDiscovery,
  onOpenOPML,
}) => {
  const {
    feeds,
    articles,
    folders,
    activeFilter,
    activeFolder,
    setActiveFilter,
    setActiveFolder,
    syncAllFeeds,
    isSyncing,
  } = useFeeds();

  const unreadTotal = articles.filter((a) => !a.isRead).length;

  const handleSelectFilter = (filter: string, folder = 'all') => {
    setActiveFilter(filter);
    setActiveFolder(folder);
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      side="left"
      title={
        <div className="flex items-center gap-2.5">
          <IncogniReadLogo size={28} />
          <span className="font-editorial font-bold text-base text-theme-heading">IncogniRead</span>
        </div>
      }
    >
      <div className="flex flex-col space-y-5">
        {/* Theme Switcher inside Mobile Drawer */}
        <div className="p-3 rounded-2xl border border-theme-border bg-theme-surface flex items-center justify-between">
          <span className="text-xs font-serif font-bold text-theme-heading">Reading Edition:</span>
          <ThemeToggle variant="dropdown" />
        </div>

        {/* Discovery & OPML Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenDiscovery();
            }}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs font-serif font-bold text-theme-heading hover:bg-amber-500/20 transition-colors min-h-[44px]"
          >
            <Compass className="h-4 w-4 text-amber-500" />
            <span>Discover</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenOPML();
            }}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-theme-border bg-theme-surface text-xs font-serif font-bold text-theme-heading hover:bg-theme-elevated transition-colors min-h-[44px]"
          >
            <FileCode className="h-4 w-4 text-amber-500" />
            <span>OPML Export</span>
          </button>
        </div>

        {/* Main Filters */}
        <div className="space-y-1">
          <button
            onClick={() => handleSelectFilter('all')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-serif font-semibold transition-colors min-h-[44px] ${
              activeFilter === 'all' && activeFolder === 'all'
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/30'
                : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <Inbox className="h-4 w-4 text-amber-500" />
              <span>All Articles</span>
            </div>
            <span className="font-mono text-xs text-theme-muted">{articles.length}</span>
          </button>

          <button
            onClick={() => handleSelectFilter('unread')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-serif font-semibold transition-colors min-h-[44px] ${
              activeFilter === 'unread'
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/30'
                : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Unread</span>
            </div>
            {unreadTotal > 0 && (
              <Badge variant="amber" className="text-xs font-mono">
                {unreadTotal}
              </Badge>
            )}
          </button>

          <button
            onClick={() => handleSelectFilter('bookmarks')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-serif font-semibold transition-colors min-h-[44px] ${
              activeFilter === 'bookmarks'
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/30'
                : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="h-4 w-4 text-amber-500" />
              <span>Saved Clippings</span>
            </div>
            <span className="font-mono text-xs text-theme-muted">
              {articles.filter((a) => a.isBookmarked).length}
            </span>
          </button>
        </div>

        {/* Folders & Feeds Tree */}
        <div className="space-y-3 pt-3 border-t border-theme-subtle">
          <p className="px-1 text-[10px] font-mono font-bold uppercase tracking-widest text-theme-muted">
            Subscriptions ({feeds.length})
          </p>

          <div className="space-y-1">
            {feeds.map((feed) => {
              const isFeedActive = activeFilter === feed.id;
              return (
                <button
                  key={feed.id}
                  onClick={() => handleSelectFilter(feed.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-serif transition-colors min-h-[44px] ${
                    isFeedActive
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold'
                      : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Rss className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{feed.title}</span>
                  </div>
                  <span className="text-[10px] text-theme-muted font-mono">
                    {feed.folder}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-theme-subtle space-y-2">
          <Button
            variant="amber"
            onClick={() => {
              onClose();
              onOpenAddFeed();
            }}
            className="w-full gap-2 min-h-[44px] font-serif font-bold text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Follow New Blog</span>
          </Button>

          <Button
            variant="outline"
            onClick={syncAllFeeds}
            isLoading={isSyncing}
            className="w-full gap-2 min-h-[44px] font-serif text-xs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh All Feeds</span>
          </Button>
        </div>
      </div>
    </Sheet>
  );
};

``

---

## File: `src\components\feed\UnifiedTimeline.tsx`

``tsx
import React, { useMemo, useState } from 'react';
import { useFeeds } from '../../context/FeedContext';
import { ArticleCard } from './ArticleCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Rss,
  CheckCheck,
  RefreshCw,
  Search,
  Bookmark,
  Inbox,
  Flame,
  LayoutGrid,
  List,
  Newspaper,
  Calendar,
} from 'lucide-react';

export const UnifiedTimeline: React.FC = () => {
  const {
    feeds,
    articles,
    activeFilter,
    activeFolder,
    searchQuery,
    isSyncing,
    syncProgress,
    setActiveFilter,
    markAllAsRead,
    syncAllFeeds,
  } = useFeeds();

  const [layoutMode, setLayoutMode] = useState<'broadsheet' | 'stream'>('broadsheet');

  // Filter articles according to active filter, folder, and search input
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesExcerpt = art.excerpt.toLowerCase().includes(q);
        const matchesFeed = art.feedTitle.toLowerCase().includes(q);
        if (!matchesTitle && !matchesExcerpt && !matchesFeed) return false;
      }

      // 2. Folder Filter
      if (activeFolder !== 'all') {
        const parentFeed = feeds.find((f) => f.id === art.feedId);
        if (parentFeed?.folder !== activeFolder) return false;
      }

      // 3. Tab Filter (all | unread | bookmarks | feedId)
      if (activeFilter === 'unread') return !art.isRead;
      if (activeFilter === 'bookmarks') return art.isBookmarked;
      if (activeFilter !== 'all') return art.feedId === activeFilter;

      return true;
    });
  }, [articles, feeds, activeFilter, activeFolder, searchQuery]);

  const activeFeedObj = feeds.find((f) => f.id === activeFilter);
  const unreadTotal = articles.filter((a) => !a.isRead).length;

  // Format today's date in classic newspaper format
  const todayDateString = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).toUpperCase();
  }, []);

  const [leadArticle, ...restArticles] = filteredArticles;

  return (
    <div className="space-y-6">
      {/* Newspaper Grand Masthead Banner */}
      <section className="pt-2 pb-4 text-center select-none border-b-2 border-theme-rule">
        {/* Top Dateline Bar */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono uppercase tracking-wider text-theme-muted pb-2 border-b border-theme-subtle gap-2">
          <span className="flex items-center gap-1.5 font-bold">
            <Calendar className="h-3 w-3 text-amber-500" />
            <span>{todayDateString}</span>
          </span>
          <span className="hidden sm:inline italic font-serif">
            “All the feeds fit to read, parsed with private offline fidelity”
          </span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            VOL. CLXXV … No. 59,820 • CITY EDITION
          </span>
        </div>

        {/* Masthead Title */}
        <div className="py-4 sm:py-6">
          <h1 className="font-masthead text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-theme-heading uppercase">
            The IncogniRead Dispatch
          </h1>
          <div className="flex items-center justify-center gap-3 pt-2 text-amber-500 text-xs">
            <span className="h-px w-12 bg-theme-border" />
            <span>❖</span>
            <span className="font-serif italic text-theme-muted tracking-wide text-xs sm:text-sm">
              International Reader of Record • Paragraph-Synced Speech Narration
            </span>
            <span>❖</span>
            <span className="h-px w-12 bg-theme-border" />
          </div>
        </div>

        {/* Newspaper Sub-Header / Section Bar */}
        <div className="pt-2 border-t border-theme-subtle flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <span className="font-editorial font-bold text-theme-heading text-sm">
              {activeFilter === 'all'
                ? activeFolder === 'all'
                  ? 'Main Broadsheet'
                  : `Department: ${activeFolder}`
                : activeFilter === 'unread'
                ? 'Unread Dispatches'
                : activeFilter === 'bookmarks'
                ? 'Archived Clippings'
                : activeFeedObj?.title || 'Feed Articles'}
            </span>
            <Badge variant="amber" className="font-mono text-[11px]">
              {filteredArticles.length} stories
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Broadsheet vs Stream Layout Toggle */}
            <div className="flex items-center p-0.5 rounded-xl border border-theme-border bg-theme-surface">
              <button
                onClick={() => setLayoutMode('broadsheet')}
                aria-label="Broadsheet layout"
                title="Broadsheet newspaper layout"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-serif transition-colors ${
                  layoutMode === 'broadsheet'
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold'
                    : 'text-theme-muted hover:text-theme-heading'
                }`}
              >
                <Newspaper className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Broadsheet</span>
              </button>

              <button
                onClick={() => setLayoutMode('stream')}
                aria-label="Stream layout"
                title="Compact stream layout"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-serif transition-colors ${
                  layoutMode === 'stream'
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold'
                    : 'text-theme-muted hover:text-theme-heading'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Stream</span>
              </button>
            </div>

            {/* Sync Feeds Button */}
            <Button
              variant="glass"
              size="sm"
              onClick={syncAllFeeds}
              isLoading={isSyncing}
              className="text-xs gap-1.5 min-h-[36px] font-serif"
              title="Refresh feeds via proxy"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-amber-500' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? `Syncing (${syncProgress.current}/${syncProgress.total})` : 'Sync Wire'}</span>
            </Button>

            {/* Mark All Read */}
            {unreadTotal > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs gap-1.5 text-theme-muted hover:text-theme-heading min-h-[36px] font-serif"
                title="Mark all current articles as read"
              >
                <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Mark All Read</span>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Quick Filter Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'All Dispatches', count: articles.length },
          { id: 'unread', label: 'Unread', count: unreadTotal },
          { id: 'bookmarks', label: 'Bookmarked', count: articles.filter((a) => a.isBookmarked).length },
        ].map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-serif font-semibold whitespace-nowrap transition-all min-h-[36px] ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-theme-surface hover:bg-theme-elevated text-theme-muted hover:text-theme-heading border border-theme-border'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-theme-elevated text-theme-muted'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feed Cards Grid / Stream */}
      {filteredArticles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-theme-border p-12 text-center space-y-3 bg-theme-surface/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-elevated text-amber-500 mx-auto">
            <Inbox className="h-6 w-6" />
          </div>
          <h4 className="text-base font-editorial font-bold text-theme-heading">
            No dispatches match your filter
          </h4>
          <p className="text-xs text-theme-muted max-w-sm mx-auto font-serif">
            {searchQuery
              ? `No articles found matching “${searchQuery}”. Try a different keyword.`
              : 'You have read all articles or haven’t added any subscriptions to this view.'}
          </p>
          {activeFilter !== 'all' && (
            <Button variant="outline" size="sm" onClick={() => setActiveFilter('all')} className="font-serif">
              Reset Filter to All
            </Button>
          )}
        </div>
      ) : layoutMode === 'broadsheet' && leadArticle ? (
        /* Broadsheet Editorial Newspaper Layout */
        <div className="space-y-5">
          {/* Featured Lead Story */}
          <ArticleCard article={leadArticle} featured={true} />

          {/* 2-Column Broadsheet Grid for the remaining articles */}
          {restArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {restArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Stream Newspaper Layout */
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
};

``

---

## File: `src\components\feed\ArticleCard.tsx`

``tsx
import React from 'react';
import { Article } from '../../types';
import { useFeeds } from '../../context/FeedContext';
import { useAudio } from '../../context/AudioContext';
import { timeAgo } from '../../lib/utils';
import {
  Headphones,
  Bookmark,
  Clock,
  CheckCircle2,
  ExternalLink,
  Plus,
} from 'lucide-react';

export interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, featured = false }) => {
  const { setReadingArticle, markAsRead, toggleBookmark } = useFeeds();
  const { currentArticle, playbackState, playArticle, togglePlayPause, addToQueue } = useAudio();

  const isCurrentAudio = currentArticle?.id === article.id;
  const isAudioPlaying = isCurrentAudio && playbackState === 'playing';

  const handleOpenReader = () => {
    setReadingArticle(article);
  };

  const handleToggleTTS = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentAudio) {
      togglePlayPause();
    } else {
      playArticle(article);
    }
  };

  const handleQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(article);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(article.id);
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(article.id);
  };

  return (
    <article
      onClick={handleOpenReader}
      className={`group relative rounded-2xl transition-all duration-200 p-5 sm:p-6 cursor-pointer flex flex-col justify-between space-y-4 select-none ${
        featured
          ? 'border-2 border-theme-border bg-theme-surface shadow-md hover:border-amber-500/60 hover:shadow-lg'
          : article.isRead
          ? 'border border-theme-border/70 bg-theme-surface/70 hover:bg-theme-surface hover:border-theme-border opacity-90 hover:opacity-100 shadow-xs'
          : 'border border-theme-border bg-theme-surface hover:border-amber-500/50 shadow-xs hover:shadow-md'
      }`}
    >
      {/* Top Meta Header: Newspaper Kicker & Timestamp */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {/* Unread Amber Indicator dot */}
          {!article.isRead ? (
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" title="Unread story" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-theme-muted/40 shrink-0" title="Read" />
          )}
          <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 truncate max-w-[150px] sm:max-w-[220px]">
            {article.feedTitle}
          </span>
          <span className="text-theme-muted">•</span>
          <span className="text-theme-muted shrink-0 flex items-center gap-1 font-serif text-[11px]">
            <Clock className="h-3 w-3" />
            {article.estimatedReadMinutes}m read
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-theme-muted font-serif text-xs italic">
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
      </div>

      {/* Main Title & Excerpt (Crystal Clear Newspaper Editorial Styling) */}
      <div className="space-y-2">
        <h3
          className={`font-editorial font-bold tracking-tight leading-snug transition-colors line-clamp-2 ${
            featured ? 'text-xl sm:text-2xl text-theme-heading' : 'text-base sm:text-lg text-theme-heading'
          } group-hover:text-amber-600 dark:group-hover:text-amber-400`}
        >
          {article.title}
        </h3>

        {article.excerpt && (
          <p
            className={`font-serif text-xs sm:text-sm text-theme-body leading-relaxed ${
              featured ? 'line-clamp-3 italic' : 'line-clamp-2'
            }`}
          >
            {article.excerpt}
          </p>
        )}

        {article.author && (
          <p className="text-[11px] text-theme-muted font-serif italic pt-0.5">
            By {article.author}
          </p>
        )}
      </div>

      {/* Bottom Action Toolbar */}
      <div className="flex items-center justify-between pt-3 border-t border-theme-subtle text-xs">
        {/* Listen to Article TTS Trigger */}
        <button
          onClick={handleToggleTTS}
          aria-label={isAudioPlaying ? 'Pause narration' : 'Listen to story aloud'}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-serif text-xs font-bold transition-all duration-150 min-h-[38px] ${
            isAudioPlaying
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
              : 'bg-theme-elevated hover:bg-amber-500/15 border border-theme-border text-theme-heading hover:border-amber-500/40'
          }`}
        >
          {isAudioPlaying ? (
            <>
              <div className="flex items-end justify-center gap-0.5 h-3.5 w-3.5">
                <span className="w-0.5 bg-current rounded-full animate-equalizer-1" />
                <span className="w-0.5 bg-current rounded-full animate-equalizer-2" />
                <span className="w-0.5 bg-current rounded-full animate-equalizer-3" />
              </div>
              <span>Playing Audio</span>
            </>
          ) : (
            <>
              <Headphones className="h-3.5 w-3.5 text-amber-500" />
              <span>Listen ({article.estimatedReadMinutes}m)</span>
            </>
          )}
        </button>

        {/* Action icons with clear hit-targets */}
        <div className="flex items-center gap-1 text-theme-muted">
          <button
            onClick={handleQueue}
            title="Add to Audio Play Later Queue"
            className="p-2 rounded-xl hover:bg-theme-elevated hover:text-theme-heading transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>

          <button
            onClick={handleBookmark}
            title={article.isBookmarked ? 'Remove Bookmark' : 'Bookmark story'}
            className={`p-2 rounded-xl transition-colors ${
              article.isBookmarked
                ? 'text-amber-500 bg-amber-500/10'
                : 'hover:bg-theme-elevated hover:text-theme-heading'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${article.isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {!article.isRead && (
            <button
              onClick={handleMarkRead}
              title="Mark as Read"
              className="p-2 rounded-xl hover:bg-theme-elevated hover:text-emerald-500 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}

          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open original publication"
            className="p-2 rounded-xl hover:bg-theme-elevated hover:text-theme-heading transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
};

``

---

## File: `src\components\feed\ReaderView.tsx`

``tsx
import React, { useState, useEffect, useRef } from 'react';
import { useFeeds } from '../../context/FeedContext';
import { useAudio } from '../../context/AudioContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { timeAgo, formatDuration } from '../../lib/utils';
import {
  X,
  Play,
  Pause,
  Bookmark,
  ExternalLink,
  Clock,
  User,
  ShieldCheck,
  Headphones,
  Volume2,
  VolumeX,
  Gauge,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlignLeft,
  Type,
  BookOpen,
} from 'lucide-react';

export const ReaderView: React.FC = () => {
  const { readingArticle, setReadingArticle, toggleBookmark, markAsRead } = useFeeds();
  const {
    currentArticle,
    playbackState,
    activeParagraphIndex,
    playbackRate,
    volume,
    isMuted,
    playArticle,
    togglePlayPause,
    seekToParagraph,
    nextParagraph,
    previousParagraph,
    setPlaybackRate,
    toggleMute,
    addToQueue,
  } = useAudio();

  const { theme } = useTheme();

  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [fontFamily, setFontFamily] = useState<'editorial' | 'serif' | 'sans' | 'mono'>('editorial');
  const [columnWidth, setColumnWidth] = useState<'normal' | 'wide' | 'narrow'>('normal');
  const [isSpeedOpen, setIsSpeedOpen] = useState(false);
  const activeParagraphRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (readingArticle) {
      markAsRead(readingArticle.id);
    }
  }, [readingArticle]);

  // Auto-scroll to active paragraph during narration
  useEffect(() => {
    if (
      currentArticle?.id === readingArticle?.id &&
      playbackState === 'playing' &&
      activeParagraphRef.current
    ) {
      activeParagraphRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeParagraphIndex, currentArticle?.id, readingArticle?.id, playbackState]);

  // Close reader on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && readingArticle) {
        setReadingArticle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readingArticle, setReadingArticle]);

  if (!readingArticle) return null;

  const isCurrentAudio = currentArticle?.id === readingArticle.id;
  const isAudioPlaying = isCurrentAudio && playbackState === 'playing';

  const fontClasses = {
    sm: 'text-sm sm:text-base leading-relaxed',
    base: 'text-base sm:text-lg leading-relaxed sm:leading-loose',
    lg: 'text-lg sm:text-xl leading-relaxed sm:leading-loose',
    xl: 'text-xl sm:text-2xl leading-relaxed sm:leading-loose',
  };

  const familyClasses = {
    editorial: 'font-serif font-normal',
    serif: 'font-serif font-normal',
    sans: 'font-sans font-normal',
    mono: 'font-mono text-sm leading-relaxed',
  };

  const columnClasses = {
    narrow: 'max-w-2xl',
    normal: 'max-w-3xl',
    wide: 'max-w-4xl',
  };

  const speedRates = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-theme-base flex flex-col justify-between animate-fade-in transition-colors duration-200">
      {/* Sticky Top Reader Action Bar */}
      <header className="sticky top-0 z-30 w-full border-b border-theme-border bg-theme-surface-solid/90 backdrop-blur-xl px-4 sm:px-8 py-3 flex items-center justify-between gap-2 shadow-xs transition-colors">
        {/* Left: Close & Feed Kicker */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setReadingArticle(null)}
            aria-label="Close reader view"
            title="Close reader (Esc)"
            className="flex items-center gap-1.5 text-xs font-semibold text-theme-muted hover:text-theme-heading px-3 py-1.5 rounded-xl hover:bg-theme-elevated border border-theme-border transition-colors min-h-[40px] shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Close</span>
          </button>

          <Badge variant="amber" className="gap-1 py-1 font-mono text-[11px] truncate max-w-[140px] sm:max-w-xs">
            <span>{readingArticle.feedTitle}</span>
          </Badge>

          <Badge variant="emerald" className="gap-1 py-1 text-[11px] hidden md:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>DOMPurify Safe</span>
          </Badge>
        </div>

        {/* Center/Right: Audio Bar & Typography & Theme Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* TTS Listen / Pause Primary Button */}
          <Button
            variant={isAudioPlaying ? 'emerald' : 'amber'}
            size="sm"
            onClick={() => {
              if (isCurrentAudio) {
                togglePlayPause();
              } else {
                playArticle(readingArticle);
              }
            }}
            className="gap-2 shadow-md min-h-[40px] text-xs font-semibold px-3"
            title="Listen to this article with speech narration"
          >
            {isAudioPlaying ? (
              <>
                <div className="flex items-end justify-center gap-0.5 h-4 w-4">
                  <span className="w-0.5 bg-current rounded-full animate-equalizer-1" />
                  <span className="w-0.5 bg-current rounded-full animate-equalizer-2" />
                  <span className="w-0.5 bg-current rounded-full animate-equalizer-3" />
                </div>
                <span>Pause</span>
              </>
            ) : (
              <>
                <Headphones className="h-4 w-4" />
                <span className="hidden sm:inline">Listen Aloud</span>
              </>
            )}
          </Button>

          {/* Speed Selector in Reader Bar (when current audio is active) */}
          {isCurrentAudio && (
            <div className="relative">
              <button
                onClick={() => setIsSpeedOpen(!isSpeedOpen)}
                className="px-2 py-1 text-xs font-mono font-bold rounded-xl border border-theme-border bg-theme-surface hover:bg-theme-elevated text-theme-heading transition-colors min-h-[40px] flex items-center gap-1"
                title="Narration speed"
              >
                <Gauge className="h-3.5 w-3.5 text-amber-500" />
                <span>{playbackRate}×</span>
              </button>

              {isSpeedOpen && (
                <div className="absolute top-12 right-0 p-2 rounded-2xl bg-theme-surface-solid border border-theme-border shadow-2xl flex flex-col gap-1 z-50 min-w-[120px] animate-slide-up">
                  {speedRates.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setPlaybackRate(r);
                        setIsSpeedOpen(false);
                      }}
                      className={`px-3 py-1.5 text-xs rounded-xl font-mono text-left transition-colors ${
                        playbackRate === r
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-theme-body hover:bg-theme-elevated hover:text-theme-heading'
                      }`}
                    >
                      {r}× {r === 1.0 ? '(Normal)' : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mute Button in Reader Bar (when current audio is active) */}
          {isCurrentAudio && (
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute narration (M)' : 'Mute narration (M)'}
              className={`p-2 rounded-xl border border-theme-border transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
                isMuted
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                  : 'bg-theme-surface hover:bg-theme-elevated text-theme-heading'
              }`}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          )}

          {/* Add to Queue */}
          <button
            onClick={() => addToQueue(readingArticle)}
            title="Add to Audio Queue"
            className="p-2 text-theme-muted hover:text-theme-heading rounded-xl hover:bg-theme-elevated border border-theme-border transition-colors min-h-[40px] min-w-[40px] hidden sm:flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={() => toggleBookmark(readingArticle.id)}
            aria-label="Bookmark article"
            title={readingArticle.isBookmarked ? 'Remove Bookmark' : 'Bookmark this article'}
            className={`p-2 rounded-xl border border-theme-border transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
              readingArticle.isBookmarked
                ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
                : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${readingArticle.isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Font Type Switcher (Editorial Serif / Modern Sans / Mono) */}
          <button
            onClick={() => {
              const types: Array<'editorial' | 'sans' | 'mono'> = ['editorial', 'sans', 'mono'];
              const next = types[(types.indexOf(fontFamily as any) + 1) % types.length];
              setFontFamily(next);
            }}
            title={`Font: ${fontFamily} — Click to switch`}
            className="p-2 text-theme-muted hover:text-theme-heading rounded-xl hover:bg-theme-elevated border border-theme-border transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center font-editorial font-bold text-sm"
          >
            Aa
          </button>

          {/* Font Size Adjuster Cycle */}
          <button
            onClick={() => {
              const sizes: Array<'sm' | 'base' | 'lg' | 'xl'> = ['sm', 'base', 'lg', 'xl'];
              const next = sizes[(sizes.indexOf(fontSize) + 1) % sizes.length];
              setFontSize(next);
            }}
            title={`Font size: ${fontSize.toUpperCase()} — Click to cycle`}
            className="p-2 text-theme-muted hover:text-theme-heading rounded-xl hover:bg-theme-elevated border border-theme-border transition-colors min-h-[40px] min-w-[40px] hidden md:flex items-center justify-center font-mono text-xs font-semibold"
          >
            {fontSize === 'sm' ? 'A-' : fontSize === 'xl' ? 'A++' : fontSize === 'lg' ? 'A+' : 'A'}
          </button>

          {/* Theme Toggle Button */}
          <ThemeToggle variant="dropdown" />

          {/* Outbound Link to Publisher */}
          <a
            href={readingArticle.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View original article on publisher site"
            title="Read on original publisher website"
            className="p-2 text-theme-muted hover:text-theme-heading rounded-xl hover:bg-theme-elevated border border-theme-border transition-colors min-h-[40px] min-w-[40px] hidden sm:flex items-center justify-center"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Reader Main Content Container (Classic Newspaper Editorial Format) */}
      <main className={`flex-1 mx-auto w-full px-5 sm:px-10 py-8 sm:py-14 transition-all duration-200 ${columnClasses[columnWidth]}`}>
        {/* Newspaper Editorial Header Masthead Deck */}
        <div className="space-y-4 pb-8 border-b-2 border-theme-rule/80">
          {/* Section Kicker */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 text-[11px]">
                {readingArticle.feedTitle}
              </span>
              <span className="text-theme-muted">•</span>
              <span className="text-theme-muted flex items-center gap-1 font-serif">
                <Clock className="h-3.5 w-3.5" />
                {readingArticle.estimatedReadMinutes} min read ({timeAgo(readingArticle.publishedAt)})
              </span>
            </div>

            {readingArticle.author && (
              <span className="text-theme-muted flex items-center gap-1 font-serif italic text-xs">
                <User className="h-3.5 w-3.5 text-amber-500" />
                By {readingArticle.author}
              </span>
            )}
          </div>

          {/* Grand Newspaper Headline in Playfair Display / Editorial Serif */}
          <h1 className="text-3xl sm:text-5xl font-editorial font-bold text-theme-heading tracking-tight leading-[1.15]">
            {readingArticle.title}
          </h1>

          {/* Editorial Sub-deck / Excerpt in Italic Serif */}
          {readingArticle.excerpt && (
            <p className="text-base sm:text-xl font-serif italic text-theme-muted leading-relaxed pt-1 border-t border-theme-subtle">
              {readingArticle.excerpt}
            </p>
          )}

          {/* Active Audio Narration Banner */}
          {isCurrentAudio && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="font-serif font-semibold">
                  IncogniRead Audio Narration Active — Click any paragraph to jump speech instantly
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono opacity-90 hidden sm:inline">
                  Paragraph {activeParagraphIndex + 1} of {readingArticle.paragraphs.length}
                </span>
                <button
                  onClick={previousParagraph}
                  className="p-1 rounded hover:bg-amber-500/20"
                  title="Previous paragraph"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={nextParagraph}
                  className="p-1 rounded hover:bg-amber-500/20"
                  title="Next paragraph"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Newspaper Editorial Article Body */}
        <article
          className={`pt-8 space-y-6 ${fontClasses[fontSize]} ${familyClasses[fontFamily]} text-theme-body`}
        >
          {readingArticle.paragraphs.length > 0 ? (
            readingArticle.paragraphs.map((para, index) => {
              const isActive = isCurrentAudio && activeParagraphIndex === index;
              const isFirst = index === 0;

              return (
                <p
                  key={index}
                  ref={isActive ? activeParagraphRef : null}
                  onClick={() => {
                    if (isCurrentAudio) {
                      seekToParagraph(index);
                    } else {
                      playArticle(readingArticle, index);
                    }
                  }}
                  className={`p-3.5 rounded-2xl transition-all duration-300 cursor-pointer ${
                    isFirst ? 'newspaper-drop-cap' : ''
                  } ${
                    isActive
                      ? 'bg-amber-500/15 border-l-4 border-amber-500 text-theme-heading shadow-md shadow-amber-500/10 scale-[1.01]'
                      : 'hover:bg-theme-elevated/50 border-l-4 border-transparent'
                  }`}
                  title="Click to jump audio narration here"
                >
                  {para}
                </p>
              );
            })
          ) : (
            // Raw Clean HTML Fallback
            <div
              className="prose prose-invert max-w-none text-theme-body"
              dangerouslySetInnerHTML={{ __html: readingArticle.contentClean }}
            />
          )}
        </article>

        {/* End of article newspaper colophon / footer */}
        <div className="mt-16 pt-8 border-t-2 border-theme-rule text-center space-y-4">
          <div className="flex items-center justify-center gap-3 text-amber-500 text-sm">
            <span>❖</span>
            <span>✦</span>
            <span>❖</span>
          </div>
          <p className="text-xs text-theme-muted font-serif italic">
            Printed from the IncogniRead Gazette • Cached offline in client IndexedDB • DOMPurify Protected
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" onClick={() => setReadingArticle(null)} className="font-serif">
              Return to Timeline
            </Button>
            <a
              href={readingArticle.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-theme-border bg-theme-surface hover:bg-theme-elevated text-xs font-serif font-semibold text-theme-heading transition-colors"
            >
              <span>Visit Original Publication</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

``

---

## File: `src\components\feed\SplineHero.tsx`

``tsx
import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { InvestigativeNewspaperLens } from './InvestigativeNewspaperLens';
import { Headphones, Rss, ShieldCheck, Sparkles, Layers, Search } from 'lucide-react';

export interface SplineHeroProps {
  onOpenAddFeed: () => void;
  onExploreDiscovery: () => void;
}

export const SplineHero: React.FC<SplineHeroProps> = ({ onOpenAddFeed, onExploreDiscovery }) => {
  return (
    <section className="relative w-full rounded-3xl border-2 border-theme-border bg-gradient-to-br from-theme-surface via-theme-surface to-theme-elevated/80 backdrop-blur-2xl overflow-hidden shadow-xl mb-8 transition-colors duration-200">
      {/* Decorative ambient radial gradients */}
      <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 items-center relative z-10 min-h-[360px]">
        {/* Left Column: Hero Copy */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="amber" className="gap-1.5 py-1 px-3 font-serif font-bold">
              <Rss className="h-3.5 w-3.5" />
              <span>Offline-First RSS Gazette</span>
            </Badge>
            <Badge variant="emerald" className="gap-1.5 py-1 px-3 font-serif font-bold">
              <Headphones className="h-3.5 w-3.5" />
              <span>Synced Paragraph Narration</span>
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-black text-theme-heading tracking-tight leading-tight">
              Read and Listen to the Web with{' '}
              <span className="text-amber-500 underline decoration-amber-500/30 underline-offset-4">
                Absolute Privacy
              </span>
            </h1>
            <p className="font-serif text-xs sm:text-sm text-theme-body leading-relaxed max-w-xl">
              Zero cloud tracking. Feeds are parsed in-browser, stored in <strong>IndexedDB</strong>, 
              sanitized with <strong>DOMPurify</strong>, and narrated aloud with interactive paragraph-synchronized speech.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              variant="amber"
              size="md"
              onClick={onOpenAddFeed}
              className="gap-2 shadow-amber-500/20 shadow-md font-serif font-bold text-xs"
            >
              <Rss className="h-4 w-4" />
              <span>Subscribe to Feed</span>
            </Button>

            <Button
              variant="glass"
              size="md"
              onClick={onExploreDiscovery}
              className="gap-2 font-serif text-xs font-bold"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Explore Co-Feeds</span>
            </Button>
          </div>

          {/* Tech Badges */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-theme-subtle text-xs">
            <div>
              <div className="font-bold text-theme-heading font-mono flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>SSRF-Safe</span>
              </div>
              <p className="text-[11px] text-theme-muted font-serif">Relayed via Proxy</p>
            </div>
            <div>
              <div className="font-bold text-theme-heading font-mono flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-amber-500" />
                <span>IndexedDB</span>
              </div>
              <p className="text-[11px] text-theme-muted font-serif">Local cache</p>
            </div>
            <div>
              <div className="font-bold text-theme-heading font-mono flex items-center gap-1">
                <Headphones className="h-3.5 w-3.5 text-emerald-500" />
                <span>Web Speech</span>
              </div>
              <p className="text-[11px] text-theme-muted font-serif">Zero-latency TTS</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Investigative Newspaper & Moving Magnifying Glass */}
        <div className="lg:col-span-5 h-full min-h-[300px] relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <InvestigativeNewspaperLens />
        </div>
      </div>
    </section>
  );
};

``

---

## File: `src\components\feed\InvestigativeNewspaperLens.tsx`

``tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Shield, Eye } from 'lucide-react';

export const InvestigativeNewspaperLens: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lensPos, setLensPos] = useState({ x: 190, y: 140 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const targetPosRef = useRef({ x: 190, y: 140 });
  const currentPosRef = useRef({ x: 190, y: 140 });
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Smooth animation loop for autonomous scanning + smooth mouse tracking
  useEffect(() => {
    const loop = () => {
      timeRef.current += 0.018;
      const t = timeRef.current;

      if (!isHovered && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width || 380;
        const height = rect.height || 280;

        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Smooth investigative scanning path across headlines and columns
        const autoX = centerX + Math.sin(t * 0.8) * (width * 0.32) + Math.cos(t * 1.6) * 20;
        const autoY = centerY + Math.sin(t * 1.4) * (height * 0.28) + Math.sin(t * 0.6) * 15;

        targetPosRef.current = { x: autoX, y: autoY };
        setTilt({
          x: Math.sin(t * 0.7) * 2.5,
          y: Math.cos(t * 0.7) * -3,
        });
      }

      // Smooth linear interpolation (lerp)
      const factor = isHovered ? 0.22 : 0.06;
      currentPosRef.current.x += (targetPosRef.current.x - currentPosRef.current.x) * factor;
      currentPosRef.current.y += (targetPosRef.current.y - currentPosRef.current.y) * factor;

      setLensPos({
        x: Math.round(currentPosRef.current.x * 10) / 10,
        y: Math.round(currentPosRef.current.y * 10) / 10,
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(20, Math.min(rect.width - 20, e.clientX - rect.left));
    const y = Math.max(20, Math.min(rect.height - 20, e.clientY - rect.top));

    targetPosRef.current = { x, y };

    // Gentle 3D perspective tilt towards cursor
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * -5;
    const tiltY = ((x - centerX) / centerX) * 6;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Mask style: Only reveal the circular region directly underneath the magnifying lens
  const lensRadius = 60; // 120px diameter lens view
  const revealMaskStyle = {
    WebkitMaskImage: `radial-gradient(circle at ${lensPos.x}px ${lensPos.y}px, black 0px, black ${lensRadius - 2}px, rgba(0,0,0,0.4) ${lensRadius}px, transparent ${lensRadius + 4}px)`,
    maskImage: `radial-gradient(circle at ${lensPos.x}px ${lensPos.y}px, black 0px, black ${lensRadius - 2}px, rgba(0,0,0,0.4) ${lensRadius}px, transparent ${lensRadius + 4}px)`,
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
      }}
      className="relative w-full max-w-[420px] aspect-[1.25/1] sm:aspect-[1.3/1] min-h-[290px] select-none cursor-crosshair overflow-hidden rounded-2xl border-2 border-theme-border/80 shadow-2xl bg-slate-950 transition-all duration-300"
    >
      {/* 3D Tilted Newspaper Stage */}
      <div
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.6s ease-out',
        }}
        className="relative w-full h-full p-4 sm:p-5 flex flex-col justify-between"
      >
        {/* ======================================================== */}
        {/* 1. INVISIBLE / REDACTED / CLASSIFIED BASE LAYER          */}
        {/* When magnifying glass is not over it, text is invisible! */}
        {/* ======================================================== */}
        <div className="absolute inset-0 p-4 sm:p-5 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900 flex flex-col justify-between opacity-80 pointer-events-none">
          {/* Faint watermark lines & redacted censor blocks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[8px] font-mono tracking-widest text-slate-700 uppercase pb-1 border-b border-slate-800/80">
              <span>CONFIDENTIAL ARCHIVE</span>
              <span>CLASSIFIED DISPATCH</span>
            </div>

            {/* Faint placeholder newspaper masthead */}
            <div className="h-6 w-3/4 mx-auto rounded bg-slate-800/40 my-1" />
            <div className="h-0.5 w-full bg-slate-800/50" />

            {/* Redacted Headline */}
            <div className="space-y-1.5 pt-2">
              <div className="h-4 w-5/6 rounded bg-slate-800/60" />
              <div className="h-4 w-3/5 rounded bg-slate-800/40" />
            </div>

            {/* Redacted Column Lines */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="space-y-2">
                <div className="h-2 w-full rounded bg-slate-800/30" />
                <div className="h-2 w-11/12 rounded bg-slate-800/30" />
                <div className="h-2 w-4/5 rounded bg-slate-800/30" />
                <div className="h-2 w-full rounded bg-slate-800/30" />
                <div className="h-2 w-3/4 rounded bg-slate-800/30" />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full rounded bg-slate-800/30" />
                <div className="h-2 w-5/6 rounded bg-slate-800/30" />
                <div className="h-2 w-full rounded bg-slate-800/30" />
                <div className="h-2 w-2/3 rounded bg-slate-800/30" />
                <div className="h-2 w-4/5 rounded bg-slate-800/30" />
              </div>
            </div>
          </div>

          {/* Classified watermark stamp */}
          <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-slate-700/60 pt-2 border-t border-slate-800/80">
            <span>HOVER TO MAGNIFY</span>
            <span>DOMPURIFY SHIELDED</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. REVEALED PRINTED NEWSPAPER (MASKED BY LENS RADIUS)   */}
        {/* Only visible where the magnifying glass is positioned!   */}
        {/* ======================================================== */}
        <div
          style={revealMaskStyle}
          className="absolute inset-0 p-4 sm:p-5 bg-[#faf6ee] text-[#111827] flex flex-col justify-between shadow-inner pointer-events-none transition-all duration-75"
        >
          {/* Authentic Newspaper Content */}
          <div className="space-y-2">
            {/* Top Newspaper Date & Issue Bar */}
            <div className="flex items-center justify-between text-[8px] font-mono tracking-widest font-bold uppercase text-amber-800 pb-1 border-b border-[#cfc3ab]">
              <span>OCTOBER 30, 2026 • LATE CITY DISPATCH</span>
              <span>NO. 42 • ZERO TELEMETRY</span>
            </div>

            {/* Grand Masthead */}
            <div className="text-center py-0.5">
              <h2 className="font-masthead text-lg sm:text-xl font-black tracking-tight text-[#0f172a] uppercase leading-none">
                The IncogniRead Gazette
              </h2>
              <div className="text-[7px] font-serif italic text-amber-900 tracking-wider pt-0.5">
                “All the News Fit to Stream — Client-Side Parsed With Speech Narration”
              </div>
            </div>

            <div className="border-t-2 border-b border-[#0f172a] my-1" />

            {/* Lead Story Headline */}
            <div className="space-y-1">
              <span className="text-[8px] font-mono font-bold tracking-widest uppercase bg-amber-500/20 px-1 py-0.2 rounded text-amber-900 inline-block">
                SPECIAL REPORT
              </span>
              <h3 className="font-editorial text-sm sm:text-base font-black text-[#0f172a] leading-tight">
                SECRET ALGORITHMS UNMASKED BY CLIENT-SIDE RSS READER
              </h3>
              <p className="font-serif italic text-[9px] text-[#475569] leading-tight">
                Decentralized in-browser engine bypasses cloud profiling and third-party tracking.
              </p>
            </div>

            {/* Two-Column Broadsheet Copy */}
            <div className="grid grid-cols-2 gap-3 pt-1 text-[8px] font-serif text-[#1e293b] leading-relaxed">
              <div className="space-y-1 border-r border-[#ded6c5] pr-2">
                <p>
                  <span className="font-editorial font-bold text-base float-left mr-1 leading-none text-amber-700">
                    I
                  </span>
                  ncogniRead introduces zero-latency client-side parsing stored directly in IndexedDB.
                  Every incoming stream is sanitized via strict DOMPurify filters.
                </p>
                <p>
                  SSRF vectors are actively blocked at the edge proxy, safeguarding local network interfaces.
                </p>
              </div>

              <div className="space-y-1">
                <p>
                  Paragraph-synchronized Web Speech narration brings the written word to life aloud.
                  Offline listeners retain complete autonomy over reading habits.
                </p>
                <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-[7px] font-mono font-bold text-amber-900">
                  CONFIDENTIAL • VERIFIED PRIVATE
                </div>
              </div>
            </div>
          </div>

          {/* Newspaper Footer */}
          <div className="flex items-center justify-between text-[8px] font-mono font-bold text-amber-900 pt-1 border-t border-[#cfc3ab]">
            <span>INC-2026-DISPATCH</span>
            <span>AUTHENTICATED CLIENT-SIDE</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. PHYSICAL MAGNIFYING GLASS ON TOP OF THE REVEAL        */}
        {/* ======================================================== */}
        <div
          style={{
            transform: `translate3d(${lensPos.x}px, ${lensPos.y}px, 0)`,
            transition: 'transform 0.05s linear',
          }}
          className="absolute top-0 left-0 pointer-events-none z-30"
        >
          {/* Glass Lens Circle Container (-ml-[60px] -mt-[60px] to center at pos) */}
          <div className="relative -ml-[60px] -mt-[60px] w-[120px] h-[120px]">
            {/* Outer Brass/Gold Metallic Rim */}
            <div
              className={`w-full h-full rounded-full border-[5px] border-amber-400 bg-amber-400/5 shadow-2xl transition-all duration-200 ${
                isHovered
                  ? 'border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.5),inset_0_0_20px_rgba(245,158,11,0.25)] scale-105'
                  : 'shadow-[0_10px_25px_rgba(0,0,0,0.6),inset_0_0_15px_rgba(245,158,11,0.15)]'
              }`}
            >
              {/* Metallic Bezel Inner Highlight */}
              <div className="w-full h-full rounded-full border border-amber-200/60" />
            </div>

            {/* Glass Curvature & Specular Glare Reflection */}
            <div className="absolute inset-1 rounded-full overflow-hidden pointer-events-none">
              {/* Crescent Glare Arc */}
              <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-gradient-to-br from-white/45 via-white/10 to-transparent transform -rotate-25 opacity-70" />
              {/* Bottom Subtle Reflection */}
              <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-tl from-amber-300/30 to-transparent opacity-50" />
            </div>

            {/* Center Optical Reticle / Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <span className="w-2.5 h-[1px] bg-amber-600" />
              <span className="w-[1px] h-2.5 bg-amber-600 -ml-[1px]" />
            </div>

            {/* Realistic Magnifying Glass Handle */}
            {/* Extends diagonally towards bottom-right at ~42deg angle */}
            <div className="absolute bottom-1 right-1 w-4 h-20 origin-top-left transform rotate-[-45deg] translate-x-3 translate-y-3 pointer-events-none">
              {/* Cast Shadow beneath handle */}
              <div className="absolute inset-0 bg-black/40 blur-sm transform translate-x-2 translate-y-2 rounded-full" />
              
              {/* Brass Ferrule Connector */}
              <div className="w-3.5 h-4 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-500 rounded-t-sm shadow-md" />
              
              {/* Walnut Wood / Polished Brass Handle Shaft */}
              <div className="w-3.5 h-16 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-900 rounded-b-xl shadow-lg border-x border-amber-500/40 relative">
                {/* Metallic Gold Ring Accent */}
                <div className="absolute top-6 inset-x-0 h-1 bg-amber-400 shadow-xs" />
                <div className="absolute bottom-2 inset-x-0 h-1 bg-amber-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Hover Pill in Corner */}
        <div className="absolute bottom-3 right-3 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 border border-amber-500/40 text-[10px] font-mono text-slate-200 shadow-xl backdrop-blur-md">
          <Search className="h-3 w-3 text-amber-400 animate-pulse" />
          <span>{isHovered ? 'Magnifier Focused' : 'Investigative Lens'}</span>
        </div>
      </div>
    </div>
  );
};

``

---

## File: `src\components\feed\AddFeedModal.tsx`

``tsx
import React, { useState } from 'react';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useFeeds } from '../../context/FeedContext';
import { Plus, Rss, Folder, AlertCircle, Sparkles } from 'lucide-react';

export interface AddFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_FEEDS = [
  { url: 'https://overreacted.io/rss.xml', title: 'Overreacted (Dan Abramov)', folder: 'Engineering & AI' },
  { url: 'https://simonwillison.net/atom/entries/', title: 'Simon Willison’s Weblog', folder: 'Engineering & AI' },
  { url: 'https://news.ycombinator.com/rss', title: 'Hacker News Frontpage', folder: 'Tech Journalism' },
  { url: 'https://www.theverge.com/rss/index.xml', title: 'The Verge', folder: 'Tech Journalism' },
  { url: 'https://hacks.mozilla.org/feed/', title: 'Mozilla Hacks', folder: 'Web Development' },
];

export const AddFeedModal: React.FC<AddFeedModalProps> = ({ isOpen, onClose }) => {
  const { addNewFeed, folders } = useFeeds();
  const [url, setUrl] = useState('');
  const [folder, setFolder] = useState('Engineering & AI');
  const [customFolder, setCustomFolder] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    const targetFolder = customFolder.trim() || folder || 'General';

    try {
      await addNewFeed(url.trim(), targetFolder);
      setUrl('');
      setCustomFolder('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to discover or parse feed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (presetUrl: string, presetFolder: string) => {
    setUrl(presetUrl);
    setFolder(presetFolder);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Rss className="h-5 w-5 text-amber-500" />
          <span className="font-editorial">Subscribe to New Feed</span>
        </div>
      }
      description="Enter a website URL or direct RSS/Atom XML link. IncogniRead will autodiscover the feed and parse it safely."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs leading-relaxed break-words">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-serif font-bold text-theme-heading mb-1.5">
            Website or Feed URL
          </label>
          <Input
            type="text"
            placeholder="e.g. overreacted.io or https://example.com/feed"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            icon={<Rss className="h-4 w-4" />}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-serif font-bold text-theme-heading mb-1.5">
              Select Department / Folder
            </label>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="w-full h-11 min-h-[44px] rounded-xl border border-theme-border bg-theme-surface text-sm text-theme-heading px-3 focus:outline-none focus:border-amber-500 font-serif"
            >
              {folders.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
              <option value="New Folder">+ Create New Folder...</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-serif font-bold text-theme-heading mb-1.5">
              Custom Folder Name (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Machine Learning"
              value={customFolder}
              onChange={(e) => setCustomFolder(e.target.value)}
              icon={<Folder className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2 pt-2 border-t border-theme-subtle">
          <span className="text-[11px] font-bold uppercase tracking-wider text-theme-muted flex items-center gap-1 font-mono">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Curated Press Subscriptions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_FEEDS.map((preset) => (
              <button
                type="button"
                key={preset.url}
                onClick={() => handleSelectPreset(preset.url, preset.folder)}
                className="px-2.5 py-1 text-xs rounded-xl bg-theme-surface border border-theme-border text-theme-heading hover:border-amber-500/50 transition-colors font-serif"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} className="font-serif">
            Cancel
          </Button>
          <Button type="submit" variant="amber" isLoading={isLoading} className="gap-2 font-serif font-bold">
            <Plus className="h-4 w-4" />
            <span>Discover & Subscribe</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

``

---

## File: `src\components\discovery\AnonymousDiscovery.tsx`

``tsx
import React, { useState, useEffect } from 'react';
import { useFeeds } from '../../context/FeedContext';
import { DiscoveryRecommendation } from '../../types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Compass,
  Sparkles,
  Users,
  Plus,
  Check,
  Shield,
  Send,
  Layers,
  ExternalLink,
  Share2,
  Lock,
  AlertTriangle,
  Info,
  Network,
} from 'lucide-react';

interface GraphNode {
  id: string;
  title: string;
  category: string;
  popularity: number;
  isSubscribed: boolean;
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export const AnonymousDiscovery: React.FC = () => {
  const { feeds, addNewFeed } = useFeeds();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'graph' | 'security'>('recommendations');
  const [recommendations, setRecommendations] = useState<DiscoveryRecommendation[]>([]);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [trapReport, setTrapReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [addedUrls, setAddedUrls] = useState<Set<string>>(new Set());
  const [telemetryStatus, setTelemetryStatus] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    async function loadRecommendations() {
      setIsLoading(true);
      try {
        const userFeedUrls = feeds.map((f) => f.feedUrl).join(',');
        const res = await fetch(`/api/discovery?userFeeds=${encodeURIComponent(userFeedUrls)}`);
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.recommendations || []);
          if (data.graph) {
            setGraphNodes(data.graph.nodes || []);
            setGraphEdges(data.graph.edges || []);
          }
          if (data.trapReport) {
            setTrapReport(data.trapReport);
          }
        }
      } catch (err) {
        console.warn('[AnonymousDiscovery] Failed to fetch recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecommendations();
  }, [feeds.length]);

  const handleSubscribe = async (rec: { feedUrl: string; category?: string; title?: string }) => {
    try {
      await addNewFeed(rec.feedUrl, rec.category || 'Discovered');
      setAddedUrls((prev) => new Set([...prev, rec.feedUrl]));
    } catch (err) {
      alert(`Could not subscribe to feed: ${err}`);
    }
  };

  const handleContributeTelemetry = async () => {
    if (feeds.length === 0) {
      alert('You have no feeds to contribute yet.');
      return;
    }

    try {
      setTelemetryStatus('submitting');
      const res = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeds: feeds.map((f) => f.feedUrl),
        }),
      });

      if (res.ok) {
        setTelemetryStatus('success');
        setTimeout(() => setTelemetryStatus(null), 4000);
      } else {
        const errJson = await res.json();
        alert(errJson.error || 'Failed to submit telemetry');
        setTelemetryStatus(null);
      }
    } catch {
      setTelemetryStatus(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-Tabs for Discovery Feature */}
      <div className="flex border-b border-theme-border pb-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-colors whitespace-nowrap ${
            activeTab === 'recommendations'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated'
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Recommendations ({recommendations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-colors whitespace-nowrap ${
            activeTab === 'graph'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated'
          }`}
        >
          <Network className="h-3.5 w-3.5" />
          <span>"Blogs Like This" Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-colors whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Threat Model & Trap Report</span>
        </button>
      </div>

      {/* 1. RECOMMENDATIONS TAB */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {/* Privacy Guarantee Header Card */}
          <Card glow="amber" className="p-3.5 bg-gradient-to-br from-theme-surface via-theme-surface to-theme-elevated/70 border-theme-border">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-editorial font-bold text-theme-heading">
                    Anonymous Co-Subscription Engine
                  </h4>
                  <Badge variant="amber" className="text-[10px] py-0 px-1.5 font-mono">
                    Zero Accounts
                  </Badge>
                </div>
                <p className="text-xs text-theme-muted font-serif leading-relaxed">
                  Recommendations are derived from overlap patterns between anonymous readers. No user accounts, cookies, or read-tracking exist on this server.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleContributeTelemetry}
                disabled={telemetryStatus === 'submitting' || telemetryStatus === 'success'}
                className="h-8 text-xs font-serif shrink-0 gap-1"
                title="Opt-in: Share your subscription URLs anonymously to train the co-subscription graph"
              >
                {telemetryStatus === 'success' ? (
                  <span className="text-emerald-500 font-bold">Synced!</span>
                ) : (
                  <>
                    <Send className="h-3 w-3 text-amber-500" />
                    <span className="hidden sm:inline">Contribute Feeds</span>
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Recommendations Stream */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {recommendations.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-theme-border text-center text-xs text-theme-muted font-serif">
                {isLoading ? 'Consulting co-subscription graph...' : 'You are subscribed to all recommended blogs in the seed graph!'}
              </div>
            ) : (
              recommendations.map((rec) => {
                const isSubscribed = addedUrls.has(rec.feedUrl) || feeds.some((f) => f.feedUrl === rec.feedUrl);
                return (
                  <div
                    key={rec.feedUrl}
                    className="p-3.5 rounded-xl border border-theme-border bg-theme-surface hover:border-amber-500/40 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="text-xs sm:text-sm font-editorial font-bold text-theme-heading flex items-center gap-1.5">
                          <span>{rec.title}</span>
                        </h5>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                            {rec.category}
                          </span>
                          <span className="text-[10px] font-mono text-theme-muted">
                            {rec.popularityScore.toLocaleString()} readers
                          </span>
                        </div>
                      </div>

                      <Button
                        variant={isSubscribed ? 'outline' : 'amber'}
                        size="sm"
                        disabled={isSubscribed}
                        onClick={() => handleSubscribe(rec)}
                        className="h-7 px-2.5 text-xs font-serif shrink-0 gap-1"
                      >
                        {isSubscribed ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            <span>Follow</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-theme-muted font-serif leading-relaxed line-clamp-2">
                      {rec.description}
                    </p>

                    {/* Transparent Reasoning Badge (PS-003 Bonus Point) */}
                    <div className="pt-2 border-t border-theme-subtle flex items-center justify-between text-[11px]">
                      <span className="text-amber-500 font-serif italic truncate max-w-[280px]">
                        “{rec.reason}”
                      </span>
                      {rec.siteUrl && (
                        <a
                          href={rec.siteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-theme-muted hover:text-theme-heading p-1"
                          title="Open blog website"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. "BLOGS LIKE THIS" GRAPH VIEW (Bonus Point in PS-003) */}
      {activeTab === 'graph' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-serif">
            <span className="text-theme-muted">
              Interactive visualization of co-subscribed blog clusters:
            </span>
            <span className="font-mono text-[10px] text-amber-500">
              {graphNodes.length} blogs • {graphEdges.length} connections
            </span>
          </div>

          {/* Network Graph Grid */}
          <div className="p-4 rounded-xl border border-theme-border bg-theme-base/60 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {graphNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 shadow-sm'
                        : node.isSubscribed
                        ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500'
                        : 'border-theme-border bg-theme-surface/50 hover:border-theme-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-theme-muted">
                        {node.category.split(' ')[0]}
                      </span>
                      {node.isSubscribed && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Subscribed" />
                      )}
                    </div>
                    <div className="font-serif font-bold text-xs text-theme-heading truncate mt-0.5">
                      {node.title}
                    </div>
                    <div className="text-[10px] font-mono text-amber-500 mt-1">
                      {node.popularity} readers
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Node Details & Connected Edges */}
            {selectedNode && (
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-2 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-editorial font-bold text-theme-heading text-sm">
                      {selectedNode.title}
                    </span>
                    <span className="text-[10px] font-mono text-theme-muted ml-2">
                      ({selectedNode.category})
                    </span>
                  </div>
                  {!selectedNode.isSubscribed && (
                    <Button
                      variant="amber"
                      size="sm"
                      onClick={() => handleSubscribe({ feedUrl: selectedNode.id, category: selectedNode.category })}
                      className="h-6 px-2 text-[10px] font-serif"
                    >
                      Follow Blog
                    </Button>
                  )}
                </div>

                <div className="text-[11px] font-serif text-theme-muted">
                  <strong>Co-Subscribed Neighbors:</strong>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {graphEdges
                      .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map((e, idx) => {
                        const neighborUrl = e.source === selectedNode.id ? e.target : e.source;
                        const neighbor = graphNodes.find((n) => n.id === neighborUrl);
                        return (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-theme-surface border border-theme-border font-mono text-[10px] text-theme-heading"
                          >
                            {neighbor ? neighbor.title : neighborUrl} ({e.weight} overlap)
                          </span>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. THREAT MODEL & BONUS TRAP REPORT */}
      {activeTab === 'security' && (
        <div className="space-y-3.5 text-xs">
          {/* Bonus Quest Trap Alert (10 Extra Points) */}
          {trapReport && (
            <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-1.5">
              <div className="flex items-center gap-2 font-bold font-serif text-amber-500 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Bonus Quest Detection: Deliberate Seed Trap Found (+10 Pts)</span>
              </div>
              <p className="text-theme-heading font-serif leading-relaxed">
                <strong>{trapReport.trapType}:</strong> {trapReport.details}
              </p>
              <div className="text-[10px] font-mono text-theme-muted">
                Deduplication Strategy: URL scheme normalization, port removal, and trailing slash stripping.
              </div>
            </div>
          )}

          {/* Threat Model Specifications */}
          <div className="p-3.5 rounded-xl border border-theme-border bg-theme-surface/60 space-y-2">
            <h5 className="font-editorial font-bold text-theme-heading text-xs flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              <span>PS-003 Threat Model: Defenses & Accepted Boundaries</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-serif pt-1">
              <div className="p-2 rounded bg-theme-base/60 border border-theme-border">
                <span className="font-bold text-emerald-500 block mb-0.5">What We Defend Against:</span>
                <ul className="list-disc pl-3.5 space-y-0.5 text-theme-muted">
                  <li><strong>SSRF Exploits:</strong> Probing private subnets (10.0.0.0/8, 192.168.0.0/16, AWS metadata 169.254.169.254).</li>
                  <li><strong>Sybil Telemetry Poisoning:</strong> Salted SHA-256 IP hash rate limiting (1 batch per 5m).</li>
                  <li><strong>XSS via Proxied Feeds:</strong> DOMPurify sanitization stripping scripts, forms, and handlers.</li>
                  <li><strong>Memory Exhaustion:</strong> 6MB payload ceiling on XML fetch stream.</li>
                </ul>
              </div>

              <div className="p-2 rounded bg-theme-base/60 border border-theme-border">
                <span className="font-bold text-amber-500 block mb-0.5">What We Intentionally Accept:</span>
                <ul className="list-disc pl-3.5 space-y-0.5 text-theme-muted">
                  <li><strong>Shared NAT / Proxy Collision:</strong> Multiple users behind one IP share rate-limit window.</li>
                  <li><strong>Cold-Start Sparsity:</strong> Brand new un-indexed blogs require seed cross-subscribers to appear in recommendations.</li>
                  <li><strong>No Account Syncing:</strong> Subscriptions remain strictly local to user's IndexedDB.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

``

---

## File: `src\components\discovery\OPMLModal.tsx`

``tsx
import React, { useState, useRef } from 'react';
import { useFeeds } from '../../context/FeedContext';
import { downloadOPML, parseOPML, OPMLFeedItem } from '../../lib/opml';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Download,
  Upload,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Folder,
  Rss,
  FileUp,
} from 'lucide-react';

export interface OPMLModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OPMLModal: React.FC<OPMLModalProps> = ({ isOpen, onClose }) => {
  const { feeds, addNewFeed } = useFeeds();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [parsedItems, setParsedItems] = useState<OPMLFeedItem[]>([]);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = () => {
    downloadOPML(feeds);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setImportStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const items = parseOPML(text);
        if (items.length === 0) {
          setErrorMessage('No valid RSS/Atom feed outlines found in this OPML file.');
          setParsedItems([]);
        } else {
          setParsedItems(items);
        }
      } catch (err: any) {
        setErrorMessage(`Failed to parse OPML: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedItems.length === 0) return;
    setImporting(true);
    setImportStatus('Importing feeds into local IndexedDB...');

    let addedCount = 0;
    for (const item of parsedItems) {
      try {
        await addNewFeed(item.feedUrl, item.folder || 'Imported');
        addedCount++;
      } catch (err) {
        console.warn(`Skipped feed ${item.feedUrl}:`, err);
      }
    }

    setImporting(false);
    setImportStatus(`Successfully imported ${addedCount} subscriptions to your reading list!`);
    setParsedItems([]);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
            <FileCode className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-editorial font-bold text-theme-heading">
              OPML Subscription Exchange
            </div>
            <div className="text-xs font-serif text-theme-muted font-normal">
              Open standard import and export for independent feed readers
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Tab Selection */}
        <div className="flex border-b border-theme-border pb-2 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-colors ${
              activeTab === 'export'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export OPML</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-colors ${
              activeTab === 'import'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import OPML</span>
          </button>
        </div>

        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <p className="text-xs font-serif text-theme-muted leading-relaxed">
              Export all your <strong>{feeds.length}</strong> subscribed feeds organized by folder into a standardized OPML 2.0 XML file. You can migrate your subscriptions to NetNewsWire, Feedly, Feedbin, or back up your offline reader state.
            </p>

            <div className="p-4 rounded-xl border border-theme-border bg-theme-surface/50 flex items-center justify-between">
              <div>
                <span className="font-editorial font-bold text-xs text-theme-heading block">
                  incogniread-subscriptions.opml
                </span>
                <span className="text-[11px] font-mono text-theme-muted">
                  {feeds.length} feeds • Categorized by folder
                </span>
              </div>

              <Button
                variant="amber"
                size="sm"
                onClick={handleExport}
                className="gap-2 font-serif font-bold text-xs"
              >
                <Download className="h-4 w-4" />
                <span>Download OPML</span>
              </Button>
            </div>
          </div>
        )}

        {/* IMPORT TAB */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <p className="text-xs font-serif text-theme-muted leading-relaxed">
              Import feeds from another RSS reader or a fellow blogger's published blogroll. All feeds are parsed client-side and saved into your private local IndexedDB.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".opml,.xml,text/xml"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl border-2 border-dashed border-theme-border hover:border-amber-500/50 bg-theme-surface/30 hover:bg-theme-elevated text-center cursor-pointer transition-colors space-y-2 group"
            >
              <FileUp className="h-8 w-8 text-amber-500 mx-auto group-hover:scale-110 transition-transform" />
              <div className="text-xs font-serif font-bold text-theme-heading">
                Click to browse or drop your .opml file here
              </div>
              <div className="text-[11px] font-mono text-theme-muted">
                Accepts standard OPML 1.0/2.0 XML
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {importStatus && (
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}

            {/* Parsed Previews */}
            {parsedItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-theme-heading">
                    Found {parsedItems.length} feeds in OPML:
                  </span>
                  <Button
                    variant="amber"
                    size="sm"
                    onClick={handleExecuteImport}
                    isLoading={importing}
                    className="font-serif font-bold text-xs gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Import All ({parsedItems.length})</span>
                  </Button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {parsedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-theme-border bg-theme-surface flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <Rss className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="font-serif font-bold text-theme-heading truncate">
                          {item.title}
                        </span>
                      </div>
                      <Badge variant="glass" className="text-[10px] font-mono shrink-0">
                        {item.folder}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};

``

---

## File: `src\components\audio\FloatingAudioPlayer.tsx`

``tsx
import React, { useState, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useFeeds } from '../../context/FeedContext';
import { formatDuration } from '../../lib/utils';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  FastForward,
  ListMusic,
  X,
  Headphones,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

export const FloatingAudioPlayer: React.FC = () => {
  const {
    currentArticle,
    playbackState,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    queue,
    activeSentence,
    activeParagraphIndex,
    togglePlayPause,
    stop,
    skip,
    nextParagraph,
    previousParagraph,
    seekToProgress,
    setPlaybackRate,
    setVolume,
    toggleMute,
    playNextInQueue,
  } = useAudio();

  const { setReadingArticle } = useFeeds();

  const [isSpeedOpen, setIsSpeedOpen] = useState(false);
  const [isVolumeSliderOpen, setIsVolumeSliderOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  if (!currentArticle || playbackState === 'idle') return null;

  const isPlaying = playbackState === 'playing';
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const remainingSeconds = Math.max(0, duration - currentTime);

  const speedPresets = [
    { rate: 0.75, label: '0.75× Leisurely', desc: 'Slow & relaxed' },
    { rate: 1.0, label: '1.0× Normal', desc: 'Natural voice' },
    { rate: 1.25, label: '1.25× Brisk', desc: 'Editorial pace' },
    { rate: 1.5, label: '1.5× Swift', desc: 'Fast reader' },
    { rate: 1.75, label: '1.75× Rapid', desc: 'High tempo' },
    { rate: 2.0, label: '2.0× Double', desc: 'Maximum speed' },
  ];

  // 1-Click speed cycle
  const handleCycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sequence = [1.0, 1.25, 1.5, 1.75, 2.0, 0.75];
    const currentIndex = sequence.indexOf(playbackRate);
    const nextRate = sequence[(currentIndex + 1) % sequence.length];
    setPlaybackRate(nextRate);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seekToProgress(ratio);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="h-4 w-4 text-rose-500" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4 text-theme-heading" />;
    return <Volume2 className="h-4 w-4 text-theme-heading" />;
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-2 sm:p-4 pointer-events-none animate-slide-up">
      <div className="max-w-4xl mx-auto pointer-events-auto rounded-2xl border-2 border-theme-border bg-theme-surface-solid shadow-2xl shadow-black/40 overflow-hidden transition-all duration-200">
        {/* Interactive High-Contrast Scrub Bar */}
        <div
          ref={progressBarRef}
          onClick={handleProgressBarClick}
          role="slider"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Audio scrubber"
          className="relative h-2.5 w-full bg-theme-elevated cursor-pointer group select-none"
        >
          {/* Progress fill */}
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-150 relative"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Scrubber Knob */}
            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow-md border-2 border-amber-600 scale-100 transition-transform -mr-2" />
          </div>
        </div>

        {/* Player Controls Inner Container */}
        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-theme-surface-solid">
          {/* Article Info & Live Spoken Sentence preview */}
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            <button
              onClick={() => setReadingArticle(currentArticle)}
              aria-label="Open Reader View"
              title="Open full editorial reader"
              className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 shrink-0 hover:scale-105 transition-all shadow-xs"
            >
              {isPlaying ? (
                /* Equalizer animated wave bars */
                <div className="flex items-end justify-center gap-0.5 h-5 w-5">
                  <span className="w-1 bg-amber-500 rounded-full animate-equalizer-1" />
                  <span className="w-1 bg-amber-400 rounded-full animate-equalizer-2" />
                  <span className="w-1 bg-emerald-500 rounded-full animate-equalizer-3" />
                  <span className="w-1 bg-amber-500 rounded-full animate-equalizer-4" />
                </div>
              ) : (
                <Headphones className="h-5 w-5 text-amber-500" />
              )}
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
                  {currentArticle.feedTitle}
                </span>
                <span className="text-theme-muted text-[10px]">•</span>
                <span className="text-[11px] font-bold text-theme-heading font-mono">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
                <span className="text-[10px] text-theme-muted font-mono hidden md:inline">
                  (-{formatDuration(remainingSeconds)})
                </span>
                {currentArticle.paragraphs.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-theme-elevated text-theme-heading font-mono font-semibold hidden lg:inline border border-theme-border">
                    Para {activeParagraphIndex + 1}/{currentArticle.paragraphs.length}
                  </span>
                )}
              </div>
              <h4
                onClick={() => setReadingArticle(currentArticle)}
                className="text-xs sm:text-sm font-editorial font-bold text-theme-heading truncate cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors pt-0.5"
                title={currentArticle.title}
              >
                {currentArticle.title}
              </h4>
              {/* Spoken subtitle snippet with elegant editorial quotation */}
              {activeSentence ? (
                <p className="text-[11px] text-amber-600 dark:text-amber-300 truncate font-serif italic hidden sm:block">
                  “{activeSentence}”
                </p>
              ) : (
                <p className="text-[10px] text-theme-muted truncate hidden sm:block font-serif">
                  Press Space to pause/resume • Press M to mute
                </p>
              )}
            </div>
          </div>

          {/* Primary Audio Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Previous Paragraph */}
            <button
              onClick={previousParagraph}
              aria-label="Previous paragraph"
              title="Previous paragraph"
              className="p-2 text-theme-muted hover:text-theme-heading rounded-xl hover:bg-theme-elevated transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-theme-border/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Skip -10s */}
            <button
              onClick={() => skip(-10)}
              aria-label="Rewind 10 seconds"
              title="Rewind 10s"
              className="p-2 text-theme-muted hover:text-theme-heading rounded-xl hover:bg-theme-elevated transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-theme-border/50"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Play / Pause Toggle Button */}
            <button
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause narration (Space)' : 'Resume narration (Space)'}
              title={isPlaying ? 'Pause narration (Space)' : 'Play narration (Space)'}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/30 transition-all duration-200 active:scale-95 hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Skip +10s */}
            <button
              onClick={() => skip(10)}
              aria-label="Forward 10 seconds"
              title="Fast forward 10s"
              className="p-2 text-theme-muted hover:text-theme-heading rounded-xl hover:bg-theme-elevated transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-theme-border/50"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            {/* Next Paragraph */}
            <button
              onClick={nextParagraph}
              aria-label="Next paragraph"
              title="Next paragraph"
              className="p-2 text-theme-muted hover:text-theme-heading rounded-xl hover:bg-theme-elevated transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-theme-border/50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Speed Selector (1-Click Cycle + Dropdown Menu) */}
            <div className="relative">
              <button
                onClick={handleCycleSpeed}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setIsSpeedOpen(!isSpeedOpen);
                }}
                aria-label={`Playback speed: ${playbackRate}x. Click to cycle, right-click for presets.`}
                title={`Speed: ${playbackRate}× — Click to cycle (${playbackRate === 2.0 ? '0.75×' : playbackRate + 0.25 + '×'})`}
                className="px-2.5 py-1 text-xs font-mono font-bold rounded-xl border-2 border-amber-500/40 bg-theme-surface hover:bg-amber-500/15 text-theme-heading transition-colors min-h-[40px] flex items-center gap-1 shadow-xs"
              >
                <Gauge className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-amber-600 dark:text-amber-400">{playbackRate.toFixed(playbackRate % 1 === 0 ? 0 : 2)}×</span>
              </button>

              {/* Speed Mode Menu Button */}
              <button
                onClick={() => setIsSpeedOpen(!isSpeedOpen)}
                title="Open speed mode presets"
                className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[8px] font-bold"
              >
                ▼
              </button>

              {isSpeedOpen && (
                <div className="absolute bottom-14 right-0 p-3 rounded-2xl bg-theme-surface-solid border-2 border-theme-border shadow-2xl flex flex-col gap-2 z-50 min-w-[220px] animate-slide-up backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-1.5 border-b border-theme-subtle">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-theme-muted font-mono">
                      Narration Speed Mode
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-500">
                      {playbackRate}×
                    </span>
                  </div>

                  {/* Preset Speed Mode Pills */}
                  <div className="space-y-1">
                    {speedPresets.map((preset) => {
                      const isSelected = playbackRate === preset.rate;
                      return (
                        <button
                          key={preset.rate}
                          onClick={() => {
                            setPlaybackRate(preset.rate);
                            setIsSpeedOpen(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                              : 'text-theme-heading hover:bg-theme-elevated'
                          }`}
                        >
                          <span className="font-mono font-semibold">{preset.label}</span>
                          <span
                            className={`text-[10px] ${
                              isSelected ? 'text-slate-900/80 font-mono' : 'text-theme-muted font-mono'
                            }`}
                          >
                            {preset.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Fine Step Adjuster Buttons */}
                  <div className="pt-2 border-t border-theme-subtle flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-theme-muted">Fine Step:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPlaybackRate(Math.max(0.5, Number((playbackRate - 0.1).toFixed(1))))}
                        className="px-2 py-0.5 rounded-lg border border-theme-border hover:bg-theme-elevated text-theme-heading font-bold"
                        title="Decrease by 0.1x"
                      >
                        -0.1
                      </button>
                      <button
                        onClick={() => setPlaybackRate(Math.min(3.0, Number((playbackRate + 0.1).toFixed(1))))}
                        className="px-2 py-0.5 rounded-lg border border-theme-border hover:bg-theme-elevated text-theme-heading font-bold"
                        title="Increase by 0.1x"
                      >
                        +0.1
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Instant Mute / Unmute Button with Popover Volume Slider */}
            <div
              className="relative"
              onMouseEnter={() => setIsVolumeSliderOpen(true)}
              onMouseLeave={() => setIsVolumeSliderOpen(false)}
            >
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute narration (M)' : 'Mute narration (M)'}
                title={isMuted ? 'Unmute narration (Press M)' : `Mute (Press M) • Vol ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                className={`p-2 rounded-xl border-2 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center ${
                  isMuted
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500 shadow-sm'
                    : 'bg-theme-surface hover:bg-theme-elevated text-theme-heading border-theme-border'
                }`}
              >
                {getVolumeIcon()}
              </button>

              {/* Hover Volume Slider Flyout */}
              {isVolumeSliderOpen && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 p-3 rounded-2xl bg-theme-surface-solid border-2 border-theme-border shadow-2xl flex flex-col items-center gap-2 z-50 animate-slide-up backdrop-blur-xl min-w-[130px]">
                  <div className="flex items-center justify-between w-full text-[10px] font-mono font-bold">
                    <span className={isMuted ? 'text-rose-500 font-bold' : 'text-theme-heading'}>
                      {isMuted ? 'MUTED' : `VOL: ${Math.round(volume * 100)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 h-2 accent-amber-500 cursor-pointer bg-theme-elevated rounded-lg"
                    aria-label="Volume slider"
                  />
                  <button
                    onClick={toggleMute}
                    className="text-[11px] font-serif font-bold text-amber-600 dark:text-amber-400 hover:underline pt-0.5"
                  >
                    {isMuted ? 'Click to Unmute' : 'Click to Mute'}
                  </button>
                </div>
              )}
            </div>

            {/* Queue Toggle Pill */}
            {queue.length > 0 && (
              <button
                onClick={() => setIsQueueOpen(!isQueueOpen)}
                className="relative p-2 text-theme-muted hover:text-theme-heading rounded-xl hover:bg-theme-elevated transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-theme-border/50"
                title={`${queue.length} articles in audio queue`}
              >
                <ListMusic className="h-4 w-4" />
                <span className="absolute top-1 right-1 px-1 text-[9px] rounded-full bg-amber-500 text-slate-950 font-bold font-mono">
                  {queue.length}
                </span>
              </button>
            )}

            {/* Maximize to Reader View */}
            <button
              onClick={() => setReadingArticle(currentArticle)}
              aria-label="Open Reader View"
              title="Expand to full editorial reading format"
              className="p-2 text-theme-muted hover:text-theme-heading rounded-xl hover:bg-theme-elevated transition-colors hidden md:flex items-center justify-center min-h-[40px] min-w-[40px] border border-theme-border/50"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* Close / Stop */}
            <button
              onClick={stop}
              aria-label="Close audio player"
              title="Stop audio player"
              className="p-2 text-theme-muted hover:text-theme-heading rounded-xl hover:bg-theme-elevated transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-theme-border/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Dropdown Mini Queue Preview */}
        {isQueueOpen && queue.length > 0 && (
          <div className="px-4 py-3 border-t-2 border-theme-border bg-theme-surface-solid space-y-2 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-theme-muted font-serif font-bold uppercase tracking-wider">
              <span>Up Next in Audio Queue</span>
              <button onClick={playNextInQueue} className="text-amber-600 dark:text-amber-400 hover:underline text-[11px] font-mono">
                Skip to Next
              </button>
            </div>
            {queue.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded-xl bg-theme-surface border border-theme-border text-xs"
              >
                <div className="truncate pr-2">
                  <span className="font-mono text-[10px] text-amber-500 mr-2">#{idx + 1}</span>
                  <span className="text-theme-heading font-serif font-medium">{item.title}</span>
                </div>
                <span className="text-[10px] text-theme-muted font-mono shrink-0">
                  {item.estimatedReadMinutes}m read
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

``

---

## File: `src\components\ui\IncogniReadLogo.tsx`

``tsx
import React from 'react';

export interface IncogniReadLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export const IncogniReadLogo: React.FC<IncogniReadLogoProps> = ({
  className = 'h-9 w-9',
  size,
  showText = false,
  textClassName = '',
}) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-amber-400 to-amber-600 shadow-md shadow-amber-500/25 text-slate-950 shrink-0 ${className}`}
        style={size ? { width: size, height: size } : undefined}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Incognito Fedora Hat Crown */}
          <path
            d="M13 18C14.5 12.5 19.5 11 24 13C28.5 11 33.5 12.5 35 18C31 18.8 17 18.8 13 18Z"
            fill="#090d16"
          />
          {/* Hat Ribbon Band (Warm Gold highlight) */}
          <path
            d="M13.8 17.5C18 16.5 30 16.5 34.2 17.5L34.6 18.8C30.5 18 17.5 18 13.4 18.8L13.8 17.5Z"
            fill="#f59e0b"
          />
          {/* Hat Brim (Curved classic silhouette) */}
          <path
            d="M8 21.5C14 18.5 34 18.5 40 21.5C35 23.5 13 23.5 8 21.5Z"
            fill="#090d16"
          />

          {/* Incognito Reading Spectacles */}
          {/* Left Lens */}
          <circle
            cx="17.5"
            cy="28"
            r="4.2"
            fill="#090d16"
            stroke="#090d16"
            strokeWidth="1.2"
          />
          <circle
            cx="17.5"
            cy="28"
            r="2.8"
            fill="#f59e0b"
            opacity="0.3"
          />
          {/* Right Lens */}
          <circle
            cx="30.5"
            cy="28"
            r="4.2"
            fill="#090d16"
            stroke="#090d16"
            strokeWidth="1.2"
          />
          <circle
            cx="30.5"
            cy="28"
            r="2.8"
            fill="#f59e0b"
            opacity="0.3"
          />
          {/* Spectacles Bridge */}
          <path
            d="M21.7 27C23 25.5 25 25.5 26.3 27"
            stroke="#090d16"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Spectacles Temple Wings */}
          <path
            d="M13.3 27.5L10 26.5"
            stroke="#090d16"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M34.7 27.5L38 26.5"
            stroke="#090d16"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Open Broadsheet / Newspaper Pages at base */}
          <path
            d="M10 36C15 34.2 21 34.6 24 37V41C21 38.6 15 38.2 10 40V36Z"
            fill="#090d16"
          />
          <path
            d="M38 36C33 34.2 27 34.6 24 37V41C27 38.6 33 38.2 38 40V36Z"
            fill="#090d16"
          />
          {/* Newspaper printed text lines */}
          <line x1="12" y1="36.5" x2="20" y2="35.5" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
          <line x1="12" y1="38.5" x2="18" y2="37.8" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
          <line x1="28" y1="35.5" x2="36" y2="36.5" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
          <line x1="30" y1="37.8" x2="36" y2="38.5" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />

          {/* RSS Broadcast Signal Waves emanating top-right */}
          <path
            d="M35 11C37.5 12.5 39.5 15 40 18"
            stroke="#090d16"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M37.5 8C41 10 43.5 13.5 44 17.5"
            stroke="#090d16"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="33" cy="13" r="1.2" fill="#090d16" />
        </svg>

        {/* Live Signal Pulse dot */}
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
      </div>

      {showText && (
        <div>
          <span className={`font-editorial text-xl sm:text-2xl font-black tracking-tight text-theme-heading flex items-center gap-0.5 ${textClassName}`}>
            Incogni<span className="text-amber-500">Read</span>
            <span className="text-amber-500">.</span>
          </span>
          <p className="hidden sm:block text-[9px] text-theme-muted font-mono tracking-widest uppercase -mt-0.5">
            The Private Dispatch
          </p>
        </div>
      )}
    </div>
  );
};

``

---

## File: `src\components\ui\ThemeToggle.tsx`

``tsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme, THEMES, ThemeMode } from '../../context/ThemeContext';
import { Moon, Sun, BookOpen, Check } from 'lucide-react';

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
        aria-label={`Toggle theme (Current: ${activeThemeConfig.name})`}
        title={`Theme: ${activeThemeConfig.name} — Click to cycle`}
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
        title={`Theme: ${activeThemeConfig.name}`}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-theme-border bg-theme-surface/80 hover:bg-theme-elevated text-theme-heading transition-all duration-200 text-xs font-serif font-medium shadow-sm min-h-[40px]"
      >
        {getThemeIcon(theme, 'h-3.5 w-3.5')}
        <span className="hidden sm:inline font-sans text-xs tracking-wide">{activeThemeConfig.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-theme-border bg-theme-surface-solid shadow-2xl p-1.5 z-50 animate-slide-up backdrop-blur-xl">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-theme-muted font-mono border-b border-theme-subtle">
            Select Reading Edition
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
                      ? 'bg-amber-500/15 border border-amber-500/30 text-theme-heading font-semibold shadow-xs'
                      : 'text-theme-body hover:bg-theme-elevated hover:text-theme-heading'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded-lg bg-theme-elevated shrink-0">
                      {getThemeIcon(item.id, 'h-3.5 w-3.5')}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-serif font-bold text-theme-heading leading-tight">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-theme-muted truncate font-sans">
                        {item.tagline}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

``

---

## File: `src\components\ui\dialog.tsx`

``tsx
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
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centering Wrapper ensuring vertical padding and no edge clipping */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        {/* Content Card */}
        <div
          ref={dialogRef}
          className={cn(
            'relative z-50 w-full rounded-2xl border border-theme-border bg-theme-surface-solid backdrop-blur-2xl p-6 sm:p-7 text-left text-theme-heading shadow-2xl animate-slide-up my-auto max-h-[calc(100vh-3rem)] overflow-y-auto',
            maxWidthClasses[maxWidth]
          )}
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 rounded-xl p-2 text-theme-muted hover:bg-theme-elevated hover:text-theme-heading transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {(title || description) && (
            <div className="mb-5 space-y-1.5 pr-6">
              {title && <h2 className="text-lg font-editorial font-bold tracking-tight text-theme-heading">{title}</h2>}
              {description && <p className="text-xs text-theme-muted font-serif leading-relaxed">{description}</p>}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

``

---

## File: `src\components\ui\button.tsx`

``tsx
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
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] min-h-[44px]';

    const variants = {
      default: 'bg-theme-elevated hover:bg-theme-elevated/80 text-theme-heading border border-theme-border shadow-sm',
      outline: 'border border-theme-border bg-transparent hover:bg-theme-elevated text-theme-heading',
      ghost: 'bg-transparent hover:bg-theme-elevated text-theme-muted hover:text-theme-heading',
      glass:
        'bg-theme-surface/70 backdrop-blur-md border border-theme-border hover:bg-theme-elevated text-theme-heading shadow-sm',
      amber:
        'bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-md shadow-amber-500/20 hover:shadow-amber-500/30',
      emerald:
        'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30',
      destructive: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-9 min-h-[36px]',
      md: 'text-sm px-4 py-2.5 h-11 min-h-[44px]',
      lg: 'text-base px-6 py-3.5 h-13 min-h-[50px]',
      icon: 'h-11 w-11 min-h-[44px] min-w-[44px] p-0 flex items-center justify-center',
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

``

---

## File: `src\components\ui\badge.tsx`

``tsx
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
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    outline: 'border border-theme-border text-theme-muted bg-transparent',
    glass: 'bg-theme-surface/70 backdrop-blur-md text-theme-heading border border-theme-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-serif font-medium tracking-wide transition-colors border select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

``

---

## File: `src\components\ui\card.tsx`

``tsx
import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'none' | 'amber' | 'emerald';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = 'none', children, ...props }, ref) => {
    const glowStyles = {
      none: '',
      amber: 'hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300',
      emerald: 'hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border border-theme-border bg-theme-surface/70 backdrop-blur-xl text-theme-heading shadow-md overflow-hidden transition-colors duration-200',
          glowStyles[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-5', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-base font-editorial font-bold leading-snug tracking-tight text-theme-heading', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs text-theme-muted font-serif leading-relaxed', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-5 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

``

---

## File: `src\components\ui\input.tsx`

``tsx
import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, icon, ...props }, ref) => {
    return (
      <div className="w-full relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex h-11 min-h-[44px] w-full rounded-xl border border-theme-border bg-theme-surface/70 backdrop-blur-md px-3.5 py-2 text-sm text-theme-heading placeholder:text-theme-muted transition-colors font-serif',
            'focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-10',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-rose-500 font-serif">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

``

---

## File: `src\components\ui\sheet.tsx`

``tsx
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
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fade-in"
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
            'w-screen max-w-xs sm:max-w-sm border-theme-border bg-theme-surface-solid backdrop-blur-2xl p-5 shadow-2xl transition-transform duration-300 flex flex-col justify-between overflow-y-auto',
            side === 'left' ? 'border-r' : 'border-l',
            'animate-slide-up'
          )}
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-theme-subtle">
              {title ? (
                <div className="text-base font-editorial font-bold text-theme-heading tracking-tight">{title}</div>
              ) : (
                <span />
              )}
              <button
                onClick={onClose}
                aria-label="Close sheet"
                className="rounded-xl p-2 text-theme-muted hover:bg-theme-elevated hover:text-theme-heading transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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

``

---

