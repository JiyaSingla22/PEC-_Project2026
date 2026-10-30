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
} from 'lucide-react';

export interface SidebarProps {
  onOpenAddFeed: () => void;
  onOpenDiscovery?: () => void;
  onOpenOPML?: () => void;
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
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-theme-border bg-theme-surface p-4 min-h-[calc(100vh-93px)] sticky top-[93px] overflow-y-auto select-none transition-colors duration-200">
      <div className="space-y-6">
        {/* Core Views Filter */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-editorial font-bold uppercase tracking-widest text-slate-700 dark:text-slate-400 mb-2">
            Dispatches Index
          </p>

          <button
            onClick={() => {
              setActiveFilter('all');
              setActiveFolder('all');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-editorial font-semibold transition-all min-h-[40px] ${
              activeFilter === 'all' && activeFolder === 'all'
                ? 'bg-amber-500/15 border border-amber-500/40 text-slate-950 dark:text-amber-300 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-theme-elevated border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="h-4 w-4 text-amber-500" />
              <span>All Stories</span>
            </div>
            <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 font-bold">{articles.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter('unread')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-editorial font-semibold transition-all min-h-[40px] ${
              activeFilter === 'unread'
                ? 'bg-amber-500/15 border border-amber-500/40 text-slate-950 dark:text-amber-300 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-theme-elevated border border-transparent'
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
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-editorial font-semibold transition-all min-h-[40px] ${
              activeFilter === 'bookmarks'
                ? 'bg-amber-500/15 border border-amber-500/40 text-slate-950 dark:text-amber-300 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-theme-elevated border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className="h-4 w-4 text-amber-500" />
              <span>Saved Bookmarks</span>
            </div>
            <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 font-bold">
              {articles.filter((a) => a.isBookmarked).length}
            </span>
          </button>
        </div>

        {/* Subscriptions & Folders Hierarchy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3 text-[10px] font-editorial font-bold uppercase tracking-widest text-slate-700 dark:text-slate-400">
            <span>Subscriptions ({feeds.length})</span>
            <button
              onClick={onOpenAddFeed}
              aria-label="Add new subscription"
              className="p-1 hover:text-amber-500 transition-colors"
              title="Add Feed"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {folders.map((folder) => {
              const folderFeeds = feeds.filter((f) => f.folder === folder.name);
              const isExpanded = expandedFolders[folder.name] ?? true;
              const isFolderActive = activeFolder === folder.name;

              return (
                <div key={folder.id} className="space-y-0.5">
                  <div
                    onClick={() => {
                      setActiveFolder(folder.name);
                      setActiveFilter('folder');
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-serif cursor-pointer transition-all ${
                      isFolderActive
                        ? 'bg-amber-500/15 text-slate-950 dark:text-amber-300 font-bold border border-amber-500/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-theme-elevated hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder(folder.name);
                        }}
                        className="text-slate-400 hover:text-amber-500 p-0.5"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </button>
                      <FolderIcon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      {folderFeeds.length}
                    </span>
                  </div>

                  {/* Child Feeds */}
                  {isExpanded && (
                    <div className="ml-4 pl-2 border-l border-theme-border/60 space-y-0.5 mt-0.5">
                      {folderFeeds.map((feed) => {
                        const isFeedActive = activeFilter === feed.id;
                        const feedArticleCount = articles.filter(
                          (a) => a.feedId === feed.id
                        ).length;

                        return (
                          <div
                            key={feed.id}
                            onClick={() => {
                              setActiveFilter(feed.id);
                              setActiveFolder('all');
                            }}
                            className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-serif cursor-pointer transition-all ${
                              isFeedActive
                                ? 'bg-amber-500/15 text-slate-950 dark:text-amber-300 font-bold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-theme-elevated'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate min-w-0 pr-1">
                              {feed.iconUrl ? (
                                <img
                                  src={feed.iconUrl}
                                  alt=""
                                  className="h-3.5 w-3.5 rounded-xs shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Rss className="h-3 w-3 text-amber-500 shrink-0" />
                              )}
                              <span className="truncate">{feed.title}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-mono text-[9px] text-slate-500 dark:text-slate-400 font-bold">
                                {feedArticleCount}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Remove subscription to "${feed.title}"?`)) {
                                    deleteFeed(feed.id);
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 transition-opacity"
                                title="Delete Feed"
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

      {/* Footer Utility Links */}
      <div className="pt-4 border-t border-theme-border/70 space-y-2">
        {onOpenDiscovery && (
          <button
            onClick={onOpenDiscovery}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-editorial font-bold text-slate-700 dark:text-slate-300 hover:bg-theme-elevated hover:text-amber-500 transition-colors border border-theme-border/60"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Browse Co-Feeds</span>
            </div>
            <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold">Explore</span>
          </button>
        )}

        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono px-1">
          <span>IncogniRead v2.4</span>
          <span>100% Offline DB</span>
        </div>
      </div>
    </aside>
  );
};
