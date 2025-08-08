# Next.js Best Practices


## ディレクトリ構造

src/app/         ルーティング & ページ
src/components/  汎用 UI（再利用可能・ロジックなし）
src/lib/         ユーティリティ関数
src/hooks/       カスタムフック
src/types/       型定義
src/constants/   定数
src/config/      設定値・環境変数ラッパー
src/services/    外部 API ラッパーやビジネスロジック
src/demo/        フロントエンドから実行できる手動テストページ

	•	専用（機能固有）コンポーネント … 対応する src/app/**/page.tsx と同階層に、`_components`ディレクトリ配置して、その中で管理する
	•	汎用（再利用可能）コンポーネント … src/components/ に配置

## データハンドリング

  依存条件	実装方法
ユーザー操作に依存しない	server components + Server Actions
ユーザー操作に依存する	client components + Server Actions + useSWR

	•	更新は Server Actions、即時反映は useSWR.mutate で楽観的更新
	•	Supabase は RLS + auth.uid() を利用し、user.id 明示は不要

## 表示と状態管理
•	UI は極力自作せず、必ず shadcn/ui のコンポーネントを利用
•	アイコンは lucide-react を統一使用
•	URL 状態は nuqs に統一
•	グローバル状態ライブラリは 使用しない（必要時は React Context + useReducer などで最小構成）

## パフォーマンス
	•	use client / useEffect / useState は最小限、まず RSCを利用する
	•	クライアント側は Suspense でフォールバック
	•	動的 import で遅延読み込み、画像は next/image、リンクは next/link
	•	ルートベースのコード分割を徹底

## フォームとバリデーション
	•	制御コンポーネント + conform
	•	スキーマ検証は Zod
	•	クライアント／サーバー両方で入力チェック

## 品質・セキュリティ・テスト

### エラーハンドリング
	•	ガード節で 早期 return、成功パスは最後にまとめる

### アクセシビリティ
	•	セマンティック HTML + ARIA、キーボード操作サポート

### Server Actions のセキュリティ指針
	•	ユーザーが許可された操作だけを Server Action として実装
	•	汎用的・多目的なサーバー関数は実装しない
	•	RLS と auth.uid() により 最小権限 を担保

### テスト
	•	demo/ ディレクトリ に UI ベースのテストページを配置し、
すべての Server Actions・クライアント関数を ブラウザ経由で手動検証 できるようにする

⸻

## 実装フロー
	1.	設計：コア原則とディレクトリ決定
	2.	データ：取得（useSWR）・更新（Server Actions＋mutate）ルール確立
	3.	UI / State：shadcn/ui と lucide-react を使い、URL 状態は nuqs
	4.	パフォーマンス：RSC・Suspense・dynamic import で最適化
	5.	フォーム & バリデーション：Zod × conform
	6.	品質管理：エラー処理 → アクセシビリティ → 専用 Server Actions → demo/ で手動テスト

## データフェッチ

Server Componentsによるデータフェッチを行う。
データフェッチを行うにあたっては、Request Memoizationを意識する。

参考資料
- https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- https://nextjs.org/docs/app/deep-dive/caching

データフェッチを行う場合、`*.tsx`のようなReactコンポーネントファイルでは直接`fetch`を利用するのではなく、
任意のドメイン階層に`app/**/fetcher.ts`のようにfetcherであることがわかるようにファイルを準備して、fetch用の関数を用意してexportして利用する。

## ユーザーアクション

ユーザーによるアクションを伴う処理(C/U/D)には、`Server Actions`と`useActionsState()`を利用する。
ユーザー操作に伴ってデータを操作・更新を行なって、その後の結果を再度取得したい場合には、`revalidatePath()`と`revalidateTag()`を用いる。

参考資料
- https://react.dev/reference/react/useActionState
- https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

## Server Component / Client Component

`page.tsx`で `use client`を扱ってはいけない。
`use client`を扱うケースは下記のようなケース。

- クライアントサイド処理
- サードパーティコンポーネント
- RSC Payload転送量の削減

参考資料
- https://zenn.dev/akfm/books/nextjs-basic-principle/viewer/part_2_client_components_usecase

どうしても `use client`をコンポーネントツリーの中でルートに近い階層で用いる場合には、Composition patternを用いる。

```tsx
// side-menu.tsx
"use client";

import { useState } from "react";

// `children`に`<UserInfo>`などのServer Componentsを渡すことが可能！
export function SideMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children}
      <div>
        <button type="button" onClick={() => setOpen((prev) => !prev)}>
          toggle
        </button>
        <div>...</div>
      </div>
    </>
  );
}
```

```tsx
// page.tsx
import { UserInfo } from "./user-info"; // Server Components
import { SideMenu } from "./side-menu"; // Client Components

/**
 * Client Components(`<SideMenu>`)の子要素として
 * Server Components(`<UserInfo>`)を渡せる
 */
export function Page() {
  return (
    <div>
      <SideMenu>
        <UserInfo />
      </SideMenu>
      <main>{/* ... */}</main>
    </div>
  );
}
```
