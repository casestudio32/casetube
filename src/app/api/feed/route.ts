import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { getNicheIntelligence, formatNicheContext } from "@/lib/youtube/client";
import { generateAI } from "@/lib/ai/provider";

const YT = "https://www.googleapis.com/youtube/v3";

async function fetchChannelByUrl(url: string, apiKey: string) {
  const handle = url.match(/@([^/?]+)/)?.[1];
  const channelId = url.match(/channel\/([^/?]+)/)?.[1];
  if (handle) return fetch(`${YT}/channels?part=statistics,snippet,contentDetails&forHandle=${handle}&key=${apiKey}`).then(r => r.json()).catch(() => null);
  if (channelId) return fetch(`${YT}/channels?part=statistics,snippet,contentDetails&id=${channelId}&key=${apiKey}`).then(r => r.json()).catch(() => null);
  return null;
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const accessToken = searchParams.get("accessToken");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const apiKey = process.env.YOUTUBE_API_KEY!;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [memory, profile] = await Promise.all([
      db.creatorMemory.findUnique({ where: { userId } }),
      db.creatorProfile.findUnique({ where: { userId }, include: { blueprint: true } }),
    ]);

    const niche = memory?.niche || (profile?.blueprint as any)?.niche || "YouTube content creation";

    // Parallel: niche intel + trending + channel
    const [intel, trendsRaw, channelRaw] = await Promise.all([
      getNicheIntelligence(niche, niche),

      fetch(`${YT}/search?part=snippet&q=${encodeURIComponent(niche)}&type=video&order=viewCount&publishedAfter=${sevenDaysAgo}&maxResults=6&key=${apiKey}`)
        .then(r => r.json()).catch(() => null),

      accessToken
        ? fetch(`${YT}/channels?part=statistics,snippet,contentDetails&mine=true`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }).then(r => r.json()).catch(() => null)
        : profile?.channelUrl
          ? fetchChannelByUrl(profile.channelUrl, apiKey)
          : Promise.resolve(null),
    ]);

    // Process outliers
    let outliers: any[] = [];
    if (trendsRaw?.items?.length) {
      const ids = trendsRaw.items.map((i: any) => i.id?.videoId).filter(Boolean).join(",");
      if (ids) {
        const details = await fetch(`${YT}/videos?part=statistics,snippet&id=${ids}&key=${apiKey}`).then(r => r.json()).catch(() => null);
        if (details?.items) {
          outliers = details.items
            .map((v: any) => ({
              videoId: v.id,
              title: v.snippet?.title,
              thumbnail: v.snippet?.thumbnails?.medium?.url,
              channelTitle: v.snippet?.channelTitle,
              viewCount: parseInt(v.statistics?.viewCount || "0"),
              viewsFormatted: fmt(parseInt(v.statistics?.viewCount || "0")),
              publishedAt: v.snippet?.publishedAt,
            }))
            .sort((a: any, b: any) => b.viewCount - a.viewCount)
            .slice(0, 3);
        }
      }
    }

    // Channel stats
    let channelStats = null;
    if (channelRaw?.items?.[0]) {
      const ch = channelRaw.items[0];
      const subs = parseInt(ch.statistics?.subscriberCount || "0");
      const views = parseInt(ch.statistics?.viewCount || "0");
      const vids = parseInt(ch.statistics?.videoCount || "0");
      channelStats = {
        name: ch.snippet?.title,
        handle: ch.snippet?.customUrl,
        thumbnail: ch.snippet?.thumbnails?.default?.url,
        subscriberCount: subs,
        viewCount: views,
        videoCount: vids,
        avgViews: vids > 0 ? Math.round(views / vids) : 0,
        subscribersFormatted: fmt(subs),
        viewsFormatted: fmt(views),
        avgViewsFormatted: fmt(vids > 0 ? Math.round(views / vids) : 0),
      };
    }

    // Keywords from niche intel
    const keywords = (intel?.commonKeywords || []).slice(0, 5).map((kw, i) => ({
      keyword: kw,
      score: Math.max(55, 95 - i * 9),
      trend: i < 2 ? "rising" : i < 4 ? "stable" : "competitive",
    }));

    // Milestones
    const milestones: any[] = [];
    if (channelStats) {
      const subSteps = [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];
      const viewSteps = [1000, 10000, 50000, 100000, 500000, 1000000, 10000000];
      const nextSub = subSteps.find(m => m > channelStats!.subscriberCount);
      const nextView = viewSteps.find(m => m > channelStats!.viewCount);
      if (nextSub) milestones.push({ type: "subscribers", icon: "subscribers", current: channelStats.subscriberCount, target: nextSub, label: `${nextSub.toLocaleString()} Subscribers`, pct: Math.min(99, Math.round((channelStats.subscriberCount / nextSub) * 100)) });
      if (nextView) milestones.push({ type: "views", icon: "views", current: channelStats.viewCount, target: nextView, label: `${nextView.toLocaleString()} Total Views`, pct: Math.min(99, Math.round((channelStats.viewCount / nextView) * 100)) });
    }

    // AI: content ideas + title upgrade
    const nicheCtx = intel ? formatNicheContext(intel) : `Niche: ${niche}`;
    const aiRes = await generateAI({
      messages: [{
        role: "user",
        content: `You are a YouTube growth expert. Based on this real niche data:

${nicheCtx}

Creator niche: "${niche}"

Return ONLY valid JSON:
{
  "ideas": [
    { "title": "Video title that could outperform top results", "hook": "First 5 seconds hook line", "why": "One sentence on why this performs", "format": "Tutorial|List|Story|Case Study" }
  ],
  "titleUpgrade": {
    "topic": "Common topic in this niche right now",
    "weak": "Generic low-performing title version",
    "strong": "Optimised high-CTR title version based on the data",
    "improvement": "What specifically makes it better (numbers, curiosity, specificity)"
  }
}

Generate exactly 3 ideas. Base everything on the real YouTube data above. Return only JSON.`,
      }],
      temperature: 0.85,
      maxTokens: 900,
    });

    let ideas: any[] = [];
    let titleUpgrade: any = null;
    try {
      const match = aiRes.content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        ideas = parsed.ideas || [];
        titleUpgrade = parsed.titleUpgrade || null;
      }
    } catch {}

    return NextResponse.json({
      niche,
      channelStats,
      outliers,
      keywords,
      ideas,
      titleUpgrade,
      milestones,
      topTitles: intel?.topTitles?.slice(0, 3) || [],
      avgViews: intel?.avgViews || 0,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 });
  }
}
