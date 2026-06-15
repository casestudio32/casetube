import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";

const BASE = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

async function fetchWithToken(url: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  const res = await fetch(url, { headers });
  return res.json();
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accessToken = session.user.accessToken as string | undefined;

    // Try OAuth token first, fall back to stored channel URL + API key
    let channelData = null;
    let topVideos = [];
    let usingOAuth = false;

    if (accessToken) {
      // Use OAuth token to get the user's own channel
      const channelRes = await fetchWithToken(
        `${BASE}/channels?part=snippet,statistics,brandingSettings&mine=true`,
        accessToken
      );
      if (channelRes.items?.[0]) {
        channelData = channelRes.items[0];
        usingOAuth = true;

        // Get their videos
        const videosRes = await fetchWithToken(
          `${BASE}/search?part=snippet&channelId=${channelData.id}&order=viewCount&type=video&maxResults=20`,
          accessToken
        );
        const videoIds = (videosRes.items || []).map((i: { id: { videoId: string } }) => i.id.videoId).filter(Boolean);

        if (videoIds.length > 0) {
          const detailsRes = await fetchWithToken(
            `${BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(",")}&key=${YOUTUBE_API_KEY}`,
            accessToken
          );
          topVideos = (detailsRes.items || []).map((item: {
            id: string;
            snippet: { title: string; publishedAt: string; thumbnails: { medium: { url: string }; high: { url: string } }; tags?: string[] };
            statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
            contentDetails: { duration: string };
          }) => ({
            videoId: item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails?.medium?.url || "",
            viewCount: parseInt(item.statistics.viewCount || "0"),
            likeCount: parseInt(item.statistics.likeCount || "0"),
            commentCount: parseInt(item.statistics.commentCount || "0"),
            publishedAt: item.snippet.publishedAt,
            tags: item.snippet.tags?.slice(0, 6) || [],
          })).sort((a: { viewCount: number }, b: { viewCount: number }) => b.viewCount - a.viewCount);
        }
      }
    }

    // If no OAuth, try stored channel URL from profile
    if (!channelData) {
      const profile = await db.creatorProfile.findUnique({ where: { userId: session.user.id } });
      if (profile?.channelUrl) {
        const q = profile.channelUrl;
        const handleMatch = q.match(/@([\w.-]+)/);
        const searchQuery = handleMatch ? handleMatch[1] : q;
        const searchRes = await fetch(`${BASE}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`);
        const searchData = await searchRes.json();
        const channelId = searchData.items?.[0]?.id?.channelId;
        if (channelId) {
          const detailRes = await fetch(`${BASE}/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`);
          const detailData = await detailRes.json();
          channelData = detailData.items?.[0] || null;

          if (channelData) {
            const vidSearchRes = await fetch(`${BASE}/search?part=snippet&channelId=${channelId}&order=viewCount&type=video&maxResults=15&key=${YOUTUBE_API_KEY}`);
            const vidSearchData = await vidSearchRes.json();
            const vids = (vidSearchData.items || []).map((i: { id: { videoId: string } }) => i.id.videoId).filter(Boolean);
            if (vids.length > 0) {
              const vidDetailRes = await fetch(`${BASE}/videos?part=snippet,statistics&id=${vids.join(",")}&key=${YOUTUBE_API_KEY}`);
              const vidDetailData = await vidDetailRes.json();
              topVideos = (vidDetailData.items || []).map((item: {
                id: string;
                snippet: { title: string; publishedAt: string; thumbnails: { medium: { url: string } }; tags?: string[] };
                statistics: { viewCount?: string; likeCount?: string };
              }) => ({
                videoId: item.id,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails?.medium?.url || "",
                viewCount: parseInt(item.statistics.viewCount || "0"),
                likeCount: parseInt(item.statistics.likeCount || "0"),
                publishedAt: item.snippet.publishedAt,
                tags: item.snippet.tags?.slice(0, 6) || [],
              })).sort((a: { viewCount: number }, b: { viewCount: number }) => b.viewCount - a.viewCount);
            }
          }
        }
      }
    }

    if (!channelData) return NextResponse.json({ connected: false, usingOAuth });

    // Analyse what's working
    const avgViews = topVideos.length > 0
      ? Math.round(topVideos.reduce((s: number, v: { viewCount: number }) => s + v.viewCount, 0) / topVideos.length)
      : 0;

    const topVideo = topVideos[0] || null;
    const words = (topVideos as { title: string }[]).flatMap(v =>
      v.title.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(" ")
        .filter(w => w.length > 3 && !["this","that","with","from","your","have","will","what","when","they","just","like","make"].includes(w))
    );
    const freq: Record<string, number> = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);

    return NextResponse.json({
      connected: true,
      usingOAuth,
      channel: {
        id: channelData.id,
        name: channelData.snippet.title,
        handle: channelData.snippet.customUrl || "",
        thumbnail: channelData.snippet.thumbnails?.high?.url || channelData.snippet.thumbnails?.default?.url || "",
        subscriberCount: parseInt(channelData.statistics?.subscriberCount || "0"),
        videoCount: parseInt(channelData.statistics?.videoCount || "0"),
        viewCount: parseInt(channelData.statistics?.viewCount || "0"),
        description: channelData.snippet.description?.slice(0, 200) || "",
      },
      topVideos: topVideos.slice(0, 10),
      insights: {
        avgViews,
        avgViewsFormatted: fmt(avgViews),
        topVideo,
        topWords,
        totalVideos: topVideos.length,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
