import type { Metadata } from 'next';

interface DeckDetailPageProps {
  params: {
    id: string;
  };
}

export function generateMetadata({ params }: DeckDetailPageProps): Metadata {
  return {
    title: `デッキ詳細 | Anki-X`,
    description: `デッキID: ${params.id} の詳細情報`,
  };
}

export default function DeckDetailPage({ params }: DeckDetailPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">デッキ詳細</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">デッキID: {params.id}</p>
        <p className="text-gray-600">デッキ詳細ページ - 実装予定</p>
      </div>
    </div>
  );
}