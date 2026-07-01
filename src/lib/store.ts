import fs from "fs";
import path from "path";

// NOTE: this is a deliberately simple persistence layer for the prototype —
// a flat JSON file on disk. It keeps the demo runnable with zero external
// infrastructure (no DB server, no Prisma binaries to download). In a real
// deployment this module is the only thing that would need to be swapped
// out for a proper database (Postgres/Mongo/etc.) behind the same
// `channelStore` interface, with refresh tokens encrypted at rest.

export type ConnectedChannel = {
  id: string; // YouTube channel id
  title: string;
  thumbnail: string;
  customUrl?: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  accessToken: string;
  refreshToken: string;
  expiryDate: number; // ms epoch
  scope: string;
  connectedAt: number; // ms epoch
  publishedAt?: string; // channel creation date, for "all time" ranges
};

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "channels.json");

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

function readAll(): ConnectedChannel[] {
  ensureFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as ConnectedChannel[];
  } catch {
    return [];
  }
}

function writeAll(channels: ConnectedChannel[]) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(channels, null, 2), "utf-8");
}

export const channelStore = {
  list(): ConnectedChannel[] {
    return readAll();
  },
  get(id: string): ConnectedChannel | undefined {
    return readAll().find((c) => c.id === id);
  },
  upsert(channel: ConnectedChannel) {
    const all = readAll();
    const idx = all.findIndex((c) => c.id === channel.id);
    if (idx >= 0) all[idx] = { ...all[idx], ...channel };
    else all.push(channel);
    writeAll(all);
  },
  updateTokens(
    id: string,
    tokens: { accessToken: string; expiryDate: number; refreshToken?: string }
  ) {
    const all = readAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return;
    all[idx].accessToken = tokens.accessToken;
    all[idx].expiryDate = tokens.expiryDate;
    if (tokens.refreshToken) all[idx].refreshToken = tokens.refreshToken;
    writeAll(all);
  },
  remove(id: string) {
    writeAll(readAll().filter((c) => c.id !== id));
  }
};
