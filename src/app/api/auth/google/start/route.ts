import { NextRequest, NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/google";
import { config } from "@/lib/config";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  if (config.mockMode) {
    return NextResponse.redirect(new URL("/connect", req.url));
  }
  const state = crypto.randomBytes(16).toString("hex");
  const url = buildAuthUrl(state);
  const res = NextResponse.redirect(url);
  res.cookies.set("oauth_state", state, {
    httpOnly: true,
    maxAge: 300,
    sameSite: "lax"
  });
  return res;
}
