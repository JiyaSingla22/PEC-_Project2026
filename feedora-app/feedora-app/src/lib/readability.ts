import { sanitizeHtml, stripHtmlToPlainText } from './sanitizer';
import { estimateReadingTime } from './utils';

export interface ExtractedArticle {
  title: string;
  byline?: string;
  excerpt: string;
  contentClean: string;
  paragraphs: string[];
  estimatedMinutes: number;
}

/**
 * Extracts reader-friendly article content and prepares tokenized paragraphs for TTS sync.
 */
export function extractArticleContent(
  rawTitle: string,
  rawContent: string,
  rawAuthor?: string
): ExtractedArticle {
  const contentClean = sanitizeHtml(rawContent);

  // Parse HTML into virtual DOM to extract paragraphs cleanly
  const parser = new DOMParser();
  const doc = parser.parseFromString(contentClean, 'text/html');

  // Strip script, style, nav, footer artifacts if any remained
  const elementsToRemove = doc.querySelectorAll('script, style, nav, footer, header, form, svg');
  elementsToRemove.forEach((el) => el.remove());

  // Extract paragraphs (or split blocks)
  const pNodes = Array.from(doc.querySelectorAll('p, blockquote, li, h2, h3, h4'));
  let paragraphs: string[] = [];

  if (pNodes.length > 0) {
    paragraphs = pNodes
      .map((node) => node.textContent?.trim() || '')
      .filter((text) => text.length > 25); // Avoid tiny menu remnants
  }

  // If no <p> tags exist (e.g. plain text or single blob), split by double newline
  if (paragraphs.length === 0) {
    const plainText = stripHtmlToPlainText(rawContent);
    paragraphs = plainText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 15);
  }

  // Generate short excerpt from the first paragraph
  const firstParagraph = paragraphs[0] || stripHtmlToPlainText(rawContent);
  const excerpt = firstParagraph.length > 180 ? `${firstParagraph.substring(0, 180).trim()}...` : firstParagraph;

  const totalPlainText = paragraphs.join(' ');
  const estimatedMinutes = estimateReadingTime(totalPlainText || rawTitle);

  return {
    title: rawTitle,
    byline: rawAuthor,
    excerpt,
    contentClean,
    paragraphs,
    estimatedMinutes,
  };
}
