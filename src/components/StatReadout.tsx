export function formatCompact(n: number): string {
  return new Intl.NumberFormat("uk-UA", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function StatReadout({
  label,
  value,
  delta,
  deltaGood = true
}: {
  label: string;
  value: string;
  delta?: string;
  deltaGood?: boolean;
}) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        {label}
      </div>
      <div
        className="mono"
        style={{ fontSize: 30, fontWeight: 600, color: "var(--paper)", lineHeight: 1 }}
      >
        {value}
      </div>
      {delta && (
        <div
          className="mono"
          style={{
            marginTop: 6,
            fontSize: 12,
            color: deltaGood ? "var(--positive)" : "var(--negative)"
          }}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
