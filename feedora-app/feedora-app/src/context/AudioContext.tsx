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

interface AudioContextValue {
  currentArticle: Article | null;
  playbackState: PlaybackState;
  activeParagraphIndex: number;
  activeSentence: string;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
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
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
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
  const [queue, setQueue] = useState<AudioQueueItem[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const currentParagraphIndexRef = useRef<number>(0);

  // Initialize SpeechSynthesis and load offline queue from IndexedDB
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        setAvailableVoices(voices);

        // Prefer natural English voices if available
        const defaultVoice =
          voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural'))) ||
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

  // Plays a specific paragraph in sequence
  const speakParagraph = useCallback(
    (paragraphs: string[], index: number) => {
      if (!synthRef.current || index >= paragraphs.length) {
        setPlaybackState('ended');
        setActiveSentence('');
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        return;
      }

      currentParagraphIndexRef.current = index;
      setActiveParagraphIndex(index);

      const paragraphText = paragraphs[index];
      const utterance = new SpeechSynthesisUtterance(paragraphText);
      utteranceRef.current = utterance;

      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = playbackRate;
      utterance.volume = volume;

      // Real-time boundary tracking for sentence synchronization
      utterance.onboundary = (event) => {
        if (event.name === 'sentence' || event.name === 'word') {
          const charIndex = event.charIndex;
          const sentenceChunk = paragraphText.substring(charIndex, charIndex + 40);
          setActiveSentence(sentenceChunk);
        }
      };

      utterance.onend = () => {
        // Automatically speak next paragraph
        if (currentParagraphIndexRef.current + 1 < paragraphs.length) {
          speakParagraph(paragraphs, currentParagraphIndexRef.current + 1);
        } else {
          setPlaybackState('ended');
          playNextInQueue();
        }
      };

      utterance.onerror = (err) => {
        console.warn('[AudioContext] Utterance error:', err);
        setPlaybackState('paused');
      };

      synthRef.current.speak(utterance);
    },
    [selectedVoice, playbackRate, volume]
  );

  const playArticle = useCallback(
    async (article: Article, startParagraphIndex = 0) => {
      if (!synthRef.current) {
        alert('Web Speech API is not supported in this browser.');
        return;
      }

      // Stop existing speech
      synthRef.current.cancel();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      setCurrentArticle(article);
      setPlaybackState('playing');

      // Estimate duration (words / 150 wpm * 60 seconds)
      const totalWords = article.paragraphs.join(' ').split(/\s+/).length;
      const estimatedDurationSeconds = Math.max(30, Math.round((totalWords / (150 * playbackRate)) * 60));
      setDuration(estimatedDurationSeconds);

      // Check saved progress in IndexedDB
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
        article.paragraphs.length > 0 ? article.paragraphs : [article.title, article.excerpt];

      speakParagraph(paragraphsToSpeak, startParagraphIndex);
    },
    [playbackRate, speakParagraph]
  );

  const pause = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.pause();
      setPlaybackState('paused');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, []);

  const resume = useCallback(() => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setPlaybackState('playing');
      timerIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => Math.min(prev + 1, duration));
      }, 1000);
    } else if (currentArticle) {
      playArticle(currentArticle, activeParagraphIndex);
    }
  }, [currentArticle, activeParagraphIndex, duration, playArticle]);

  const togglePlayPause = useCallback(() => {
    if (playbackState === 'playing') {
      pause();
    } else {
      resume();
    }
  }, [playbackState, pause, resume]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setPlaybackState('idle');
    setActiveSentence('');
    setCurrentTime(0);
  }, []);

  const skip = useCallback(
    (secondsDelta: number) => {
      if (!currentArticle) return;
      const paragraphs = currentArticle.paragraphs;
      if (paragraphs.length === 0) return;

      // Approximate paragraph jump (each paragraph ~15-20s)
      const paragraphDelta = Math.sign(secondsDelta) * Math.max(1, Math.round(Math.abs(secondsDelta) / 18));
      const targetIndex = Math.max(0, Math.min(activeParagraphIndex + paragraphDelta, paragraphs.length - 1));

      synthRef.current?.cancel();
      setCurrentTime((prev) => Math.max(0, Math.min(prev + secondsDelta, duration)));
      speakParagraph(paragraphs, targetIndex);
    },
    [currentArticle, activeParagraphIndex, duration, speakParagraph]
  );

  const seekToParagraph = useCallback(
    (paragraphIndex: number) => {
      if (!currentArticle) return;
      synthRef.current?.cancel();
      speakParagraph(currentArticle.paragraphs, paragraphIndex);
    },
    [currentArticle, speakParagraph]
  );

  const setPlaybackRate = (rate: number) => {
    setRate(rate);
    if (utteranceRef.current) utteranceRef.current.rate = rate;
  };

  const setVolume = (vol: number) => {
    setVol(vol);
    if (utteranceRef.current) utteranceRef.current.volume = vol;
  };

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

    // If an article object is stored or we trigger playback
    // For seamless transition
  }, [queue]);

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
        setPlaybackRate,
        setVolume,
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
