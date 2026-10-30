import React from 'react';
import { useFeeds } from '../../context/FeedContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Rss,
  Search,
  Plus,
  Wifi,
  WifiOff,
  RefreshCw,
  Menu,
  ShieldCheck,
} from 'lucide-react';

export interface NavbarProps {
  onOpenAddFeed: () => void;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddFeed, onOpenMobileMenu }) => {
  const { searchQuery, setSearchQuery, isOnline, isSyncing, syncAllFeeds } = useFeeds();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open navigation drawer"
            className="lg:hidden rounded-xl p-2.5 text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors border border-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer select-none">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
              <Rss className="h-5 w-5 text-slate-950 fill-slate-950" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1">
                Feedora<span className="text-amber-500">.</span>
              </span>
              <p className="hidden sm:block text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Privacy-First RSS
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Input Box */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search articles across all subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 min-h-[40px] pl-10 pr-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Online Status, Sync & Add Feed */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Offline / Online Pill */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono select-none ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
            title={isOnline ? 'Online: Live syncing enabled' : 'Offline: Serving local IndexedDB cache'}
          >
            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          <Button
            variant="glass"
            size="sm"
            onClick={syncAllFeeds}
            isLoading={isSyncing}
            className="hidden md:inline-flex min-h-[38px] p-2"
            title="Sync all feeds"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
          </Button>

          <Button
            variant="amber"
            size="sm"
            onClick={onOpenAddFeed}
            className="gap-1.5 min-h-[38px] text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Feed</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
