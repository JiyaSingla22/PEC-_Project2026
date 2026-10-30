import React from 'react';

export interface IncogniReadLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const IncogniReadLogo: React.FC<IncogniReadLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Newspaper & Magnifying Glass Emblem with Pastel Champagne & Sand Styling */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#e8d7c3] via-[#deb887] to-[#bfa07a] shadow-md shadow-black/10 border border-[#e2cba8]/50 p-1.5 shrink-0 ${iconSizes[size]}`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-slate-950"
        >
          {/* Folded Newspaper Base */}
          <rect
            x="6"
            y="8"
            width="32"
            height="32"
            rx="3"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="2"
          />
          {/* Newspaper Masthead Banner in Pastel Champagne */}
          <path d="M10 13H34" stroke="#e2cba8" strokeWidth="2.5" strokeLinecap="round" />
          {/* Newspaper Column Lines */}
          <path d="M10 19H22" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 23H20" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 27H18" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 31H22" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

          {/* Newspaper Fold & Ear */}
          <path d="M26 18H34" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M26 22H34" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />

          {/* Magnifying Glass Overlaid in Pastel Champagne */}
          <circle
            cx="29"
            cy="27"
            r="8"
            fill="rgba(226, 203, 168, 0.28)"
            stroke="#e2cba8"
            strokeWidth="2.5"
          />
          {/* Lens glare */}
          <path
            d="M25 24C26 22 29 22 31 24"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Lens handle */}
          <path
            d="M35 33L42 40"
            stroke="#1e1b18"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M35 33L42 40"
            stroke="#caa77d"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Live reading pulse dot in Pastel Champagne */}
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e2cba8] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e2cba8] shadow-xs"></span>
        </span>
      </div>

      {showText && (
        <div className="leading-tight">
          <span
            className={`font-editorial font-black tracking-tight flex items-center ${textSizes[size]}`}
          >
            {/* Ink-black in Morning/Sepia, pure white in Midnight */}
            <span className="text-slate-950 dark:text-white font-black">Incogni</span>
            <span className="text-amber-700 dark:text-amber-300 font-serif font-black">Read</span>
            <span className="text-amber-500 font-serif">.</span>
          </span>
          <p className="text-[9px] font-mono tracking-widest uppercase text-slate-600 dark:text-slate-400 font-bold">
            The Private Broadsheet
          </p>
        </div>
      )}
    </div>
  );
};
