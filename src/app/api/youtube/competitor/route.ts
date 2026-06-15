import { NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

async function findChannel(query: string) {
  // Try to extract channel handle or ID from URL
  const handleMatch = query.match(/@([\w.-]+)/);
  const idMatch = query.match(/channel\/(UC[\w-]+)/);

  let channelId: string | null = null;

  if (idMatch) {
    channelId = idMatch[1];
  } else {
    const searchQuery = handleMatch ? handleMatch[1] : query;
    const url = `${BASE}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=channel&maxResults=3&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    channelId = data.items?.[0]?.id?.channelId || null;
  }

  if (!channelId) return null;

  const detailUrl = `${BASE}/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${YOUTUBE_API_KEY}`;
  const detailRes = await fetch(detailUrl);
  const detailData = await detailRes.json();
  const ch = detailData.items?.[0];
  if (!ch) return null;

  return {
    channelId,
    name: ch.snippet.title,
    handle: ch.snippet.customUrl || "",
    description: ch.snippet.description?.slice(0, 200) || "",
    thumbnail: ch.snippet.thumbnails?.high?.url || ch.snippet.thumbnails?.default?.url || "",
    subscriberCount: parseInt(ch.statistics.subscriberCount || "0"),
    videoCount: parseInt(ch.statistics.videoCount || "0"),
    viewCount: parseInt(ch.statistics.viewCount || "0"),
    country: ch.snippet.country || "",
  };
}

async function getTopVideos(channelId: string) {
  const searchUrl = `${BASE}/search?part=snippet&channelId=${channelId}&order=viewCount&type=video&maxResults=12&key=${YOUTUBE_API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const videoIds: string[] = (searchData.items || []).map((i: { id: { videoId: string } }) => i.id.videoId).filter(Boolean);
  if (videoIds.length === 0) return [];

  const detailUrl = `${BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(",")}&key=${YOUTUBE_API_KEY}`;
  const detailRes = await fetch(detailUrl);
  const detailData = await detailRes.json();

  return (detailData.items || []).map((item: {
    id: string;
    snippet: { title: string; publishedAt: string; thumbnails: { medium: { url: string } }; tags?: string[] };
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

function analyseVideos(videos: { title: string; viewCount: number; tags: string[] }[]) {
  if (videos.length === 0) return { topTitleWords: [], avgViews: 0, bestFormats: [] };

  const avgViews = Math.round(videos.reduce((s, v) => s + v.viewCount, 0) / videos.length);

  const words = videos.flatMap(v =>
    v.title.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(" ").filter(w => w.length > 3 &&
      !["this","that","with","from","your","have","will","what","when","they","just","like","make","know","time","more","very","than","about","into","them","then","also","been","were","their"].includes(w))
  );
  const freq: Record<string, number> = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  const topTitleWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w]) => w);

  const formats = [];
  const howMany = videos.filter(v => /how (to|i|we)/i.test(v.title)).length;
  const listicle = videos.filter(v => /^\d+|top \d+|\d+ (ways|tips|things|reasons)/i.test(v.title)).length;
  const story = videos.filter(v => /i |my |why i|how i/i.test(v.title)).length;
  if (howMany > 1) formats.push(`How-To (${howMany} videos)`);
  if (listicle > 1) formats.push(`Listicles (${listicle} videos)`);
  if (story > 1) formats.push(`Personal Story (${story} videos)`);

  return { topTitleWords, avgViews, bestFormats: formats };
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "No channel provided" }, { status: 400 });
    if (!YOUTUBE_API_KEY) return NextResponse.json({ error: "YouTube API not configured" }, { status: 500 });

    const channel = await findChannel(query);
    if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

    const topVideos = await getTopVideos(channel.channelId);
    const analysis = analyseVideos(topVideos);

    return NextResponse.json({ channel, topVideos: topVideos.slice(0, 10), analysis });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
