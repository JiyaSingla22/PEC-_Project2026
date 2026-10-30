import { Router, Request, Response, NextFunction } from 'express';
import { Article } from '../models/Article';
import { Feed } from '../models/Feed';

const router = Router();

// GET /api/articles – list articles with optional filters
// Query params: feedId, isRead, isBookmarked, limit, skip
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: Record<string, unknown> = {};

    if (req.query.feedId) filter['feedId'] = req.query.feedId;
    if (req.query.isRead !== undefined) filter['isRead'] = req.query.isRead === 'true';
    if (req.query.isBookmarked !== undefined) filter['isBookmarked'] = req.query.isBookmarked === 'true';

    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const skip = parseInt(req.query.skip as string) || 0;

    const [articles, total] = await Promise.all([
      Article.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit),
      Article.countDocuments(filter),
    ]);

    res.json({ success: true, total, count: articles.length, data: articles });
  } catch (err) {
    next(err);
  }
});

// GET /api/articles/:id – single article
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      res.status(404).json({ success: false, error: 'Article not found.' });
      return;
    }
    res.json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
});

// POST /api/articles/bulk – save many articles at once (upsert by feedId+link)
router.post('/bulk', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { articles } = req.body as { articles: any[] };
    if (!Array.isArray(articles) || articles.length === 0) {
      res.status(400).json({ success: false, error: 'articles array is required.' });
      return;
    }

    // Bulk upsert: match by the compound key to prevent unique constraint conflicts
    const ops = articles.map((art) => ({
      updateOne: {
        filter: { feedId: art.feedId, link: art.link }, // Match on compound unique fields
        update: {
          $setOnInsert: { 
            _id: art.id, // Only assign custom ID string on initial insertion
            isRead: art.isRead ?? false, 
            isBookmarked: art.isBookmarked ?? false 
          },
          $set: {
            feedTitle: art.feedTitle,
            title: art.title,
            author: art.author,
            publishedAt: art.publishedAt,
            contentRaw: art.contentRaw,
            contentClean: art.contentClean,
            excerpt: art.excerpt,
            paragraphs: art.paragraphs,
            estimatedReadMinutes: art.estimatedReadMinutes,
          },
        },
        upsert: true,
      },
    }));

    const result = await Article.bulkWrite(ops);

    // Update feed unread count
    if (articles.length > 0) {
      const feedId = articles[0].feedId;
      const unreadCount = await Article.countDocuments({ feedId, isRead: false });
      await Feed.findByIdAndUpdate(feedId, { unreadCount });
    }

    res.status(201).json({
      success: true,
      inserted: result.upsertedCount,
      modified: result.modifiedCount,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/articles/:id – update article state (isRead, isBookmarked, audioProgress)
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowedFields = ['isRead', 'isBookmarked', 'audioProgressSeconds', 'audioDurationSeconds'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ success: false, error: 'No valid fields provided for update.' });
      return;
    }

    const article = await Article.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!article) {
      res.status(404).json({ success: false, error: 'Article not found.' });
      return;
    }

    // Recompute feed unread count when isRead changes
    if ('isRead' in updates) {
      const unreadCount = await Article.countDocuments({ feedId: article.feedId, isRead: false });
      await Feed.findByIdAndUpdate(article.feedId, { unreadCount });
    }

    res.json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/articles/mark-all-read – mark all (or by feedId) as read
router.patch('/actions/mark-all-read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: Record<string, unknown> = { isRead: false };
    if (req.body.feedId) filter['feedId'] = req.body.feedId;

    const result = await Article.updateMany(filter, { isRead: true });

    // Update unread counts for affected feeds
    const feedIds = req.body.feedId
      ? [req.body.feedId]
      : await Article.distinct('feedId');

    for (const feedId of feedIds) {
      await Feed.findByIdAndUpdate(feedId, { unreadCount: 0 });
    }

    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    next(err);
  }
});

export default router;
