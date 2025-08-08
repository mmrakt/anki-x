# architecture.md

## 概要

技術スタック（React 19, Next 15, TypeScript, Tailwind + shadcn/ui, Tanstack Query, React Hook Form, Prisma, Zod, Storybook, MSW, jotai）を用いたアーキテクチャ詳細。実装ガイドと設計方針を記載。

## 高レベル図（ASCII）

```
[Browser(Client)] -- HTTPS --> [Next.js App (Vercel)] --(Prisma)--> [Postgres DB]
       |                          |-- Redis? (cache/session/prefetch) --|
       |                          |-- External TTS / Email / OAuth ---|
       |                          |-- Background jobs (cron / serverless)
```

## 技術マッピング（各技術の役割）

* **Next.js (15)**: ルーティング（app dir）、Server Actions、Server Components（RSC）、Streaming, Partial Prerendering。開発は Turbopack。
* **React 19**: Server/Client Components、Actions、Concurrent features（useTransition, Suspenseなど）
* **TypeScript**: 全体での型安全
* **Tailwind CSS + shadcn/ui**: UI構築
* **Tanstack Query**: サーバーデータ取得／キャッシュ／prefetch／mutation
* **React Hook Form + Zod**: フォーム入力とバリデーション（フロントはRHF、バックはZodで再検証）
* **Prisma ORM**: DBスキーマ管理・クエリ
* **Storybook**: UIコンポーネント開発・ドキュメント
* **MSW**: StorybookおよびテストでのAPIモック
* **jotai**: セッション内短期state（カードキュー、現在indexなど）

## DB（Prisma）- コアスキーマ

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  decks     Deck[]
  reviews   Review[]
}

model Deck {
  id        String   @id @default(cuid())
  title     String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  cards     Card[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Card {
  id          String   @id @default(cuid())
  deckId      String
  deck        Deck     @relation(fields: [deckId], references: [id])
  front       String
  back        String
  createdAt   DateTime @default(now())
  ease        Float    @default(2.5)
  interval    Int      @default(0)
  repetitions Int      @default(0)
  dueAt       DateTime @default(now())
  reviews     Review[]
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  cardId    String
  rating    Int
  createdAt DateTime @default(now())
  nextDue   DateTime
  note      String?
  user      User     @relation(fields: [userId], references: [id])
  card      Card     @relation(fields: [cardId], references: [id])
}
```

## API設計（Server Actions中心）

> ほとんどServer Actionsで実装し、必要な読み取りはTanstack Queryでfetchする想定

### 主なServer Actions

* `actions/createDeck(formData)` — デッキ作成（Zodでvalidate）
* `actions/updateDeck(formData)` — デッキ更新
* `actions/createCard(formData)` — カード作成
* `actions/updateCard(formData)` — カード更新
* `actions/submitReview(formData)` — レビュー受け取り + SM‑2更新（トランザクション）
* `actions/importCSV(formData)` — CSV/Ankiインポート

### 読み取りエンドポイント（TRQで呼ぶ）

* `GET /api/decks` — デッキ一覧（RSC or TRQ）
* `GET /api/decks/:id` — デッキ詳細 + dueカウント
* `GET /api/review/due?userId=` — 当日のdueカード一覧（セッション開始時取得）
* `GET /api/users/:id/stats` — 学習統計

## Server/Client Componentの分割方針

* **Server Components (RSC)**

  * デッキ一覧ページの読み取り部分（高速表示）
  * 公開用デッキページ（SEO用）
  * 学習統計の集計結果表示（heavy）
* **Client Components**

  * 復習セッションUI（即時反応・アニメ）
  * カード編集フォーム（RHF）
  * モーダル・トースト

## State管理パターン

* **Tanstack Query**: 永続的なサーバーデータ（decks, cards, stats）

  * staleTimeとcacheTimeはケースバイケースで調整。復習セッションはprefetchしてlocalで処理。
* **jotai**: セッション内の短期ステート（現在のカード配列、index、UIフラグ）
* **RHF + Zod**: フォームの入力管理と同期検証。Server ActionでZod再検証。

## SRSアルゴリズム

* SM‑2ベースの簡易実装。評価を受け取り、Cardの `ease`, `repetitions`, `interval`, `dueAt` を更新する。

```ts
export function sm2(card: { ease:number; repetitions:number; interval:number }, rating:number) {
  let { ease, repetitions, interval } = card;
  if (rating < 2) {
    repetitions = 0; interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * ease);
  }
  ease = Math.max(1.3, ease + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02)));
  const nextDue = new Date(); nextDue.setDate(nextDue.getDate() + interval);
  return { ease, repetitions, interval, nextDue };
}
```

## キャッシュとUX最適化

* 復習開始時に `GET /api/review/due` をTRQで一括取得→jotaiにキューとして保存してセッション中はローカル操作
* レビュー送信は `mutation` + optimistic update（TRQ）またはServer Actionを使い、Serverで整合を取りDB更新
* 長文カードはRSCでストリーミングして早めに表示

## Storybook / MSW

* StorybookはUIコンポーネントの単位開発に必須
* MSWはStorybookとテストで利用し、TRQのレスポンスをモックしてUI検証

## テスト戦略

* ユニット: SRSロジック、Zodスキーマ
* コンポーネント: Storybook + @testing-library/react (MSWでAPIモック)
* E2E: Playwright（復習フロー、インポート、認証）

## デプロイ & インフラ

* **推奨**: Vercel（Next 15最適）
* **DB**: Supabase / PlanetScale / RDS(Postgres)
* **キャッシュ/短期ストア**: Redis（必要なら）
* **Background jobs**: Vercel Cron / Serverless Functions / Dedicated worker（夜間集計・メール）
* **CI/CD**: GitHub Actions — prisma migrate deploy, tests, build

## 観測・ロギング

* 主要イベント: レビュー送信、デッキ作成、ログイン
* モニタ: Sentry (errors), Prometheus/Datadog (metrics)

## スケーリング／同時性の注意点

* 同時レビューでの在庫競合はカード更新をDBトランザクションで保護
* 大量ユーザ: dueカードの抽出クエリを最適化（インデックス）し、セッションに返す量を制限

## セキュリティ

* 入力はZodで厳格にバリデート
* Server Actionsでサーバ側再検証と認可チェック
* Rate limit (API gateway or middleware)
* Secrets: Vault / Vercel envs

## バックアップ & マイグレーション

* 定期バックアップ（daily）とポイントインタイムリストア
* Prisma Migrateでスキーマ管理。ステージングで検証→本番適用。

## ロードマップ（推奨）

* **Sprint 0 (1w)**: 要件確定、DBスキーマ、dev env
* **Sprint 1 (2w)**: 認証、デッキ/カードCRUD、Storybook基盤
* **Sprint 2 (2w)**: 復習セッション実装、SM‑2ロジック、TRQ/jotai統合
* **Sprint 3 (2w)**: テスト・E2E、デプロイ準備、初期分析
* **v1**: CSVインポート、共有デッキ、TTS

---

*以上。必要なら各セクションをさらに細かく（エンドポイントのリクエスト/レスポンス型、Storybookストーリーリスト、CIワークフロー等）展開するよ。*
