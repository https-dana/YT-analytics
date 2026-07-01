import { NextRequest, NextResponse } from "next/server";
import { createOAuthClient } from "@/lib/google";
import { fetchOwnChannel } from "@/lib/youtube";
import { channelStore } from "@/lib/store";
import { config } from "@/lib/config";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = req.cookies.get("oauth_state")?.value;
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/connect?error=${encodeURIComponent(error)}`, config.appUrl)
    );
  }

  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(
      new URL("/connect?error=invalid_state", config.appUrl)
    );
  }

  try {
    const client = createOAuthClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const channel = await fetchOwnChannel(client);

    channelStore.upsert({
      ...channel,
      accessToken: tokens.access_token || "",
      refreshToken: tokens.refresh_token || "",
      expiryDate: tokens.expiry_date || Date.now() + 55 * 60 * 1000,
      scope: tokens.scope || "",
      connectedAt: Date.now()
    });

    const res = NextResponse.redirect(new URL(`/channel/${channel.id}`, config.appUrl));
    res.cookies.delete("oauth_state");
    return res;
  } catch (e) {
    console.error("OAuth callback failed:", e);
    return NextResponse.redirect(
      new URL("/connect?error=token_exchange_failed", config.appUrl)
    );
  }
}

