import { Feed } from '../types';

export interface OPMLFeedItem {
  title: string;
  feedUrl: string;
  siteUrl?: string;
  folder?: string;
}

/**
 * Generates standard OPML 2.0 XML string from active subscriptions.
 */
export function exportToOPML(feeds: Feed[]): string {
  const dateStr = new Date().toUTCString();

  // Group feeds by folder
  const folderMap = new Map<string, Feed[]>();
  for (const feed of feeds) {
    const folder = feed.folder || 'Subscriptions';
    if (!folderMap.has(folder)) {
      folderMap.set(folder, []);
    }
    folderMap.get(folder)!.push(feed);
  }

  let bodyContent = '';
  for (const [folderName, folderFeeds] of folderMap.entries()) {
    const escapedFolder = escapeXml(folderName);
    bodyContent += `    <outline text="${escapedFolder}" title="${escapedFolder}">\n`;
    for (const f of folderFeeds) {
      const escapedTitle = escapeXml(f.title);
      const escapedXmlUrl = escapeXml(f.feedUrl);
      const escapedHtmlUrl = escapeXml(f.siteUrl || '');
      bodyContent += `      <outline type="rss" text="${escapedTitle}" title="${escapedTitle}" xmlUrl="${escapedXmlUrl}" htmlUrl="${escapedHtmlUrl}" />\n`;
    }
    bodyContent += `    </outline>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>IncogniRead Subscriptions Export</title>
    <dateCreated>${dateStr}</dateCreated>
    <docs>http://opml.org/spec2.opml</docs>
  </head>
  <body>
${bodyContent}  </body>
</opml>`;
}

/**
 * Triggers a browser file download of the OPML export.
 */
export function downloadOPML(feeds: Feed[], filename = 'incogniread-subscriptions.opml'): void {
  const xmlContent = exportToOPML(feeds);
  const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parses an OPML 1.0 or 2.0 XML string into subscription feed items.
 */
export function parseOPML(opmlXml: string): OPMLFeedItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(opmlXml, 'text/xml');
  const items: OPMLFeedItem[] = [];

  const outlines = Array.from(doc.querySelectorAll('outline'));
  for (const outline of outlines) {
    const xmlUrl = outline.getAttribute('xmlUrl') || outline.getAttribute('xmlurl');
    if (!xmlUrl) continue;

    const title =
      outline.getAttribute('title') ||
      outline.getAttribute('text') ||
      outline.getAttribute('description') ||
      'Untitled Feed';

    const siteUrl =
      outline.getAttribute('htmlUrl') ||
      outline.getAttribute('htmlurl') ||
      new URL(xmlUrl).origin;

    // Determine folder from parent outline if nested
    let folder = 'Imported';
    const parentOutline = outline.parentElement?.closest('outline');
    if (parentOutline) {
      folder = parentOutline.getAttribute('text') || parentOutline.getAttribute('title') || 'Imported';
    }

    items.push({
      title: title.trim(),
      feedUrl: xmlUrl.trim(),
      siteUrl: siteUrl.trim(),
      folder: folder.trim(),
    });
  }

  return items;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
