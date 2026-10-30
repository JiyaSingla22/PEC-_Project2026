import React from 'react';
import { Sheet } from '../ui/sheet';
import { useFeeds } from '../../context/FeedContext';
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
} from 'lucide-react';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddFeed: () => void;
  onOpenDiscovery: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  onOpenAddFeed,
  onOpenDiscovery,
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
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold">
            <Rss className="h-4 w-4" />
          </div>
          <span>Feedora Feeds</span>
        </div>
      }
    >
      <div className="flex flex-col space-y-6">
        {/* Main Filters */}
        <div className="space-y-1">
          <button
            onClick={() => handleSelectFilter('all')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
              activeFilter === 'all' && activeFolder === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Inbox className="h-4 w-4 text-amber-500" />
              <span>All Stories</span>
            </div>
            <span className="font-mono text-xs text-slate-400">{articles.length}</span>
          </button>

          <button
            onClick={() => handleSelectFilter('unread')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
              activeFilter === 'unread'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-300 hover:bg-slate-800/60'
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
            className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
              activeFilter === 'bookmarks'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="h-4 w-4 text-amber-400" />
              <span>Saved Bookmarks</span>
            </div>
            <span className="font-mono text-xs text-slate-400">
              {articles.filter((a) => a.isBookmarked).length}
            </span>
          </button>
        </div>

        {/* Discovery Action Pill */}
        <button
          onClick={() => {
            onOpenDiscovery();
            onClose();
          }}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-semibold text-slate-200 hover:text-white min-h-[44px]"
        >
          <div className="flex items-center gap-2.5">
            <Compass className="h-4 w-4 text-amber-500" />
            <span>Anonymous Discovery</span>
          </div>
          <Badge variant="amber" className="text-[10px]">
            New
          </Badge>
        </button>

        {/* Subscribed Feeds */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
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
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Rss className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{feed.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {feed.folder}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Button
            variant="amber"
            onClick={() => {
              onClose();
              onOpenAddFeed();
            }}
            className="w-full gap-2 min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            <span>Subscribe to New Feed</span>
          </Button>

          <Button
            variant="outline"
            onClick={syncAllFeeds}
            isLoading={isSyncing}
            className="w-full gap-2 min-h-[44px]"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh All Feeds</span>
          </Button>
        </div>
      </div>
    </Sheet>
  );
};
