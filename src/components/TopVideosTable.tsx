"use client";

import { useState } from "react";
import { formatCompact } from "./StatReadout";

export type TopVideoRow = {
  videoId: string;
  title: string;
  thumbnail: string;
  views: number;
  watchTimeMinutes: number;
  likes: number;
  comments: number;
  avgViewDurationSeconds: number;
};

type CommentItem = {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  likeCount: number;
  publishedAt: string;
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function TopVideosTable({
  channelId,
  videos
}: {
  channelId: string;
  videos: TopVideoRow[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, CommentItem[]>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const max = Math.max(1, ...videos.map((v) => v.views));

  async function toggle(videoId: string) {
    if (openId === videoId) {
      setOpenId(null);
      return;
    }
    setOpenId(videoId);
    if (!comments[videoId]) {
      setLoading(videoId);
      try {
        const res = await fetch(`/api/channels/${channelId}/videos/${videoId}/comments`);
        const data = await res.json();
        setComments((prev) => ({ ...prev, [videoId]: data.comments || [] }));
      } finally {
        setLoading(null);
      }
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {videos.map((v) => (
        <div key={v.videoId} className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <button
            onClick={() => toggle(v.videoId)}
            style={{
              display: "grid",
              gridTemplateColumns: "64px 1fr auto auto auto auto",
              alignItems: "center",
              gap: 14,
              width: "100%",
              padding: "12px 16px",
              background: "transparent",
              border: "none",
              textAlign: "left"
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={v.thumbnail}
              alt=""
              width={64}
              height={36}
              style={{ borderRadius: 6, objectFit: "cover", background: "var(--panel-alt)" }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {v.title}
              </div>
              <div style={{ height: 4, borderRadius: 3, background: "var(--panel-alt)", marginTop: 6, width: 140 }}>
                <div
                  style={{
                    height: 4,
                    borderRadius: 3,
                    background: "var(--signal)",
                    width: `${(v.views / max) * 100}%`
                  }}
                />
              </div>
            </div>
            <Metric label="перегляди" value={formatCompact(v.views)} />
            <Metric label="лайки" value={formatCompact(v.likes)} />
            <Metric label="коментарі" value={formatCompact(v.comments)} />
            <Metric label="серед. перегляд" value={formatDuration(v.avgViewDurationSeconds)} />
          </button>

          {openId === v.videoId && (
            <div style={{ borderTop: "1px solid var(--hairline)", padding: "12px 16px" }}>
              {loading === v.videoId && (
                <div className="mono muted" style={{ fontSize: 12 }}>
                  Завантаження коментарів…
                </div>
              )}
              {loading !== v.videoId && (comments[v.videoId]?.length ?? 0) === 0 && (
                <div className="mono muted" style={{ fontSize: 12 }}>
                  Коментарів не знайдено.
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {comments[v.videoId]?.map((c) => (
                  <div key={c.id} style={{ display: "flex", gap: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.authorAvatar}
                      alt=""
                      width={28}
                      height={28}
                      style={{ borderRadius: "50%", flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: 12.5 }}>
                        <strong style={{ fontWeight: 600 }}>{c.author}</strong>{" "}
                        <span className="mono muted" style={{ fontSize: 11 }}>
                          · {formatCompact(c.likeCount)} лайків
                        </span>
                      </div>
                      <div className="muted" style={{ fontSize: 13, marginTop: 2, lineHeight: 1.5 }}>
                        {c.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "right", minWidth: 78 }}>
      <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>
        {value}
      </div>
      <div className="eyebrow" style={{ fontSize: 9 }}>
        {label}
      </div>
    </div>
  );
}
