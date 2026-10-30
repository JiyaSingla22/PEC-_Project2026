export type HighlightColor = 'champagne' | 'sage' | 'rose' | 'lavender';

export interface ClientHighlight {
  id: string;
  articleId: string;
  text: string;
  color: HighlightColor;
  note?: string;
  createdAt: string;
}

const STORAGE_PREFIX = 'incogniread_hl_';

export const HIGHLIGHT_COLORS: {
  id: HighlightColor;
  label: string;
  hex: string;
  bgClass: string;
  badgeClass: string;
}[] = [
  {
    id: 'champagne',
    label: 'Champagne Sand',
    hex: '#e2cba8',
    bgClass: 'bg-[#e2cba8]/40 dark:bg-[#e2cba8]/30 text-slate-950 dark:text-[#fbf6ed] border-b-2 border-[#caa77d] dark:border-[#e2cba8]',
    badgeClass: 'bg-[#e2cba8] text-slate-950',
  },
  {
    id: 'sage',
    label: 'Pastel Sage',
    hex: '#a3c9a8',
    bgClass: 'bg-[#a3c9a8]/40 dark:bg-[#a3c9a8]/30 text-slate-950 dark:text-[#eff8f0] border-b-2 border-[#76a87c] dark:border-[#a3c9a8]',
    badgeClass: 'bg-[#a3c9a8] text-slate-950',
  },
  {
    id: 'rose',
    label: 'Pastel Rose',
    hex: '#f4b8b8',
    bgClass: 'bg-[#f4b8b8]/40 dark:bg-[#f4b8b8]/30 text-slate-950 dark:text-[#fff2f2] border-b-2 border-[#e69898] dark:border-[#f4b8b8]',
    badgeClass: 'bg-[#f4b8b8] text-slate-950',
  },
  {
    id: 'lavender',
    label: 'Pastel Lavender',
    hex: '#c8b8f4',
    bgClass: 'bg-[#c8b8f4]/40 dark:bg-[#c8b8f4]/30 text-slate-950 dark:text-[#f8f5ff] border-b-2 border-[#aa94ea] dark:border-[#c8b8f4]',
    badgeClass: 'bg-[#c8b8f4] text-slate-950',
  },
];

export function getArticleHighlights(articleId: string): ClientHighlight[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${articleId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[Highlights] Failed to load highlights:', err);
    return [];
  }
}

export function saveArticleHighlights(articleId: string, highlights: ClientHighlight[]): void {
  if (typeof window === 'undefined') return;
  try {
    if (highlights.length === 0) {
      localStorage.removeItem(`${STORAGE_PREFIX}${articleId}`);
    } else {
      localStorage.setItem(`${STORAGE_PREFIX}${articleId}`, JSON.stringify(highlights));
    }
    // Dispatch custom event so listeners (like ArticleCard badge) can update
    window.dispatchEvent(new CustomEvent('incogniread-highlights-changed', { detail: { articleId } }));
  } catch (err) {
    console.warn('[Highlights] Failed to save highlights:', err);
  }
}

export function addHighlight(
  articleId: string,
  text: string,
  color: HighlightColor = 'champagne',
  note?: string
): ClientHighlight {
  const cleanText = text.trim();
  const current = getArticleHighlights(articleId);

  // Check if identical highlight already exists
  const existing = current.find((h) => h.text.toLowerCase() === cleanText.toLowerCase());
  if (existing) {
    existing.color = color;
    if (note !== undefined) existing.note = note;
    saveArticleHighlights(articleId, current);
    return existing;
  }

  const newHighlight: ClientHighlight = {
    id: `hl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    articleId,
    text: cleanText,
    color,
    note,
    createdAt: new Date().toISOString(),
  };

  const updated = [...current, newHighlight];
  saveArticleHighlights(articleId, updated);
  return newHighlight;
}

/**
 * Adds one or more highlights from a dragged cursor selection (handles multi-line/multi-paragraph spans).
 */
export function addHighlightsFromSelection(
  articleId: string,
  rawSelectionText: string,
  color: HighlightColor = 'champagne'
): ClientHighlight[] {
  const lines = rawSelectionText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 2);

  const created: ClientHighlight[] = [];
  for (const line of lines) {
    created.push(addHighlight(articleId, line, color));
  }
  return created;
}

export function removeHighlight(articleId: string, highlightId: string): void {
  const current = getArticleHighlights(articleId);
  const updated = current.filter((h) => h.id !== highlightId);
  saveArticleHighlights(articleId, updated);
}

export function clearArticleHighlights(articleId: string): void {
  saveArticleHighlights(articleId, []);
}

export function getHighlightClassNames(color: HighlightColor): string {
  const found = HIGHLIGHT_COLORS.find((c) => c.id === color);
  return found ? found.bgClass : HIGHLIGHT_COLORS[0].bgClass;
}

export interface HighlightSegment {
  text: string;
  highlight?: ClientHighlight;
}

/**
 * Splits plain text into plain and highlighted chunks by matching client-highlighted phrases.
 */
export function segmentTextWithHighlights(
  rawText: string,
  highlights: ClientHighlight[]
): HighlightSegment[] {
  if (!rawText || highlights.length === 0) {
    return [{ text: rawText }];
  }

  // Find all match intervals in the raw text
  interface Interval {
    start: number;
    end: number;
    highlight: ClientHighlight;
  }

  const intervals: Interval[] = [];
  const lowerText = rawText.toLowerCase();

  for (const hl of highlights) {
    const term = hl.text.toLowerCase();
    if (!term) continue;

    let searchIndex = 0;
    while (searchIndex < lowerText.length) {
      const matchIndex = lowerText.indexOf(term, searchIndex);
      if (matchIndex === -1) break;

      intervals.push({
        start: matchIndex,
        end: matchIndex + term.length,
        highlight: hl,
      });

      searchIndex = matchIndex + term.length;
    }
  }

  if (intervals.length === 0) {
    return [{ text: rawText }];
  }

  // Sort intervals by start position, then by longest match
  intervals.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start);
  });

  // Resolve overlapping intervals (first match wins)
  const nonOverlapping: Interval[] = [];
  let lastEnd = 0;

  for (const interval of intervals) {
    if (interval.start >= lastEnd) {
      nonOverlapping.push(interval);
      lastEnd = interval.end;
    }
  }

  // Build segments
  const segments: HighlightSegment[] = [];
  let currentIndex = 0;

  for (const match of nonOverlapping) {
    if (match.start > currentIndex) {
      segments.push({
        text: rawText.substring(currentIndex, match.start),
      });
    }

    segments.push({
      text: rawText.substring(match.start, match.end),
      highlight: match.highlight,
    });

    currentIndex = match.end;
  }

  if (currentIndex < rawText.length) {
    segments.push({
      text: rawText.substring(currentIndex),
    });
  }

  return segments;
}
