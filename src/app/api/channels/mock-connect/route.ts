import { NextRequest, NextResponse } from "next/server";
import { channelStore } from "@/lib/store";
import { mockChannelById } from "@/lib/mock";
import { config } from "@/lib/config";

export async function POST(req: NextRequest) {
  if (!config.mockMode) {
    return NextResponse.json({ error: "Mock mode is disabled" }, { status: 400 });
  }
  const { id } = await req.json();
  const persona = mockChannelById(id);

  channelStore.upsert({
    ...persona,
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiryDate: Date.now() + 55 * 60 * 1000,
    scope: "mock",
    connectedAt: Date.now()
  });

  return NextResponse.json({ ok: true, id: persona.id });
}
