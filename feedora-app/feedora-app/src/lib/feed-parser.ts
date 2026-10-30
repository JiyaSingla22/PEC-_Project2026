import { XMLParser } from 'fast-xml-parser';
import { Feed, Article } from '../types';
import { extractArticleContent } from './readability';
import { generateId } from './utils';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  cdataPropName: '__cdata',
  trimValues: true,
  processEntities: {
    enabled: true,
    maxTotalExpansions: 100000,
    maxExpandedLength: 10000000,
  },
});

export interface ParsedFeedResult {
  feed: Omit<Feed, 'id'>;
  articles: Omit<Article, 'id' | 'feedId' | 'feedTitle'>[];
}

/**
 * Autodiscovers RSS/Atom feeds from a website domain or HTML page.
 * Enhanced with multi-stage fallback:
 * 1. Checks if URL itself is XML.
 * 2. Checks <link rel="alternate" type="application/rss+xml|atom+xml"> in HTML.
 * 3. Probes common domain feed endpoints (/feed, /rss, /rss.xml, /atom.xml).
 */
export async function autodiscoverFeedUrl(inputUrl: string): Promise<string> {
  let targetUrl = inputUrl.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  // If already directly an XML/RSS file or feed endpoint, return as-is
  if (/\.(xml|rss|atom)$/i.test(targetUrl) || targetUrl.endsWith('/feed') || targetUrl.endsWith('/feed/')) {
    return targetUrl;
  }

  try {
    const proxyUrl = `/api/fetch?url=${encodeURIComponent(targetUrl)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) return targetUrl;

    const bodyText = await response.text();

    // Check if the response itself is already valid XML
    if (bodyText.includes('<rss') || bodyText.includes('<feed') || bodyText.includes('xmlns="http://www.w3.org/2005/Atom"')) {
      return targetUrl;
    }

    // 1. Search for <link rel="alternate"> in the HTML head
    const parser = new DOMParser();
    const doc = parser.parseFromString(bodyText, 'text/html');
    const rssLink = doc.querySelector(
      'link[type="application/rss+xml"], link[type="application/atom+xml"], link[rel="alternate"][type*="xml"]'
    );

    if (rssLink) {
      const href = rssLink.getAttribute('href');
      if (href) {
        return new URL(href, targetUrl).href;
      }
    }

    // 2. Intelligent Domain Probing: If page is a deep article or landing page, probe common feed endpoints
    const origin = new URL(targetUrl).origin;
    const candidateEndpoints = [
      `${origin}/feed/`,
      `${origin}/feed`,
      `${origin}/rss.xml`,
      `${origin}/rss`,
      `${origin}/atom.xml`,
    ];

    for (const candidate of candidateEndpoints) {
      try {
        const probeRes = await fetch(`/api/fetch?url=${encodeURIComponent(candidate)}`);
        if (probeRes.ok) {
          const probeText = await probeRes.text();
          if (probeText.includes('<rss') || probeText.includes('<feed')) {
            console.log(`[feed-parser] Autodiscovered feed candidate: ${candidate}`);
            return candidate;
          }
        }
      } catch {
        // Continue probing next candidate
      }
    }
  } catch (err) {
    console.warn('[feed-parser] Autodiscovery search encountered error:', err);
  }

  return targetUrl;
}

/**
 * Fetches and parses an RSS 2.0 or Atom XML feed via the SSRF-protected /api/fetch proxy.
 */
export async function fetchAndParseFeed(feedUrl: string, folderName = 'General'): Promise<ParsedFeedResult> {
  const proxyUrl = `/api/fetch?url=${encodeURIComponent(feedUrl)}`;
  const response = await fetch(proxyUrl);

  if (!response.ok) {
    let errorDetails = `HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorDetails = `${errJson.error}: ${errJson.details || ''}`;
    } catch {}
    throw new Error(`Feed fetch failed: ${errorDetails}`);
  }

  const rawText = await response.text();

  // If the document is an HTML webpage rather than XML, provide a clear, educational error
  const isHtml =
    rawText.trim().toLowerCase().startsWith('<!doctype html') ||
    rawText.includes('<html') ||
    rawText.includes('<head>') ||
    rawText.includes('<body>');

  if (isHtml && !rawText.includes('<rss') && !rawText.includes('<feed')) {
    throw new Error(
      `The URL provided is a standard HTML webpage, not an RSS or Atom feed. ` +
      `No feed stream was found at "${feedUrl}". ` +
      `Please provide the site's direct RSS link (e.g. https://www.feedblitz.com/feed/ or ending in .xml / /feed).`
    );
  }

  let parsedObj: any;
  try {
    parsedObj = xmlParser.parse(rawText);
  } catch (err: any) {
    throw new Error(`XML Syntax Error: Could not parse feed document (${err.message}).`);
  }

  // 1. Check for RSS 2.0
  if (parsedObj.rss?.channel) {
    return parseRssChannel(parsedObj.rss.channel, feedUrl, folderName);
  }

  // 2. Check for Atom feed
  if (parsedObj.feed) {
    return parseAtomFeed(parsedObj.feed, feedUrl, folderName);
  }

  // 3. Check for RDF / RSS 1.0
  if (parsedObj['rdf:RDF']?.channel) {
    return parseRssChannel(parsedObj['rdf:RDF'].channel, feedUrl, folderName, parsedObj['rdf:RDF'].item);
  }

  throw new Error(
    'Unrecognized feed format. Expected standard RSS 2.0 or Atom XML data, but received incompatible XML structure.'
  );
}

