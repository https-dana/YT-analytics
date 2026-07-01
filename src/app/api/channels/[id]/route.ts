import { NextRequest, NextResponse } from "next/server";
import { channelStore } from "@/lib/store";
import { config } from "@/lib/config";
import { getAuthorizedClient } from "@/lib/google";
import { fetchChannelStats } from "@/lib/youtube";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const channel = channelStore.get(params.id);
  if (!channel) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!config.mockMode) {
    try {
      const auth = await getAuthorizedClient(channel);
      const fresh = await fetchChannelStats(auth, channel.id);
      channelStore.upsert({ ...channel, ...fresh });
      Object.assign(channel, fresh);
    } catch (e) {
      console.error("Failed to refresh channel stats:", e);
    }
  }

  return NextResponse.json({
    id: channel.id,
    title: channel.title,
    thumbnail: channel.thumbnail,
    customUrl: channel.customUrl,
    subscriberCount: channel.subscriberCount,
    viewCount: channel.viewCount,
    videoCount: channel.videoCount,
    connectedAt: channel.connectedAt,
    publishedAt: channel.publishedAt
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  channelStore.remove(params.id);
  return NextResponse.json({ ok: true });
}
