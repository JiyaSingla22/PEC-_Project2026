import { Router, Request, Response, NextFunction } from 'express';
import { Feed } from '../models/Feed';
import { Article } from '../models/Article';

const router = Router();

// GET /api/feeds – list all feeds
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const feeds = await Feed.find().sort({ createdAt: -1 });
    res.json({ success: true, count: feeds.length, data: feeds });
  } catch (err) {
    next(err);
  }
});

// GET /api/feeds/:id – get a single feed
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      res.status(404).json({ success: false, error: 'Feed not found.' });
      return;
    }
    res.json({ success: true, data: feed });
  } catch (err) {
    next(err);
  }
});

// POST /api/feeds – create a feed
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      id,
      title,
      siteUrl,
      feedUrl,
      description,
      folder,
      unreadCount,
      lastFetchedAt,
      iconUrl,
      isFavorite,
    } = req.body;

    if (!id || !title || !feedUrl || !siteUrl) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: id, title, feedUrl, siteUrl.',
      });
      return;
    }

    // Upsert by feedUrl to avoid duplicates safely
    const feed = await Feed.findOneAndUpdate(
      { feedUrl },
      {
        $setOnInsert: { _id: id }, // Ensures _id is only written on new insert operations
        $set: {
          title,
          siteUrl,
          feedUrl,
          description: description || '',
          folder: folder || 'General',
          unreadCount: unreadCount ?? 0,
          lastFetchedAt: lastFetchedAt || new Date().toISOString(),
          iconUrl,
          isFavorite: isFavorite ?? false,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: feed });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/feeds/:id – update feed fields
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowedFields = ['title', 'description', 'folder', 'unreadCount', 'lastFetchedAt', 'iconUrl', 'isFavorite'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const feed = await Feed.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!feed) {
      res.status(404).json({ success: false, error: 'Feed not found.' });
      return;
    }
    res.json({ success: true, data: feed });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/feeds/:id – delete feed and cascade its articles
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feed = await Feed.findByIdAndDelete(req.params.id);
    if (!feed) {
      res.status(404).json({ success: false, error: 'Feed not found.' });
      return;
    }
    const { deletedCount } = await Article.deleteMany({ feedId: req.params.id });
    res.json({
      success: true,
      message: `Feed deleted. ${deletedCount} article(s) removed.`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
