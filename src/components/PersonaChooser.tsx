"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MOCK_PERSONAS } from "@/lib/mock";
import { formatCompact } from "./StatReadout";

export function PersonaChooser() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function connect(id: string) {
    setLoadingId(id);
    try {
      await fetch("/api/channels/mock-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      router.push(`/channel/${id}`);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {MOCK_PERSONAS.map((p) => (
        <button
          key={p.id}
          onClick={() => connect(p.id)}
          disabled={loadingId !== null}
          className="panel"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 16px",
            width: "100%",
            textAlign: "left",
            border: "1px solid var(--hairline)",
            background: "var(--panel)",
            opacity: loadingId && loadingId !== p.id ? 0.5 : 1
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.thumbnail}
            alt=""
            width={36}
            height={36}
            style={{ borderRadius: "50%" }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14 }}>
              {p.title}
            </div>
            <div className="mono muted" style={{ fontSize: 12, marginTop: 2 }}>
              {p.customUrl} · {formatCompact(p.subscriberCount)} підписників
            </div>
          </div>
          <span className="eyebrow">{loadingId === p.id ? "Вхід…" : "Обрати"}</span>
        </button>
      ))}
    </div>
  );
}
