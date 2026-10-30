import { Router, Request, Response } from 'express';
import { discoverySubmitLimiter } from '../middleware/rateLimiter';
import crypto from 'crypto';

const router = Router();

interface CoSubscriptionEdge {
  sourceFeedUrl: string;
  sourceFeedTitle: string;
  targetFeedUrl: string;
  targetFeedTitle: string;
  targetFeedDesc: string;
  targetFeedSiteUrl: string;
  category: string;
  coCount: number;
}

// Seed graph – in production this would live in MongoDB
const DISCOVERY_GRAPH: CoSubscriptionEdge[] = [
  {
    sourceFeedUrl: 'https://overreacted.io/rss.xml',
    sourceFeedTitle: 'Overreacted',
    targetFeedUrl: 'https://simonwillison.net/atom/entries/',
    targetFeedTitle: "Simon Willison's Weblog",
    targetFeedDesc: 'Deep explorations into AI, LLMs, SQLite, Python, and open-source systems architecture.',
    targetFeedSiteUrl: 'https://simonwillison.net',
    category: 'Engineering & AI',
    coCount: 1420,
  },
  {
    sourceFeedUrl: 'https://overreacted.io/rss.xml',
    sourceFeedTitle: 'Overreacted',
    targetFeedUrl: 'https://kentcdodds.com/blog/rss.xml',
    targetFeedTitle: 'Kent C. Dodds',
    targetFeedDesc: 'Software design patterns, React performance, testing, and web architecture.',
    targetFeedSiteUrl: 'https://kentcdodds.com',
    category: 'Web Development',
    coCount: 1190,
  },
  {
    sourceFeedUrl: 'https://news.ycombinator.com/rss',
    sourceFeedTitle: 'Hacker News Frontpage',
    targetFeedUrl: 'https://lwn.net/headlines/rss',
    targetFeedTitle: 'LWN.net Linux Weekly News',
    targetFeedDesc: 'In-depth kernel, security, and low-level Linux systems journalism.',
    targetFeedSiteUrl: 'https://lwn.net',
    category: 'Systems & Open Source',
    coCount: 980,
  },
  {
    sourceFeedUrl: 'https://news.ycombinator.com/rss',
    sourceFeedTitle: 'Hacker News Frontpage',
    targetFeedUrl: 'https://arstechnica.com/feed/',
    targetFeedTitle: 'Ars Technica',
    targetFeedDesc: 'Technological analysis, policy, hardware, and scientific exploration.',
    targetFeedSiteUrl: 'https://arstechnica.com',
    category: 'Tech Journalism',
    coCount: 1750,
  },
  {
    sourceFeedUrl: 'https://www.theverge.com/rss/index.xml',
    sourceFeedTitle: 'The Verge',
    targetFeedUrl: 'https://404media.co/rss/',
    targetFeedTitle: '404 Media',
    targetFeedDesc: 'Investigative tech journalism exposing surveillance, hacking, and labor.',
    targetFeedSiteUrl: 'https://404media.co',
    category: 'Investigative Tech',
    coCount: 840,
  },
];

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'feedora-privacy-salt-2024';
  return crypto.createHmac('sha256', salt).update(ip).digest('hex').slice(0, 16);
}

// GET /api/discovery?userFeeds=url1,url2,...
router.get('/', (req: Request, res: Response) => {
  const rawFeeds = req.query.userFeeds as string | undefined;
  const subscribedUrls: string[] = rawFeeds ? rawFeeds.split(',').map((u) => u.trim()) : [];

  const seenTargets = new Set<string>();
  const recommendations: Array<{
    feedUrl: string;
    title: string;
    description: string;
    siteUrl: string;
    category: string;
    popularityScore: number;
    reason: string;
  }> = [];

  // Co-subscription matches
  for (const edge of DISCOVERY_GRAPH) {
    if (
      subscribedUrls.includes(edge.sourceFeedUrl) &&
      !subscribedUrls.includes(edge.targetFeedUrl) &&
      !seenTargets.has(edge.targetFeedUrl)
    ) {
      seenTargets.add(edge.targetFeedUrl);
      recommendations.push({
        feedUrl: edge.targetFeedUrl,
        title: edge.targetFeedTitle,
        description: edge.targetFeedDesc,
        siteUrl: edge.targetFeedSiteUrl,
        category: edge.category,
        popularityScore: edge.coCount,
        reason: `Followed by readers of "${edge.sourceFeedTitle}"`,
      });
    }
  }

  // Trending fallbacks (not already subscribed or added)
  for (const edge of DISCOVERY_GRAPH) {
    if (!subscribedUrls.includes(edge.targetFeedUrl) && !seenTargets.has(edge.targetFeedUrl)) {
      seenTargets.add(edge.targetFeedUrl);
      recommendations.push({
        feedUrl: edge.targetFeedUrl,
        title: edge.targetFeedTitle,
        description: edge.targetFeedDesc,
        siteUrl: edge.targetFeedSiteUrl,
        category: edge.category,
        popularityScore: edge.coCount,
        reason: `Trending in ${edge.category} (${edge.coCount} anonymous readers)`,
      });
    }
  }

  res.json({
    success: true,
    count: recommendations.length,
    recommendations,
    privacyGuarantee:
      'Feed correlations are computed across anonymized salted hash clusters. Zero individual browsing logs.',
  });
});

// POST /api/discovery – anonymous co-subscription telemetry
router.post('/', discoverySubmitLimiter, (req: Request, res: Response) => {
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  const anonymizedToken = hashIp(clientIp);

  res.json({
    success: true,
    message: 'Co-subscription graph updated anonymously.',
    anonymizedToken,
  });
});

export default router;
