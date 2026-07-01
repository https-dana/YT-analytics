# Signal — платформа аналітики YouTube-каналів

Прототип платформи, куди можна підключити один або декілька YouTube-каналів
через Google OAuth і дивитись перегляди, аудиторію, джерела трафіку, топ
відео та коментарі в одній панелі.

## Швидкий старт (демо-режим, без ключів Google)

```bash
npm install
npm run dev
```

Відкрийте http://localhost:3000. Додаток за замовчуванням працює в
**демо-режимі** (`MOCK_MODE=true` в `.env.local`) — замість реального
Google-логіну показується вибір із кількох тестових каналів, а вся аналітика
генерується детерміновано (та ж сама при кожному запуску). Це дозволяє
одразу оцінити UX, не створюючи Google Cloud проєкт.

Натисніть «+ Підключити канал» → оберіть тестовий канал → потрапите на
сторінку глибокої аналітики з графіками, розбивками та коментарями. Можна
підключити кілька каналів одночасно — вони з'являться на дашборді як окремі
картки (мультиканальність).

## Підключення реального Google OAuth

1. У [Google Cloud Console](https://console.cloud.google.com/) створіть
   проєкт, увімкніть **YouTube Data API v3** та **YouTube Analytics API**.
2. Створіть OAuth 2.0 Client ID (тип «Web application»), Authorized redirect
   URI: `http://localhost:3000/api/auth/google/callback`.
3. Скопіюйте `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` у `.env.local`,
   встановіть `MOCK_MODE=false`.
4. `npm run dev` — тепер «Підключити канал» веде на справжній Google-логін
   зі згодою на доступ до `youtube.readonly` та `yt-analytics.readonly`.

## Деплой на Railway

Проєкт містить `railway.toml`, тож Railway (через Nixpacks) автоматично
розпізнає його як Next.js-застосунок.

**Варіант А — через GitHub:**

1. Запуште код у GitHub-репозиторій.
2. На [railway.app](https://railway.app) → **New Project** → **Deploy from
   GitHub repo** → оберіть репозиторій.
3. Railway сам виконає `npm install`, `npm run build`, `npm run start`.
4. У вкладці **Variables** сервісу додайте:
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (якщо вимикаєте демо-режим)
   - `MOCK_MODE` = `true` або `false`
   - `APP_URL` = домен, який Railway видасть після першого деплою, напр.
     `https://your-app.up.railway.app` (без слеша в кінці)
5. Після деплою Railway видає публічний домен у вкладці **Settings →
   Networking → Generate Domain**. Проставте його в `APP_URL` і
   передеплойте (Redeploy), бо OAuth redirect URI будується саме з цього
   значення.
6. Якщо `MOCK_MODE=false` — у Google Cloud Console додайте в Authorized
   redirect URIs: `https://your-app.up.railway.app/api/auth/google/callback`.

**Варіант Б — через Railway CLI (без GitHub):**

```bash
npm i -g @railway/cli
railway login
cd yt-analytics
railway init
railway up
railway variables --set "APP_URL=https://<домен-після-деплою>"
railway variables --set "MOCK_MODE=true"
```

**Важливо про постійність даних:** підключені канали зберігаються у файлі
`data/channels.json`. Файлова система Railway для сервісів — ефемерна:
дані зникнуть після кожного нового деплою/рестарту контейнера. Для
демо/тестового це не критично, але якщо потрібна постійність:

1. У Railway додайте **Volume** до сервісу (Settings → Volumes), вкажіть
   mount path, напр. `/data`.
2. Додайте переменну `DATA_DIR=/data`.
3. Передеплойте — тепер `data/channels.json` живе на volume і переживає
   рестарти.

## Архітектура

```
src/
  app/
    page.tsx                    дашборд: список підключених каналів
    connect/page.tsx            вибір Google-акаунта / вхід
    channel/[id]/page.tsx       глибока аналітика одного каналу
    api/
      auth/google/start         старт OAuth (redirect на Google)
      auth/google/callback      обмін code -> токени, збереження каналу
      channels/                 список / деталі / відключення каналу
      channels/[id]/videos      список відео (YT Data API)
      channels/[id]/analytics   агрегована аналітика (YT Analytics API)
      channels/.../comments     коментарі під відео
  lib/
    google.ts                   OAuth2-клієнт, авто-рефреш токена
    youtube.ts                  обгортки над YouTube Data API v3
    youtubeAnalytics.ts         обгортки над YouTube Analytics API v2
    mock.ts                     детерміновані фейкові дані для демо-режиму
    store.ts                    збереження підключених каналів (JSON-файл)
```

### Дані, які витягуються

**Публічно (YouTube Data API v3)** — назва каналу, аватар, підписники,
перегляди, кількість відео, список останніх відео зі статистикою (перегляди,
лайки, коментарі, тривалість), коментарі під відео.

**Тільки після Google-логіну (YouTube Analytics API v2, `channel==MINE`)** —
перегляди та watch time по днях, отримані/втрачені підписники, джерела
трафіку (пошук, рекомендовані, зовнішні посилання...), розбивка по
пристроях, аудиторія за віком/статтю, топ країн, топ відео за період з
watch time і середньою тривалістю перегляду.

### Чому JSON-файл, а не Postgres/Prisma

Це навмисне спрощення для тестового: `lib/store.ts` — єдиний модуль, який
треба замінити на реальну БД для продакшн-версії; решта коду звертається до
нього через той самий інтерфейс (`channelStore.list/get/upsert/remove`).
Токени в реальному продукті мають зберігатись зашифрованими, а не в
відкритому JSON.

### Що є навмисним спрощенням прототипу

- Одна робоча область без окремої авторизації користувачів застосунку —
  усі підключені канали видно кожному, хто відкриє дашборд. У продакшн-версії
  тут мав би бути окремий шар auth (сесії, робочі простори/команди), а
  Google OAuth підключав би канал саме до такого простору.
- Немає кешування квоти YouTube API (у Data API є денний ліміт запитів) —
  для реального навантаження потрібен кеш аналітики з TTL.
- Демо-акаунти обираються кнопкою замість справжнього Google-чекбоксу — це
  лише щоб показати UX без live-ключів.

## Стек

Next.js 14 (App Router) + TypeScript, `googleapis` для OAuth і викликів API,
Recharts для графіків. Без зовнішньої БД — усе піднімається однією командою.
