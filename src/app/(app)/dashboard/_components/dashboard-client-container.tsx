'use client';

import { useDecks } from '@/lib/queries/deck';
import { useStats } from '@/lib/queries/stats';
import { DashboardStats } from './dashboard-stats';
import { DeckList } from './deck-list';

// Client Container Component - uses hydrated data from TanStack Query
export function DashboardClientContainer() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: decks, isLoading: decksLoading } = useDecks();

  if (statsLoading || decksLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg" />
          ))}
        </div>
        <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && <DashboardStats stats={stats} />}
      {decks && <DeckList decks={decks} />}
    </div>
  );
}
