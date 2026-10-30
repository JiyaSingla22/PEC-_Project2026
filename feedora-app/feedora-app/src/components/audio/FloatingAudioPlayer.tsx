import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useFeeds } from '../../context/FeedContext';
import { formatDuration } from '../../lib/utils';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  FastForward,
  ListMusic,
  X,
  Headphones,
  Maximize2,
  Sparkles,
} from 'lucide-react';

export const FloatingAudioPlayer: React.FC = () => {
  const {
    currentArticle,
    playbackState,
    currentTime,
    duration,
    playbackRate,
    volume,
    queue,
    activeSentence,
    togglePlayPause,
    stop,
    skip,
    setPlaybackRate,
    setVolume,
    playNextInQueue,
  } = useAudio();

  const { setReadingArticle } = useFeeds();

  const [isSpeedOpen, setIsSpeedOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!currentArticle || playbackState === 'idle') return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const rates = [0.75, 1.0, 1.25, 1.5, 2.0];

  const handleToggleMute = () => {
    if (isMuted) {
      setVolume(1.0);
      setIsMuted(false);
    } else {
      setVolume(0.0);
      setIsMuted(true);
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-2 sm:p-4 pointer-events-none animate-slide-up">
      <div className="max-w-4xl mx-auto pointer-events-auto rounded-2xl border border-slate-800/90 bg-slate-950/90 backdrop-blur-2xl shadow-2xl shadow-emerald-500/10 overflow-hidden">
        {/* Top Mini Progress Scrub Bar */}
        <div className="relative h-1.5 w-full bg-slate-800/80 cursor-pointer group">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Player Controls Inner Container */}
        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Article Info & Live Spoken Sentence preview */}
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            <button
              onClick={() => setReadingArticle(currentArticle)}
              aria-label="Open Reader View"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 hover:scale-105 transition-transform"
            >
              <Headphones className={`h-5 w-5 ${playbackState === 'playing' ? 'animate-pulse' : ''}`} />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                {playbackState === 'playing' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  {currentArticle.feedTitle}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
              </div>
              <h4
                onClick={() => setReadingArticle(currentArticle)}
                className="text-xs sm:text-sm font-semibold text-white truncate cursor-pointer hover:text-emerald-300 transition-colors"
                title={currentArticle.title}
              >
                {currentArticle.title}
              </h4>
              {/* Spoken subtitle snippet */}
              {activeSentence && (
                <p className="text-[11px] text-emerald-400/80 truncate italic hidden sm:block">
                  "{activeSentence}"
                </p>
              )}
            </div>
          </div>

          {/* Primary Audio Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Skip -10s */}
            <button
              onClick={() => skip(-10)}
              aria-label="Skip backward 10 seconds"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Play / Pause Toggle Button */}
            <button
              onClick={togglePlayPause}
              aria-label={playbackState === 'playing' ? 'Pause narration' : 'Resume narration'}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 transition-transform active:scale-95"
            >
              {playbackState === 'playing' ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Skip +10s */}
            <button
              onClick={() => skip(10)}
              aria-label="Skip forward 10 seconds"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            {/* Playback Rate / Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setIsSpeedOpen(!isSpeedOpen)}
                className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 min-h-[44px] flex items-center"
              >
                {playbackRate}x
              </button>

              {isSpeedOpen && (
                <div className="absolute bottom-12 right-0 p-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col gap-1 z-50">
                  {rates.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setPlaybackRate(r);
                        setIsSpeedOpen(false);
                      }}
                      className={`px-3 py-1.5 text-xs rounded-lg font-mono text-left transition-colors ${
                        playbackRate === r
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Volume / Mute */}
            <button
              onClick={handleToggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors hidden sm:flex items-center justify-center min-h-[44px] min-w-[44px]"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* Queue Toggle Pill */}
            {queue.length > 0 && (
              <button
                onClick={() => setIsQueueOpen(!isQueueOpen)}
                className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                title={`${queue.length} articles in audio queue`}
              >
                <ListMusic className="h-4 w-4" />
                <span className="absolute top-1 right-1 px-1 text-[9px] rounded-full bg-emerald-500 text-slate-950 font-bold">
                  {queue.length}
                </span>
              </button>
            )}

            {/* Maximize to Reader View */}
            <button
              onClick={() => setReadingArticle(currentArticle)}
              aria-label="Maximize to reader view"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors hidden md:flex items-center justify-center min-h-[44px] min-w-[44px]"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* Close / Stop */}
            <button
              onClick={stop}
              aria-label="Close audio player"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Dropdown Mini Queue Preview */}
        {isQueueOpen && queue.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-950/95 space-y-2 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Up Next in Audio Queue</span>
              <button onClick={playNextInQueue} className="text-emerald-400 hover:underline text-[11px] font-mono">
                Skip to Next
              </button>
            </div>
            {queue.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div className="truncate pr-2">
                  <span className="font-mono text-[10px] text-emerald-400 mr-2">#{idx + 1}</span>
                  <span className="text-white font-medium">{item.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {item.estimatedReadMinutes}m read
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
