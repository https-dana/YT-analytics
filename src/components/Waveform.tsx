"use client";

export function Waveform({
  bars = 48,
  height = 28,
  color = "var(--hairline)",
  seed = 7
}: {
  bars?: number;
  height?: number;
  color?: string;
  seed?: number;
}) {
  let a = seed;
  const rand = () => {
    a = (a * 9301 + 49297) % 233280;
    return a / 233280;
  };
  const heights = Array.from({ length: bars }, () => 0.15 + rand() * 0.85);

  return (
    <svg
      viewBox={`0 0 ${bars * 4} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      aria-hidden
    >
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 4}
          y={height * (1 - h)}
          width={2}
          height={height * h}
          rx={1}
          fill={color}
        />
      ))}
    </svg>
  );
}
