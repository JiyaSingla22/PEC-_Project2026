import React from 'react';
import {
  ClientHighlight,
  HIGHLIGHT_COLORS,
  removeHighlight,
  clearArticleHighlights,
} from '../../lib/highlights';
import {
  Highlighter,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react';

export interface HighlightToolbarPopoverProps {
  articleId: string;
  highlights: ClientHighlight[];
  onHighlightsUpdated: () => void;
  onClose: () => void;
  onJumpToText?: (text: string) => void;
}

export const HighlightToolbarPopover: React.FC<HighlightToolbarPopoverProps> = ({
  articleId,
  highlights,
  onHighlightsUpdated,
  onClose,
  onJumpToText,
}) => {
  const handleRemove = (id: string) => {
    removeHighlight(articleId, id);
    onHighlightsUpdated();
  };

  const handleClearAll = () => {
    if (highlights.length === 0) return;
    if (window.confirm('Clear all client highlights from this dispatch?')) {
      clearArticleHighlights(articleId);
      onHighlightsUpdated();
    }
  };

  return (
    <div
      className="absolute top-12 right-0 w-80 sm:w-96 rounded-2xl border-2 border-theme-border shadow-2xl z-50 p-4 solid-dropdown-panel animate-slide-up"
      style={{ backgroundColor: 'var(--bg-surface-solid, #ffffff)', opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
            <Highlighter className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-editorial font-bold text-theme-heading">
              Client Highlights
            </h4>
            <p className="text-[10px] text-theme-muted font-serif">
              Drag cursor across words while pressing to highlight
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-theme-muted hover:text-theme-heading rounded-lg hover:bg-theme-elevated transition-colors"
          title="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Highlights List */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-theme-muted">
          <span>Saved Highlights ({highlights.length})</span>
          {highlights.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-rose-500 hover:underline capitalize font-serif font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {highlights.length === 0 ? (
          <div className="py-6 text-center text-xs text-theme-muted font-serif italic border border-dashed border-theme-border/70 rounded-xl bg-theme-surface/40 p-4">
            No words highlighted yet. Simply press and drag your cursor over any words in the article to highlight them instantly.
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {highlights.map((hl) => {
              const col = HIGHLIGHT_COLORS.find((c) => c.id === hl.color) || HIGHLIGHT_COLORS[0];
              return (
                <div
                  key={hl.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-theme-elevated/70 border border-theme-border text-xs group hover:bg-theme-elevated transition-colors"
                >
                  <div
                    onClick={() => onJumpToText && onJumpToText(hl.text)}
                    className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                    title="Click to jump to this highlight in dispatch"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span className="font-serif font-bold text-theme-heading truncate">
                      "{hl.text}"
                    </span>
                    <ExternalLink className="h-3 w-3 text-theme-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <button
                    onClick={() => handleRemove(hl.id)}
                    className="p-1 text-theme-muted hover:text-rose-500 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
                    title="Remove highlight"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
