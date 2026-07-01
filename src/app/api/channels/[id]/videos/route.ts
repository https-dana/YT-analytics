import { NextRequest, NextResponse } from "next/server";
import { channelStore } from "@/lib/store";
import { config } from "@/lib/config";
import { getAuthorizedClient } from "@/lib/google";
import { fetchChannelVideos } from "@/lib/youtube";
import { mockVideos } from "@/lib/mock";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const channel = channelStore.get(params.id);
  if (!channel) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (config.mockMode) {
    return NextResponse.json({ videos: mockVideos(channel.id) });
  }

  try {
    const auth = await getAuthorizedClient(channel);
    const videos = await fetchChannelVideos(auth, channel.id);
    return NextResponse.json({ videos });
  } catch (e) {
    console.error("Failed to fetch videos:", e);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
