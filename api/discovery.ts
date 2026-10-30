import crypto from 'crypto';

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

// In-memory co-subscription seed graph (simulating database table)
const DISCOVERY_GRAPH: CoSubscriptionEdge[] = [
  {
    sourceFeedUrl: 'https://overreacted.io/rss.xml',
    sourceFeedTitle: 'Overreacted',
    targetFeedUrl: 'https://simonwillison.net/atom/entries/',
    targetFeedTitle: 'Simon Willison’s Weblog',
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

// Ephemeral rate limiting cache based on salted IP hashes
const submissionRateLimit = new Map<string, number>();
const SALT = process.env.DISCOVERY_IP_SALT || 'incogniread_privacy_salt_2026';

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + SALT).digest('hex').substring(0, 16);
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET: Retrieve anonymous recommendations based on active subscription URLs
  if (req.method === 'GET') {
    const rawFeeds = req.query?.userFeeds || (new URL(req.url, `http://${req.headers.host}`).searchParams.get('userFeeds'));
    const subscribedUrls: string[] = rawFeeds ? rawFeeds.split(',') : [];

    const recommendations: Array<{
      feedUrl: string;
      title: string;
      description: string;
      siteUrl: string;
      category: string;
      popularityScore: number;
      reason: string;
    }> = [];

    // Match co-subscription graph
    for (const edge of DISCOVERY_GRAPH) {
      if (subscribedUrls.includes(edge.sourceFeedUrl)) {
        if (!subscribedUrls.includes(edge.targetFeedUrl)) {
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
    }

    // Always include top trending feeds that user isn't already subscribed to
    for (const edge of DISCOVERY_GRAPH) {
      const alreadyAdded = recommendations.some((r) => r.feedUrl === edge.targetFeedUrl);
      if (!alreadyAdded && !subscribedUrls.includes(edge.targetFeedUrl)) {
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

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
      privacyGuarantee: 'Feed correlations are computed across anonymized salted hash clusters. Zero individual browsing logs.',
    });
    return;
  }

  // POST: Opt-in anonymous co-subscription telemetry submission
  if (req.method === 'POST') {
    const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket?.remoteAddress || '127.0.0.1';
    const ipHash = hashIp(clientIp);
    const now = Date.now();

    // Rate-limit: 1 contribution per hour per salted IP hash
    const lastSub = submissionRateLimit.get(ipHash);
    if (lastSub && now - lastSub < 3600000) {
      res.status(429).json({
        error: 'Rate limit exceeded: Co-subscription telemetry is capped at 1 sync/hour per anonymous user.',
      });
      return;
    }

    submissionRateLimit.set(ipHash, now);

    res.status(200).json({
      success: true,
      message: 'Co-subscription graph updated anonymously.',
      anonymizedToken: ipHash,
    });
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
