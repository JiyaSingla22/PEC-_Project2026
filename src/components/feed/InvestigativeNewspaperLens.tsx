import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Shield, Eye } from 'lucide-react';

export const InvestigativeNewspaperLens: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lensPos, setLensPos] = useState({ x: 190, y: 140 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const targetPosRef = useRef({ x: 190, y: 140 });
  const currentPosRef = useRef({ x: 190, y: 140 });
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Smooth animation loop for autonomous scanning + smooth mouse tracking
  useEffect(() => {
    const loop = () => {
      timeRef.current += 0.018;
      const t = timeRef.current;

      if (!isHovered && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width || 380;
        const height = rect.height || 280;

        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Smooth investigative scanning path across headlines and columns
        const autoX = centerX + Math.sin(t * 0.8) * (width * 0.32) + Math.cos(t * 1.6) * 20;
        const autoY = centerY + Math.sin(t * 1.4) * (height * 0.28) + Math.sin(t * 0.6) * 15;

        targetPosRef.current = { x: autoX, y: autoY };
        setTilt({
          x: Math.sin(t * 0.7) * 2.5,
          y: Math.cos(t * 0.7) * -3,
        });
      }

      // Smooth linear interpolation (lerp)
      const factor = isHovered ? 0.22 : 0.06;
      currentPosRef.current.x += (targetPosRef.current.x - currentPosRef.current.x) * factor;
      currentPosRef.current.y += (targetPosRef.current.y - currentPosRef.current.y) * factor;

      setLensPos({
        x: Math.round(currentPosRef.current.x * 10) / 10,
        y: Math.round(currentPosRef.current.y * 10) / 10,
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(20, Math.min(rect.width - 20, e.clientX - rect.left));
    const y = Math.max(20, Math.min(rect.height - 20, e.clientY - rect.top));

    targetPosRef.current = { x, y };

    // Gentle 3D perspective tilt towards cursor
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * -5;
    const tiltY = ((x - centerX) / centerX) * 6;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Mask style: Only reveal the circular region directly underneath the magnifying lens
  const lensRadius = 60; // 120px diameter lens view
  const revealMaskStyle = {
    WebkitMaskImage: `radial-gradient(circle at ${lensPos.x}px ${lensPos.y}px, black 0px, black ${lensRadius - 2}px, rgba(0,0,0,0.4) ${lensRadius}px, transparent ${lensRadius + 4}px)`,
    maskImage: `radial-gradient(circle at ${lensPos.x}px ${lensPos.y}px, black 0px, black ${lensRadius - 2}px, rgba(0,0,0,0.4) ${lensRadius}px, transparent ${lensRadius + 4}px)`,
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
      }}
      className="relative w-full max-w-[420px] aspect-[1.25/1] sm:aspect-[1.3/1] min-h-[290px] select-none cursor-crosshair overflow-hidden rounded-2xl border-2 border-theme-border/80 shadow-2xl bg-slate-950 transition-all duration-300"
    >
      {/* 3D Tilted Newspaper Stage */}
      <div
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.6s ease-out',
        }}
        className="relative w-full h-full p-4 sm:p-5 flex flex-col justify-between"
      >
        {/* ======================================================== */}
        {/* 1. INVISIBLE / REDACTED / CLASSIFIED BASE LAYER          */}
        {/* When magnifying glass is not over it, text is invisible! */}
        {/* ======================================================== */}
        <div className="absolute inset-0 p-4 sm:p-5 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900 flex flex-col justify-between opacity-80 pointer-events-none">
          {/* Faint watermark lines & redacted censor blocks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[8px] font-mono tracking-widest text-slate-700 uppercase pb-1 border-b border-slate-800/80">
              <span>CONFIDENTIAL ARCHIVE</span>
              <span>CLASSIFIED DISPATCH</span>
            </div>

            {/* Faint placeholder newspaper masthead */}
            <div className="h-6 w-3/4 mx-auto rounded bg-slate-800/40 my-1" />
            <div className="h-0.5 w-full bg-slate-800/50" />

            {/* Redacted Headline */}
            <div className="space-y-1.5 pt-2">
              <div className="h-4 w-5/6 rounded bg-slate-800/60" />
              <div className="h-4 w-3/5 rounded bg-slate-800/40" />
            </div>

            {/* Redacted Column Lines */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="space-y-2">
                <div className="h-2 w-full rounded bg-slate-800/30" />
                <div className="h-2 w-11/12 rounded bg-slate-800/30" />
                <div className="h-2 w-4/5 rounded bg-slate-800/30" />
                <div className="h-2 w-full rounded bg-slate-800/30" />
                <div className="h-2 w-3/4 rounded bg-slate-800/30" />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full rounded bg-slate-800/30" />
                <div className="h-2 w-5/6 rounded bg-slate-800/30" />
                <div className="h-2 w-full rounded bg-slate-800/30" />
                <div className="h-2 w-2/3 rounded bg-slate-800/30" />
                <div className="h-2 w-4/5 rounded bg-slate-800/30" />
              </div>
            </div>
          </div>

          {/* Classified watermark stamp */}
          <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-slate-700/60 pt-2 border-t border-slate-800/80">
            <span>HOVER TO MAGNIFY</span>
            <span>DOMPURIFY SHIELDED</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. REVEALED PRINTED NEWSPAPER (MASKED BY LENS RADIUS)   */}
        {/* Only visible where the magnifying glass is positioned!   */}
        {/* ======================================================== */}
        <div
          style={revealMaskStyle}
          className="absolute inset-0 p-4 sm:p-5 bg-[#faf6ee] text-[#111827] flex flex-col justify-between shadow-inner pointer-events-none transition-all duration-75"
        >
          {/* Authentic Newspaper Content */}
          <div className="space-y-2">
            {/* Top Newspaper Date & Issue Bar */}
            <div className="flex items-center justify-between text-[8px] font-mono tracking-widest font-bold uppercase text-amber-800 pb-1 border-b border-[#cfc3ab]">
              <span>OCTOBER 30, 2026 • LATE CITY DISPATCH</span>
              <span>NO. 42 • ZERO TELEMETRY</span>
            </div>

            {/* Grand Masthead */}
            <div className="text-center py-0.5">
              <h2 className="font-masthead text-lg sm:text-xl font-black tracking-tight text-[#0f172a] uppercase leading-none">
                The IncogniRead Gazette
              </h2>
              <div className="text-[7px] font-serif italic text-amber-900 tracking-wider pt-0.5">
                “All the News Fit to Stream — Client-Side Parsed With Speech Narration”
              </div>
            </div>

            <div className="border-t-2 border-b border-[#0f172a] my-1" />

            {/* Lead Story Headline */}
            <div className="space-y-1">
              <span className="text-[8px] font-mono font-bold tracking-widest uppercase bg-amber-500/20 px-1 py-0.2 rounded text-amber-900 inline-block">
                SPECIAL REPORT
              </span>
              <h3 className="font-editorial text-sm sm:text-base font-black text-[#0f172a] leading-tight">
                SECRET ALGORITHMS UNMASKED BY CLIENT-SIDE RSS READER
              </h3>
              <p className="font-serif italic text-[9px] text-[#475569] leading-tight">
                Decentralized in-browser engine bypasses cloud profiling and third-party tracking.
              </p>
            </div>

            {/* Two-Column Broadsheet Copy */}
            <div className="grid grid-cols-2 gap-3 pt-1 text-[8px] font-serif text-[#1e293b] leading-relaxed">
              <div className="space-y-1 border-r border-[#ded6c5] pr-2">
                <p>
                  <span className="font-editorial font-bold text-base float-left mr-1 leading-none text-amber-700">
                    I
                  </span>
                  ncogniRead introduces zero-latency client-side parsing stored directly in IndexedDB.
                  Every incoming stream is sanitized via strict DOMPurify filters.
                </p>
                <p>
                  SSRF vectors are actively blocked at the edge proxy, safeguarding local network interfaces.
                </p>
              </div>

              <div className="space-y-1">
                <p>
                  Paragraph-synchronized Web Speech narration brings the written word to life aloud.
                  Offline listeners retain complete autonomy over reading habits.
                </p>
                <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-[7px] font-mono font-bold text-amber-900">
                  CONFIDENTIAL • VERIFIED PRIVATE
                </div>
              </div>
            </div>
          </div>

          {/* Newspaper Footer */}
          <div className="flex items-center justify-between text-[8px] font-mono font-bold text-amber-900 pt-1 border-t border-[#cfc3ab]">
            <span>INC-2026-DISPATCH</span>
            <span>AUTHENTICATED CLIENT-SIDE</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. PHYSICAL MAGNIFYING GLASS ON TOP OF THE REVEAL        */}
        {/* ======================================================== */}
        <div
          style={{
            transform: `translate3d(${lensPos.x}px, ${lensPos.y}px, 0)`,
            transition: 'transform 0.05s linear',
          }}
          className="absolute top-0 left-0 pointer-events-none z-30"
        >
          {/* Glass Lens Circle Container (-ml-[60px] -mt-[60px] to center at pos) */}
          <div className="relative -ml-[60px] -mt-[60px] w-[120px] h-[120px]">
            {/* Outer Brass/Gold Metallic Rim */}
            <div
              className={`w-full h-full rounded-full border-[5px] border-amber-400 bg-amber-400/5 shadow-2xl transition-all duration-200 ${
                isHovered
                  ? 'border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.5),inset_0_0_20px_rgba(245,158,11,0.25)] scale-105'
                  : 'shadow-[0_10px_25px_rgba(0,0,0,0.6),inset_0_0_15px_rgba(245,158,11,0.15)]'
              }`}
            >
              {/* Metallic Bezel Inner Highlight */}
              <div className="w-full h-full rounded-full border border-amber-200/60" />
            </div>

            {/* Glass Curvature & Specular Glare Reflection */}
            <div className="absolute inset-1 rounded-full overflow-hidden pointer-events-none">
              {/* Crescent Glare Arc */}
              <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-gradient-to-br from-white/45 via-white/10 to-transparent transform -rotate-25 opacity-70" />
              {/* Bottom Subtle Reflection */}
              <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-tl from-amber-300/30 to-transparent opacity-50" />
            </div>

            {/* Center Optical Reticle / Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <span className="w-2.5 h-[1px] bg-amber-600" />
              <span className="w-[1px] h-2.5 bg-amber-600 -ml-[1px]" />
            </div>

            {/* Realistic Magnifying Glass Handle */}
            {/* Extends diagonally towards bottom-right at ~42deg angle */}
            <div className="absolute bottom-1 right-1 w-4 h-20 origin-top-left transform rotate-[-45deg] translate-x-3 translate-y-3 pointer-events-none">
              {/* Cast Shadow beneath handle */}
              <div className="absolute inset-0 bg-black/40 blur-sm transform translate-x-2 translate-y-2 rounded-full" />
              
              {/* Brass Ferrule Connector */}
              <div className="w-3.5 h-4 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-500 rounded-t-sm shadow-md" />
              
              {/* Walnut Wood / Polished Brass Handle Shaft */}
              <div className="w-3.5 h-16 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-900 rounded-b-xl shadow-lg border-x border-amber-500/40 relative">
                {/* Metallic Gold Ring Accent */}
                <div className="absolute top-6 inset-x-0 h-1 bg-amber-400 shadow-xs" />
                <div className="absolute bottom-2 inset-x-0 h-1 bg-amber-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Hover Pill in Corner */}
        <div className="absolute bottom-3 right-3 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 border border-amber-500/40 text-[10px] font-mono text-slate-200 shadow-xl backdrop-blur-md">
          <Search className="h-3 w-3 text-amber-400 animate-pulse" />
          <span>{isHovered ? 'Magnifier Focused' : 'Investigative Lens'}</span>
        </div>
      </div>
    </div>
  );
};
