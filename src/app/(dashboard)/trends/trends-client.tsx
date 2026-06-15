"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Trend = {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  timeAgo: string;
  duration: string;
  tags: string[];
  velocityLabel: string;
  velocityColor: string;
  viewsPerHour: number;
  description: string;
};

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export function TrendsClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchedAt, setFetchedAt] = useState("");
  const [creating, setCreating] = useState<string | null>(null);
  const [customNiche, setCustomNiche] = useState("");
  const [searchNiche, setSearchNiche] = useState("");

  const fetchTrends = async (refresh = false, nicheOverride?: string) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    const nicheParam = nicheOverride || searchNiche || "";
    const url = `/api/youtube/trends?userId=${userId}&refresh=${refresh}${nicheParam ? `&niche=${encodeURIComponent(nicheParam)}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();

    setTrends(data.trends || []);
    setNiche(data.niche || "");
    setFetchedAt(data.fetchedAt || "");
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchTrends(); }, []);

  const createProjectFromTrend = async (trend: Trend) => {
    setCreating(trend.videoId);
    const res = await fetch("/api/projects/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title: trend.title,
        videoTopic: `Based on trending video by ${trend.channelName} — ${fmt(trend.viewCount)} views in ${trend.timeAgo}`,
        description: `Inspired by: "${trend.title}" (${trend.channelName})`,
      }),
    });
    const data = await res.json();
    if (data.project) router.push(`/projects/${data.project.id}`);
    setCreating(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchNiche(customNiche);
    fetchTrends(true, customNiche);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Trend Finder</h1>
          <p className="text-gray-400 text-sm mt-1">
            What's blowing up in <span className="text-white font-medium">{niche || "your niche"}</span> right now
            {fetchedAt && <span className="text-gray-600 ml-2">· updated {new Date(fetchedAt).toLocaleTimeString()}</span>}
          </p>
        </div>
        <button
          onClick={() => fetchTrends(true, searchNiche || undefined)}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <span className={refreshing ? "animate-spin inline-block" : ""}>↻</span>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Custom niche search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          className="input-field flex-1"
          placeholder={`Search trends in a different niche (e.g. "personal finance", "minecraft", "fitness")`}
          value={customNiche}
          onChange={e => setCustomNiche(e.target.value)}
        />
        <button type="submit" className="btn-primary px-6" disabled={refreshing}>
          Search
        </button>
      </form>

      {/* Content */}
      {loading ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-40 bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6 animate-pulse">Fetching live YouTube data for your niche...</p>
        </div>
      ) : trends.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📡</div>
          <h3 className="text-white font-semibold text-lg mb-2">No trends found</h3>
          <p className="text-gray-500 text-sm mb-4">Try a different niche or refresh to pull fresh data.</p>
          <button onClick={() => fetchTrends(true)} className="btn-primary">Try again</button>
        </div>
      ) : (
        <>
          {/* Top trend — hero */}
          <AnimatePresence mode="wait">
            {trends[0] && (
              <motion.div
                key={trends[0].videoId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="bg-gray-900/60 border border-white/8 rounded-2xl overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Thumbnail */}
                    <div className="relative md:w-80 shrink-0">
                      <img
                        src={trends[0].thumbnail}
                        alt={trends[0].title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${trends[0].velocityColor}`}>
                          {trends[0].velocityLabel}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                        {trends[0].duration}
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">#1 Trending</span>
                          <span className="text-xs text-gray-500">{trends[0].timeAgo}</span>
                        </div>
                        <h2 className="text-white font-bold text-lg leading-snug mb-2">{trends[0].title}</h2>
                        <p className="text-gray-400 text-sm mb-3">{trends[0].channelName}</p>
                        <div className="flex gap-4 text-sm mb-4">
                          <span className="text-white font-semibold">{fmt(trends[0].viewCount)} <span className="text-gray-500 font-normal text-xs">views</span></span>
                          <span className="text-gray-400">{fmt(trends[0].likeCount)} likes</span>
                          <span className="text-green-400 font-medium">{fmt(trends[0].viewsPerHour)}/hr</span>
                        </div>
                        {trends[0].tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {trends[0].tags.slice(0, 6).map((tag, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 bg-white/8 text-gray-400 rounded-full">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => createProjectFromTrend(trends[0])}
                          disabled={!!creating}
                          className="btn-primary text-sm disabled:opacity-60"
                        >
                          {creating === trends[0].videoId ? "Creating..." : "🚀 Create project from this trend"}
                        </button>
                        <a
                          href={`https://www.youtube.com/watch?v=${trends[0].videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-sm"
                        >
                          Watch ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rest of trends grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {trends.slice(1).map((trend, i) => (
              <motion.div
                key={trend.videoId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-gray-900/60 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all group"
              >
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={trend.thumbnail}
                    alt={trend.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${trend.velocityColor}`}>
                      {trend.velocityLabel}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {trend.duration}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{trend.channelName} · {trend.timeAgo}</p>
                  <h3 className="text-white text-sm font-semibold leading-snug mb-3 line-clamp-2">{trend.title}</h3>

                  <div className="flex items-center gap-3 text-xs mb-4">
                    <span className="text-white font-medium">{fmt(trend.viewCount)} views</span>
                    <span className="text-green-400">{fmt(trend.viewsPerHour)}/hr</span>
                    <span className="text-gray-500">{fmt(trend.likeCount)} likes</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => createProjectFromTrend(trend)}
                      disabled={!!creating}
                      className="flex-1 text-xs py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                    >
                      {creating === trend.videoId ? "Creating..." : "+ Create project"}
                    </button>
                    <a
                      href={`https://www.youtube.com/watch?v=${trend.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs py-2 px-3 bg-white/8 hover:bg-white/12 text-gray-300 rounded-lg transition-colors"
                    >
                      Watch ↗
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
