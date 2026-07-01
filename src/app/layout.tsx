import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Signal — YouTube channel analytics",
  description: "Підключіть YouTube-канали й дивіться перегляди, аудиторію та коментарі в одному місці."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header style={{ borderBottom: "1px solid var(--hairline)" }}>
          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 64
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 18
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
                <rect x="1" y="9" width="3" height="9" rx="1" fill="var(--signal)" />
                <rect x="7" y="4" width="3" height="14" rx="1" fill="var(--signal)" />
                <rect x="13" y="0" width="3" height="18" rx="1" fill="var(--signal-dim)" />
              </svg>
              Signal
            </Link>
            <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {config.mockMode ? (
                <>
                  <span className="pulse-dot" style={{ background: "var(--signal)" }} />
                  Демо-режим · дані згенеровано
                </>
              ) : (
                <>
                  <span className="pulse-dot" />
                  Live · YouTube Data &amp; Analytics API
                </>
              )}
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
