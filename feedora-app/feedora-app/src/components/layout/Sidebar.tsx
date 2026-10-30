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
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAddFeed }) => {
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
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl p-4 min-h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="space-y-6">
        {/* Core Views Filter */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Timeline Views
          </p>

          <button
            onClick={() => {
              setActiveFilter('all');
              setActiveFolder('all');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[40px] ${
              activeFilter === 'all' && activeFolder === 'all'
                ? 'bg-amber-500/15 border border-amber-500/30 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="h-4 w-4 text-amber-500" />
              <span>All Stories</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">{articles.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter('unread')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[40px] ${
              activeFilter === 'unread'
                ? 'bg-amber-500/15 border border-amber-500/30 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
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
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[40px] ${
              activeFilter === 'bookmarks'
                ? 'bg-amber-500/15 border border-amber-500/30 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className="h-4 w-4 text-amber-400" />
              <span>Saved Bookmarks</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              {articles.filter((a) => a.isBookmarked).length}
            </span>
          </button>
        </div>

        {/* Folders & Feeds Tree */}
        <div className="space-y-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between px-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Subscriptions ({feeds.length})
            </p>
            <button
              onClick={onOpenAddFeed}
              className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
              title="Add feed"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {folders.map((folder) => {
              const folderFeeds = feeds.filter((f) => f.folder === folder.name);
              const isExpanded = expandedFolders[folder.name] ?? true;
              const isFolderActive = activeFolder === folder.name;

              return (
                <div key={folder.id} className="space-y-1">
                  {/* Folder Header */}
                  <div
                    onClick={() => {
                      setActiveFolder(folder.name);
                      setActiveFilter('all');
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      isFolderActive
                        ? 'bg-slate-800/80 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder(folder.name);
                        }}
                        className="text-slate-500 hover:text-white"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <FolderIcon className="h-3.5 w-3.5 text-amber-500/80" />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {folderFeeds.length}
                    </span>
                  </div>

                  {/* Feeds under this folder */}
                  {isExpanded && (
                    <div className="pl-6 space-y-0.5">
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
                            className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                              isFeedActive
                                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
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
                                <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-300 font-mono">
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
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
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
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>Feedora v1.0 Offline</span>
        </p>
        <p className="text-[10px] leading-tight">
          Client-side IndexedDB persistent storage. Zero external browsing logs.
        </p>
      </div>
    </aside>
  );
};
