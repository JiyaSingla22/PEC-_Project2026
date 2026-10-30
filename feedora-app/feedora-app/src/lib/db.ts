import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Feed, Article, AudioQueueItem } from '../types';

interface FeedoraDB extends DBSchema {
  feeds: {
    key: string;
    value: Feed;
    indexes: { 'by-folder': string };
  };
  articles: {
    key: string;
    value: Article;
    indexes: {
      'by-feed': string;
      'by-published': string;
      'by-read': number; // 0 or 1
      'by-bookmarked': number;
    };
  };
  audioQueue: {
    key: string;
    value: AudioQueueItem;
    indexes: { 'by-added': string };
  };
  playbackProgress: {
    key: string; // articleId
    value: {
      articleId: string;
      positionSeconds: number;
      durationSeconds: number;
      updatedAt: string;
    };
  };
}

const DB_NAME = 'feedora_offline_v1';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<FeedoraDB>> | null = null;

function getDb(): Promise<IDBPDatabase<FeedoraDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FeedoraDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Feeds store
        if (!db.objectStoreNames.contains('feeds')) {
          const feedStore = db.createObjectStore('feeds', { keyPath: 'id' });
          feedStore.createIndex('by-folder', 'folder');
        }

        // Articles store
        if (!db.objectStoreNames.contains('articles')) {
          const articleStore = db.createObjectStore('articles', { keyPath: 'id' });
          articleStore.createIndex('by-feed', 'feedId');
          articleStore.createIndex('by-published', 'publishedAt');
          articleStore.createIndex('by-read', 'isRead');
          articleStore.createIndex('by-bookmarked', 'isBookmarked');
        }

        // Audio Queue store
        if (!db.objectStoreNames.contains('audioQueue')) {
          const queueStore = db.createObjectStore('audioQueue', { keyPath: 'id' });
          queueStore.createIndex('by-added', 'dateAdded');
        }

        // Playback progress store
        if (!db.objectStoreNames.contains('playbackProgress')) {
          db.createObjectStore('playbackProgress', { keyPath: 'articleId' });
        }
      },
    });
  }
  return dbPromise;
}

// Feeds CRUD
export async function getAllFeedsFromDB(): Promise<Feed[]> {
  const db = await getDb();
  return db.getAll('feeds');
}

export async function saveFeedToDB(feed: Feed): Promise<void> {
  const db = await getDb();
  await db.put('feeds', feed);
}

export async function deleteFeedFromDB(feedId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['feeds', 'articles'], 'readwrite');
  await tx.objectStore('feeds').delete(feedId);

  // Cascade delete feed articles
  const articleIndex = tx.objectStore('articles').index('by-feed');
  let cursor = await articleIndex.openCursor(feedId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

// Articles CRUD
export async function getAllArticlesFromDB(): Promise<Article[]> {
  const db = await getDb();
  const articles = await db.getAllFromIndex('articles', 'by-published');
  return articles.reverse(); // Newest first
}

export async function getArticlesByFeedFromDB(feedId: string): Promise<Article[]> {
  const db = await getDb();
  const articles = await db.getAllFromIndex('articles', 'by-feed', feedId);
  return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function saveArticlesToDB(articles: Article[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('articles', 'readwrite');
  for (const article of articles) {
    // Preserve read & bookmark states if article already existed
    const existing = await tx.store.get(article.id);
    if (existing) {
      await tx.store.put({
        ...article,
        isRead: existing.isRead,
        isBookmarked: existing.isBookmarked,
        audioProgressSeconds: existing.audioProgressSeconds,
      });
    } else {
      await tx.store.put(article);
    }
  }
  await tx.done;
}

export async function updateArticleStateInDB(
  articleId: string,
  updates: Partial<Pick<Article, 'isRead' | 'isBookmarked' | 'audioProgressSeconds'>>
): Promise<void> {
  const db = await getDb();
  const article = await db.get('articles', articleId);
  if (article) {
    await db.put('articles', { ...article, ...updates });
  }
}

// Audio Queue & Playback persistence
export async function getAudioQueueFromDB(): Promise<AudioQueueItem[]> {
  const db = await getDb();
  const queue = await db.getAllFromIndex('audioQueue', 'by-added');
  return queue;
}

export async function addToAudioQueueInDB(item: AudioQueueItem): Promise<void> {
  const db = await getDb();
  await db.put('audioQueue', item);
}

export async function removeFromAudioQueueInDB(itemId: string): Promise<void> {
  const db = await getDb();
  await db.delete('audioQueue', itemId);
}

export async function clearAudioQueueInDB(): Promise<void> {
  const db = await getDb();
  await db.clear('audioQueue');
}

export async function savePlaybackProgressInDB(
  articleId: string,
  positionSeconds: number,
  durationSeconds: number
): Promise<void> {
  const db = await getDb();
  await db.put('playbackProgress', {
    articleId,
    positionSeconds,
    durationSeconds,
    updatedAt: new Date().toISOString(),
  });
}

export async function getPlaybackProgressFromDB(articleId: string): Promise<number> {
  const db = await getDb();
  const record = await db.get('playbackProgress', articleId);
  return record?.positionSeconds || 0;
}
