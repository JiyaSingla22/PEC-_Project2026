import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Feed, Article, Folder } from '../types';
import {
  getAllFeedsFromDB,
  saveFeedToDB,
  deleteFeedFromDB,
  getAllArticlesFromDB,
  saveArticlesToDB,
  updateArticleStateInDB,
} from '../lib/db';
import { fetchAndParseFeed, autodiscoverFeedUrl } from '../lib/feed-parser';
import { generateId } from '../lib/utils';
import { REAL_BROADSHEET_ARTICLES, enrichArticleIfSparse } from '../lib/real-articles';

// ---------------------------------------------------------------------------
// Backend API helpers
// ---------------------------------------------------------------------------

const API_BASE = '/api';

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API POST ${path} failed (${res.status})`);
  }
  return res.json();
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API PATCH ${path} failed (${res.status})`);
  }
  return res.json();
}

async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API DELETE ${path} failed (${res.status})`);
  }
}

// ---------------------------------------------------------------------------

interface FeedContextValue {
  feeds: Feed[];
  articles: Article[];
  folders: Folder[];
  activeFilter: string; // 'all' | 'unread' | 'bookmarks' | feedId
  activeFolder: string; // 'all' | folderName
  searchQuery: string;
  isSyncing: boolean;
  syncProgress: { current: number; total: number };
  isOnline: boolean;
  readingArticle: Article | null;
  setActiveFilter: (filter: string) => void;
  setActiveFolder: (folder: string) => void;
  setSearchQuery: (query: string) => void;
  setReadingArticle: (article: Article | null) => void;
  addNewFeed: (urlOrDomain: string, folderName?: string) => Promise<Feed>;
  deleteFeed: (feedId: string) => Promise<void>;
  markAsRead: (articleId: string) => Promise<void>;
  toggleBookmark: (articleId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  syncAllFeeds: () => Promise<void>;
}

const DEFAULT_FEEDS: Array<{ url: string; folder: string }> = [
  { url: 'https://404media.co/rss/', folder: 'Investigative Tech' },
  { url: 'https://arstechnica.com/feed/', folder: 'Tech Journalism' },
  { url: 'https://overreacted.io/rss.xml', folder: 'Engineering & AI' },
  { url: 'https://simonwillison.net/atom/entries/', folder: 'Engineering & AI' },
  { url: 'https://lwn.net/headlines/rss', folder: 'Systems & Open Source' },
];

const FeedContext = createContext<FeedContextValue | undefined>(undefined);

export const FeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial hydration: prioritize full-fledged real broadsheet dispatches, then backend/IndexedDB
  useEffect(() => {
    async function initStorage() {
      try {
        // Try to load from backend first
        if (navigator.onLine) {
          const res = await fetch('/api/feeds');
          if (res.ok) {
            const json = await res.json();
            const backendFeeds: Feed[] = (json.data || []).map((f: any) => ({
              id: f._id,
              title: f.title,
              siteUrl: f.siteUrl,
              feedUrl: f.feedUrl,
              description: f.description,
              folder: f.folder,
              unreadCount: f.unreadCount,
              lastFetchedAt: f.lastFetchedAt,
              iconUrl: f.iconUrl,
              isFavorite: f.isFavorite,
            }));

            if (backendFeeds.length > 0) {
              const artRes = await fetch('/api/articles?limit=500');
              const artJson = artRes.ok ? await artRes.json() : { data: [] };
              const backendArticles: Article[] = (artJson.data || [])
                .map(mapMongoArticle)
                .map(enrichArticleIfSparse);

              // Prepend our comprehensive real broadsheet articles
              const combined = [...REAL_BROADSHEET_ARTICLES, ...backendArticles];
              const seen = new Set<string>();
              const uniqueArticles = combined.filter((a) => {
                if (seen.has(a.id)) return false;
                seen.add(a.id);
                return true;
              });

              setFeeds(backendFeeds);
              setArticles(uniqueArticles);

              // Save to local IndexedDB for instant offline access
              saveArticlesToDB(uniqueArticles).catch(() => {});
              return;
            }
          }
        }

        // Offline fallback: local IndexedDB
        const storedFeeds = await getAllFeedsFromDB();
        const storedArticles = await getAllArticlesFromDB();
        const enrichedStored = storedArticles.map(enrichArticleIfSparse);
        const combined = [...REAL_BROADSHEET_ARTICLES, ...enrichedStored];
        const seen = new Set<string>();
        const uniqueArticles = combined.filter((a) => {
          if (seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        });

        if (storedFeeds.length > 0) {
          setFeeds(storedFeeds);
          setArticles(uniqueArticles);
        } else {
          await seedInitialFeeds();
        }
      } catch (err) {
        console.error('[FeedContext] Initialization error:', err);
        const storedFeeds = await getAllFeedsFromDB();
        const storedArticles = await getAllArticlesFromDB();
        const enrichedStored = storedArticles.map(enrichArticleIfSparse);
        const combined = [...REAL_BROADSHEET_ARTICLES, ...enrichedStored];
        const seen = new Set<string>();
        const uniqueArticles = combined.filter((a) => {
          if (seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        });

        if (storedFeeds.length > 0) {
          setFeeds(storedFeeds);
          setArticles(uniqueArticles);
        } else {
          await seedInitialFeeds();
        }
      }
    }
    initStorage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function mapMongoArticle(a: any): Article {
    return {
      id: a._id,
      feedId: a.feedId,
      feedTitle: a.feedTitle,
      title: a.title,
      link: a.link,
      author: a.author,
      publishedAt: a.publishedAt,
      contentRaw: a.contentRaw,
      contentClean: a.contentClean,
      excerpt: a.excerpt,
      paragraphs: a.paragraphs,
      isRead: a.isRead,
      isBookmarked: a.isBookmarked,
      estimatedReadMinutes: a.estimatedReadMinutes,
      audioProgressSeconds: a.audioProgressSeconds,
      audioDurationSeconds: a.audioDurationSeconds,
    };
  }

  const seedInitialFeeds = async () => {
    setIsSyncing(true);
    const initialFeeds: Feed[] = [];
    const initialArticles: Article[] = [...REAL_BROADSHEET_ARTICLES];

    // Persist our full-fledged broadsheet articles to IndexedDB immediately
    saveArticlesToDB(REAL_BROADSHEET_ARTICLES).catch(() => {});

    for (let i = 0; i < DEFAULT_FEEDS.length; i++) {
      const item = DEFAULT_FEEDS[i];
      setSyncProgress({ current: i + 1, total: DEFAULT_FEEDS.length });

      try {
        const parsed = await fetchAndParseFeed(item.url, item.folder);
        const feedId = generateId('feed');
        const newFeed: Feed = { ...parsed.feed, id: feedId };

        const mappedArticles: Article[] = parsed.articles.map((art) =>
          enrichArticleIfSparse({
            ...art,
            id: generateId('art'),
            feedId: newFeed.id,
            feedTitle: newFeed.title,
          })
        );

        // Persist to both backend and local IndexedDB
        await Promise.allSettled([
          saveFeedToDB(newFeed),
          apiPost('/feeds', { ...newFeed }),
        ]);
        await Promise.allSettled([
          saveArticlesToDB(mappedArticles),
          apiPost('/articles/bulk', { articles: mappedArticles }),
        ]);

        initialFeeds.push(newFeed);
        initialArticles.push(...mappedArticles);
      } catch (err) {
        console.warn(`[FeedContext] Seeding failed for ${item.url}:`, err);
      }
    }

    setFeeds(initialFeeds);
    setArticles(initialArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
    setIsSyncing(false);
  };

  // Sync all subscribed feeds
  const syncAllFeeds = useCallback(async () => {
    if (isSyncing || feeds.length === 0 || !navigator.onLine) return;
    setIsSyncing(true);
    setSyncProgress({ current: 0, total: feeds.length });

    const allNewArticles: Article[] = [];
    const updatedFeeds: Feed[] = [];

    for (let i = 0; i < feeds.length; i++) {
      const feed = feeds[i];
      setSyncProgress({ current: i + 1, total: feeds.length });

      try {
        const parsed = await fetchAndParseFeed(feed.feedUrl, feed.folder);
        const newArticles: Article[] = parsed.articles.map((art) =>
          enrichArticleIfSparse({
            ...art,
            id: generateId('art'),
            feedId: feed.id,
            feedTitle: feed.title,
          })
        );

        const updatedFeed: Feed = {
          ...feed,
          title: parsed.feed.title || feed.title,
          description: parsed.feed.description || feed.description,
          lastFetchedAt: new Date().toISOString(),
          unreadCount: newArticles.filter((a) => !a.isRead).length,
        };

        await Promise.allSettled([
          saveArticlesToDB(newArticles),
          apiPost('/articles/bulk', { articles: newArticles }),
        ]);
        await Promise.allSettled([
          saveFeedToDB(updatedFeed),
          apiPatch(`/feeds/${feed.id}`, {
            title: updatedFeed.title,
            description: updatedFeed.description,
            lastFetchedAt: updatedFeed.lastFetchedAt,
            unreadCount: updatedFeed.unreadCount,
          }),
        ]);

        allNewArticles.push(...newArticles);
        updatedFeeds.push(updatedFeed);
      } catch (err) {
        console.warn(`[FeedContext] Refresh error for ${feed.title}:`, err);
        updatedFeeds.push(feed);
      }
    }

    setFeeds(updatedFeeds);
    const refreshedArticles = await getAllArticlesFromDB();
    setArticles(refreshedArticles);
    setIsSyncing(false);
  }, [feeds, isSyncing]);

  const addNewFeed = async (urlOrDomain: string, folderName = 'General'): Promise<Feed> => {
    setIsSyncing(true);
    try {
      const discoveredUrl = await autodiscoverFeedUrl(urlOrDomain);
      const parsed = await fetchAndParseFeed(discoveredUrl, folderName);

      const feedId = generateId('feed');
      const newFeed: Feed = { ...parsed.feed, id: feedId };

      const mappedArticles: Article[] = parsed.articles.map((art) => ({
        ...art,
        id: generateId('art'),
        feedId: newFeed.id,
        feedTitle: newFeed.title,
      }));

      await Promise.allSettled([
        saveFeedToDB(newFeed),
        apiPost('/feeds', { ...newFeed }),
      ]);
      await Promise.allSettled([
        saveArticlesToDB(mappedArticles),
        apiPost('/articles/bulk', { articles: mappedArticles }),
      ]);

      setFeeds((prev) => [newFeed, ...prev]);
      setArticles((prev) =>
        [...mappedArticles, ...prev].sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )
      );

      return newFeed;
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteFeed = async (feedId: string) => {
    await Promise.allSettled([
      deleteFeedFromDB(feedId),
      apiDelete(`/feeds/${feedId}`),
    ]);
    setFeeds((prev) => prev.filter((f) => f.id !== feedId));
    setArticles((prev) => prev.filter((a) => a.feedId !== feedId));
    if (activeFilter === feedId) setActiveFilter('all');
  };

  const markAsRead = async (articleId: string) => {
    await Promise.allSettled([
      updateArticleStateInDB(articleId, { isRead: true }),
      apiPatch(`/articles/${articleId}`, { isRead: true }),
    ]);
    setArticles((prev) => prev.map((a) => (a.id === articleId ? { ...a, isRead: true } : a)));
    if (readingArticle?.id === articleId) {
      setReadingArticle((prev) => (prev ? { ...prev, isRead: true } : null));
    }
  };

  const toggleBookmark = async (articleId: string) => {
    const target = articles.find((a) => a.id === articleId);
    if (!target) return;
    const newState = !target.isBookmarked;
    await Promise.allSettled([
      updateArticleStateInDB(articleId, { isBookmarked: newState }),
      apiPatch(`/articles/${articleId}`, { isBookmarked: newState }),
    ]);
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, isBookmarked: newState } : a))
    );
    if (readingArticle?.id === articleId) {
      setReadingArticle((prev) => (prev ? { ...prev, isBookmarked: newState } : null));
    }
  };

  const markAllAsRead = async () => {
    await Promise.allSettled([
      (async () => {
        for (const article of articles) {
          if (!article.isRead) await updateArticleStateInDB(article.id, { isRead: true });
        }
      })(),
      apiPatch('/articles/actions/mark-all-read', {}),
    ]);
    setArticles((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  // Derive folders list from feeds
  const folderNames = Array.from(new Set(feeds.map((f) => f.folder || 'General')));
  const folders: Folder[] = folderNames.map((name) => ({
    id: name,
    name,
    count: feeds.filter((f) => f.folder === name).length,
  }));

  return (
    <FeedContext.Provider
      value={{
        feeds,
        articles,
        folders,
        activeFilter,
        activeFolder,
        searchQuery,
        isSyncing,
        syncProgress,
        isOnline,
        readingArticle,
        setActiveFilter,
        setActiveFolder,
        setSearchQuery,
        setReadingArticle,
        addNewFeed,
        deleteFeed,
        markAsRead,
        toggleBookmark,
        markAllAsRead,
        syncAllFeeds,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
};

export function useFeeds() {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeeds must be used within a FeedProvider');
  }
  return context;
}
