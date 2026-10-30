import React, { useMemo, useState } from 'react';
import { useFeeds } from '../../context/FeedContext';
import { ArticleCard } from './ArticleCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Rss,
  CheckCheck,
  RefreshCw,
  Inbox,
  LayoutGrid,
  Rows,
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

  return (
    <div className="space-y-6">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-theme-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-editorial font-bold text-theme-heading tracking-tight flex items-center gap-2">
              <Rss className="h-5 w-5 text-amber-500" />
              <span>
                {activeFilter === 'all'
                  ? activeFolder === 'all'
                    ? 'The Daily Chronicle'
                    : `Section: ${activeFolder}`
                  : activeFilter === 'unread'
                  ? 'Unread Dispatches'
                  : activeFilter === 'bookmarks'
                  ? 'Saved Archives'
                  : activeFeedObj?.title || 'Feed Dispatches'}
              </span>
            </h2>
            <Badge variant="amber" className="font-mono text-xs">
              {filteredArticles.length}
            </Badge>
          </div>
          <p className="text-xs text-theme-muted font-serif italic">
            Chronological editorial stream parsed in-browser and cached in offline IndexedDB.
          </p>
        </div>

        {/* Layout Mode Toggle & Sync Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Broadsheet vs Stream Layout Selector */}
          <div className="flex items-center p-1 rounded-xl bg-theme-elevated border border-theme-border">
            <button
              onClick={() => setLayoutMode('broadsheet')}
              title="Broadsheet 2-Column Grid"
              className={`p-1.5 rounded-lg transition-colors ${
                layoutMode === 'broadsheet'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold'
                  : 'text-theme-muted hover:text-theme-heading'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('stream')}
              title="Single Column Editorial Stream"
              className={`p-1.5 rounded-lg transition-colors ${
                layoutMode === 'stream'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold'
                  : 'text-theme-muted hover:text-theme-heading'
              }`}
            >
              <Rows className="h-3.5 w-3.5" />
            </button>
          </div>

          <Button
            variant="glass"
            size="sm"
            onClick={syncAllFeeds}
            isLoading={isSyncing}
            className="text-xs gap-1.5 min-h-[38px] font-serif font-bold"
            title="Refresh feeds via CORS proxy"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-amber-500' : ''}`} />
            <span>{isSyncing ? `Syncing (${syncProgress.current}/${syncProgress.total})` : 'Sync'}</span>
          </Button>

          {unreadTotal > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs gap-1.5 min-h-[38px] font-serif"
              title="Mark all current articles as read"
            >
              <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Mark Read</span>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Filter Tabs with Editorial Style */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 font-serif">
        {[
          { id: 'all', label: 'All Dispatches', count: articles.length },
          { id: 'unread', label: 'Unread', count: unreadTotal },
          { id: 'bookmarks', label: 'Saved Bookmarks', count: articles.filter((a) => a.isBookmarked).length },
        ].map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
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

      {/* Feed Cards Grid / Broadsheet Stream */}
      {filteredArticles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-theme-border p-12 text-center space-y-3 bg-theme-surface/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-elevated text-amber-500 mx-auto">
            <Inbox className="h-6 w-6" />
          </div>
          <h4 className="text-base font-editorial font-bold text-theme-heading">No stories match your filter</h4>
          <p className="text-xs text-theme-muted font-serif max-w-sm mx-auto">
            {searchQuery
              ? `No articles found matching "${searchQuery}". Try a different keyword.`
              : 'You have read all articles or haven’t added any feeds yet in this view.'}
          </p>
          {activeFilter !== 'all' && (
            <Button variant="outline" size="sm" onClick={() => setActiveFilter('all')}>
              Reset Filter to All
            </Button>
          )}
        </div>
      ) : (
        <div
          className={
            layoutMode === 'broadsheet'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5'
              : 'space-y-4 max-w-3xl mx-auto'
          }
        >
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
};
