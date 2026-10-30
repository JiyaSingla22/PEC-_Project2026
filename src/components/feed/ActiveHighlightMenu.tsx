import React from 'react';
import { ClientHighlight, HighlightColor, HIGHLIGHT_COLORS } from '../../lib/highlights';
import { Trash2, X } from 'lucide-react';

export interface ActiveHighlightMenuProps {
  x: number;
  y: number;
  highlight: ClientHighlight;
  onChangeColor: (newColor: HighlightColor) => void;
  onRemove: () => void;
  onClose: () => void;
}

export const ActiveHighlightMenu: React.FC<ActiveHighlightMenuProps> = ({
  x,
  y,
  highlight,
  onChangeColor,
  onRemove,
  onClose,
}) => {
  return (
    <div
      className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 bg-[#0d1524] dark:bg-[#121c2e] text-white rounded-2xl shadow-2xl border border-[#e2cba8]/40 p-2 flex items-center gap-2 select-none animate-slide-up"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1.5 px-1.5 text-xs font-serif font-bold text-[#e2cba8] max-w-[140px] truncate">
        "{highlight.text}"
      </div>

      <div className="flex items-center gap-1 border-l border-white/20 pl-2">
        {HIGHLIGHT_COLORS.map((col) => (
          <button
            key={col.id}
            onClick={() => onChangeColor(col.id)}
            style={{ backgroundColor: col.hex }}
            className={`h-4 w-4 rounded-full border border-black/20 hover:scale-125 transition-transform ${
              highlight.color === col.id ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
            }`}
            title={`Change to ${col.label}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-1 border-l border-white/20 pl-1.5">
        <button
          onClick={onRemove}
          className="p-1 hover:text-rose-400 text-white/80 rounded transition-colors"
          title="Remove highlight"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={onClose}
          className="p-1 hover:text-white text-white/60 rounded transition-colors"
          title="Close menu"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Little tail pointing down */}
      <div
        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#0d1524] dark:border-t-[#121c2e]"
      />
    </div>
  );
};
