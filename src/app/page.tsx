"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChannelCard, type ChannelCardData } from "@/components/ChannelCard";
import { Waveform } from "@/components/Waveform";

export default function Dashboard() {
  const [channels, setChannels] = useState<ChannelCardData[] | null>(null);

  useEffect(() => {
    fetch("/api/channels")
      .then((r) => r.json())
      .then((d) => setChannels(d.channels))
      .catch(() => setChannels([]));
  }, []);

  return (
    <div className="container" style={{ paddingTop: "clamp(24px, 4vw, 56px)", paddingBottom: "clamp(32px, 6vw, 80px)" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow">Панель каналів</div>
          <h1 className="h1" style={{ marginTop: 8 }}>
            Усі ваші канали. Один сигнал.
          </h1>
          <p className="muted" style={{ maxWidth: 520, marginTop: 10, lineHeight: 1.6 }}>
            Підключіть будь-яку кількість YouTube-каналів через Google-логін і
            дивіться перегляди, аудиторію, трафік і коментарі в одній панелі.
          </p>
        </div>
        <Link
          href="/connect"
          className="mono"
          style={{
            background: "var(--signal)",
            color: "#1a1204",
            fontWeight: 600,
            fontSize: 13,
            padding: "12px 20px",
            borderRadius: 10,
            whiteSpace: "nowrap"
          }}
        >
          + Підключити канал
        </Link>
      </div>

      <div style={{ margin: "32px 0" }}>
        <Waveform seed={3} height={22} />
      </div>

      {channels === null && (
        <div className="muted mono" style={{ padding: "40px 0" }}>
          Завантаження каналів…
        </div>
      )}

      {channels && channels.length === 0 && <EmptyState />}

      {channels && channels.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16
          }}
        >
          {channels.map((c) => (
            <ChannelCard key={c.id} channel={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="panel"
      style={{
        padding: "56px 32px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16
      }}
    >
      <Waveform seed={21} bars={28} height={34} color="var(--panel-alt)" />
      <div className="h2">Ще немає підключених каналів</div>
      <p className="muted" style={{ maxWidth: 380, lineHeight: 1.6 }}>
        Натисніть «Підключити канал», увійдіть через Google і дозвольте доступ
        до YouTube Analytics — і статистика з’явиться тут.
      </p>
      <Link
        href="/connect"
        className="mono"
        style={{
          background: "var(--signal)",
          color: "#1a1204",
          fontWeight: 600,
          fontSize: 13,
          padding: "12px 20px",
          borderRadius: 10,
          marginTop: 4
        }}
      >
        + Підключити канал
      </Link>
    </div>
  );
}