function parseRssChannel(channel: any, feedUrl: string, folder: string, overrideItems?: any): ParsedFeedResult {
  const title = getCleanString(channel.title) || 'Untitled Feed';
  const siteUrl = getCleanString(channel.link) || feedUrl;
  const description = getCleanString(channel.description) || '';

  const rawItems = overrideItems || channel.item;
  const itemsArray = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  const articles = itemsArray.map((item: any) => {
    const itemTitle = getCleanString(item.title) || 'Untitled Article';
    const itemLink = getCleanString(item.link) || item.guid?.['#text'] || siteUrl;
    const itemAuthor = getCleanString(item['dc:creator'] || item.author || channel['dc:creator']);
    const rawDate = item.pubDate || item.date || item['dc:date'] || new Date().toISOString();
    const publishedAt = new Date(rawDate).toISOString();

    const rawContent = getCleanString(item['content:encoded'] || item.description || item.summary || '');
    const extracted = extractArticleContent(itemTitle, rawContent, itemAuthor);

    return {
      title: itemTitle,
      link: itemLink,
      author: itemAuthor,
      publishedAt,
      contentRaw: rawContent,
      contentClean: extracted.contentClean,
      excerpt: extracted.excerpt,
      paragraphs: extracted.paragraphs,
      isRead: false,
      isBookmarked: false,
      estimatedReadMinutes: extracted.estimatedMinutes,
    };
  });

  return {
    feed: {
      title,
      siteUrl,
      feedUrl,
      description,
      folder,
      unreadCount: articles.length,
      lastFetchedAt: new Date().toISOString(),
      iconUrl: getFaviconUrl(siteUrl),
    },
    articles,
  };
}

function parseAtomFeed(feed: any, feedUrl: string, folder: string): ParsedFeedResult {
  const title = getCleanString(feed.title) || 'Untitled Atom Feed';
  let siteUrl = feedUrl;
  if (Array.isArray(feed.link)) {
    const altLink = feed.link.find((l: any) => l['@_rel'] === 'alternate' || !l['@_rel']);
    if (altLink) siteUrl = altLink['@_href'] || siteUrl;
  } else if (feed.link?.['@_href']) {
    siteUrl = feed.link['@_href'];
  }

  const description = getCleanString(feed.subtitle) || '';
  const entriesArray = Array.isArray(feed.entry) ? feed.entry : feed.entry ? [feed.entry] : [];

  const articles = entriesArray.map((entry: any) => {
    const itemTitle = getCleanString(entry.title) || 'Untitled Entry';
    let itemLink = siteUrl;
    if (Array.isArray(entry.link)) {
      const alt = entry.link.find((l: any) => l['@_rel'] === 'alternate' || !l['@_rel']);
      if (alt) itemLink = alt['@_href'] || itemLink;
    } else if (entry.link?.['@_href']) {
      itemLink = entry.link['@_href'];
    }

    const itemAuthor = getCleanString(entry.author?.name || feed.author?.name);
    const rawDate = entry.published || entry.updated || new Date().toISOString();
    const publishedAt = new Date(rawDate).toISOString();

    const rawContent = getCleanString(entry.content?.['#text'] || entry.content || entry.summary?.['#text'] || entry.summary || '');
    const extracted = extractArticleContent(itemTitle, rawContent, itemAuthor);

    return {
      title: itemTitle,
      link: itemLink,
      author: itemAuthor,
      publishedAt,
      contentRaw: rawContent,
      contentClean: extracted.contentClean,
      excerpt: extracted.excerpt,
      paragraphs: extracted.paragraphs,
      isRead: false,
      isBookmarked: false,
      estimatedReadMinutes: extracted.estimatedMinutes,
    };
  });

  return {
    feed: {
      title,
      siteUrl,
      feedUrl,
      description,
      folder,
      unreadCount: articles.length,
      lastFetchedAt: new Date().toISOString(),
      iconUrl: getFaviconUrl(siteUrl),
    },
    articles,
  };
}

function getCleanString(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val.trim();
  if (val['__cdata']) return String(val['__cdata']).trim();
  if (val['#text']) return String(val['#text']).trim();
  return String(val).trim();
}

function getFaviconUrl(domain: string): string {
  try {
    const url = new URL(domain);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
  } catch {
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${domain}`;
  }
}
