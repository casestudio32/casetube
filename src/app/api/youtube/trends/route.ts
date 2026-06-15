import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

type VideoItem = {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    description: string;
    thumbnails: { high: { url: string }; medium: { url: string } };
    tags?: string[];
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
  contentDetails: { duration: string };
};

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function velocityLabel(views: number, hoursOld: number): { label: string; color: string } {
  const viewsPerHour = views / Math.max(hoursOld, 1);
  if (viewsPerHour > 10000) return { label: "🔥 Viral", color: "text-red-400 bg-red-500/15 border-red-500/30" };
  if (viewsPerHour > 3000) return { label: "⚡ Trending", color: "text-orange-400 bg-orange-500/15 border-orange-500/30" };
  if (viewsPerHour > 500) return { label: "📈 Rising", color: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30" };
  return { label: "🌱 Growing", color: "text-green-400 bg-green-500/15 border-green-500/30" };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const refresh = searchParams.get("refresh") === "true";
    let niche = searchParams.get("niche");

    if (!niche && userId) {
      const memory = await db.creatorMemory.findUnique({ where: { userId } });
      niche = memory?.niche || "YouTube";
    }
    if (!niche) niche = "YouTube";

    if (!YOUTUBE_API_KEY) return NextResponse.json({ error: "YouTube API not configured" }, { status: 500 });

    // Search for recent videos in the niche (last 7 days)
    const publishedAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const queries = [
      `${niche}`,
      `${niche} tutorial`,
      `${niche} 2025`,
    ];

    const videoIdSet = new Set<string>();

    for (const q of queries) {
      const searchUrl = `${BASE}/search?part=snippet&q=${encodeURIComponent(q)}&type=video&order=viewCount&maxResults=15&publishedAfter=${publishedAfter}&relevanceLanguage=en&key=${YOUTUBE_API_KEY}`;
      const res = await fetch(searchUrl, { cache: refresh ? "no-store" : "default" });
      const data = await res.json();
      if (data.items) {
        data.items.forEach((item: { id: { videoId: string } }) => {
          if (item.id?.videoId) videoIdSet.add(item.id.videoId);
        });
      }
    }

    const videoIds = Array.from(videoIdSet).slice(0, 30);
    if (videoIds.length === 0) return NextResponse.json({ trends: [], niche });

    // Get full video details
    const detailsUrl = `${BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(",")}&key=${YOUTUBE_API_KEY}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    if (!detailsData.items) return NextResponse.json({ trends: [], niche });

    const trends = (detailsData.items as VideoItem[])
      .map(item => {
        const views = parseInt(item.statistics.viewCount || "0");
        const hoursOld = Math.floor((Date.now() - new Date(item.snippet.publishedAt).getTime()) / 3600000);
        const velocity = velocityLabel(views, hoursOld);
        return {
          videoId: item.id,
          title: item.snippet.title,
          channelName: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || "",
          viewCount: views,
          likeCount: parseInt(item.statistics.likeCount || "0"),
          commentCount: parseInt(item.statistics.commentCount || "0"),
          publishedAt: item.snippet.publishedAt,
          timeAgo: timeAgo(item.snippet.publishedAt),
          duration: parseDuration(item.contentDetails.duration),
          tags: item.snippet.tags?.slice(0, 8) || [],
          velocityLabel: velocity.label,
          velocityColor: velocity.color,
          viewsPerHour: Math.round(views / Math.max(hoursOld, 1)),
          description: item.snippet.description?.slice(0, 200) || "",
        };
      })
      .sort((a, b) => b.viewsPerHour - a.viewsPerHour)
      .slice(0, 20);

    return NextResponse.json({ trends, niche, fetchedAt: new Date().toISOString() });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
