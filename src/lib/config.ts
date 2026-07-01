export const config = {
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  appUrl: process.env.APP_URL || "http://localhost:3000",
  // Mock mode is on by default so the app is fully explorable without any
  // Google credentials. Flip MOCK_MODE=false in .env.local (and fill in the
  // client id/secret above) once real OAuth credentials are configured, to
  // hit the live YouTube Data API + YouTube Analytics API.
  mockMode: process.env.MOCK_MODE !== "false",
  redirectUri:
    (process.env.APP_URL || "http://localhost:3000") +
    "/api/auth/google/callback",
  // Scopes needed:
  //  - youtube.readonly       -> YouTube Data API (channel/video/comment info)
  //  - yt-analytics.readonly  -> YouTube Analytics API (views, watch time,
  //                              traffic sources, demographics, ...)
  scopes: [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
    "openid",
    "email",
    "profile"
  ]
};
