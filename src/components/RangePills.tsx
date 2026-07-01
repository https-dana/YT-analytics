"use client";

const OPTIONS = [
  { label: "7 днів", value: 7 },
  { label: "28 днів", value: 28 },
  { label: "90 днів", value: 90 },
  { label: "Увесь час", value: -1 }
];

export function RangePills({
  value,
  onChange
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div
      className="mono"
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        background: "var(--panel)",
        border: "1px solid var(--hairline)",
        borderRadius: 10
      }}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: "6px 12px",
            fontSize: 12,
            borderRadius: 7,
            border: "none",
            background: value === o.value ? "var(--signal)" : "transparent",
            color: value === o.value ? "#1a1204" : "var(--muted)",
            fontWeight: value === o.value ? 600 : 400
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
