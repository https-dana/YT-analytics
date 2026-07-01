import { NextRequest, NextResponse } from "next/server";
import { channelStore } from "@/lib/store";
import { config } from "@/lib/config";
import { getAuthorizedClient } from "@/lib/google";
import { fetchVideoComments } from "@/lib/youtube";
import { mockComments } from "@/lib/mock";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; videoId: string } }
) {
  const channel = channelStore.get(params.id);
  if (!channel) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (config.mockMode) {
    return NextResponse.json({ comments: mockComments(params.videoId) });
  }

  try {
    const auth = await getAuthorizedClient(channel);
    const comments = await fetchVideoComments(auth, params.videoId);
    return NextResponse.json({ comments });
  } catch (e) {
    console.error("Failed to fetch comments:", e);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}
