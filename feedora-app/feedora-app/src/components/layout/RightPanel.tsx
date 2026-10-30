import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useFeeds } from '../../context/FeedContext';
import { AnonymousDiscovery } from '../discovery/AnonymousDiscovery';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  ListMusic,
  Compass,
  Play,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const RightPanel: React.FC = () => {
  const { queue, removeFromQueue, playArticle } = useAudio();
  const { articles } = useFeeds();
  const [activeTab, setActiveTab] = useState<'queue' | 'discovery'>('discovery');

  const handlePlayQueueItem = (articleId: string) => {
    const article = articles.find((a) => a.id === articleId);
    if (article) {
      playArticle(article);
    }
  };

  return (
    <aside className="hidden xl:flex w-80 flex-col border-l border-slate-800/80 bg-slate-950/60 backdrop-blur-xl p-4 min-h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      {/* Tab Switcher: Discovery vs Audio Queue */}
      <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 mb-5">
        <button
          onClick={() => setActiveTab('discovery')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
            activeTab === 'discovery'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Discover</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
            activeTab === 'queue'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ListMusic className="h-3.5 w-3.5" />
          <span>Audio Queue</span>
          {queue.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[9px] rounded-full bg-emerald-500 text-slate-950 font-bold">
              {queue.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'discovery' ? (
        <AnonymousDiscovery />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            <span>Play Later Queue</span>
            <span className="text-[10px] font-mono text-emerald-400">{queue.length} articles</span>
          </div>

          {queue.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center space-y-2 bg-slate-900/30">
              <ListMusic className="h-6 w-6 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Your audio queue is empty.</p>
              <p className="text-[11px] text-slate-500">
                Click "+" on any story to stack articles for uninterrupted narration.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {queue.map((item, idx) => (
                <div
                  key={item.id}
                  className="group p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-white line-clamp-2 leading-snug">
                      {item.title}
                    </span>
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from queue"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="text-amber-400/80 font-mono truncate max-w-[120px]">
                      {item.feedTitle}
                    </span>
                    <button
                      onClick={() => handlePlayQueueItem(item.articleId)}
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Play Now</span>
                    </button>
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
