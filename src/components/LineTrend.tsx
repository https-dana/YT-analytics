"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import type { DailyPoint } from "@/lib/youtubeAnalytics";

export function LineTrend({ data }: { data: DailyPoint[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" })
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={formatted} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--hairline)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
          axisLine={{ stroke: "var(--hairline)" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: "var(--panel-alt)",
            border: "1px solid var(--hairline)",
            borderRadius: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 12
          }}
          labelStyle={{ color: "var(--paper)" }}
        />
        <Line
          type="monotone"
          dataKey="views"
          name="Перегляди"
          stroke="var(--signal)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="watchTimeMinutes"
          name="Хвилини перегляду"
          stroke="var(--cool)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
