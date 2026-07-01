import Link from "next/link";
import { formatCompact } from "./StatReadout";

export type ChannelCardData = {
  id: string;
  title: string;
  thumbnail: string;
  customUrl?: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
};

export function ChannelCard({ channel }: { channel: ChannelCardData }) {
  return (
    <Link
      href={`/channel/${channel.id}`}
      className="panel"
      style={{
        display: "block",
        padding: 20,
        transition: "border-color 120ms ease, transform 120ms ease"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            overflow: "hidden",
            background: "var(--panel-alt)",
            flexShrink: 0,
            position: "relative"
          }}
        >
          {channel.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={channel.thumbnail}
              alt=""
              width={48}
              height={48}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            className="h2"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {channel.title}
          </div>
          <div className="mono muted" style={{ fontSize: 12, marginTop: 2 }}>
            <span className="pulse-dot" style={{ marginRight: 6 }} />
            {channel.customUrl || channel.id}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid var(--hairline)"
        }}
      >
        <MiniStat label="Підписники" value={formatCompact(channel.subscriberCount)} />
        <MiniStat label="Перегляди" value={formatCompact(channel.viewCount)} />
        <MiniStat label="Відео" value={formatCompact(channel.videoCount)} />
      </div>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="eyebrow" style={{ fontSize: 10 }}>
        {label}
      </div>
      <div className="mono" style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}
