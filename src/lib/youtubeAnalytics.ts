import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

export type DailyPoint = {
  date: string;
  views: number;
  watchTimeMinutes: number;
  subscribersGained: number;
  subscribersLost: number;
};

export type BreakdownPoint = { label: string; value: number };

export type TopVideoRow = {
  videoId: string;
  views: number;
  watchTimeMinutes: number;
  likes: number;
  comments: number;
  avgViewDurationSeconds: number;
};

async function query(
  auth: OAuth2Client,
  params: Record<string, string | number | undefined>
) {
  const yta = google.youtubeAnalytics({ version: "v2", auth });
  const res = await yta.reports.query(params as any);
  return res.data;
}

const fmt = (d: Date) => d.toISOString().slice(0, 10);

/** Day-by-day views / watch time / subscriber deltas for the range. */
export async function fetchDailyTimeseries(
  auth: OAuth2Client,
  startDate: Date,
  endDate: Date
): Promise<DailyPoint[]> {
  const data = await query(auth, {
    ids: "channel==MINE",
    startDate: fmt(startDate),
    endDate: fmt(endDate),
    metrics: "views,estimatedMinutesWatched,subscribersGained,subscribersLost",
    dimensions: "day",
    sort: "day"
  });
  return (data.rows || []).map((r) => ({
    date: String(r[0]),
    views: Number(r[1] || 0),
    watchTimeMinutes: Number(r[2] || 0),
    subscribersGained: Number(r[3] || 0),
    subscribersLost: Number(r[4] || 0)
  }));
}

/** Where views came from: browse, search, suggested, external, etc. */
export async function fetchTrafficSources(
  auth: OAuth2Client,
  startDate: Date,
  endDate: Date
): Promise<BreakdownPoint[]> {
  const data = await query(auth, {
    ids: "channel==MINE",
    startDate: fmt(startDate),
    endDate: fmt(endDate),
    metrics: "views",
    dimensions: "insightTrafficSourceType",
    sort: "-views"
  });
  return (data.rows || []).map((r) => ({
    label: humanizeTrafficSource(String(r[0])),
    value: Number(r[1] || 0)
  }));
}

/** Views split by device type (mobile / desktop / tv / tablet). */
export async function fetchDeviceBreakdown(
  auth: OAuth2Client,
  startDate: Date,
  endDate: Date
): Promise<BreakdownPoint[]> {
  const data = await query(auth, {
    ids: "channel==MINE",
    startDate: fmt(startDate),
    endDate: fmt(endDate),
    metrics: "views",
    dimensions: "deviceType",
    sort: "-views"
  });
  return (data.rows || []).map((r) => ({
    label: capitalize(String(r[0])),
    value: Number(r[1] || 0)
  }));
}

/** Audience age/gender split (share of viewers, %). */
export async function fetchDemographics(
  auth: OAuth2Client,
  startDate: Date,
  endDate: Date
): Promise<{ ageGroup: string; male: number; female: number }[]> {
  const data = await query(auth, {
    ids: "channel==MINE",
    startDate: fmt(startDate),
    endDate: fmt(endDate),
    metrics: "viewerPercentage",
    dimensions: "ageGroup,gender"
  });
  const rows = data.rows || [];
  const byAge = new Map<string, { male: number; female: number }>();
  for (const r of rows) {
    const age = String(r[0]).replace("age", "").replace("-", "–");
    const gender = String(r[1]);
    const pct = Number(r[2] || 0);
    const entry = byAge.get(age) || { male: 0, female: 0 };
    if (gender === "male") entry.male = pct;
    if (gender === "female") entry.female = pct;
    byAge.set(age, entry);
  }
  return Array.from(byAge.entries()).map(([ageGroup, v]) => ({ ageGroup, ...v }));
}

/** Top countries by views. */
export async function fetchGeography(
  auth: OAuth2Client,
  startDate: Date,
  endDate: Date,
  maxResults = 8
): Promise<BreakdownPoint[]> {
  const data = await query(auth, {
    ids: "channel==MINE",
    startDate: fmt(startDate),
    endDate: fmt(endDate),
    metrics: "views",
    dimensions: "country",
    sort: "-views",
    maxResults
  });
  return (data.rows || []).map((r) => ({
    label: String(r[0]),
    value: Number(r[1] || 0)
  }));
}

/** Per-video performance for the range, best videos first. */
export async function fetchTopVideos(
  auth: OAuth2Client,
  startDate: Date,
  endDate: Date,
  maxResults = 10
): Promise<TopVideoRow[]> {
  const data = await query(auth, {
    ids: "channel==MINE",
    startDate: fmt(startDate),
    endDate: fmt(endDate),
    metrics: "views,estimatedMinutesWatched,likes,comments,averageViewDuration",
    dimensions: "video",
    sort: "-views",
    maxResults
  });
  return (data.rows || []).map((r) => ({
    videoId: String(r[0]),
    views: Number(r[1] || 0),
    watchTimeMinutes: Number(r[2] || 0),
    likes: Number(r[3] || 0),
    comments: Number(r[4] || 0),
    avgViewDurationSeconds: Number(r[5] || 0)
  }));
}

function humanizeTrafficSource(code: string) {
  const map: Record<string, string> = {
    ADVERTISING: "Реклама",
    ANNOTATION: "Анотації",
    CAMPAIGN_CARD: "Картки кампаній",
    END_SCREEN: "Кінцеві заставки",
    EXT_URL: "Зовнішні посилання",
    NO_LINK_EMBEDDED: "Вбудований плеєр",
    NO_LINK_OTHER: "Інше",
    NOTIFICATION: "Сповіщення",
    PLAYLIST: "Плейлисти",
    PROMOTED: "Просування",
    RELATED_VIDEO: "Рекомендовані відео",
    SUBSCRIBER: "Підписки",
    YT_CHANNEL: "Сторінка каналу",
    YT_OTHER_PAGE: "Інші сторінки YouTube",
    YT_SEARCH: "Пошук YouTube",
    SHORTS: "Shorts"
  };
  return map[code] || capitalize(code.replace(/_/g, " "));
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
