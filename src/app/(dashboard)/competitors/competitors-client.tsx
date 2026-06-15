"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Video = {
  videoId: string;
  title: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  tags: string[];
};

type Channel = {
  channelId: string;
  name: string;
  handle: string;
  description: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  country: string;
};

type Analysis = {
  topTitleWords: string[];
  avgViews: number;
  bestFormats: string[];
};

type Competitor = {
  channel: Channel;
  topVideos: Video[];
  analysis: Analysis;
};

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

function CompetitorCard({ competitor, onRemove }: { competitor: Competitor; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { channel, topVideos, analysis } = competitor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-gray-900/60 border border-white/8 rounded-2xl overflow-hidden"
    >
      {/* Channel header */}
      <div className="p-5 flex items-center gap-4">
        <img src={channel.thumbnail} alt={channel.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-white font-semibold truncate">{channel.name}</h3>
            {channel.handle && <span className="text-xs text-gray-500">{channel.handle}</span>}
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <span><span className="text-white font-medium">{fmt(channel.subscriberCount)}</span> subscribers</span>
            <span><span className="text-white font-medium">{fmt(channel.videoCount)}</span> videos</span>
            <span><span className="text-white font-medium">{fmt(channel.viewCount)}</span> total views</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setExpanded(e => !e)} className="btn-secondary text-xs py-1.5 px-3">
            {expanded ? "▲ Less" : "▼ Analyse"}
          </button>
          <button onClick={onRemove} className="text-gray-600 hover:text-red-400 transition-colors text-xs px-2">✕</button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-5 pb-4 grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-white">{fmt(analysis.avgViews)}</p>
          <p className="text-xs text-gray-500">avg views/video</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-white">{analysis.bestFormats.length > 0 ? analysis.bestFormats[0].split(" ")[0] : "Mixed"}</p>
          <p className="text-xs text-gray-500">top format</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-white">{fmt(topVideos[0]?.viewCount || 0)}</p>
          <p className="text-xs text-gray-500">best video views</p>
        </div>
      </div>

      {/* Expanded analysis */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/8"
          >
            <div className="p-5 space-y-5">
              {/* Top title keywords */}
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Keywords dominating their titles</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.topTitleWords.map((w, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-indigo-500/15 text-indigo-300 rounded-full border border-indigo-500/20">{w}</span>
                  ))}
                </div>
              </div>

              {/* Best formats */}
              {analysis.bestFormats.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Their best performing formats</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.bestFormats.map((f, i) => (
                      <span key={i} className="text-xs px-3 py-1 bg-white/8 text-gray-300 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Top videos */}
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Their top 5 most viewed videos</p>
                <div className="space-y-2">
                  {topVideos.slice(0, 5).map((v, i) => (
                    <a
                      key={v.videoId}
                      href={`https://www.youtube.com/watch?v=${v.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/8 transition-colors group"
                    >
                      <span className="text-xs text-gray-600 w-4 shrink-0">#{i + 1}</span>
                      <img src={v.thumbnail} alt="" className="w-16 h-10 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate group-hover:text-indigo-300 transition-colors">{v.title}</p>
                        <p className="text-xs text-gray-500">{fmt(v.viewCount)} views</p>
                      </div>
                      <span className="text-gray-600 text-xs shrink-0">↗</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Intelligence summary */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                <p className="text-xs text-indigo-400 font-medium mb-1">What you can learn from {channel.name}</p>
                <ul className="space-y-1">
                  {analysis.topTitleWords.slice(0, 3).length > 0 && (
                    <li className="text-sm text-gray-300 flex gap-2"><span className="text-indigo-400">→</span>Use words like "{analysis.topTitleWords.slice(0, 3).join('", "')}" in your titles</li>
                  )}
                  {analysis.bestFormats[0] && (
                    <li className="text-sm text-gray-300 flex gap-2"><span className="text-indigo-400">→</span>{analysis.bestFormats[0]} works well for this audience</li>
                  )}
                  <li className="text-sm text-gray-300 flex gap-2"><span className="text-indigo-400">→</span>Their top video got {fmt(topVideos[0]?.viewCount || 0)} views — study its title structure</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function CompetitorsClient() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || competitors.length >= 5) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/youtube/competitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query.trim() }),
    });
    const data = await res.json();

    if (data.error) {
      setError(data.error === "Channel not found" ? "Channel not found. Try the exact channel name or YouTube URL." : data.error);
    } else {
      const alreadyAdded = competitors.some(c => c.channel.channelId === data.channel.channelId);
      if (alreadyAdded) {
        setError("This channel is already in your list.");
      } else {
        setCompetitors(prev => [...prev, data]);
        setQuery("");
      }
    }
    setLoading(false);
  };

  const removeCompetitor = (channelId: string) => {
    setCompetitors(prev => prev.filter(c => c.channel.channelId !== channelId));
  };

  // Cross-competitor insights
  const allKeywords = competitors.flatMap(c => c.analysis.topTitleWords);
  const keywordFreq: Record<string, number> = {};
  allKeywords.forEach(w => { keywordFreq[w] = (keywordFreq[w] || 0) + 1; });
  const sharedKeywords = Object.entries(keywordFreq).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([w]) => w);

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Competitor Analysis</h1>
        <p className="text-gray-400 text-sm mt-1">Analyse what's working for top channels in your niche</p>
      </div>

      {/* Add competitor */}
      <form onSubmit={addCompetitor} className="mb-8">
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="Channel name, @handle, or YouTube URL (e.g. @MrBeast or youtube.com/c/veritasium)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            disabled={competitors.length >= 5}
          />
          <button
            type="submit"
            disabled={loading || !query.trim() || competitors.length >= 5}
            className="btn-primary px-6 disabled:opacity-50"
          >
            {loading ? "Analysing..." : "+ Add Channel"}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        {competitors.length >= 5 && <p className="text-gray-500 text-xs mt-2">Maximum 5 competitors reached.</p>}
      </form>

      {/* Cross-competitor insights */}
      <AnimatePresence>
        {competitors.length >= 2 && sharedKeywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🧠</span>
              <p className="text-yellow-400 font-semibold text-sm">Cross-Competitor Intelligence</p>
              <span className="text-xs text-gray-500">— keywords used by {competitors.length}+ channels in your niche</span>
            </div>
            <p className="text-gray-400 text-xs mb-3">These keywords appear across multiple top channels — they're proven to work in your niche:</p>
            <div className="flex flex-wrap gap-2">
              {sharedKeywords.slice(0, 12).map((w, i) => (
                <span key={i} className="text-xs px-3 py-1 bg-yellow-500/15 text-yellow-300 rounded-full border border-yellow-500/20 font-medium">{w}</span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {competitors.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔭</div>
          <h3 className="text-white font-semibold text-lg mb-2">No competitors added yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Add up to 5 YouTube channels to see their top videos, title patterns, and what's making them successful.
          </p>
        </div>
      )}

      {/* Competitor cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {competitors.map(c => (
            <CompetitorCard
              key={c.channel.channelId}
              competitor={c}
              onRemove={() => removeCompetitor(c.channel.channelId)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
