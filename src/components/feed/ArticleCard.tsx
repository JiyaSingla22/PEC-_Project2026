import React, { useState, useEffect } from 'react';
import { Article } from '../../types';
import { useFeeds } from '../../context/FeedContext';
import { timeAgo } from '../../lib/utils';
import { getArticleHighlights } from '../../lib/highlights';
import {
  Bookmark,
  Clock,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Highlighter,
} from 'lucide-react';

export interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, featured = false }) => {
  const { setReadingArticle, markAsRead, toggleBookmark } = useFeeds();
  const [highlightCount, setHighlightCount] = useState<number>(() => {
    return getArticleHighlights(article.id).length;
  });

  useEffect(() => {
    const handleHighlightsChanged = (e: Event) => {
      const custom = e as CustomEvent<{ articleId: string }>;
      if (!custom.detail || custom.detail.articleId === article.id) {
        setHighlightCount(getArticleHighlights(article.id).length);
      }
    };
    window.addEventListener('incogniread-highlights-changed', handleHighlightsChanged);
    return () => window.removeEventListener('incogniread-highlights-changed', handleHighlightsChanged);
  }, [article.id]);

  const handleOpenReader = () => {
    setReadingArticle(article);
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
      className={`group relative rounded-2xl border-2 transition-all duration-300 p-4 sm:p-5 lg:p-6 cursor-pointer flex flex-col justify-between space-y-4 select-none ${
        featured ? 'md:col-span-2' : ''
      } ${
        article.isRead
          ? 'border-theme-border/60 bg-theme-surface/75 hover:bg-theme-surface hover:border-theme-border opacity-90'
          : 'border-theme-border bg-theme-surface hover:border-amber-500/70 shadow-lg shadow-black/5 hover:shadow-xl'
      }`}
    >
      {/* Top Editorial Eyebrow & Dateline */}
      <div className="flex items-center justify-between gap-2 text-xs border-b border-theme-subtle pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {!article.isRead && (
            <span
              className="h-2 w-2 rounded-full bg-amber-500 shrink-0 shadow-xs ring-2 ring-amber-500/20"
              title="Unread Dispatch"
            />
          )}
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 truncate max-w-[160px] sm:max-w-[240px]">
            {article.feedTitle}
          </span>
          <span className="text-slate-400 opacity-60">•</span>
          <span className="text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1 font-mono text-[11px]">
            <Clock className="h-3 w-3" />
            {article.estimatedReadMinutes}m read
          </span>
          {highlightCount > 0 && (
            <>
              <span className="text-slate-400 opacity-60 hidden sm:inline">•</span>
              <span
                className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30"
                title={`${highlightCount} words or phrases highlighted by you`}
              >
                <Highlighter className="h-2.5 w-2.5" />
                <span>{highlightCount} highlighted</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 text-slate-500 dark:text-slate-400 font-serif italic text-[11px]">
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
      </div>

      {/* Main Headline & Excerpt */}
      <div className="space-y-2">
        <h3
          className={`font-editorial font-bold tracking-tight leading-snug transition-colors line-clamp-2 ${
            featured ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-lg sm:text-xl'
          } ${
            article.isRead
              ? 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'
              : 'text-slate-950 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400'
          }`}
        >
          {article.title}
        </h3>

        <p className="font-serif text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
          {article.excerpt}
        </p>

        {article.author && (
          <p className="text-[11px] font-serif italic text-slate-500 dark:text-slate-400">
            By <span className="font-semibold text-slate-700 dark:text-slate-300">{article.author}</span>
          </p>
        )}
      </div>

      {/* Bottom Editorial Actions Deck */}
      <div className="pt-3 border-t border-theme-subtle flex items-center justify-between gap-2">
        {/* Read Dispatch Action Button */}
        <button
          onClick={handleOpenReader}
          aria-label="Read full dispatch"
          className="px-3.5 py-1.5 rounded-xl text-xs font-editorial font-bold flex items-center gap-2 transition-all min-h-[36px] bg-theme-elevated text-slate-800 dark:text-slate-200 hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-300 border border-theme-border/60 group/btn"
          title="Open distraction-free broadsheet reader"
        >
          <span>Read Dispatch</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 text-amber-500" />
        </button>

        {/* Secondary Utility Controls */}
        <div className="flex items-center gap-1">
          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            aria-label={article.isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
            className={`p-2 rounded-lg transition-colors ${
              article.isBookmarked
                ? 'text-amber-500 bg-amber-500/10'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-theme-elevated'
            }`}
            title={article.isBookmarked ? 'Bookmarked' : 'Save bookmark'}
          >
            <Bookmark className={`h-4 w-4 ${article.isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Mark as Read Toggle */}
          <button
            onClick={handleMarkRead}
            aria-label={article.isRead ? 'Mark as unread' : 'Mark as read'}
            className={`p-2 rounded-lg transition-colors ${
              article.isRead
                ? 'text-emerald-600 dark:text-emerald-400 hover:bg-theme-elevated'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-theme-elevated'
            }`}
            title={article.isRead ? 'Dispatch Read' : 'Mark Read'}
          >
            <CheckCircle2 className={`h-4 w-4 ${article.isRead ? 'fill-current' : ''}`} />
          </button>

          {/* External Source Link */}
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Open original dispatch"
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-theme-elevated transition-colors"
            title="Open original web URL"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
};
