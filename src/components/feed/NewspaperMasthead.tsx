import React from 'react';
import { useFeeds } from '../../context/FeedContext';
import { ShieldCheck } from 'lucide-react';

export interface NewspaperMastheadProps {
  onOpenAddFeed: () => void;
  onExploreDiscovery: () => void;
}

export const NewspaperMasthead: React.FC<NewspaperMastheadProps> = ({
  onOpenAddFeed,
  onExploreDiscovery,
}) => {
  const { articles, feeds } = useFeeds();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date()).toUpperCase();

  const unreadCount = articles.filter((a) => !a.isRead).length;

  return (
    <section className="w-full mb-8 pt-2 pb-6 border-b-2 border-theme-rule select-none">
      {/* Top Ear Pieces (Left & Right Dispatch Badges) */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-theme-subtle pb-2.5 mb-4 text-[10px] text-slate-600 dark:text-slate-400 font-mono gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider border border-amber-500/30">
            Special Edition
          </span>
          <span className="font-bold">VOL. CLXXV • NO. 59,820 • CITY EDITION</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" /> DOMPurify Safe
          </span>
          <span className="opacity-30">•</span>
          <span>IndexedDB Cache</span>
          <span className="opacity-30">•</span>
          <span className="font-bold text-slate-900 dark:text-slate-200">FREE & PRIVATE DISPATCH</span>
        </div>
      </div>

      {/* Grand Newspaper Masthead Title */}
      <div className="text-center space-y-1.5 my-3">
        <p className="text-[10px] sm:text-xs font-serif italic text-slate-600 dark:text-slate-400 tracking-widest uppercase">
          ✦ The Independent Broadsheet of the Open Web ✦
        </p>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-masthead tracking-wider text-slate-950 dark:text-slate-100 uppercase drop-shadow-xs">
          The IncogniRead Chronicle
        </h1>

        <p className="text-xs sm:text-sm font-editorial italic text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
          "All the web dispatches fit to read, sanitized client-side in private offline storage."
        </p>
      </div>

      {/* Double Hairline Editorial Rule */}
      <div className="newspaper-double-rule my-3 py-1.5 flex flex-wrap items-center justify-between text-xs text-theme-heading font-editorial gap-2">
        <div className="font-bold text-amber-700 dark:text-amber-400 tracking-wide uppercase text-[11px] font-mono">
          {formattedDate}
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400 font-serif">
          <span>{feeds.length} Subscriptions Active</span>
          <span>•</span>
          <span>{articles.length} Dispatches Recorded</span>
          {unreadCount > 0 && (
            <>
              <span>•</span>
              <span className="text-amber-700 dark:text-amber-400 font-semibold">{unreadCount} Unread Stories</span>
            </>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 font-serif">
          <button
            onClick={onOpenAddFeed}
            className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline uppercase tracking-wider"
          >
            + Subscribe Feed
          </button>
          <span className="opacity-30">|</span>
          <button
            onClick={onExploreDiscovery}
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline uppercase tracking-wider"
          >
            ✦ Discover Co-Feeds
          </button>
        </div>
      </div>
    </section>
  );
};
