import React, { useMemo } from 'react';
import { useFeeds } from '../../context/FeedContext';
import { ArticleCard } from './ArticleCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Rss,
  CheckCheck,
  RefreshCw,
  Search,
  Filter,
  Bookmark,
  Layers,
  Inbox,
  Flame,
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
      {/* Timeline Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Rss className="h-5 w-5 text-amber-500" />
              <span>
                {activeFilter === 'all'
                  ? activeFolder === 'all'
                    ? 'Unified Timeline'
                    : `Folder: ${activeFolder}`
                  : activeFilter === 'unread'
                  ? 'Unread Articles'
                  : activeFilter === 'bookmarks'
                  ? 'Bookmarked Stories'
                  : activeFeedObj?.title || 'Feed Articles'}
              </span>
            </h2>
            <Badge variant="amber" className="font-mono text-xs">
              {filteredArticles.length}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Chronological privacy-first stream parsed client-side and saved to IndexedDB.
          </p>
        </div>

        {/* Sync & Mark Read Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="glass"
            size="sm"
            onClick={syncAllFeeds}
            isLoading={isSyncing}
            className="text-xs gap-1.5 min-h-[38px]"
            title="Refresh feeds via CORS proxy"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isSyncing ? `Syncing (${syncProgress.current}/${syncProgress.total})` : 'Sync'}</span>
          </Button>

          {unreadTotal > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs gap-1.5 text-slate-300 hover:text-white min-h-[38px]"
            >
              <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Mark All Read</span>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'All Stories', count: articles.length },
          { id: 'unread', label: 'Unread', count: unreadTotal },
          { id: 'bookmarks', label: 'Bookmarks', count: articles.filter((a) => a.isBookmarked).length },
        ].map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
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
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-3 bg-slate-900/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 text-amber-500 mx-auto">
            <Inbox className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold text-white">No stories match your filter</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
};
