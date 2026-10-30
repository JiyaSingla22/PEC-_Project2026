import React, { useState, Suspense, lazy } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Headphones, Rss, ShieldCheck, Sparkles, Layers, Zap } from 'lucide-react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export interface SplineHeroProps {
  onOpenAddFeed: () => void;
  onExploreDiscovery: () => void;
}

export const SplineHero: React.FC<SplineHeroProps> = ({ onOpenAddFeed, onExploreDiscovery }) => {
  const [hasSplineError, setHasSplineError] = useState(false);

  return (
    <section className="relative w-full rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950/95 backdrop-blur-2xl overflow-hidden shadow-2xl mb-8">
      {/* Decorative ambient radial gradients */}
      <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 items-center relative z-10 min-h-[360px]">
        {/* Left Column: Hero Copy */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="amber" className="gap-1.5 py-1 px-3">
              <Rss className="h-3.5 w-3.5" />
              <span>Offline-First RSS Reader</span>
            </Badge>
            <Badge variant="emerald" className="gap-1.5 py-1 px-3">
              <Headphones className="h-3.5 w-3.5" />
              <span>Synced Paragraph TTS</span>
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Read and Listen to the Web with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400">
                Absolute Privacy
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
              Zero cloud tracking. Feeds are parsed in-browser, stored in <strong>IndexedDB</strong>, 
              sanitized with <strong>DOMPurify</strong>, and narrated aloud with synchronized paragraph highlights.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              variant="amber"
              size="md"
              onClick={onOpenAddFeed}
              className="gap-2 shadow-amber-500/20 shadow-lg"
            >
              <Rss className="h-4 w-4" />
              <span>Subscribe to Feed</span>
            </Button>

            <Button
              variant="glass"
              size="md"
              onClick={onExploreDiscovery}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Discover Co-Feeds</span>
            </Button>
          </div>

          {/* Tech Badges */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-xs">
            <div>
              <div className="font-bold text-white font-mono flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>SSRF-Safe</span>
              </div>
              <p className="text-[11px] text-slate-400">Relayed via CORS Proxy</p>
            </div>
            <div>
              <div className="font-bold text-white font-mono flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-amber-400" />
                <span>IndexedDB</span>
              </div>
              <p className="text-[11px] text-slate-400">Offline-first local cache</p>
            </div>
            <div>
              <div className="font-bold text-white font-mono flex items-center gap-1">
                <Headphones className="h-3.5 w-3.5 text-emerald-400" />
                <span>Web Speech</span>
              </div>
              <p className="text-[11px] text-slate-400">Zero-latency TTS engine</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Spline 3D Scene / Geometric Mesh Viewport */}
        <div className="lg:col-span-5 h-[280px] lg:h-full min-h-[300px] relative flex items-center justify-center p-6 overflow-hidden">
          {!hasSplineError ? (
            <div className="w-full h-full relative z-20">
              <Suspense
                fallback={
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                  </div>
                }
              >
                <Spline
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  onError={() => setHasSplineError(true)}
                  className="w-full h-full"
                />
              </Suspense>
            </div>
          ) : (
            // Fallback interactive 3D particle orb
            <div className="relative flex items-center justify-center h-48 w-48">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-emerald-500/20 blur-2xl animate-pulse" />
              <div className="h-36 w-36 rounded-3xl border border-amber-500/40 bg-slate-900/80 backdrop-blur-xl flex flex-col items-center justify-center shadow-2xl shadow-amber-500/20 transform hover:rotate-6 transition-transform duration-500">
                <Rss className="h-10 w-10 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-slate-300 mt-2">FEEDORA 3D</span>
              </div>
              <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/30 animate-[spin_15s_linear_infinite]" />
            </div>
          )}

          {/* Floating Pill */}
          <div className="absolute bottom-4 right-4 z-30 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Client Parser Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
};
