import React, { useState } from 'react';
import { useFeeds } from '../../context/FeedContext';
import { AnonymousDiscovery } from '../discovery/AnonymousDiscovery';
import { timeAgo } from '../../lib/utils';
import {
  Compass,
  Bookmark,
  ExternalLink,
  BookOpen,
  Trash2,
} from 'lucide-react';

export const RightPanel: React.FC = () => {
  const { articles, setReadingArticle, toggleBookmark } = useFeeds();
  const [activeTab, setActiveTab] = useState<'discovery' | 'bookmarks'>('discovery');

  const bookmarkedArticles = articles.filter((a) => a.isBookmarked);

  return (
    <aside className="hidden xl:flex w-80 flex-col border-l border-theme-border bg-theme-surface p-4 min-h-[calc(100vh-93px)] sticky top-[93px] overflow-y-auto select-none transition-colors duration-200">
      {/* Tab Switcher: Discovery vs Saved Dispatches */}
      <div className="flex p-1 rounded-xl bg-theme-elevated border border-theme-border mb-5">
        <button
          onClick={() => setActiveTab('discovery')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-editorial font-semibold transition-all min-h-[36px] ${
            activeTab === 'discovery'
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs font-bold'
              : 'text-theme-muted hover:text-theme-heading'
          }`}
        >
          <Compass className="h-3.5 w-3.5 text-amber-500" />
          <span>Discover</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-editorial font-semibold transition-all min-h-[36px] ${
            activeTab === 'bookmarks'
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs font-bold'
              : 'text-theme-muted hover:text-theme-heading'
          }`}
        >
          <Bookmark className="h-3.5 w-3.5 text-emerald-500" />
          <span>Saved</span>
          {bookmarkedArticles.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[9px] rounded-full bg-emerald-500 text-slate-950 font-bold font-mono">
              {bookmarkedArticles.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'discovery' ? (
        <AnonymousDiscovery />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-theme-muted px-1 font-editorial">
            <span>Saved Dispatches</span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {bookmarkedArticles.length} saved
            </span>
          </div>

          {bookmarkedArticles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-theme-border p-8 text-center space-y-2 bg-theme-surface/50">
              <Bookmark className="h-6 w-6 text-theme-muted mx-auto" />
              <p className="text-xs text-theme-muted font-editorial">No saved dispatches.</p>
              <p className="text-[11px] text-theme-muted font-serif italic">
                Click the bookmark icon on any article to keep it saved for later offline reading.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {bookmarkedArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setReadingArticle(art)}
                  className="group p-3 rounded-xl border border-theme-border bg-theme-elevated hover:bg-theme-surface hover:border-amber-500/40 transition-all text-xs space-y-2 cursor-pointer shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-editorial font-bold text-theme-heading line-clamp-2 leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                      {art.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(art.id);
                      }}
                      className="p-1 text-theme-muted hover:text-rose-500 transition-colors shrink-0"
                      title="Remove bookmark"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-theme-muted pt-1 border-t border-theme-subtle">
                    <span className="text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold truncate max-w-[120px]">
                      {art.feedTitle}
                    </span>
                    <div className="flex items-center gap-1.5 font-serif italic text-[10px]">
                      <span>{timeAgo(art.publishedAt)}</span>
                      <BookOpen className="h-3 w-3 text-amber-500" />
                    </div>
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
