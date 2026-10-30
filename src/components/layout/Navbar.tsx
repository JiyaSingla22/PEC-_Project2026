import React from 'react';
import { useFeeds } from '../../context/FeedContext';
import { IncogniReadLogo } from '../ui/IncogniReadLogo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/button';
import {
  Search,
  Plus,
  Wifi,
  WifiOff,
  RefreshCw,
  Menu,
  ShieldCheck,
  Calendar,
  Compass,
  FileCode,
} from 'lucide-react';

export interface NavbarProps {
  onOpenAddFeed: () => void;
  onOpenMobileMenu: () => void;
  onOpenDiscovery?: () => void;
  onOpenOPML?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddFeed,
  onOpenMobileMenu,
  onOpenDiscovery,
  onOpenOPML,
}) => {
  const { searchQuery, setSearchQuery, isOnline, isSyncing, syncAllFeeds } = useFeeds();

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date()).toUpperCase();

  return (
    <header
      className="solid-navbar sticky top-0 z-30 w-full border-b border-theme-border shadow-md transition-all duration-200"
      style={{ backgroundColor: 'var(--bg-surface-solid, #0b111e)', opacity: 1 }}
    >
      {/* Top Hairline Newspaper Dateline Bar (100% Solid Non-Transparent) */}
      <div
        className="border-b border-theme-subtle text-[10px] text-theme-muted py-1.5 px-4 sm:px-6 lg:px-8 hidden md:block select-none"
        style={{ backgroundColor: 'var(--bg-elevated, #162032)' }}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3 font-editorial tracking-wider">
            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {todayFormatted}
            </span>
            <span className="opacity-30">|</span>
            <span className="uppercase tracking-widest text-[9px] text-theme-muted font-mono font-semibold">
              The IncogniRead Broadsheet • Issue No. 302
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[9px] text-theme-muted">
            <span>CLIENT-PARSED INDEXEDDB</span>
            <span className="opacity-30">|</span>
            <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="h-3 w-3" /> ZERO TELEMETRY
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-3 sm:gap-4">
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
            <IncogniReadLogo size="md" showText={true} />
          </div>
        </div>

        {/* Global Search Input Box */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search dispatches & archives across subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 min-h-[40px] pl-10 pr-4 rounded-xl border border-theme-border bg-theme-input text-xs sm:text-sm text-theme-heading placeholder:text-theme-muted font-serif focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-theme-muted hover:text-theme-heading font-mono"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Discovery, OPML, Theme Toggle, Online Status, Sync & Add Blog */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Online / Offline Status */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono select-none ${
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
          {onOpenDiscovery && (
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
          )}

          {/* OPML Import / Export Trigger Button */}
          {onOpenOPML && (
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
          )}

          {/* Theme Edition Selector Toggle */}
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

          {/* Add Blog / Feed Button */}
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
