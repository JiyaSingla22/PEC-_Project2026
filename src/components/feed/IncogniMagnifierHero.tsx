import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Rss,
  ShieldCheck,
  Sparkles,
  Layers,
  Eye,
} from 'lucide-react';

export interface IncogniMagnifierHeroProps {
  onOpenAddFeed: () => void;
  onExploreDiscovery: () => void;
}

export const IncogniMagnifierHero: React.FC<IncogniMagnifierHeroProps> = ({
  onOpenAddFeed,
  onExploreDiscovery,
}) => {
  // Lens position relative to the newspaper container
  const [lensPos, setLensPos] = useState<{ x: number; y: number }>({ x: 190, y: 130 });
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const targetPosRef = useRef<{ x: number; y: number }>({ x: 190, y: 130 });
  const autoTimeRef = useRef<number>(0);

  // Smooth animation loop: follows mouse when hovering, otherwise glides in inspection path
  useEffect(() => {
    let active = true;

    const animate = () => {
      if (!active) return;

      if (!isHovering) {
        // Automatic reading trajectory
        autoTimeRef.current += 0.015;
        const t = autoTimeRef.current;
        // Figure-8 trajectory across headlines and columns
        const newX = 200 + Math.sin(t) * 110;
        const newY = 140 + Math.cos(t * 1.5) * 65;
        targetPosRef.current = { x: newX, y: newY };
      }

      // Smooth spring interpolation
      setLensPos((prev) => {
        const dx = targetPosRef.current.x - prev.x;
        const dy = targetPosRef.current.y - prev.y;
        return {
          x: prev.x + dx * 0.12,
          y: prev.y + dy * 0.12,
        };
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isHovering]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(50, Math.min(rect.width - 50, e.clientX - rect.left));
    const y = Math.max(50, Math.min(rect.height - 50, e.clientY - rect.top));
    targetPosRef.current = { x, y };
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const lensRadius = isHovering ? 76 : 70;

  return (
    <section className="relative w-full rounded-3xl border-2 border-theme-border bg-theme-surface overflow-hidden shadow-xl mb-8 transition-colors duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center relative z-10 min-h-[420px]">
        {/* Left Column: Hero Copy & Value Proposition */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="amber" className="gap-1.5 py-1 px-3 font-editorial text-xs">
              <Rss className="h-3.5 w-3.5" />
              <span>Private Broadsheet</span>
            </Badge>
            <Badge variant="emerald" className="gap-1.5 py-1 px-3 font-mono text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Zero Cloud Tracking</span>
            </Badge>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-editorial text-slate-950 dark:text-slate-100 tracking-tight leading-tight">
              Read the Global Web with{' '}
              <span className="text-amber-700 dark:text-amber-400 font-serif">
                Absolute Incognito Privacy
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed max-w-xl">
              Zero cloud telemetry. Articles are parsed in memory, securely stored in <strong>IndexedDB</strong>, 
              sanitized against malicious scripts, and presented in high-fidelity broadsheet typography.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              variant="amber"
              size="md"
              onClick={onOpenAddFeed}
              className="gap-2 shadow-amber-500/20 shadow-lg font-serif font-bold text-slate-950"
            >
              <Rss className="h-4 w-4" />
              <span>Subscribe to Feed</span>
            </Button>

            <Button
              variant="glass"
              size="md"
              onClick={onExploreDiscovery}
              className="gap-2 font-serif font-bold text-slate-900 dark:text-slate-100 border border-theme-border"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Discover Dispatches</span>
            </Button>
          </div>

          {/* Tech Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-theme-subtle text-xs">
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 font-mono flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Zero Telemetry</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-serif">No tracking cookies</p>
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 font-mono flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-amber-500" />
                <span>IndexedDB</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-serif">Offline cache</p>
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 font-mono flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Distraction-Free</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-serif">Editorial reading</p>
            </div>
          </div>
        </div>

        {/* Right Column: Newspaper with Magnifying Glass Reveal */}
        <div className="lg:col-span-6 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-[460px] h-[330px] rounded-2xl border-2 border-theme-border bg-[#ede7d8] dark:bg-[#0c121e] shadow-2xl overflow-hidden cursor-crosshair group select-none transition-all duration-300 hover:border-amber-500/50"
            title="Move your mouse over the newspaper to inspect secret dispatches through the magnifying glass"
          >
            {/* 1. Base Layer: Dimmed / Obscured Newspaper Outline */}
            <div className="absolute inset-0 p-5 opacity-30 dark:opacity-25 bg-[#f5f1e6] dark:bg-[#070b12] text-slate-900 dark:text-slate-100 pointer-events-none transition-opacity duration-300 group-hover:opacity-40">
              <div className="border-b-2 border-slate-900 dark:border-slate-500 pb-1 mb-2 flex justify-between items-center text-[8px] font-mono">
                <span>VOL. XXIV • NO. 302</span>
                <span className="font-bold">INCOGNIREAD MORNING DISPATCH</span>
                <span>RESTRICTED</span>
              </div>
              <h3 className="text-xl font-editorial font-black uppercase text-center mb-2">
                THE INCOGNIREAD CHRONICLE
              </h3>
              <div className="border-t border-b border-slate-900 dark:border-slate-500 py-0.5 text-[9px] font-serif text-center italic mb-2">
                "Special Investigation: Zero Cloud Telemetry in Modern Reading"
              </div>
              <div className="grid grid-cols-2 gap-3 text-[9px] leading-snug font-serif">
                <p>
                  Classified dispatches reveal an independent RSS protocol operating entirely client-side.
                  All external requests are sanitized against script injection...
                </p>
                <p>
                  Broadsheet typography engine formats dispatches into dual-column editorial layouts 
                  with custom drop-caps and serif fonts...
                </p>
              </div>
            </div>

            {/* 2. Revealed Layer: Crystal-clear, illuminated, magnified newspaper visible ONLY under the magnifying lens */}
            <div
              className="absolute inset-0 p-5 bg-[#ffffff] text-slate-950 pointer-events-none transition-transform duration-75 shadow-inner"
              style={{
                clipPath: `circle(${lensRadius}px at ${lensPos.x}px ${lensPos.y}px)`,
                transform: `scale(${isHovering ? 1.03 : 1.0})`,
                transformOrigin: `${lensPos.x}px ${lensPos.y}px`,
              }}
            >
              {/* Newspaper Header */}
              <div className="border-b-2 border-slate-950 pb-1 mb-2 flex justify-between items-center text-[8px] font-mono text-slate-700">
                <span className="text-amber-800 font-bold">TOP SECRET DISPATCH</span>
                <span className="font-bold font-editorial text-slate-950">THE INCOGNIREAD CHRONICLE</span>
                <span>OCTOBER 2026</span>
              </div>

              {/* Grand Main Headline */}
              <h2 className="text-xl sm:text-2xl font-editorial font-black uppercase text-slate-950 tracking-tight leading-tight text-center mb-1.5 drop-shadow-xs">
                INCOGNITO RSS ENGINE UNVEILED
              </h2>

              <p className="text-[10px] text-amber-900 font-serif italic text-center mb-2 pb-1 border-b border-slate-300">
                "All telemetry stripped client-side in IndexedDB cache before rendering"
              </p>

              {/* Columns of Newspaper Prose with authentic drop-cap */}
              <div className="grid grid-cols-2 gap-3 text-[9px] leading-relaxed text-slate-900 font-serif">
                <div>
                  <p>
                    <span className="float-left text-2xl font-black font-editorial mr-1 leading-none text-amber-800">
                      I
                    </span>
                    NCOGNITO protocol guarantees zero server-side logs. Your subscription list stays in private storage, 
                    isolated behind origin permissions.
                  </p>
                </div>
                <div>
                  <p>
                    Pure distraction-free typography with instant client-side parsing.
                    Hover anywhere to reveal hidden dispatches.
                  </p>
                </div>
              </div>

              {/* Verified Stamp Emblem inside Lens */}
              <div className="mt-2 pt-1 border-t border-slate-300 flex items-center justify-between text-[8px] font-mono text-emerald-800">
                <span className="font-bold">STATUS: UNFILTERED BROADSHEET</span>
                <span className="font-bold text-amber-800">SECURITY: 100% PRIVATE</span>
              </div>
            </div>

            {/* 3. Magnifying Glass Rim & Specular Glare (Physical Lens Frame) */}
            <div
              className="absolute pointer-events-none transition-transform duration-75"
              style={{
                left: `${lensPos.x}px`,
                top: `${lensPos.y}px`,
                transform: 'translate(-50%, -50%)',
                width: `${lensRadius * 2}px`,
                height: `${lensRadius * 2}px`,
              }}
            >
              {/* Pastel Champagne & Sand Bezel Ring */}
              <div
                className="w-full h-full rounded-full border-4 border-[#e2cba8] shadow-2xl relative"
                style={{
                  boxShadow: '0 0 0 2px #c2a781, 0 8px 24px rgba(0,0,0,0.45), inset 0 2px 4px rgba(255,255,255,0.6)',
                }}
              >
                {/* Convex Glass Specular Highlight Curve */}
                <div className="absolute top-2 left-3 right-6 h-1/3 rounded-t-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none transform -rotate-12" />

                {/* Center Reticle crosshairs subtle indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-2.5 h-[1px] bg-[#caa77d]" />
                  <div className="h-2.5 w-[1px] bg-[#caa77d] absolute" />
                </div>
              </div>

              {/* Magnifier Physical Handle */}
              <div
                className="absolute w-4 h-16 bg-gradient-to-r from-[#9e8360] via-[#caa77d] to-[#6d573c] rounded-b-md shadow-xl border-t-2 border-[#e2cba8]"
                style={{
                  left: '86%',
                  top: '86%',
                  transformOrigin: 'top left',
                  transform: 'rotate(-45deg)',
                  boxShadow: '4px 6px 12px rgba(0,0,0,0.5)',
                }}
              >
                {/* Brass grip ribs */}
                <div className="w-full h-1 bg-[#e2cba8]/70 mt-3" />
                <div className="w-full h-1 bg-[#e2cba8]/70 mt-2" />
                <div className="w-full h-1 bg-[#e2cba8]/70 mt-2" />
                <div className="w-full h-2 bg-[#f0e3ce] rounded-b-sm mt-3" />
              </div>
            </div>

            {/* Interactive hint on bottom right */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-[#e2cba8] text-[9px] font-mono pointer-events-none flex items-center gap-1 shadow-sm">
              <Eye className="h-3 w-3" />
              <span>Inspect Lens</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
