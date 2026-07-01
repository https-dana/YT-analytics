import type { ChannelSummary, VideoSummary, CommentSummary } from "./youtube";
import type { DailyPoint, BreakdownPoint, TopVideoRow } from "./youtubeAnalytics";

// A handful of fake "Google accounts" the demo OAuth chooser lets you pick
// from, so multi-channel connection can be demonstrated end to end without
// real credentials.
export const MOCK_PERSONAS: ChannelSummary[] = [
  {
    id: "mock-kitchenlab",
    title: "Kitchen Lab UA",
    thumbnail: "https://i.pravatar.cc/160?img=12",
    customUrl: "@kitchenlabua",
    subscriberCount: 184_300,
    viewCount: 21_400_000,
    videoCount: 312
  },
  {
    id: "mock-codecoffee",
    title: "Code & Coffee",
    thumbnail: "https://i.pravatar.cc/160?img=45",
    customUrl: "@codeandcoffee",
    subscriberCount: 62_900,
    viewCount: 5_120_000,
    videoCount: 148
  },
  {
    id: "mock-retrogaming",
    title: "Retro Gaming Hub",
    thumbnail: "https://i.pravatar.cc/160?img=33",
    customUrl: "@retrogaminghub",
    subscriberCount: 401_050,
    viewCount: 58_900_000,
    videoCount: 587
  },
  {
    id: "mock-mandarintravel",
    title: "Mandarin Travel",
    thumbnail: "https://i.pravatar.cc/160?img=8",
    customUrl: "@mandarintravel",
    subscriberCount: 29_800,
    viewCount: 2_030_000,
    videoCount: 76
  }
];

function seedFromString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TITLES = [
  "Як я зробив це за 24 години",
  "Топ-10 помилок новачків",
  "Розбір найпопулярнішого запиту від підписників",
  "Що змінилося за рік",
  "Великий огляд: чи варто це вашого часу",
  "Секрети, про які мовчать усі",
  "Я спробував це вперше в житті",
  "Порівняння: старе проти нового",
  "Відповідаю на найдивніші коментарі",
  "Повний гайд для початківців",
  "Це вразило навіть мене",
  "Реакція на найгарячіші новини тижня"
];

const COMMENTERS = [
  "Олена К.", "Максим П.", "Тетяна Р.", "Ivan G.", "Sarah M.", "Дмитро В.",
  "Anna L.", "Богдан С.", "Julia W.", "Артем Н."
];

const COMMENT_TEXTS = [
  "Дуже класне відео, чекав на це!",
  "Нарешті хтось пояснив це нормально 🙌",
  "Можеш зробити продовження цієї теми?",
  "Не погоджуюсь з тезою на 3:20, але загалом супер",
  "Дивлюсь цей канал вже два роки, якість тільки росте",
  "Це саме те, що я шукав",
  "Звук трохи тихий, а так все чудово",
  "Підписався після цього відео",
  "Ідея з таймкодами дуже допомагає",
  "Коли наступне відео?"
];

export function mockChannelById(id: string): ChannelSummary {
  return MOCK_PERSONAS.find((p) => p.id === id) || MOCK_PERSONAS[0];
}

export function mockVideos(channelId: string, count = 12): VideoSummary[] {
  const rand = mulberry32(seedFromString(channelId + "videos"));
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const views = Math.floor(2_000 + rand() * 480_000);
    const publishedDaysAgo = i * 6 + Math.floor(rand() * 4);
    return {
      id: `${channelId}-v${i}`,
      title: TITLES[(i + seedFromString(channelId)) % TITLES.length],
      thumbnail: `https://picsum.photos/seed/${channelId}-${i}/320/180`,
      publishedAt: new Date(now - publishedDaysAgo * 86_400_000).toISOString(),
      viewCount: views,
      likeCount: Math.floor(views * (0.02 + rand() * 0.05)),
      commentCount: Math.floor(views * (0.001 + rand() * 0.004)),
      durationSeconds: Math.floor(90 + rand() * 900)
    };
  });
}

