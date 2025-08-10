import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '設定 | Anki-X',
  description: 'アプリケーション設定',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">学習設定</h2>
        <p className="text-gray-600">設定ページ - 実装予定</p>
      </div>
    </div>
  );
}