"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type FeedData = {
  niche: string;
  channelStats: { name: string; handle: string; thumbnail: string; subscriberCount: number; viewCount: number; videoCount: number; avgViews: number; subscribersFormatted: string; viewsFormatted: string; avgViewsFormatted: string } | null;
  outliers: { videoId: string; title: string; thumbnail: string; channelTitle: string; viewCount: number; viewsFormatted: string; publishedAt: string }[];
  keywords: { keyword: string; score: number; trend: string }[];
  ideas: { title: string; hook: string; why: string; format: string }[];
  titleUpgrade: { topic: string; weak: string; strong: string; improvement: string } | null;
  milestones: { type: string; current: number; target: number; label: string; pct: number }[];
  topTitles: string[];
  avgViews: number;
  generatedAt: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function ScoreBar({ score, trend }: { score: number; trend: string }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-zinc-500";
  const trendColor = trend === "rising" ? "text-green-400" : trend === "stable" ? "text-blue-400" : "text-zinc-400";
  const trendLabel = trend === "rising" ? "↑ Rising" : trend === "stable" ? "→ Stable" : "⚡ Hot";
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className={`h-full rounded-full ${color}`} />
      </div>
      <span className="text-xs font-bold text-white w-7 text-right">{score}</span>
      <span className={`text-xs ${trendColor} w-14 text-right`}>{trendLabel}</span>
    </div>
  );
}

function CardShell({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden">
      {children}
    </motion.div>
  );
}

