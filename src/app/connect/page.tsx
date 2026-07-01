import { config } from "@/lib/config";
import { PersonaChooser } from "@/components/PersonaChooser";
import { Waveform } from "@/components/Waveform";

export default function ConnectPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 80, maxWidth: 520 }}>
      <div className="eyebrow">Підключення каналу</div>
      <h1 className="h1" style={{ marginTop: 8, fontSize: 28 }}>
        Увійдіть через Google
      </h1>
      <p className="muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
        Для базової статистики достатньо публічних даних YouTube Data API. Для
        глибшої аналітики (аудиторія, джерела трафіку, watch time) потрібен
        дозвіл на читання YouTube Analytics вашого облікового запису Google.
      </p>

      {searchParams?.error && (
        <div
          className="mono"
          style={{
            marginTop: 16,
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(255,107,107,0.1)",
            color: "var(--negative)",
            fontSize: 13
          }}
        >
          Не вдалося підключити канал ({searchParams.error}). Спробуйте ще раз.
        </div>
      )}

      <div style={{ margin: "28px 0" }}>
        <Waveform seed={12} height={20} />
      </div>

      {config.mockMode ? (
        <>
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Демо-режим · оберіть тестовий канал
          </div>
          <PersonaChooser />
          <p className="muted" style={{ fontSize: 12, marginTop: 16, lineHeight: 1.6 }}>
            Це імітація вибору Google-акаунта, бо додаток запущено без реальних
            OAuth-ключів. Додайте GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET та
            MOCK_MODE=false в .env.local, щоб підключати справжні канали.
          </p>
        </>
      ) : (
        <a
          href="/api/auth/google/start"
          className="mono"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            background: "var(--paper)",
            color: "#151515",
            fontWeight: 600,
            fontSize: 14,
            padding: "14px 20px",
            borderRadius: 10
          }}
        >
          Продовжити з Google
        </a>
      )}
    </div>
  );
}
