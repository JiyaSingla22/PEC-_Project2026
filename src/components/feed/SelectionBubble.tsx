import React from 'react';
import { HighlightColor, HIGHLIGHT_COLORS } from '../../lib/highlights';
import { Highlighter } from 'lucide-react';

export interface SelectionBubbleProps {
  x: number;
  y: number;
  selectedText: string;
  onSelectColor: (color: HighlightColor) => void;
  onClose: () => void;
}

export const SelectionBubble: React.FC<SelectionBubbleProps> = ({
  x,
  y,
  selectedText,
  onSelectColor,
  onClose,
}) => {
  return (
    <div
      className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 bg-[#0d1524] dark:bg-[#121c2e] text-white rounded-2xl shadow-2xl border border-[#e2cba8]/40 p-1.5 flex items-center gap-2 select-none animate-slide-up"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1 px-1.5 text-[11px] font-serif font-bold text-[#e2cba8]">
        <Highlighter className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Highlight:</span>
      </div>

      <div className="flex items-center gap-1.5">
        {HIGHLIGHT_COLORS.map((col) => (
          <button
            key={col.id}
            onClick={() => onSelectColor(col.id)}
            style={{ backgroundColor: col.hex }}
            className="h-5 w-5 rounded-full border border-black/20 hover:scale-125 transition-transform shadow-xs"
            title={`Highlight in ${col.label}`}
          />
        ))}
      </div>

      {/* Little tail triangle pointing down */}
      <div
        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#0d1524] dark:border-t-[#121c2e]"
      />
    </div>
  );
};
