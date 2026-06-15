const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

export type YTVideo = {
  videoId: string;
  title: string;
  channelName: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
  description: string;
  tags: string[];
  duration: string;
  thumbnail: string;
};

export type NicheIntelligence = {
  topVideos: YTVideo[];
  topTitles: string[];
  commonKeywords: string[];
  avgViews: number;
  insights: string;
};

async function searchTopVideos(query: string, maxResults = 10): Promise<string[]> {
  const url = `${BASE}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=viewCount&maxResults=${maxResults}&relevanceLanguage=en&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items) return [];
  return data.items.map((item: { id: { videoId: string } }) => item.id.videoId).filter(Boolean);
}

async function getVideoDetails(videoIds: string[]): Promise<YTVideo[]> {
  if (videoIds.length === 0) return [];
  const url = `${BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(",")}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items) return [];

  return data.items.map((item: {
    id: string;
    snippet: {
      title: string;
      channelTitle: string;
      publishedAt: string;
      description: string;
      tags?: string[];
      thumbnails: { high: { url: string } };
    };
    statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
    contentDetails: { duration: string };
  }) => ({
    videoId: item.id,
    title: item.snippet.title,
    channelName: item.snippet.channelTitle,
    viewCount: parseInt(item.statistics.viewCount || "0"),
    likeCount: parseInt(item.statistics.likeCount || "0"),
    commentCount: parseInt(item.statistics.commentCount || "0"),
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description?.slice(0, 300) || "",
    tags: item.snippet.tags?.slice(0, 10) || [],
    duration: item.contentDetails.duration,
    thumbnail: item.snippet.thumbnails?.high?.url || "",
  }));
}

export async function getNicheIntelligence(niche: string, topic?: string): Promise<NicheIntelligence | null> {
  if (!YOUTUBE_API_KEY) return null;

  try {
    const query = topic ? `${topic} ${niche}` : niche;
    const videoIds = await searchTopVideos(query, 12);
    if (videoIds.length === 0) return null;

    const videos = await getVideoDetails(videoIds);
    const sorted = videos.sort((a, b) => b.viewCount - a.viewCount).slice(0, 10);

    const avgViews = Math.round(sorted.reduce((acc, v) => acc + v.viewCount, 0) / sorted.length);
    const topTitles = sorted.map(v => v.title);

    // Extract common keywords from titles
    const allWords = topTitles.join(" ").toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(" ")
      .filter(w => w.length > 3 && !["this", "that", "with", "from", "your", "have", "will", "what", "when", "they", "just", "like", "make", "know", "time", "more", "very", "than"].includes(w));
    const wordFreq: Record<string, number> = {};
    allWords.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
    const commonKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word);

    const insights = `Top ${sorted.length} videos in "${query}" average ${avgViews.toLocaleString()} views. Most successful titles use: ${commonKeywords.slice(0, 5).join(", ")}.`;

    return { topVideos: sorted, topTitles, commonKeywords, avgViews, insights };
  } catch {
    return null;
  }
}

export function formatNicheContext(intel: NicheIntelligence): string {
  const topTitlesText = intel.topVideos
    .slice(0, 8)
    .map(v => `- "${v.title}" — ${v.viewCount.toLocaleString()} views (${v.channelName})`)
    .join("\n");

  return `
REAL YOUTUBE DATA FOR THIS NICHE (use this to inform your output):
Average views for top content: ${intel.avgViews.toLocaleString()}
Top performing keywords: ${intel.commonKeywords.slice(0, 10).join(", ")}

Top 8 highest-viewed videos right now:
${topTitlesText}

Study these titles carefully — their structure, word choice, and format. Your output must be informed by what ACTUALLY works on YouTube in this niche, not generic advice.
`.trim();
}
