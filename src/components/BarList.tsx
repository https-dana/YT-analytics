import type { BreakdownPoint } from "@/lib/youtubeAnalytics";
import { formatCompact } from "./StatReadout";

export function BarList({ items, color = "var(--signal)" }: { items: BreakdownPoint[]; color?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item) => (
        <div key={item.label}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              marginBottom: 5
            }}
          >
            <span>{item.label}</span>
            <span className="mono muted">{formatCompact(item.value)}</span>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: "var(--panel-alt)" }}>
            <div
              style={{
                height: 6,
                borderRadius: 4,
                background: color,
                width: `${(item.value / max) * 100}%`,
                transition: "width 300ms ease"
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
