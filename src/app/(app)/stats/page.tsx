import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '学習統計 | Anki-X',
  description: '学習進捗と統計情報',
};

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">学習統計</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">学習データ</h2>
        <p className="text-gray-600">統計ページ - 実装予定</p>
      </div>
    </div>
  );
}