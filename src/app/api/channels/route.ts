import { NextResponse } from "next/server";
import { channelStore } from "@/lib/store";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const channels = channelStore.list().sort((a, b) => a.connectedAt - b.connectedAt);
  return NextResponse.json({
    mockMode: config.mockMode,
    channels: channels.map((c) => ({
      id: c.id,
      title: c.title,
      thumbnail: c.thumbnail,
      customUrl: c.customUrl,
      subscriberCount: c.subscriberCount,
      viewCount: c.viewCount,
      videoCount: c.videoCount,
      connectedAt: c.connectedAt
    }))
  });
}
