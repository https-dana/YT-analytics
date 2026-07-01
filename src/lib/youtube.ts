import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

export type ChannelSummary = {
  id: string;
  title: string;
  thumbnail: string;
  customUrl?: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  publishedAt?: string; // channel creation date, used for "all time" ranges
};

export type VideoSummary = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  durationSeconds: number;
};

export type CommentSummary = {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  likeCount: number;
  publishedAt: string;
};

function parseIsoDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const [, h, mnt, s] = m;
  return (Number(h) || 0) * 3600 + (Number(mnt) || 0) * 60 + (Number(s) || 0);
}

// Both the YouTube Data API v3 and YouTube Analytics API calls in this app
// are authorized with the signed-in user's own OAuth token (per the
// requirement: Data API AND Analytics API, both via Google OAuth) - not a
// server-side API key. This requires the `youtube.readonly` scope, which
// Google classifies as sensitive, so the OAuth consent screen needs to go
// through Google's verification review before it can serve any Google
// account (see README for the "Testing" vs "Production" tradeoff).

/** Fetches the signed-in user's own channel (mine=true). */
export async function fetchOwnChannel(auth: OAuth2Client): Promise<ChannelSummary> {
  const youtube = google.youtube({ version: "v3", auth });
  const res = await youtube.channels.list({
    part: ["snippet", "statistics"],
    mine: true
  });
  const c = res.data.items?.[0];
  if (!c || !c.id) throw new Error("No YouTube channel found on this account");
  return {
    id: c.id,
    title: c.snippet?.title || "Untitled channel",
    thumbnail: c.snippet?.thumbnails?.high?.url || c.snippet?.thumbnails?.default?.url || "",
    customUrl: c.snippet?.customUrl || undefined,
    subscriberCount: Number(c.statistics?.subscriberCount || 0),
    viewCount: Number(c.statistics?.viewCount || 0),
    videoCount: Number(c.statistics?.videoCount || 0),
    publishedAt: c.snippet?.publishedAt || undefined
  };
}

/** Refreshes just the public counters for an already-connected channel. */
export async function fetchChannelStats(
  auth: OAuth2Client,
  channelId: string
): Promise<Pick<ChannelSummary, "subscriberCount" | "viewCount" | "videoCount">> {
  const youtube = google.youtube({ version: "v3", auth });
  const res = await youtube.channels.list({ part: ["statistics"], id: [channelId] });
  const s = res.data.items?.[0]?.statistics;
  return {
    subscriberCount: Number(s?.subscriberCount || 0),
    viewCount: Number(s?.viewCount || 0),
    videoCount: Number(s?.videoCount || 0)
  };
}

/** Lists the channel's most recent videos with stats, newest first. */
export async function fetchChannelVideos(
  auth: OAuth2Client,
  channelId: string,
  maxResults = 12
): Promise<VideoSummary[]> {
  const youtube = google.youtube({ version: "v3", auth });

  const channelRes = await youtube.channels.list({ part: ["contentDetails"], id: [channelId] });
  const uploadsPlaylistId =
    channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) return [];

  const playlistRes = await youtube.playlistItems.list({
    part: ["contentDetails"],
    playlistId: uploadsPlaylistId,
    maxResults
  });
  const videoIds =
    playlistRes.data.items
      ?.map((i) => i.contentDetails?.videoId)
      .filter((id): id is string => Boolean(id)) || [];
  if (videoIds.length === 0) return [];

  const videosRes = await youtube.videos.list({
    part: ["snippet", "statistics", "contentDetails"],
    id: videoIds
  });

  return (videosRes.data.items || []).map((v) => ({
    id: v.id!,
    title: v.snippet?.title || "",
    thumbnail: v.snippet?.thumbnails?.medium?.url || "",
    publishedAt: v.snippet?.publishedAt || "",
    viewCount: Number(v.statistics?.viewCount || 0),
    likeCount: Number(v.statistics?.likeCount || 0),
    commentCount: Number(v.statistics?.commentCount || 0),
    durationSeconds: parseIsoDuration(v.contentDetails?.duration || "PT0S")
  }));
}

/** Fetches top-level comments for a single video. */
export async function fetchVideoComments(
  auth: OAuth2Client,
  videoId: string,
  maxResults = 20
): Promise<CommentSummary[]> {
  const youtube = google.youtube({ version: "v3", auth });
  try {
    const res = await youtube.commentThreads.list({
      part: ["snippet"],
      videoId,
      maxResults,
      order: "relevance",
      textFormat: "plainText"
    });
    return (res.data.items || []).map((item) => {
      const c = item.snippet?.topLevelComment?.snippet;
      return {
        id: item.id || "",
        author: c?.authorDisplayName || "Anonymous",
        authorAvatar: c?.authorProfileImageUrl || "",
        text: c?.textDisplay || "",
        likeCount: c?.likeCount || 0,
        publishedAt: c?.publishedAt || ""
      };
    });
  } catch {
    // Comments can be disabled on a video - fail soft.
    return [];
  }
}
