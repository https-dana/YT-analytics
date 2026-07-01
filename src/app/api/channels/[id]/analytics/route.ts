import { NextRequest, NextResponse } from "next/server";
import { channelStore } from "@/lib/store";
import { config } from "@/lib/config";
import { getAuthorizedClient } from "@/lib/google";
import {
  fetchDailyTimeseries,
  fetchTrafficSources,
  fetchDeviceBreakdown,
  fetchDemographics,
  fetchGeography,
  fetchTopVideos
} from "@/lib/youtubeAnalytics";
import { fetchChannelVideos } from "@/lib/youtube";
import {
  mockDailyTimeseries,
  mockTrafficSources,
  mockDeviceBreakdown,
  mockDemographics,
  mockGeography,
  mockTopVideos,
  mockVideos
} from "@/lib/mock";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const channel = channelStore.get(params.id);
  if (!channel) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const rangeParam = searchParams.get("range") || "28";
  const endDate = new Date();
  const startDate =
    rangeParam === "all"
      ? new Date(channel.publishedAt || Date.now() - 5 * 365 * 86_400_000)
      : new Date(endDate.getTime() - Number(rangeParam) * 86_400_000);

  if (config.mockMode) {
    const videos = mockVideos(channel.id, 20);
    const titleById = new Map(videos.map((v) => [v.id, v]));
    const topVideos = mockTopVideos(channel.id).map((row) => ({
      ...row,
      title: titleById.get(row.videoId)?.title || row.videoId,
      thumbnail: titleById.get(row.videoId)?.thumbnail || ""
    }));

    return NextResponse.json({
      range: { start: startDate.toISOString(), end: endDate.toISOString() },
      timeseries: mockDailyTimeseries(channel.id, startDate, endDate),
      trafficSources: mockTrafficSources(channel.id),
      deviceBreakdown: mockDeviceBreakdown(channel.id),
      demographics: mockDemographics(channel.id),
      geography: mockGeography(channel.id),
      topVideos
    });
  }

  try {
    const auth = await getAuthorizedClient(channel);
    const isAllTime = rangeParam === "all";
    const [timeseries, trafficSources, deviceBreakdown, demographics, geography, topVideosRaw, videos] =
      await Promise.all([
        fetchDailyTimeseries(auth, startDate, endDate),
        fetchTrafficSources(auth, startDate, endDate),
        fetchDeviceBreakdown(auth, startDate, endDate),
        fetchDemographics(auth, startDate, endDate),
        fetchGeography(auth, startDate, endDate),
        fetchTopVideos(auth, startDate, endDate),
        fetchChannelVideos(auth, channel.id, 50)
      ]);

    const titleById = new Map(videos.map((v) => [v.id, v]));

    // "All time" uses each video's own lifetime view/like/comment counters
    // (YouTube Data API - always populated, no processing lag or privacy
    // threshold) instead of the YouTube Analytics per-period breakdown,
    // which can legitimately come back empty/zero for very recent activity.
    const topVideos = isAllTime
      ? [...videos]
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, 10)
          .map((v) => ({
            videoId: v.id,
            title: v.title,
            thumbnail: v.thumbnail,
            views: v.viewCount,
            likes: v.likeCount,
            comments: v.commentCount,
            watchTimeMinutes: 0,
            avgViewDurationSeconds: null as number | null
          }))
      : topVideosRaw.map((row) => ({
          ...row,
          title: titleById.get(row.videoId)?.title || row.videoId,
          thumbnail: titleById.get(row.videoId)?.thumbnail || ""
        }));

    return NextResponse.json({
      range: { start: startDate.toISOString(), end: endDate.toISOString() },
      timeseries,
      trafficSources,
      deviceBreakdown,
      demographics,
      geography,
      topVideos
    });
  } catch (e) {
    console.error("Failed to fetch analytics:", e);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
