import React from 'react';
import { Article } from '../../types';
import { useFeeds } from '../../context/FeedContext';
import { useAudio } from '../../context/AudioContext';
import { Badge } from '../ui/badge';
import { timeAgo } from '../../lib/utils';
import {
  Headphones,
  Bookmark,
  Clock,
  CheckCircle2,
  Play,
  Pause,
  ExternalLink,
  Plus,
} from 'lucide-react';

export interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const { setReadingArticle, markAsRead, toggleBookmark } = useFeeds();
  const { currentArticle, playbackState, playArticle, togglePlayPause, addToQueue } = useAudio();

  const isCurrentAudio = currentArticle?.id === article.id;
  const isAudioPlaying = isCurrentAudio && playbackState === 'playing';

  const handleOpenReader = () => {
    setReadingArticle(article);
  };

  const handleToggleTTS = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentAudio) {
      togglePlayPause();
    } else {
      playArticle(article);
    }
  };

  const handleQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(article);
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
    <div
      onClick={handleOpenReader}
      className={`group relative rounded-2xl border transition-all duration-300 p-5 cursor-pointer flex flex-col justify-between space-y-3.5 select-none ${
        article.isRead
          ? 'border-slate-800/60 bg-slate-950/40 hover:bg-slate-900/50 hover:border-slate-700/80'
          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-amber-500/40 shadow-lg shadow-black/20'
      }`}
    >
      {/* Top Meta Header */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {/* Unread Amber Indicator dot */}
          {!article.isRead && (
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" title="Unread" />
          )}
          <span className="font-semibold text-amber-400 font-mono truncate max-w-[140px] sm:max-w-[200px]">
            {article.feedTitle}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 shrink-0 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.estimatedReadMinutes}m read
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
      </div>

      {/* Main Title & Excerpt */}
      <div className="space-y-1.5">
        <h3
          className={`text-base font-bold tracking-tight leading-snug transition-colors line-clamp-2 ${
            article.isRead ? 'text-slate-300 group-hover:text-white' : 'text-white group-hover:text-amber-300'
          }`}
        >
          {article.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>
      </div>

      {/* Bottom Action Toolbar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        {/* Listen to Article TTS Trigger */}
        <button
          onClick={handleToggleTTS}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all duration-200 min-h-[36px] ${
            isAudioPlaying
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white'
          }`}
        >
          {isAudioPlaying ? (
            <>
              <Pause className="h-3.5 w-3.5 fill-current" />
              <span>Playing Audio</span>
            </>
          ) : (
            <>
              <Headphones className="h-3.5 w-3.5 text-emerald-400" />
              <span>Listen</span>
            </>
          )}
        </button>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={handleQueue}
            title="Add to Play Later Audio Queue"
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>

          <button
            onClick={handleBookmark}
            title={article.isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
            className={`p-1.5 rounded-lg transition-colors ${
              article.isBookmarked
                ? 'text-amber-400 hover:bg-amber-500/10'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${article.isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {!article.isRead && (
            <button
              onClick={handleMarkRead}
              title="Mark as Read"
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-emerald-400 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}

          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open original website"
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
