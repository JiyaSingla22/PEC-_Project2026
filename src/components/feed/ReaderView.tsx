import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFeeds } from '../../context/FeedContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { timeAgo } from '../../lib/utils';
import {
  ClientHighlight,
  HighlightColor,
  HIGHLIGHT_COLORS,
  getArticleHighlights,
  addHighlight,
  addHighlightsFromSelection,
  removeHighlight,
  clearArticleHighlights,
  getHighlightClassNames,
  segmentTextWithHighlights,
} from '../../lib/highlights';
import { HighlightToolbarPopover } from './HighlightToolbarPopover';
import { SelectionBubble } from './SelectionBubble';
import { ActiveHighlightMenu } from './ActiveHighlightMenu';
import {
  X,
  Bookmark,
  ExternalLink,
  Clock,
  User,
  ShieldCheck,
  Plus,
  Minus,
  Columns,
  Square,
  CheckCircle2,
  Highlighter,
  Eraser,
  Check,
} from 'lucide-react';

export const ReaderView: React.FC = () => {
  const { readingArticle, setReadingArticle, toggleBookmark, markAsRead } = useFeeds();

  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [fontFamily, setFontFamily] = useState<'editorial' | 'headline' | 'sans'>('editorial');
  const [isMultiColumn, setIsMultiColumn] = useState<boolean>(false);

  // Client Highlights State
  const [highlights, setHighlights] = useState<ClientHighlight[]>([]);
  const [isHighlightMenuOpen, setIsHighlightMenuOpen] = useState(false);
  const [isPenActive, setIsPenActive] = useState(true);
  const [activeColor, setActiveColor] = useState<HighlightColor>('champagne');
  const [isEraserActive, setIsEraserActive] = useState(false);

  const [floatingSelection, setFloatingSelection] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const [activeHighlightClick, setActiveHighlightClick] = useState<{
    highlight: ClientHighlight;
    x: number;
    y: number;
  } | null>(null);

  const articleRef = useRef<HTMLElement | null>(null);

  const loadHighlights = useCallback(() => {
    if (!readingArticle) return;
    const items = getArticleHighlights(readingArticle.id);
    setHighlights(items);
  }, [readingArticle]);

  useEffect(() => {
    if (readingArticle) {
      markAsRead(readingArticle.id);
      loadHighlights();
    }
  }, [readingArticle, loadHighlights]);

  // Listen for global highlights changes
  useEffect(() => {
    const handleChanged = (e: Event) => {
      const custom = e as CustomEvent<{ articleId: string }>;
      if (custom.detail?.articleId === readingArticle?.id) {
        loadHighlights();
      }
    };
    window.addEventListener('incogniread-highlights-changed', handleChanged);
    return () => window.removeEventListener('incogniread-highlights-changed', handleChanged);
  }, [readingArticle?.id, loadHighlights]);

  // Handle client text selection on moving cursor while pressing (mouse / touch)
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setFloatingSelection(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 2) {
      setFloatingSelection(null);
      return;
    }

    // Verify selection is within article element
    if (articleRef.current && selection.anchorNode && articleRef.current.contains(selection.anchorNode)) {
      if (isEraserActive) {
        // Remove any highlights that overlap this selected text
        const matching = highlights.filter(
          (h) =>
            selectedText.toLowerCase().includes(h.text.toLowerCase()) ||
            h.text.toLowerCase().includes(selectedText.toLowerCase())
        );
        for (const m of matching) {
          removeHighlight(readingArticle!.id, m.id);
        }
        loadHighlights();
        selection.removeAllRanges();
        setFloatingSelection(null);
        return;
      }

      if (isPenActive) {
        // INSTANT HIGHLIGHT while pressing & moving cursor across words!
        addHighlightsFromSelection(readingArticle!.id, selectedText, activeColor);
        loadHighlights();
        selection.removeAllRanges();
        setFloatingSelection(null);
        return;
      }

      // If Pen mode is OFF, show floating color selection bubble for manual color pick
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setFloatingSelection({
          text: selectedText,
          x: Math.max(80, Math.min(window.innerWidth - 80, rect.left + rect.width / 2)),
          y: Math.max(60, rect.top),
        });
        setActiveHighlightClick(null);
      } catch (err) {
        setFloatingSelection(null);
      }
    }
  }, [isEraserActive, isPenActive, activeColor, highlights, readingArticle, loadHighlights]);

  const handleApplySelectionHighlight = (color: HighlightColor) => {
    if (!readingArticle || !floatingSelection) return;
    addHighlightsFromSelection(readingArticle.id, floatingSelection.text, color);
    loadHighlights();
    window.getSelection()?.removeAllRanges();
    setFloatingSelection(null);
  };

  const handleHighlightMarkClick = (e: React.MouseEvent, hl: ClientHighlight) => {
    e.stopPropagation();
    if (!readingArticle) return;

    if (isEraserActive) {
      removeHighlight(readingArticle.id, hl.id);
      loadHighlights();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setActiveHighlightClick({
      highlight: hl,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setFloatingSelection(null);
  };

  const handleChangeHighlightColor = (newColor: HighlightColor) => {
    if (!readingArticle || !activeHighlightClick) return;
    addHighlight(readingArticle.id, activeHighlightClick.highlight.text, newColor);
    loadHighlights();
    setActiveHighlightClick(null);
  };

  const handleRemoveActiveHighlight = () => {
    if (!readingArticle || !activeHighlightClick) return;
    removeHighlight(readingArticle.id, activeHighlightClick.highlight.id);
    loadHighlights();
    setActiveHighlightClick(null);
  };

  const handleJumpToText = (text: string) => {
    setIsHighlightMenuOpen(false);
    if (!articleRef.current) return;
    const marks = articleRef.current.querySelectorAll('mark');
    for (const mark of Array.from(marks)) {
      if (mark.textContent?.toLowerCase().includes(text.toLowerCase())) {
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
        mark.classList.add('ring-4', 'ring-amber-500');
        setTimeout(() => {
          mark.classList.remove('ring-4', 'ring-amber-500');
        }, 1500);
        break;
      }
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleDocumentClick = () => {
      setFloatingSelection(null);
      setActiveHighlightClick(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  if (!readingArticle) return null;

  const fontSizes = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base sm:text-lg leading-relaxed sm:leading-loose',
    lg: 'text-lg sm:text-xl leading-relaxed sm:leading-loose',
    xl: 'text-xl sm:text-2xl leading-relaxed sm:leading-loose',
  };

  const fontFamilyClasses = {
    editorial: 'font-editorial',
    headline: 'font-editorial',
    sans: 'font-sans',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-theme-base text-theme-body flex flex-col justify-between animate-fade-in"
      style={{ backgroundColor: 'var(--bg-base, #f8f6f0)', opacity: 1 }}
    >
      {/* Sticky Top Reader Action Bar (100% Solid Non-Transparent) */}
      <header
        className="sticky top-0 z-30 w-full border-b border-theme-border bg-theme-surface-solid px-4 sm:px-8 py-3 flex items-center justify-between gap-2 shadow-xs"
        style={{ backgroundColor: 'var(--bg-surface-solid, #ffffff)', opacity: 1 }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setReadingArticle(null)}
            className="flex items-center gap-1.5 text-xs font-editorial font-bold text-theme-heading px-3 py-1.5 rounded-xl bg-theme-elevated hover:bg-theme-surface border border-theme-border transition-colors min-h-[38px]"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Close</span>
          </button>

          <span className="hidden md:inline-block font-mono text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider truncate max-w-[220px]">
            {readingArticle.feedTitle}
          </span>

          <Badge variant="emerald" className="hidden sm:inline-flex gap-1 py-1 text-[11px] font-mono">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Sanitized Readability</span>
          </Badge>
        </div>

        {/* Reader Customization Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Bookmark Toggle */}
          <button
            onClick={() => toggleBookmark(readingArticle.id)}
            aria-label="Bookmark dispatch"
            title={readingArticle.isBookmarked ? 'Bookmarked' : 'Save bookmark'}
            className={`p-2 rounded-xl border border-theme-border transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center ${
              readingArticle.isBookmarked
                ? 'text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/40'
                : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${readingArticle.isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Column Layout Switcher (Single vs Dual Broadsheet) */}
          <button
            onClick={() => setIsMultiColumn(!isMultiColumn)}
            title={isMultiColumn ? 'Switch to Single Column' : 'Switch to Newspaper Broadsheet Dual Columns'}
            className={`hidden md:flex p-2 rounded-xl border border-theme-border transition-colors min-h-[38px] min-w-[38px] items-center justify-center ${
              isMultiColumn
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border-amber-500/40'
                : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated'
            }`}
          >
            {isMultiColumn ? <Square className="h-4 w-4" /> : <Columns className="h-4 w-4" />}
          </button>

          {/* Font Type Switcher */}
          <button
            onClick={() => {
              const types: Array<'editorial' | 'headline' | 'sans'> = ['editorial', 'headline', 'sans'];
              const next = types[(types.indexOf(fontFamily) + 1) % types.length];
              setFontFamily(next);
            }}
            title={`Font: ${fontFamily}. Click to change font.`}
            className="p-2 text-theme-heading rounded-xl bg-theme-elevated hover:bg-theme-surface border border-theme-border transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center font-editorial text-xs font-bold"
          >
            {fontFamily === 'editorial' ? 'Serif' : fontFamily === 'headline' ? 'Editorial' : 'Sans'}
          </button>

          {/* Font Size Steppers */}
          <div className="hidden sm:flex items-center rounded-xl border border-theme-border bg-theme-elevated p-0.5">
            <button
              onClick={() => {
                if (fontSize === 'xl') setFontSize('lg');
                else if (fontSize === 'lg') setFontSize('base');
                else if (fontSize === 'base') setFontSize('sm');
              }}
              title="Decrease text size"
              className="p-1.5 text-theme-muted hover:text-theme-heading rounded-lg hover:bg-theme-surface transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1.5 text-theme-heading uppercase">{fontSize}</span>
            <button
              onClick={() => {
                if (fontSize === 'sm') setFontSize('base');
                else if (fontSize === 'base') setFontSize('lg');
                else if (fontSize === 'lg') setFontSize('xl');
              }}
              title="Increase text size"
              className="p-1.5 text-theme-muted hover:text-theme-heading rounded-lg hover:bg-theme-surface transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Original External Article Link */}
          <a
            href={readingArticle.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View original article on publisher site"
            className="p-2 text-theme-muted hover:text-theme-heading rounded-xl bg-theme-elevated hover:bg-theme-surface border border-theme-border transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
            title="Open original web URL"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Interactive Broadsheet Highlighter Pen Strip (100% Solid Non-Transparent) */}
      <div
        className="sticky top-[57px] z-20 w-full border-b border-theme-border px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-3 shadow-xs select-none"
        style={{ backgroundColor: 'var(--bg-elevated, #efeae0)', opacity: 1 }}
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Pen Mode Toggle Button */}
          <button
            onClick={() => {
              setIsPenActive(!isPenActive);
              setIsEraserActive(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-editorial font-bold flex items-center gap-1.5 transition-all min-h-[34px] border ${
              isPenActive && !isEraserActive
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                : 'bg-theme-surface text-theme-muted hover:text-theme-heading border-theme-border'
            }`}
            title={
              isPenActive
                ? 'Highlighter pen is ACTIVE: Drag across text while pressing to highlight instantly'
                : 'Turn on highlighter pen'
            }
          >
            <Highlighter className="h-3.5 w-3.5" />
            <span>{isPenActive && !isEraserActive ? 'Pen Mode Active' : 'Pen Mode'}</span>
          </button>

          {/* Color Palette Swatches */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-theme-surface border border-theme-border">
            {HIGHLIGHT_COLORS.map((col) => {
              const isSelected = activeColor === col.id && !isEraserActive;
              return (
                <button
                  key={col.id}
                  onClick={() => {
                    setActiveColor(col.id);
                    setIsPenActive(true);
                    setIsEraserActive(false);
                  }}
                  style={{ backgroundColor: col.hex }}
                  className={`h-5 w-5 rounded-lg transition-transform flex items-center justify-center border border-black/10 ${
                    isSelected
                      ? 'ring-2 ring-slate-900 dark:ring-white scale-110 shadow-xs'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  title={`Select ${col.label} for cursor highlight`}
                >
                  {isSelected && <Check className="h-3 w-3 text-slate-950 font-bold" />}
                </button>
              );
            })}
          </div>

          {/* Eraser Button */}
          <button
            onClick={() => {
              setIsEraserActive(!isEraserActive);
              setIsPenActive(true);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-serif flex items-center gap-1 transition-all min-h-[34px] border ${
              isEraserActive
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/50 font-bold shadow-xs'
                : 'bg-theme-surface text-theme-muted hover:text-theme-heading border-theme-border'
            }`}
            title="Eraser: sweep across words or click highlights to remove them"
          >
            <Eraser className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Eraser</span>
          </button>

          {/* Helper Guide Tag */}
          <span className="text-[11px] font-serif italic text-theme-muted hidden md:inline">
            {isEraserActive
              ? 'Eraser mode: drag over words or click highlights to remove'
              : isPenActive
              ? 'Move cursor while pressing to highlight words'
              : 'Select text to choose highlight color'}
          </span>
        </div>

        {/* Right: Highlights Manager & Clear All */}
        <div className="relative flex items-center gap-2">
          {highlights.length > 0 && (
            <button
              onClick={() => setIsHighlightMenuOpen(!isHighlightMenuOpen)}
              className="text-xs font-mono text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-theme-surface transition-colors"
              title="View all highlighted words in dispatch"
            >
              <Highlighter className="h-3.5 w-3.5" />
              <span>{highlights.length} saved</span>
            </button>
          )}

          {isHighlightMenuOpen && (
            <HighlightToolbarPopover
              articleId={readingArticle.id}
              highlights={highlights}
              onHighlightsUpdated={loadHighlights}
              onClose={() => setIsHighlightMenuOpen(false)}
              onJumpToText={handleJumpToText}
            />
          )}
        </div>
      </div>

      {/* Floating Selection Highlighter Bubble (Only shown if Pen Mode is toggled off) */}
      {!isPenActive && floatingSelection && (
        <SelectionBubble
          x={floatingSelection.x}
          y={floatingSelection.y}
          selectedText={floatingSelection.text}
          onSelectColor={handleApplySelectionHighlight}
          onClose={() => setFloatingSelection(null)}
        />
      )}

      {/* Floating Active Highlight Context Menu */}
      {activeHighlightClick && (
        <ActiveHighlightMenu
          x={activeHighlightClick.x}
          y={activeHighlightClick.y}
          highlight={activeHighlightClick.highlight}
          onChangeColor={handleChangeHighlightColor}
          onRemove={handleRemoveActiveHighlight}
          onClose={() => setActiveHighlightClick(null)}
        />
      )}

      {/* Reader Main Broadsheet Article */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 sm:px-10 py-10 sm:py-16">
        {/* Article Broadsheet Masthead Header */}
        <header className="space-y-5 pb-8 border-b-2 border-theme-rule">
          {/* Kicker Eyebrow */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest text-[11px]">
              {readingArticle.feedTitle}
            </span>
            <span className="text-theme-muted opacity-40">/</span>
            <span className="text-theme-muted flex items-center gap-1 text-[11px]">
              <Clock className="h-3 w-3" />
              {readingArticle.estimatedReadMinutes} min read ({timeAgo(readingArticle.publishedAt)})
            </span>
            <span className="text-theme-muted opacity-40">/</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="h-3 w-3" /> Read
            </span>
            {highlights.length > 0 && (
              <>
                <span className="text-theme-muted opacity-40">/</span>
                <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1 text-[11px] font-bold">
                  <Highlighter className="h-3 w-3" /> {highlights.length} highlighted
                </span>
              </>
            )}
          </div>

          {/* Grand Article Headline in Playfair Display */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-editorial tracking-tight text-theme-heading leading-tight">
            {readingArticle.title}
          </h1>

          {/* Author Byline & Dateline */}
          <div className="pt-2 flex flex-wrap items-center justify-between text-xs font-serif italic text-theme-muted border-t border-theme-subtle gap-2">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-amber-500" />
              <span>
                {readingArticle.author ? `By ${readingArticle.author}` : 'Dispatched by IncogniRead Editorial Desk'}
              </span>
              <span className="opacity-60">— Special Correspondent</span>
            </div>
            <div className="text-[11px] font-mono text-theme-muted not-italic">
              {new Date(readingArticle.publishedAt).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Article Body with Newspaper Drop-Cap and Drag-Highlighted Words */}
        <article
          ref={articleRef}
          onMouseUp={handleTextSelection}
          onTouchEnd={handleTextSelection}
          className={`pt-10 space-y-6 ${fontSizes[fontSize]} ${fontFamilyClasses[fontFamily]} text-theme-body selection:bg-amber-500/30 ${
            isEraserActive ? 'cursor-crosshair' : 'cursor-text'
          } ${isMultiColumn ? 'md:columns-2 gap-8' : ''}`}
        >
          {readingArticle.paragraphs.length > 0 ? (
            readingArticle.paragraphs.map((para, index) => {
              const isFirst = index === 0;
              const segments = segmentTextWithHighlights(para, highlights);

              return (
                <p
                  key={index}
                  className={`p-1.5 rounded-lg transition-colors leading-relaxed ${
                    isFirst ? 'newspaper-drop-cap' : ''
                  }`}
                >
                  {segments.map((seg, segIdx) => {
                    if (!seg.highlight) {
                      return <span key={segIdx}>{seg.text}</span>;
                    }

                    const hl = seg.highlight;
                    const colClass = getHighlightClassNames(hl.color);

                    return (
                      <mark
                        key={segIdx}
                        onClick={(e) => handleHighlightMarkClick(e, hl)}
                        className={`rounded px-1 py-0.5 mx-0.5 cursor-pointer font-medium transition-all hover:ring-2 hover:ring-amber-500/50 shadow-xs ${colClass}`}
                        title={
                          isEraserActive
                            ? 'Click to erase highlight'
                            : `Highlighted (${hl.color}). Click to change color or erase.`
                        }
                      >
                        {seg.text}
                      </mark>
                    );
                  })}
                </p>
              );
            })
          ) : (
            // Raw Clean HTML Fallback
            <div
              className="prose max-w-none font-serif text-theme-body"
              dangerouslySetInnerHTML={{ __html: readingArticle.contentClean }}
            />
          )}
        </article>

        {/* End of article newspaper divider & footer */}
        <div className="mt-16 pt-8 border-t-2 border-double border-theme-rule text-center space-y-4">
          <div className="text-amber-500 text-lg">❖ ❖ ❖</div>
          <p className="text-xs text-theme-muted font-editorial italic">
            This dispatch was parsed client-side and rendered with IncogniRead Readability. Client highlights are stored in private local storage.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" onClick={() => setReadingArticle(null)} className="font-serif">
              Return to Broadsheet Timeline
            </Button>
            <a
              href={readingArticle.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-theme-elevated hover:bg-theme-surface border border-theme-border text-xs font-serif font-bold text-theme-heading transition-colors"
            >
              <span>Visit Original Publication</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