function CardHeader({ icon, title, tag }: { icon: React.ReactNode; title: string; tag?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
      <div className="flex items-center gap-2.5">
        <span className="text-zinc-400">{icon}</span>
        <span className="text-white font-semibold text-sm">{title}</span>
      </div>
      {tag && <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{tag}</span>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 animate-pulse">
      <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-full" />
        <div className="h-3 bg-zinc-800 rounded w-4/5" />
        <div className="h-3 bg-zinc-800 rounded w-3/5" />
      </div>
    </div>
  );
}

// ── Cards ──────────────────────────────────────────────────────────

function ChannelPulseCard({ stats }: { stats: NonNullable<FeedData["channelStats"]> }) {
  const items = [
    { label: "Subscribers", value: stats.subscribersFormatted, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>, color: "text-indigo-400" },
    { label: "Total Views", value: stats.viewsFormatted, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, color: "text-blue-400" },
    { label: "Videos", value: String(stats.videoCount), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>, color: "text-purple-400" },
    { label: "Avg Views", value: stats.avgViewsFormatted, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>, color: "text-green-400" },
  ];
  return (
    <CardShell delay={0.05}>
      <CardHeader icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>} title="Channel Pulse" tag="Live" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          {stats.thumbnail && <img src={stats.thumbnail} alt="" className="w-10 h-10 rounded-full object-cover" />}
          <div>
            <p className="text-white font-semibold text-sm">{stats.name}</p>
            {stats.handle && <p className="text-zinc-500 text-xs">{stats.handle}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {items.map(item => (
            <div key={item.label} className="bg-zinc-800/50 rounded-xl p-3">
              <div className={`mb-1 ${item.color}`}>{item.icon}</div>
              <p className="text-white font-bold text-xl">{item.value}</p>
              <p className="text-zinc-500 text-xs">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

function OutliersCard({ outliers, niche }: { outliers: FeedData["outliers"]; niche: string }) {
  return (
    <CardShell delay={0.1}>
      <CardHeader icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>} title="Niche Outliers" tag="Last 7 days" />
      <div className="p-5 space-y-3">
        <p className="text-zinc-500 text-xs mb-3">Top performing videos in <span className="text-white">{niche}</span> right now</p>
        {outliers.map((v, i) => (
          <a key={v.videoId} href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener noreferrer"
            className="flex gap-3 p-3 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/80 transition-all group">
            <div className="relative flex-shrink-0">
              <img src={v.thumbnail} alt="" className="w-24 h-14 object-cover rounded-lg" />
              <div className="absolute top-1 left-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-bold">#{i + 1}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium line-clamp-2 group-hover:text-indigo-300 transition-colors leading-snug">{v.title}</p>
              <p className="text-zinc-500 text-xs mt-1">{v.channelTitle}</p>
              <p className="text-green-400 text-xs font-semibold mt-1">{v.viewsFormatted} views · {timeAgo(v.publishedAt)}</p>
            </div>
          </a>
        ))}
        <Link href="/trends" className="flex items-center justify-center gap-2 w-full py-2.5 mt-1 border border-zinc-700 hover:border-zinc-500 rounded-xl text-zinc-400 hover:text-white text-xs transition-all">
          See all trends →
        </Link>
      </div>
    </CardShell>
  );
}

function KeywordsCard({ keywords }: { keywords: FeedData["keywords"] }) {
  return (
    <CardShell delay={0.15}>
      <CardHeader icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>} title="Keyword Opportunities" />
      <div className="p-5 space-y-3">
        {keywords.map((kw, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-medium">{kw.keyword}</span>
            </div>
            <ScoreBar score={kw.score} trend={kw.trend} />
          </div>
        ))}
        <Link href="/seo" className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 hover:border-blue-500/40 rounded-xl text-blue-400 text-xs font-medium transition-all">
          Deep dive in SEO Center →
        </Link>
      </div>
    </CardShell>
  );
}

function TitleUpgradeCard({ upgrade }: { upgrade: NonNullable<FeedData["titleUpgrade"]> }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(upgrade.strong);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <CardShell delay={0.2}>
      <CardHeader icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>} title="Title Upgrade" tag={upgrade.topic} />
      <div className="p-5 space-y-3">
        <div className="p-3 bg-red-500/8 border border-red-500/15 rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-400 text-xs font-medium">Weak title</span>
          </div>
          <p className="text-zinc-400 text-sm line-through">{upgrade.weak}</p>
        </div>
        <div className="p-3 bg-green-500/8 border border-green-500/15 rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-green-400 text-xs font-medium">Optimised title</span>
          </div>
          <p className="text-white text-sm font-medium">{upgrade.strong}</p>
        </div>
        <p className="text-zinc-500 text-xs leading-relaxed">💡 {upgrade.improvement}</p>
        <div className="flex gap-2">
          <button onClick={copy} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded-xl transition-all">
            {copied ? "Copied!" : "Copy title"}
          </button>
          <Link href="/seo?tab=titles" className="flex-1 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 text-xs rounded-xl transition-all text-center">
            Generate more →
          </Link>
        </div>
      </div>
    </CardShell>
  );
}

function IdeasCard({ ideas }: { ideas: FeedData["ideas"] }) {
  const formatColors: Record<string, string> = {
    Tutorial: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    List: "bg-purple-500/15 text-purple-400 border-purple-500/20",
    Story: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    "Case Study": "bg-green-500/15 text-green-400 border-green-500/20",
  };
  return (
    <CardShell delay={0.25}>
      <CardHeader icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} title="Fresh Content Ideas" tag="AI + YouTube data" />
      <div className="p-5 space-y-3">
        {ideas.map((idea, i) => (
          <div key={i} className="p-4 bg-zinc-800/40 rounded-xl space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-white text-sm font-semibold leading-snug flex-1">{idea.title}</p>
              <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border ${formatColors[idea.format] || "bg-zinc-700 text-zinc-400 border-zinc-600"}`}>{idea.format}</span>
            </div>
            <p className="text-zinc-400 text-xs italic">"{idea.hook}"</p>
            <p className="text-zinc-500 text-xs">{idea.why}</p>
          </div>
        ))}
        <Link href="/studio" className="flex items-center justify-center gap-2 w-full py-2.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 hover:border-purple-500/40 rounded-xl text-purple-400 text-xs font-medium transition-all">
          Generate full script →
        </Link>
      </div>
    </CardShell>
  );
}

function MilestonesCard({ milestones }: { milestones: FeedData["milestones"] }) {
  return (
    <CardShell delay={0.3}>
      <CardHeader icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>} title="Milestones" />
      <div className="p-5 space-y-4">
        {milestones.map((m, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white font-medium">{m.label}</span>
              <span className="text-zinc-400">{m.current.toLocaleString()} / {m.target.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 + i * 0.1 }} className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            </div>
            <p className="text-zinc-500 text-xs">{m.pct}% there · {(m.target - m.current).toLocaleString()} to go</p>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function NicheInsightCard({ topTitles, avgViews, niche }: { topTitles: string[]; avgViews: number; niche: string }) {
  if (!topTitles.length) return null;
  return (
    <CardShell delay={0.35}>
      <CardHeader icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>} title="What's Working in Your Niche" />
      <div className="p-5">
        <p className="text-zinc-500 text-xs mb-3">Top video titles in <span className="text-white">{niche}</span> right now (avg {avgViews.toLocaleString()} views)</p>
        <div className="space-y-2">
          {topTitles.map((t, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 bg-zinc-800/40 rounded-lg">
              <span className="text-zinc-600 text-xs font-bold mt-0.5 w-4 flex-shrink-0">#{i + 1}</span>
              <p className="text-zinc-300 text-xs leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

// ── Main Component ─────────────────────────────────────────────────

export function FeedClient({ userId, accessToken }: { userId: string; accessToken?: string }) {
  const [data, setData] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ userId });
      if (accessToken) params.set("accessToken", accessToken);
      const res = await fetch(`/api/feed?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError("Failed to load feed. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, accessToken]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Feed</h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              {data ? `Updated ${timeAgo(data.generatedAt)} · ${data.niche}` : "Personalised daily briefing"}
            </p>
          </div>
          <button
            onClick={() => load(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-sm rounded-xl transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? "animate-spin" : ""}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button onClick={() => load()} className="text-white text-sm bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl transition-all">Try again</button>
          </div>
        )}

        {/* Feed */}
        {data && !loading && (
          <div className="space-y-4">
            {data.channelStats && <ChannelPulseCard stats={data.channelStats} />}
            {data.milestones.length > 0 && <MilestonesCard milestones={data.milestones} />}
            {data.outliers.length > 0 && <OutliersCard outliers={data.outliers} niche={data.niche} />}
            {data.keywords.length > 0 && <KeywordsCard keywords={data.keywords} />}
            {data.titleUpgrade && <TitleUpgradeCard upgrade={data.titleUpgrade} />}
            {data.ideas.length > 0 && <IdeasCard ideas={data.ideas} />}
            {data.topTitles.length > 0 && <NicheInsightCard topTitles={data.topTitles} avgViews={data.avgViews} niche={data.niche} />}

            {/* No channel connected nudge */}
            {!data.channelStats && (
              <CardShell delay={0}>
                <div className="p-6 text-center">
                  <div className="text-zinc-600 flex justify-center mb-3">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
                  </div>
                  <p className="text-white font-semibold mb-1">Connect your channel</p>
                  <p className="text-zinc-500 text-sm mb-4">Link your YouTube channel to see your stats, milestones, and personalised insights.</p>
                  <Link href="/my-channel" className="inline-block px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all">Connect Channel →</Link>
                </div>
              </CardShell>
            )}

            <p className="text-center text-zinc-700 text-xs pb-4">Feed refreshes with live YouTube data each time you visit</p>
          </div>
        )}
      </div>
    </div>
  );
}
