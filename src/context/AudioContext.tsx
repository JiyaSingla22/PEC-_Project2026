import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Article, AudioQueueItem, PlaybackState } from '../types';
import {
  getAudioQueueFromDB,
  addToAudioQueueInDB,
  removeFromAudioQueueInDB,
  savePlaybackProgressInDB,
  getPlaybackProgressFromDB,
} from '../lib/db';
import { generateId } from '../lib/utils';

export interface AudioContextValue {
  currentArticle: Article | null;
  playbackState: PlaybackState;
  activeParagraphIndex: number;
  activeSentence: string;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  queue: AudioQueueItem[];
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  playArticle: (article: Article, startParagraphIndex?: number) => void;
  togglePlayPause: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skip: (seconds: number) => void;
  seekToParagraph: (paragraphIndex: number) => void;
  seekToProgress: (percent: number) => void;
  nextParagraph: () => void;
  prevParagraph: () => void;
  previousParagraph: () => void;
  setPlaybackRate: (rate: number) => void;
  increaseSpeed: () => void;
  decreaseSpeed: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
  addToQueue: (article: Article) => Promise<void>;
  removeFromQueue: (itemId: string) => Promise<void>;
  playNextInQueue: () => void;
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number>(0);
  const [activeSentence, setActiveSentence] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setRate] = useState<number>(1.0);
  const [volume, setVol] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [queue, setQueue] = useState<AudioQueueItem[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Synchronous references to avoid React state closure staleness during speech utterance callbacks
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const speakTimeoutRef = useRef<any>(null);
  const isIntentionallyStoppingRef = useRef<boolean>(false);
  const durationRef = useRef<number>(0);
  const playNextInQueueRef = useRef<() => void>(() => {});

  const playbackRateRef = useRef<number>(1.0);
  const volumeRef = useRef<number>(1.0);
  const isMutedRef = useRef<boolean>(false);
  const preMuteVolumeRef = useRef<number>(1.0);
  const currentParagraphIndexRef = useRef<number>(0);
  const activeParagraphsRef = useRef<string[]>([]);
  const currentArticleRef = useRef<Article | null>(null);
  const playbackStateRef = useRef<PlaybackState>('idle');

  // Sync refs when states change
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    currentArticleRef.current = currentArticle;
  }, [currentArticle]);

  useEffect(() => {
    playbackStateRef.current = playbackState;
  }, [playbackState]);

  // Initialize SpeechSynthesis and load offline queue from IndexedDB
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        setAvailableVoices(voices);

        // Prefer high-quality natural editorial voices
        const defaultVoice =
          voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Premium'))) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];

        if (defaultVoice) setSelectedVoice(defaultVoice);
      };

      updateVoices();
      if (synthRef.current?.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = updateVoices;
      }
    }

    // Load persistent offline audio queue
    getAudioQueueFromDB()
      .then(setQueue)
      .catch((err) => console.warn('[AudioContext] Could not load offline audio queue:', err));

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      synthRef.current?.cancel();
    };
  }, []);

  // Keyboard shortcut: Spacebar toggles Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      if (e.code === 'Space' && currentArticleRef.current && playbackStateRef.current !== 'idle') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Periodic persistence of playback progress to IndexedDB
  useEffect(() => {
    if (!currentArticle || playbackState === 'idle') return;

    const interval = setInterval(() => {
      if (currentTime > 0 && duration > 0) {
        savePlaybackProgressInDB(currentArticle.id, currentTime, duration).catch(() => {});
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentArticle, currentTime, duration, playbackState]);

  // Plays a specific paragraph in sequence with explicit volume and rate overrides
  const speakParagraph = useCallback(
    (paragraphs: string[], index: number, overrideRate?: number, overrideVol?: number) => {
      if (!synthRef.current || index >= paragraphs.length) {
        setPlaybackState('ended');
        playbackStateRef.current = 'ended';
        setActiveSentence('');
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        return;
      }

      // Clear any pending speak timer
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }

      isIntentionallyStoppingRef.current = false;
      activeParagraphsRef.current = paragraphs;
      currentParagraphIndexRef.current = index;
      setActiveParagraphIndex(index);

      // Cancel any currently running speech
      try {
        synthRef.current.cancel();
      } catch (err) {
        console.warn('[AudioContext] cancel error:', err);
      }

      // 40ms micro-delay so Chromium audio pipeline resets cleanly before the new utterance
      speakTimeoutRef.current = setTimeout(() => {
        if (playbackStateRef.current !== 'playing') {
          return;
        }

        const paragraphText = paragraphs[index];
        if (!paragraphText || !paragraphText.trim()) {
          if (index + 1 < paragraphs.length) {
            speakParagraph(paragraphs, index + 1);
          } else {
            setPlaybackState('ended');
            playbackStateRef.current = 'ended';
          }
          return;
        }

        const utterance = new SpeechSynthesisUtterance(paragraphText);
        utteranceRef.current = utterance;
        (window as any).__activeUtterance = utterance; // Prevent premature GC in Chromium

        if (selectedVoice) utterance.voice = selectedVoice;

        const targetRate = overrideRate !== undefined ? overrideRate : playbackRateRef.current;
        const targetVol = overrideVol !== undefined ? overrideVol : (isMutedRef.current ? 0 : volumeRef.current);

        utterance.rate = Math.max(0.5, Math.min(2.5, targetRate));
        utterance.volume = Math.max(0, Math.min(1, targetVol));

        utterance.onboundary = (event) => {
          if (event.name === 'sentence' || event.name === 'word') {
            const charIndex = event.charIndex;
            const sentenceChunk = paragraphText.substring(charIndex, charIndex + 45);
            setActiveSentence(sentenceChunk);
          }
        };

        utterance.onend = () => {
          // If paused, stopped, or intentionally canceled, do NOT advance to next paragraph!
          if (isIntentionallyStoppingRef.current || playbackStateRef.current !== 'playing') {
            return;
          }

          if (currentParagraphIndexRef.current + 1 < paragraphs.length) {
            speakParagraph(paragraphs, currentParagraphIndexRef.current + 1);
          } else {
            setPlaybackState('ended');
            playbackStateRef.current = 'ended';
            setActiveSentence('');
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            playNextInQueueRef.current();
          }
        };

        utterance.onerror = (err) => {
          if (err.error === 'canceled' || err.error === 'interrupted') {
            return;
          }
          console.warn('[AudioContext] Utterance error:', err);
          if (playbackStateRef.current === 'playing') {
            setPlaybackState('paused');
            playbackStateRef.current = 'paused';
          }
        };

        synthRef.current?.speak(utterance);
      }, 40);
    },
    [selectedVoice]
  );

  const pause = useCallback(() => {
    // 1. Mark intentional stop flag so onend/onerror do not advance or retrigger speech
    isIntentionallyStoppingRef.current = true;

    // 2. Clear pending speak timeouts
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }

    // 3. Halt hardware audio output immediately
    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch (err) {
        console.warn('[AudioContext] pause cancel error:', err);
      }
    }

    // 4. Stop progression timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // 5. Update state
    setPlaybackState('paused');
    playbackStateRef.current = 'paused';
  }, []);

  const resume = useCallback(() => {
    const article = currentArticleRef.current;
    if (!article) return;

    isIntentionallyStoppingRef.current = false;

    const paragraphs =
      article.paragraphs && article.paragraphs.length > 0
        ? article.paragraphs
        : [article.title, article.excerpt].filter(Boolean);

    let targetIndex = currentParagraphIndexRef.current;
    if (playbackStateRef.current === 'ended' || targetIndex >= paragraphs.length) {
      targetIndex = 0;
      setCurrentTime(0);
    }

    setPlaybackState('playing');
    playbackStateRef.current = 'playing';

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setCurrentTime((prev) => Math.min(prev + 1, durationRef.current || 300));
    }, 1000);

    speakParagraph(paragraphs, targetIndex);
  }, [speakParagraph]);

  const togglePlayPause = useCallback(() => {
    if (playbackStateRef.current === 'playing') {
      pause();
    } else {
      resume();
    }
  }, [pause, resume]);

  const playArticle = useCallback(
    async (article: Article, startParagraphIndex = 0) => {
      if (!synthRef.current) {
        alert('Web Speech API is not supported in this browser.');
        return;
      }

      // If user clicked play on the exact article that is already loaded:
      if (currentArticleRef.current?.id === article.id) {
        if (startParagraphIndex !== undefined && startParagraphIndex !== currentParagraphIndexRef.current) {
          // Specific paragraph jump in reader view:
          setPlaybackState('playing');
          playbackStateRef.current = 'playing';
          speakParagraph(
            article.paragraphs && article.paragraphs.length > 0
              ? article.paragraphs
              : [article.title, article.excerpt].filter(Boolean),
            startParagraphIndex
          );
          return;
        }

        if (playbackStateRef.current === 'playing') {
          pause();
          return;
        } else {
          resume();
          return;
        }
      }

      // New article selected:
      isIntentionallyStoppingRef.current = true;
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      synthRef.current.cancel();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      setCurrentArticle(article);
      currentArticleRef.current = article;
      setPlaybackState('playing');
      playbackStateRef.current = 'playing';

      const totalWords = (article.paragraphs && article.paragraphs.length > 0 ? article.paragraphs.join(' ') : article.title + ' ' + article.excerpt)
        .split(/\s+/)
        .length;
      const estimatedDurationSeconds = Math.max(30, Math.round((totalWords / (150 * playbackRateRef.current)) * 60));
      setDuration(estimatedDurationSeconds);
      durationRef.current = estimatedDurationSeconds;

      const savedPosition = await getPlaybackProgressFromDB(article.id);
      if (savedPosition && startParagraphIndex === 0) {
        setCurrentTime(savedPosition);
      } else {
        setCurrentTime(0);
      }

      // Start tick timer
      timerIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => Math.min(prev + 1, estimatedDurationSeconds));
      }, 1000);

      const paragraphsToSpeak =
        article.paragraphs && article.paragraphs.length > 0
          ? article.paragraphs
          : [article.title, article.excerpt].filter(Boolean);

      speakParagraph(paragraphsToSpeak, startParagraphIndex);
    },
    [speakParagraph, pause, resume]
  );

  const stop = useCallback(() => {
    isIntentionallyStoppingRef.current = true;
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setPlaybackState('idle');
    playbackStateRef.current = 'idle';
    setActiveSentence('');
    setCurrentTime(0);
  }, []);

  const skip = useCallback(
    (secondsDelta: number) => {
      const article = currentArticleRef.current;
      if (!article) return;
      const paragraphs = article.paragraphs.length > 0
        ? article.paragraphs
        : [article.title, article.excerpt];

      const paragraphDelta = Math.sign(secondsDelta) * Math.max(1, Math.round(Math.abs(secondsDelta) / 18));
      const targetIndex = Math.max(0, Math.min(currentParagraphIndexRef.current + paragraphDelta, paragraphs.length - 1));

      setCurrentTime((prev) => Math.max(0, Math.min(prev + secondsDelta, duration)));
      speakParagraph(paragraphs, targetIndex);
    },
    [duration, speakParagraph]
  );

  const seekToParagraph = useCallback(
    (paragraphIndex: number) => {
      const article = currentArticleRef.current;
      if (!article) return;
      const paragraphs = article.paragraphs.length > 0
        ? article.paragraphs
        : [article.title, article.excerpt];
      const targetIndex = Math.max(0, Math.min(paragraphIndex, paragraphs.length - 1));

      if (paragraphs.length > 0 && duration > 0) {
        setCurrentTime(Math.round((targetIndex / paragraphs.length) * duration));
      }

      setPlaybackState('playing');
      playbackStateRef.current = 'playing';
      speakParagraph(paragraphs, targetIndex);
    },
    [duration, speakParagraph]
  );

  const seekToProgress = useCallback(
    (percent: number) => {
      const article = currentArticleRef.current;
      if (!article || duration <= 0) return;
      const clamped = Math.max(0, Math.min(100, percent));
      const targetTime = Math.round((clamped / 100) * duration);
      setCurrentTime(targetTime);

      const paragraphs = article.paragraphs.length > 0
        ? article.paragraphs
        : [article.title, article.excerpt];

      const targetParagraph = Math.floor((clamped / 100) * paragraphs.length);
      seekToParagraph(Math.min(targetParagraph, paragraphs.length - 1));
    },
    [duration, seekToParagraph]
  );

  const nextParagraph = useCallback(() => {
    seekToParagraph(currentParagraphIndexRef.current + 1);
  }, [seekToParagraph]);

  const prevParagraph = useCallback(() => {
    seekToParagraph(currentParagraphIndexRef.current - 1);
  }, [seekToParagraph]);

  // Synchronous and immediate speed changer
  const setPlaybackRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.5, Math.min(2.5, Number(rate.toFixed(2))));
    playbackRateRef.current = clampedRate;
    setRate(clampedRate);

    // If currently speaking, immediately cancel and restart at the new speed!
    if (synthRef.current && (playbackStateRef.current === 'playing' || synthRef.current.speaking)) {
      const paras = currentArticleRef.current?.paragraphs || activeParagraphsRef.current;
      if (paras && paras.length > 0) {
        const curVol = isMutedRef.current ? 0 : volumeRef.current;
        speakParagraph(paras, currentParagraphIndexRef.current, clampedRate, curVol);
      }
    }
  }, [speakParagraph]);

  const increaseSpeed = () => {
    setPlaybackRate(playbackRateRef.current + 0.25);
  };

  const decreaseSpeed = () => {
    setPlaybackRate(playbackRateRef.current - 0.25);
  };

  // Synchronous volume setter
  const setVolume = useCallback((vol: number) => {
    const clampedVol = Math.max(0, Math.min(1, vol));
    volumeRef.current = clampedVol;
    setVol(clampedVol);

    const newMuted = clampedVol === 0;
    isMutedRef.current = newMuted;
    setIsMuted(newMuted);

    if (clampedVol > 0) {
      preMuteVolumeRef.current = clampedVol;
    }

    if (synthRef.current && (playbackStateRef.current === 'playing' || synthRef.current.speaking)) {
      const paras = currentArticleRef.current?.paragraphs || activeParagraphsRef.current;
      if (paras && paras.length > 0) {
        speakParagraph(paras, currentParagraphIndexRef.current, playbackRateRef.current, clampedVol);
      }
    }
  }, [speakParagraph]);

  // Synchronous instant mute toggle
  const toggleMute = useCallback(() => {
    const currentlyMuted = isMutedRef.current;
    const newMuted = !currentlyMuted;

    isMutedRef.current = newMuted;
    setIsMuted(newMuted);

    let effectiveVol = 0;
    if (newMuted) {
      preMuteVolumeRef.current = volumeRef.current > 0 ? volumeRef.current : 1.0;
      effectiveVol = 0;
      setVol(0);
    } else {
      const restored = preMuteVolumeRef.current > 0 ? preMuteVolumeRef.current : 1.0;
      effectiveVol = restored;
      volumeRef.current = restored;
      setVol(restored);
    }

    // Immediately cancel and re-speak at the new volume level so the audio silences / restores instantly!
    if (synthRef.current && (playbackStateRef.current === 'playing' || synthRef.current.speaking)) {
      const paras = currentArticleRef.current?.paragraphs || activeParagraphsRef.current;
      if (paras && paras.length > 0) {
        speakParagraph(paras, currentParagraphIndexRef.current, playbackRateRef.current, effectiveVol);
      }
    }
  }, [speakParagraph]);

  const addToQueue = async (article: Article) => {
    const queueItem: AudioQueueItem = {
      id: generateId('queue'),
      articleId: article.id,
      title: article.title,
      feedTitle: article.feedTitle,
      excerpt: article.excerpt,
      estimatedReadMinutes: article.estimatedReadMinutes,
      currentPositionSeconds: 0,
      dateAdded: new Date().toISOString(),
    };

    setQueue((prev) => [...prev, queueItem]);
    await addToAudioQueueInDB(queueItem);
  };

  const removeFromQueue = async (itemId: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== itemId));
    await removeFromAudioQueueInDB(itemId);
  };

  const playNextInQueue = useCallback(() => {
    if (queue.length === 0) return;
    const [nextItem, ...remaining] = queue;
    setQueue(remaining);
    removeFromAudioQueueInDB(nextItem.id);
  }, [queue]);

  useEffect(() => {
    playNextInQueueRef.current = playNextInQueue;
  }, [playNextInQueue]);

  return (
    <AudioContext.Provider
      value={{
        currentArticle,
        playbackState,
        activeParagraphIndex,
        activeSentence,
        currentTime,
        duration,
        playbackRate,
        volume,
        isMuted,
        queue,
        availableVoices,
        selectedVoice,
        playArticle,
        togglePlayPause,
        pause,
        resume,
        stop,
        skip,
        seekToParagraph,
        seekToProgress,
        nextParagraph,
        prevParagraph,
        previousParagraph: prevParagraph,
        setPlaybackRate,
        increaseSpeed,
        decreaseSpeed,
        setVolume,
        toggleMute,
        setSelectedVoice,
        addToQueue,
        removeFromQueue,
        playNextInQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
