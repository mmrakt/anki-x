import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'デッキ管理 | Anki-X',
  description: 'デッキの作成・編集・管理',
};

export default function DecksPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">デッキ管理</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">デッキ管理ページ - 実装予定</p>
      </div>
    </div>
  );
}