import type { IncomingMessage, ServerResponse } from 'http';
import { validateTargetUrl } from '../src/lib/ssrf';

export default async function handler(req: any, res: any) {
  // Support both Next.js/Vercel (req.query) and raw Node http request
  const urlParam = req.query?.url || new URL(req.url, `http://${req.headers.host}`).searchParams.get('url');

  if (!urlParam) {
    res.status(400).json({ error: 'Missing required "url" parameter.' });
    return;
  }

  // 1. SSRF Defense Check
  const ssrfCheck = await validateTargetUrl(urlParam);
  if (!ssrfCheck.valid) {
    res.status(403).json({
      error: 'SSRF Protection: Access Denied',
      details: ssrfCheck.reason,
    });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s max fetch timeout

    const upstreamResponse = await fetch(urlParam, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Feedora-RSS-Reader/1.0 (Privacy-First Offline Reader; +https://github.com/feedora/reader)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });

    clearTimeout(timeout);

    if (!upstreamResponse.ok) {
      res.status(upstreamResponse.status).json({
        error: `Upstream feed returned status ${upstreamResponse.status} ${upstreamResponse.statusText}`,
      });
      return;
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'application/xml; charset=utf-8';
    const textData = await upstreamResponse.text();

    // Prevent oversized XML memory abuse (max 6MB)
    if (textData.length > 6 * 1024 * 1024) {
      res.status(413).json({ error: 'Feed payload exceeds maximum allowable size (6MB).' });
      return;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Feedora-Proxy', 'SSRF-Protected');
    res.status(200).send(textData);
  } catch (err: any) {
    if (err.name === 'AbortError') {
      res.status(504).json({ error: 'Upstream feed request timed out after 10 seconds.' });
      return;
    }
    res.status(500).json({ error: 'Failed to relay feed response', message: err.message });
  }
}
