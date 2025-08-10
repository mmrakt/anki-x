import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'プロフィール | Anki-X',
  description: 'ユーザープロフィール設定',
};

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">ユーザー情報</h2>
        <p className="text-gray-600">プロフィール設定ページ - 実装予定</p>
      </div>
    </div>
  );
}