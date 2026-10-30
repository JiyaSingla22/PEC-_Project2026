import React from 'react';
import { useFeeds } from '../../context/FeedContext';
import { IncogniReadLogo } from '../ui/IncogniReadLogo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  X,
  Plus,
  Inbox,
  Bookmark,
  Compass,
  Rss,
  Wifi,
  WifiOff,
  FileCode,
} from 'lucide-react';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddFeed: () => void;
  onOpenDiscovery?: () => void;
  onOpenOPML?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  onOpenAddFeed,
  onOpenDiscovery = () => {},
  onOpenOPML,
}) => {
  const {
    feeds,
    articles,
    activeFilter,
    setActiveFilter,
    setActiveFolder,
    isOnline,
  } = useFeeds();

  if (!isOpen) return null;

  const handleSelectFilter = (filter: string) => {
    setActiveFilter(filter);
    setActiveFolder('all');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-theme-surface border-r border-theme-border p-5 flex flex-col justify-between shadow-2xl overflow-y-auto select-none transition-colors duration-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-theme-subtle">
            <IncogniReadLogo size="sm" showText={true} />
            <button
              onClick={onClose}
              aria-label="Close navigation"
              className="p-2 text-theme-muted hover:text-theme-heading rounded-lg hover:bg-theme-elevated transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Connection & Theme Status */}
          <div className="p-3 rounded-2xl bg-theme-elevated border border-theme-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-emerald-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-rose-500" />
              )}
              <span className="text-xs font-mono font-bold text-theme-heading">
                {isOnline ? 'Online Engine' : 'Offline Cache'}
              </span>
            </div>

            <ThemeToggle variant="button" />
          </div>

          {/* Add Feed Primary Button */}
          <Button
            variant="amber"
            onClick={() => {
              onOpenAddFeed();
              onClose();
            }}
            className="w-full gap-2 min-h-[44px] text-sm font-serif font-bold shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Add Feed Subscription</span>
          </Button>

          {/* Navigation Views */}
          <div className="space-y-1">
            <button
              onClick={() => handleSelectFilter('all')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-editorial font-bold transition-colors min-h-[44px] ${
                activeFilter === 'all'
                  ? 'bg-amber-500/15 text-slate-950 dark:text-amber-300 border border-amber-500/30'
                  : 'text-theme-muted hover:bg-theme-elevated hover:text-theme-heading'
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox className="h-4 w-4 text-amber-500" />
                <span>All Stories</span>
              </div>
              <span className="font-mono text-xs text-theme-muted">
                {articles.length}
              </span>
            </button>

            <button
              onClick={() => handleSelectFilter('unread')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-editorial font-bold transition-colors min-h-[44px] ${
                activeFilter === 'unread'
                  ? 'bg-amber-500/15 text-slate-950 dark:text-amber-300 border border-amber-500/30'
                  : 'text-theme-muted hover:bg-theme-elevated hover:text-theme-heading'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Unread</span>
              </div>
              <Badge variant="amber" className="text-xs">
                {articles.filter((a) => !a.isRead).length}
              </Badge>
            </button>

            <button
              onClick={() => handleSelectFilter('bookmarks')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-editorial font-bold transition-colors min-h-[44px] ${
                activeFilter === 'bookmarks'
                  ? 'bg-amber-500/15 text-slate-950 dark:text-amber-300 border border-amber-500/30'
                  : 'text-theme-muted hover:bg-theme-elevated hover:text-theme-heading'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bookmark className="h-4 w-4 text-amber-500" />
                <span>Saved Bookmarks</span>
              </div>
              <span className="font-mono text-xs text-theme-muted">
                {articles.filter((a) => a.isBookmarked).length}
              </span>
            </button>
          </div>

          {/* Discovery & OPML Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => {
                onOpenDiscovery();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-theme-elevated border border-theme-border text-sm font-semibold text-theme-heading hover:text-amber-500 min-h-[44px]"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="h-4 w-4 text-amber-500" />
                <span>Anonymous Discovery</span>
              </div>
              <Badge variant="amber" className="text-[10px]">
                New
              </Badge>
            </button>

            {onOpenOPML && (
              <button
                onClick={() => {
                  onOpenOPML();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-theme-elevated border border-theme-border text-sm font-semibold text-theme-heading hover:text-amber-500 min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <FileCode className="h-4 w-4 text-theme-muted" />
                  <span>OPML Subscriptions</span>
                </div>
                <span className="text-[10px] font-mono text-theme-muted">Import/Export</span>
              </button>
            )}
          </div>

          {/* Subscribed Feeds */}
          <div className="space-y-2 pt-2 border-t border-theme-subtle">
            <div className="text-[11px] font-bold uppercase tracking-wider text-theme-muted px-1">
              Subscriptions ({feeds.length})
            </div>
            <div className="space-y-1">
              {feeds.map((feed) => {
                const isFeedActive = activeFilter === feed.id;
                return (
                  <button
                    key={feed.id}
                    onClick={() => handleSelectFilter(feed.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors min-h-[44px] ${
                      isFeedActive
                        ? 'bg-amber-500/15 text-slate-950 dark:text-amber-300 font-semibold'
                        : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated'
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
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-theme-subtle text-xs text-theme-muted font-mono flex justify-between items-center">
          <span>IncogniRead Broadsheet</span>
          <span>IndexedDB Cache</span>
        </div>
      </div>
    </div>
  );
};
