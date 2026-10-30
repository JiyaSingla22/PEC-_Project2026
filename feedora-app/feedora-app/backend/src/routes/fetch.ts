import { Router, Request, Response } from 'express';
import { validateTargetUrl } from '../lib/ssrf';
import { fetchLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /api/fetch?url=<encoded_url>
// SSRF-protected RSS/Atom proxy
router.get('/', fetchLimiter, async (req: Request, res: Response) => {
  const urlParam = req.query.url as string | undefined;

  if (!urlParam) {
    res.status(400).json({ success: false, error: 'Missing required "url" query parameter.' });
    return;
  }

  // 1. SSRF Defense
  const ssrfCheck = await validateTargetUrl(urlParam);
  if (!ssrfCheck.valid) {
    res.status(403).json({
      success: false,
      error: 'SSRF Protection: Access Denied',
      details: ssrfCheck.reason,
    });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const upstream = await fetch(urlParam, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Feedora-RSS-Reader/1.0 (Privacy-First Offline Reader; +https://github.com/feedora/reader)',
        Accept:
          'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });

    clearTimeout(timeout);

    if (!upstream.ok) {
      res.status(upstream.status).json({
        success: false,
        error: `Upstream feed returned ${upstream.status} ${upstream.statusText}`,
      });
      return;
    }

    const contentType = upstream.headers.get('content-type') || 'application/xml; charset=utf-8';
    const text = await upstream.text();

    if (text.length > 6 * 1024 * 1024) {
      res.status(413).json({
        success: false,
        error: 'Feed payload exceeds maximum allowable size (6 MB).',
      });
      return;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    res.setHeader('X-Feedora-Proxy', 'SSRF-Protected');
    res.status(200).send(text);
  } catch (err: any) {
    if (err.name === 'AbortError') {
      res.status(504).json({ success: false, error: 'Upstream feed request timed out after 10 seconds.' });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to relay feed response', message: err.message });
  }
});

export default router;
