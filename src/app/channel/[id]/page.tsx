"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StatReadout, formatCompact } from "@/components/StatReadout";
import { RangePills } from "@/components/RangePills";
import { LineTrend } from "@/components/LineTrend";
import { BarList } from "@/components/BarList";
import { DemographicsBars } from "@/components/DemographicsBars";
import { TopVideosTable } from "@/components/TopVideosTable";
import { Waveform } from "@/components/Waveform";

type ChannelInfo = {
  id: string;
  title: string;
  thumbnail: string;
  customUrl?: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
};

export default function ChannelPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [range, setRange] = useState(28);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    fetch(`/api/channels/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setChannel)
      .catch(() => setChannel(null));
  }, [id]);

  useEffect(() => {
    setLoadingAnalytics(true);
    const rangeParam = range === -1 ? "all" : String(range);
    fetch(`/api/channels/${id}/analytics?range=${rangeParam}`)
      .then((r) => r.json())
      .then(setAnalytics)
      .finally(() => setLoadingAnalytics(false));
  }, [id, range]);

  async function disconnect() {
    if (!confirm("Відключити цей канал? Дані аналітики перестануть оновлюватись.")) return;
    await fetch(`/api/channels/${id}`, { method: "DELETE" });
    router.push("/");
  }

  if (!channel) {
    return (
      <div className="container" style={{ paddingTop: 56 }}>
        <div className="mono muted">Завантаження каналу…</div>
      </div>
    );
  }

  const totals = (analytics?.timeseries || []).reduce(
    (acc: any, d: any) => ({
      views: acc.views + d.views,
      watchTimeMinutes: acc.watchTimeMinutes + d.watchTimeMinutes,
      subscribersGained: acc.subscribersGained + d.subscribersGained,
      subscribersLost: acc.subscribersLost + d.subscribersLost
    }),
    { views: 0, watchTimeMinutes: 0, subscribersGained: 0, subscribersLost: 0 }
  );
  const netSubs = totals.subscribersGained - totals.subscribersLost;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <Link href="/" className="mono muted" style={{ fontSize: 12 }}>
        ← Усі канали
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginTop: 16,
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={channel.thumbnail}
            alt=""
            width={56}
            height={56}
            style={{ borderRadius: 14, objectFit: "cover", background: "var(--panel)" }}
          />
          <div>
            <h1 className="h1" style={{ fontSize: 26 }}>
              {channel.title}
            </h1>
            <div className="mono muted" style={{ fontSize: 12, marginTop: 4 }}>
              <span className="pulse-dot" style={{ marginRight: 6 }} />
              {channel.customUrl || channel.id} · {formatCompact(channel.subscriberCount)} підписників
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <RangePills value={range} onChange={setRange} />
          <button
            onClick={disconnect}
            className="mono"
            style={{
              fontSize: 12,
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid var(--hairline)",
              background: "transparent",
              color: "var(--negative)"
            }}
          >
            Відключити
          </button>
        </div>
      </div>

      <div style={{ margin: "28px 0 24px" }}>
        <Waveform seed={id?.length || 5} height={20} />
      </div>

      {loadingAnalytics && <div className="mono muted">Оновлення аналітики…</div>}

      {!loadingAnalytics && analytics && !analytics.error && (
        <>
          <div
            className="panel"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 24,
              padding: 24
            }}
          >
            <StatReadout label={`Перегляди · ${range === -1 ? "увесь час" : range + " дн."}`} value={formatCompact(totals.views)} />
            <StatReadout
              label="Годин перегляду"
              value={formatCompact(Math.round(totals.watchTimeMinutes / 60))}
            />
            <StatReadout
              label="Нові підписники (нетто)"
              value={(netSubs >= 0 ? "+" : "") + formatCompact(netSubs)}
              deltaGood={netSubs >= 0}
              delta={`+${formatCompact(totals.subscribersGained)} / −${formatCompact(totals.subscribersLost)}`}
            />
            <StatReadout label="Усього переглядів каналу" value={formatCompact(channel.viewCount)} />
          </div>

          <SectionTitle>Динаміка переглядів і watch time</SectionTitle>
          <div className="panel" style={{ padding: 20 }}>
            <LineTrend data={analytics.timeseries} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginTop: 16
            }}
          >
            <div>
              <SectionTitle>Джерела трафіку</SectionTitle>
              <div className="panel" style={{ padding: 20 }}>
                <BarList items={analytics.trafficSources} />
              </div>
            </div>
            <div>
              <SectionTitle>Пристрої</SectionTitle>
              <div className="panel" style={{ padding: 20 }}>
                <BarList items={analytics.deviceBreakdown} color="var(--cool)" />
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: 16,
              marginTop: 16
            }}
          >
            <div>
              <SectionTitle>Аудиторія за віком і статтю</SectionTitle>
              <div className="panel" style={{ padding: 20 }}>
                <DemographicsBars data={analytics.demographics} />
              </div>
            </div>
            <div>
              <SectionTitle>Топ країн за переглядами</SectionTitle>
              <div className="panel" style={{ padding: 20 }}>
                <BarList items={analytics.geography} color="var(--positive)" />
              </div>
            </div>
          </div>

          <SectionTitle>
            {range === -1 ? "Найкращі відео за весь час" : "Найкращі відео за період"} · коментарі
          </SectionTitle>
          {analytics.topVideos.every((v: any) => v.views === 0) ? (
            <div
              className="panel"
              style={{ padding: "28px 24px", textAlign: "center" }}
            >
              <div className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
                Дані по відео за цей період ще не готові. YouTube Analytics
                оновлює статистику з затримкою до 24–48 годин, особливо для
                щойно завантажених відео. Спробуйте більший діапазон
                («Увесь час») або перевірте пізніше.
              </div>
            </div>
          ) : (
            <TopVideosTable channelId={channel.id} videos={analytics.topVideos} />
          )}
        </>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="h2" style={{ margin: "32px 0 14px" }}>
      {children}
    </div>
  );
}
