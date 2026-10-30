import React, { useState, useEffect, useRef } from 'react';
import { useFeeds } from '../../context/FeedContext';
import { useAudio } from '../../context/AudioContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { timeAgo, formatDuration } from '../../lib/utils';
import {
  X,
  Play,
  Pause,
  Bookmark,
  ExternalLink,
  Clock,
  User,
  ShieldCheck,
  Headphones,
  Type,
  Plus,
  Minus,
} from 'lucide-react';

export const ReaderView: React.FC = () => {
  const { readingArticle, setReadingArticle, toggleBookmark, markAsRead } = useFeeds();
  const {
    currentArticle,
    playbackState,
    activeParagraphIndex,
    playArticle,
    togglePlayPause,
    seekToParagraph,
    addToQueue,
  } = useAudio();

  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [isSerif, setIsSerif] = useState<boolean>(true);
  const activeParagraphRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (readingArticle) {
      markAsRead(readingArticle.id);
    }
  }, [readingArticle]);

  // Auto-scroll to active paragraph during narration
  useEffect(() => {
    if (
      currentArticle?.id === readingArticle?.id &&
      playbackState === 'playing' &&
      activeParagraphRef.current
    ) {
      activeParagraphRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeParagraphIndex, currentArticle?.id, readingArticle?.id, playbackState]);

  if (!readingArticle) return null;

  const isCurrentAudio = currentArticle?.id === readingArticle.id;
  const isAudioPlaying = isCurrentAudio && playbackState === 'playing';

  const fontClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base sm:text-lg leading-relaxed sm:leading-loose',
    lg: 'text-lg sm:text-xl leading-relaxed sm:leading-loose',
    xl: 'text-xl sm:text-2xl leading-relaxed sm:leading-loose',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between animate-fade-in">
      {/* Sticky Top Reader Action Bar */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setReadingArticle(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-900 border border-slate-800 transition-colors min-h-[40px]"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Close</span>
          </button>

          <Badge variant="amber" className="hidden sm:inline-flex gap-1 py-1 font-mono">
            <span>{readingArticle.feedTitle}</span>
          </Badge>

          {/* Security Sanitization Badge */}
          <Badge variant="emerald" className="gap-1 py-1 text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>DOMPurify Sanitized</span>
          </Badge>
        </div>

        {/* Reader Customization & Audio Actions */}
        <div className="flex items-center gap-2">
          {/* TTS Listen Action Button */}
          <Button
            variant={isAudioPlaying ? 'emerald' : 'amber'}
            size="sm"
            onClick={() => {
              if (isCurrentAudio) {
                togglePlayPause();
              } else {
                playArticle(readingArticle);
              }
            }}
            className="gap-2 shadow-lg min-h-[40px]"
          >
            {isAudioPlaying ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                <span>Pause Narration</span>
              </>
            ) : (
              <>
                <Headphones className="h-4 w-4" />
                <span>Listen to Article</span>
              </>
            )}
          </Button>

          {/* Add to Queue */}
          <button
            onClick={() => addToQueue(readingArticle)}
            title="Add to Audio Play Later Queue"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 border border-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={() => toggleBookmark(readingArticle.id)}
            aria-label="Bookmark article"
            className={`p-2 rounded-xl border border-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
              readingArticle.isBookmarked
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${readingArticle.isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Font Type Switcher (Serif / Sans) */}
          <button
            onClick={() => setIsSerif(!isSerif)}
            title="Toggle Serif / Sans Font"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 border border-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center font-serif text-sm font-bold"
          >
            Aa
          </button>

          {/* Outbound Link */}
          <a
            href={readingArticle.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View original article on publisher site"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 border border-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Reader Main Content Container */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-8 py-8 sm:py-12">
        {/* Article Meta Header */}
        <div className="space-y-4 pb-8 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="font-semibold text-amber-400 font-mono">{readingArticle.feedTitle}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readingArticle.estimatedReadMinutes} min read ({timeAgo(readingArticle.publishedAt)})
            </span>
            {readingArticle.author && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {readingArticle.author}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {readingArticle.title}
          </h1>

          {/* Active Audio Narration banner */}
          {isCurrentAudio && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-semibold">
                  Feedora Audio Narration Active — Paragraph synced in real time
                </span>
              </div>
              <span className="text-[11px] font-mono opacity-80">
                Paragraph {activeParagraphIndex + 1} of {readingArticle.paragraphs.length}
              </span>
            </div>
          )}
        </div>

        {/* Article Body with Synchronized Paragraph Highlighting */}
        <article
          className={`pt-8 space-y-6 ${fontClasses[fontSize]} ${
            isSerif ? 'font-serif text-slate-200' : 'font-sans text-slate-200'
          }`}
        >
          {readingArticle.paragraphs.length > 0 ? (
            readingArticle.paragraphs.map((para, index) => {
              const isActive = isCurrentAudio && activeParagraphIndex === index;
              return (
                <p
                  key={index}
                  ref={isActive ? activeParagraphRef : null}
                  onClick={() => {
                    if (isCurrentAudio) {
                      seekToParagraph(index);
                    } else {
                      playArticle(readingArticle, index);
                    }
                  }}
                  className={`p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 border-l-4 border-emerald-400 text-white shadow-lg shadow-emerald-500/5 scale-[1.01]'
                      : 'hover:bg-slate-900/40 border-l-4 border-transparent'
                  }`}
                  title="Click to jump audio narration to this paragraph"
                >
                  {para}
                </p>
              );
            })
          ) : (
            // Raw Clean HTML Fallback
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: readingArticle.contentClean }}
            />
          )}
        </article>

        {/* End of article footer */}
        <div className="mt-16 pt-8 border-t border-slate-800 text-center space-y-4">
          <p className="text-xs text-slate-400 font-mono">
            Article cached in offline IndexedDB • Extracted with readability heuristics
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => setReadingArticle(null)}>
              Back to Timeline
            </Button>
            <a
              href={readingArticle.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-white transition-colors"
            >
              <span>Visit Original Publication</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
