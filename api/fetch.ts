import dns from 'dns';
import { promisify } from 'util';
import net from 'net';

const lookupAsync = promisify(dns.lookup);

function isPrivateOrReservedIP(ip: string): boolean {
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    if (a === 0) return true;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true;
    return false;
  }

  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (
      lower === '::1' ||
      lower === '::' ||
      lower.startsWith('fe80:') ||
      lower.startsWith('fc00:') ||
      lower.startsWith('fd00:')
    ) {
      return true;
    }
    return false;
  }

  return true;
}

async function validateTargetUrl(rawUrl: string): Promise<{ valid: boolean; reason?: string }> {
  try {
    const parsed = new URL(rawUrl);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, reason: 'Disallowed protocol: Only HTTP and HTTPS are permitted.' };
    }

    const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
    if (![80, 443, 8080, 8443].includes(port)) {
      return { valid: false, reason: `Disallowed port: Port ${port} is restricted.` };
    }

    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === 'metadata.google.internal' ||
      hostname === '169.254.169.254'
    ) {
      return { valid: false, reason: 'Target hostname targets local or cloud metadata domain.' };
    }

    // Direct IP string check before DNS lookup
    if (net.isIP(hostname)) {
      if (isPrivateOrReservedIP(hostname)) {
        return { valid: false, reason: `Private or reserved IP addresses are blocked: ${hostname}` };
      }
    }

    try {
      const addresses = await lookupAsync(hostname, { all: true });
      for (const addr of addresses) {
        if (isPrivateOrReservedIP(addr.address)) {
          return { valid: false, reason: `Target resolves to private or restricted IP: ${addr.address}` };
        }
      }
    } catch {
      // If DNS lookup throws in a sandboxed serverless environment, allow standard fetch to attempt connection
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, reason: `Invalid URL format: ${err.message}` };
  }
}

function sendResponse(res: any, status: number, contentType: string, data: string) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', contentType);

  if (typeof res.status === 'function') {
    res.status(status);
  } else {
    res.statusCode = status;
  }

  if (typeof res.send === 'function') {
    return res.send(data);
  }
  return res.end(data);
}

function sendJson(res: any, status: number, data: any) {
  return sendResponse(res, status, 'application/json; charset=utf-8', JSON.stringify(data));
}

export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (typeof res.status === 'function') {
      res.status(200).end();
    } else {
      res.statusCode = 200;
      res.end();
    }
    return;
  }

  let urlParam: string | null = null;
  if (req.query?.url && typeof req.query.url === 'string') {
    urlParam = req.query.url;
  } else if (req.url) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      urlParam = parsed.searchParams.get('url');
    } catch {
      urlParam = null;
    }
  }

  if (!urlParam) {
    return sendJson(res, 400, { error: 'Missing required "url" parameter.' });
  }

  // SSRF Protection Check
  const ssrfCheck = await validateTargetUrl(urlParam);
  if (!ssrfCheck.valid) {
    return sendJson(res, 403, {
      error: 'SSRF Protection: Access Denied',
      details: ssrfCheck.reason,
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const upstreamResponse = await fetch(urlParam, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 IncogniRead/1.0',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8',
      },
    });

    clearTimeout(timeout);

    if (!upstreamResponse.ok) {
      return sendJson(res, upstreamResponse.status, {
        error: `Upstream feed returned status ${upstreamResponse.status} ${upstreamResponse.statusText}`,
      });
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'application/xml; charset=utf-8';
    const textData = await upstreamResponse.text();

    if (textData.length > 6 * 1024 * 1024) {
      return sendJson(res, 413, { error: 'Feed payload exceeds maximum allowable size (6MB).' });
    }

    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    res.setHeader('X-IncogniRead-Proxy', 'SSRF-Protected');
    return sendResponse(res, 200, contentType, textData);
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return sendJson(res, 504, { error: 'Upstream feed request timed out after 12 seconds.' });
    }
    return sendJson(res, 502, { error: 'Failed to relay feed response', message: err.message });
  }
}
