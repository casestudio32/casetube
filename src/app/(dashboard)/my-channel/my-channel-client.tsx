"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

type Video = {
  videoId: string;
  title: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  tags: string[];
};

type ChannelData = {
  connected: boolean;
  usingOAuth: boolean;
  channel?: {
    id: string;
    name: string;
    handle: string;
    thumbnail: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
    description: string;
  };
  topVideos?: Video[];
  insights?: {
    avgViews: number;
    avgViewsFormatted: string;
    topVideo: Video | null;
    topWords: string[];
    totalVideos: number;
  };
};

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function MyChannelClient({ hasOAuth }: { hasOAuth: boolean }) {
  const [data, setData] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/youtube/my-channel")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse mb-8" />
      <div className="h-40 bg-white/5 rounded-2xl animate-pulse mb-6" />
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Channel</h1>
        <p className="text-gray-400 text-sm mt-1">Your YouTube channel performance and insights</p>
      </div>

      {/* Not connected */}
      {!data?.connected && (
        <div className="max-w-lg">
          <div className="bg-gray-900/60 border border-white/8 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">📺</div>
            <h2 className="text-white font-bold text-lg mb-2">Connect your YouTube channel</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Connect with Google to pull your real channel data — subscriber count, top videos, what's working, and what's not. CaseTube uses this to make AI content suggestions specific to YOUR channel's proven style.
            </p>

            {!hasOAuth ? (
              <div className="space-y-3">
                <button
                  onClick={() => signIn("google", { callbackUrl: "/my-channel" })}
                  className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 font-medium py-3 px-4 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Connect with Google + YouTube
                </button>
                <p className="text-xs text-gray-600">Read-only access. We never post or modify your channel.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                  You're signed in with Google but YouTube access wasn't granted. Sign in again to connect your channel.
                </p>
                <button
                  onClick={() => signIn("google", { callbackUrl: "/my-channel" })}
                  className="w-full btn-primary cursor-pointer"
                >
                  Re-connect with YouTube access
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connected */}
      {data?.connected && data.channel && data.insights && (
        <div className="space-y-6">
          {/* OAuth badge */}
          {data.usingOAuth && (
            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 w-fit">
              <span>✓</span> Connected via Google OAuth — showing your real channel data
            </div>
          )}

          {/* Channel card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/60 border border-white/8 rounded-2xl p-6 flex items-center gap-5">
            <img src={data.channel.thumbnail} alt={data.channel.name} className="w-20 h-20 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-xl">{data.channel.name}</h2>
              {data.channel.handle && <p className="text-gray-400 text-sm">{data.channel.handle}</p>}
              {data.channel.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{data.channel.description}</p>}
            </div>
            <a
              href={`https://www.youtube.com/channel/${data.channel.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm shrink-0"
            >
              View on YouTube ↗
            </a>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Subscribers", value: fmt(data.channel.subscriberCount), icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
              { label: "Total Videos", value: fmt(data.channel.videoCount), icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
              { label: "Total Views", value: fmt(data.channel.viewCount), icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
              { label: "Avg Views/Video", value: data.insights.avgViewsFormatted, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="bg-gray-900/60 border border-white/8 rounded-2xl p-4 text-center">
                <div className="text-zinc-400 flex justify-center mb-2">{stat.icon}</div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Top video + keywords */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Keywords working for your channel */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900/60 border border-white/8 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-1">Words that work on your channel</h3>
              <p className="text-gray-500 text-xs mb-4">From your top performing video titles</p>
              <div className="flex flex-wrap gap-2">
                {data.insights.topWords.map((w, i) => (
                  <span key={i} className="text-sm px-3 py-1 bg-indigo-500/15 text-indigo-300 rounded-full border border-indigo-500/20">{w}</span>
                ))}
              </div>
              {data.insights.topVideo && (
                <div className="mt-4 pt-4 border-t border-white/8">
                  <p className="text-xs text-gray-400 mb-2">Your best performing video</p>
                  <a href={`https://www.youtube.com/watch?v=${data.insights.topVideo.videoId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <img src={data.insights.topVideo.thumbnail} alt="" className="w-20 h-12 object-cover rounded-lg shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium group-hover:text-indigo-300 transition-colors line-clamp-2">{data.insights.topVideo.title}</p>
                      <p className="text-green-400 text-xs mt-0.5">{fmt(data.insights.topVideo.viewCount)} views</p>
                    </div>
                  </a>
                </div>
              )}
            </motion.div>

            {/* AI insight */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-1">What CaseTube learns from your channel</h3>
              <p className="text-gray-400 text-xs mb-4">This data is injected into every AI generation to match YOUR proven style</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-indigo-400 text-lg shrink-0">→</span>
                  <p className="text-sm text-gray-300">Your audience responds to titles with <span className="text-white font-medium">"{data.insights.topWords.slice(0, 2).join('", "')}"</span> — the AI will prioritise these</p>
                </li>
                <li className="flex gap-3">
                  <span className="text-indigo-400 text-lg shrink-0">→</span>
                  <p className="text-sm text-gray-300">Your top video has <span className="text-white font-medium">{fmt(data.insights.topVideo?.viewCount || 0)} views</span> — the AI will study its structure for hooks and scripts</p>
                </li>
                <li className="flex gap-3">
                  <span className="text-indigo-400 text-lg shrink-0">→</span>
                  <p className="text-sm text-gray-300">Average of <span className="text-white font-medium">{data.insights.avgViewsFormatted} views per video</span> — AI titles and hooks are benchmarked to beat this</p>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Top videos */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-900/60 border border-white/8 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4">Your top videos</h3>
            <div className="space-y-2">
              {(data.topVideos || []).slice(0, 8).map((v, i) => (
                <a
                  key={v.videoId}
                  href={`https://www.youtube.com/watch?v=${v.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors group"
                >
                  <span className="text-xs text-gray-600 w-5 shrink-0 text-center">#{i + 1}</span>
                  <img src={v.thumbnail} alt="" className="w-20 h-12 object-cover rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate group-hover:text-indigo-300 transition-colors">{v.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{timeAgo(v.publishedAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-white">{fmt(v.viewCount)}</p>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
