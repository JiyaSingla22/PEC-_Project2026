import React, { useState, useEffect } from 'react';
import { useFeeds } from '../../context/FeedContext';
import { DiscoveryRecommendation } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Compass,
  Sparkles,
  Users,
  Plus,
  Check,
  Shield,
  Send,
  Layers,
  ExternalLink,
} from 'lucide-react';

export const AnonymousDiscovery: React.FC = () => {
  const { feeds, addNewFeed } = useFeeds();
  const [recommendations, setRecommendations] = useState<DiscoveryRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedUrls, setAddedUrls] = useState<Set<string>>(new Set());
  const [telemetryStatus, setTelemetryStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecommendations() {
      setIsLoading(true);
      try {
        const userFeedUrls = feeds.map((f) => f.feedUrl).join(',');
        const res = await fetch(`/api/discovery?userFeeds=${encodeURIComponent(userFeedUrls)}`);
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.recommendations || []);
        }
      } catch (err) {
        console.warn('[AnonymousDiscovery] Failed to fetch recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecommendations();
  }, [feeds.length]);

  const handleSubscribe = async (rec: DiscoveryRecommendation) => {
    try {
      await addNewFeed(rec.feedUrl, rec.category);
      setAddedUrls((prev) => new Set([...prev, rec.feedUrl]));
    } catch (err) {
      alert(`Could not subscribe to feed: ${err}`);
    }
  };

  const handleContributeTelemetry = async () => {
    try {
      setTelemetryStatus('submitting');
      const res = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedCount: feeds.length,
          timestamp: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setTelemetryStatus('success');
        setTimeout(() => setTelemetryStatus(null), 4000);
      } else {
        const errJson = await res.json();
        alert(errJson.error || 'Failed to submit telemetry');
        setTelemetryStatus(null);
      }
    } catch (err) {
      setTelemetryStatus(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Privacy Guarantee Header Card */}
      <Card glow="amber" className="p-4 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/80">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 mt-0.5">
            <Compass className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Co-Subscription Discovery</span>
              <Badge variant="amber" className="text-[10px] py-0 px-1.5 font-mono">
                Anonymous
              </Badge>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discovers recommendations computed from collective feed correlations, without logging personal identity or article reads.
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span>Salted SHA-256 IP Clustered</span>
          </div>
          <button
            onClick={handleContributeTelemetry}
            disabled={telemetryStatus === 'submitting' || telemetryStatus === 'success'}
            className="text-amber-400 hover:underline flex items-center gap-1 font-semibold disabled:opacity-50"
          >
            {telemetryStatus === 'success' ? (
              <span className="text-emerald-400">Synced Anonymously</span>
            ) : (
              <>
                <Send className="h-3 w-3" />
                <span>Sync Co-Graph</span>
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          <span>Curated Recommendations</span>
          <span className="text-[10px] font-mono text-amber-400">{recommendations.length} available</span>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
            {isLoading ? 'Scanning co-subscription graph...' : 'You are subscribed to all recommended feeds!'}
          </div>
        ) : (
          recommendations.map((rec) => {
            const isSubscribed = addedUrls.has(rec.feedUrl) || feeds.some((f) => f.feedUrl === rec.feedUrl);
            return (
              <div
                key={rec.feedUrl}
                className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all duration-200 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      <span>{rec.title}</span>
                    </h5>
                    <Badge variant="glass" className="text-[10px] font-mono py-0 px-1.5 mt-0.5">
                      {rec.category}
                    </Badge>
                  </div>

                  <Button
                    variant={isSubscribed ? 'outline' : 'amber'}
                    size="sm"
                    disabled={isSubscribed}
                    onClick={() => handleSubscribe(rec)}
                    className="h-8 px-2.5 text-xs min-h-[32px] gap-1 shrink-0"
                  >
                    {isSubscribed ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Subscribed</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {rec.description}
                </p>

                {/* Transparent Reasoning Badge */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-amber-400/90 italic truncate max-w-[210px]">
                    "{rec.reason}"
                  </span>
                  <a
                    href={rec.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white p-1"
                    title="Visit site"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