export function mockComments(videoId: string, count = 8): CommentSummary[] {
  const rand = mulberry32(seedFromString(videoId + "comments"));
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    id: `${videoId}-c${i}`,
    author: COMMENTERS[Math.floor(rand() * COMMENTERS.length)],
    authorAvatar: `https://i.pravatar.cc/64?img=${Math.floor(rand() * 70)}`,
    text: COMMENT_TEXTS[Math.floor(rand() * COMMENT_TEXTS.length)],
    likeCount: Math.floor(rand() * 240),
    publishedAt: new Date(now - i * 3 * 3_600_000).toISOString()
  }));
}

export function mockDailyTimeseries(
  channelId: string,
  startDate: Date,
  endDate: Date
): DailyPoint[] {
  const rand = mulberry32(seedFromString(channelId + "timeseries"));
  const days = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000)
  );
  const base = 3_000 + rand() * 15_000;
  const points: DailyPoint[] = [];
  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate.getTime() + i * 86_400_000);
    const weekday = d.getUTCDay();
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.25 : 1;
    const noise = 0.7 + rand() * 0.6;
    const trend = 1 + i / (days * 6); // gentle upward drift
    const views = Math.round(base * weekendBoost * noise * trend);
    points.push({
      date: d.toISOString().slice(0, 10),
      views,
      watchTimeMinutes: Math.round(views * (2.5 + rand() * 2)),
      subscribersGained: Math.round(views * (0.002 + rand() * 0.004)),
      subscribersLost: Math.round(views * (0.0005 + rand() * 0.0015))
    });
  }
  return points;
}

export function mockTrafficSources(channelId: string): BreakdownPoint[] {
  const rand = mulberry32(seedFromString(channelId + "traffic"));
  const labels = [
    "Пошук YouTube",
    "Рекомендовані відео",
    "Сторінка каналу",
    "Зовнішні посилання",
    "Плейлисти",
    "Shorts",
    "Сповіщення"
  ];
  const raw = labels.map((label) => ({ label, value: rand() }));
  const sum = raw.reduce((s, r) => s + r.value, 0);
  return raw
    .map((r) => ({ label: r.label, value: Math.round((r.value / sum) * 100_000) }))
    .sort((a, b) => b.value - a.value);
}

export function mockDeviceBreakdown(channelId: string): BreakdownPoint[] {
  const rand = mulberry32(seedFromString(channelId + "device"));
  const raw = [
    { label: "Mobile", value: 0.55 + rand() * 0.1 },
    { label: "Desktop", value: 0.25 + rand() * 0.1 },
    { label: "Tv", value: 0.1 + rand() * 0.08 },
    { label: "Tablet", value: 0.03 + rand() * 0.04 }
  ];
  const sum = raw.reduce((s, r) => s + r.value, 0);
  return raw.map((r) => ({ label: r.label, value: Math.round((r.value / sum) * 100) }));
}

export function mockDemographics(
  channelId: string
): { ageGroup: string; male: number; female: number }[] {
  const rand = mulberry32(seedFromString(channelId + "demo"));
  const ages = ["13–17", "18–24", "25–34", "35–44", "45–54", "55–64", "65+"];
  return ages.map((ageGroup) => {
    const male = Math.round(rand() * 15 + 2);
    const female = Math.round(rand() * 12 + 2);
    return { ageGroup, male, female };
  });
}

export function mockGeography(channelId: string): BreakdownPoint[] {
  const rand = mulberry32(seedFromString(channelId + "geo"));
  const countries = ["Україна", "Польща", "США", "Німеччина", "Велика Британія", "Канада", "Іспанія"];
  const raw = countries.map((label) => ({ label, value: rand() }));
  const sum = raw.reduce((s, r) => s + r.value, 0);
  return raw
    .map((r) => ({ label: r.label, value: Math.round((r.value / sum) * 100_000) }))
    .sort((a, b) => b.value - a.value);
}

export function mockTopVideos(channelId: string, count = 8): TopVideoRow[] {
  const videos = mockVideos(channelId, count);
  return videos
    .map((v) => ({
      videoId: v.id,
      views: v.viewCount,
      watchTimeMinutes: Math.round(v.viewCount * 3.2),
      likes: v.likeCount,
      comments: v.commentCount,
      avgViewDurationSeconds: Math.round(v.durationSeconds * 0.42)
    }))
    .sort((a, b) => b.views - a.views);
}
