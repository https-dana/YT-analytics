"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function DemographicsBars({
  data
}: {
  data: { ageGroup: string; male: number; female: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }} barGap={4}>
        <CartesianGrid stroke="var(--hairline)" vertical={false} />
        <XAxis
          dataKey="ageGroup"
          tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
          axisLine={{ stroke: "var(--hairline)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
          width={36}
          unit="%"
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
        <Bar dataKey="male" name="Чоловіки" fill="var(--cool)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="female" name="Жінки" fill="var(--signal)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
