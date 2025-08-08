import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getDecks, getStats } from '@/lib/data/deck';
import { deckKeys } from '@/lib/queries/deck';
import { statsKeys } from '@/lib/queries/stats';
import { createServerQueryClient } from '@/lib/query-client';
import { DashboardClientContainer } from './_components/dashboard-client-container';
import { DashboardPresentation } from './_components/dashboard-presentation';

async function fetchDecksForQuery() {
  const decks = await getDecks();
  if (!decks) return [];

  return decks.map((deck) => ({
    ...deck,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
  }));
}

async function fetchStatsForQuery() {
  const stats = await getStats();
  if (!stats) return null;

  return {
    basic: stats.basic,
    reviewsByRating: stats.reviewsByRating,
    dailyStats: stats.dailyStats,
  };
}

export async function DashboardPage() {
  const queryClient = createServerQueryClient();

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: deckKeys.lists(),
      queryFn: fetchDecksForQuery,
      staleTime: 1000 * 60 * 5,
    }),
    queryClient.prefetchQuery({
      queryKey: statsKeys.user(),
      queryFn: fetchStatsForQuery,
      staleTime: 1000 * 60 * 5,
    }),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <DashboardPresentation
        statsSlot={
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg" />
                ))}
              </div>
            }
          >
            <DashboardClientContainer />
          </Suspense>
        }
      />
    </HydrationBoundary>
  );
}
