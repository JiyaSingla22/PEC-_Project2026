// -----------------------------------------------------------------------------
// Feedora Application Domain Type Definitions
// -----------------------------------------------------------------------------

export interface Feed {
  id: string;
  title: string;
  siteUrl: string;
  feedUrl: string;
  description?: string;
  folder: string; // e.g. "Tech & AI", "Design", "News", "Uncategorized"
  unreadCount: number;
  lastFetchedAt: string;
  iconUrl?: string;
  isFavorite?: boolean;
}

export interface Article {
  id: string; // Hash of link/guid
  feedId: string;
  feedTitle: string;
  title: string;
  link: string;
  author?: string;
  publishedAt: string;
  contentRaw: string;
  contentClean: string; // Sanitized by DOMPurify
  excerpt: string;
  paragraphs: string[]; // Tokenized sentences/paragraphs for real-time TTS sync
  isRead: boolean;
  isBookmarked: boolean;
  estimatedReadMinutes: number;
  audioProgressSeconds?: number;
  audioDurationSeconds?: number;
}

export interface AudioQueueItem {
  id: string;
  articleId: string;
  title: string;
  feedTitle: string;
  excerpt: string;
  estimatedReadMinutes: number;
  currentPositionSeconds: number;
  dateAdded: string;
}

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended';

export interface TTSState {
  currentArticle: Article | null;
  playbackState: PlaybackState;
  activeParagraphIndex: number; // For highlighting active spoken paragraph in Reader View
  activeSentenceText: string;
  currentTime: number;
  duration: number;
  playbackRate: number; // 0.75, 1.0, 1.25, 1.5, 2.0
  volume: number; // 0.0 - 1.0
  queue: AudioQueueItem[];
  selectedVoice: string | null;
}

export interface DiscoveryRecommendation {
  feedUrl: string;
  title: string;
  description: string;
  siteUrl: string;
  category: string;
  popularityScore: number;
  reason: string;
}

export interface Folder {
  id: string;
  name: string;
  count: number;
}
