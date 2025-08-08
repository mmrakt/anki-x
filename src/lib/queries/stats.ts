import { useQuery } from '@tanstack/react-query'

export interface Stats {
  basic: {
    totalDecks: number
    totalCards: number
    dueCardsToday: number
    todayReviews: number
    weekReviews: number
    monthReviews: number
  }
  reviewsByRating: Record<string, number>
  dailyStats: Array<{
    date: string
    reviews: number
  }>
}

async function fetchStats(): Promise<Stats> {
  const response = await fetch('/api/stats')
  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }
  return response.json()
}

export const statsKeys = {
  all: ['stats'] as const,
  user: (userId?: string) => [...statsKeys.all, 'user', userId] as const,
}

export function useStats(initialData?: Stats) {
  return useQuery({
    queryKey: statsKeys.user(),
    queryFn: fetchStats,
    initialData,
    staleTime: 1000 * 60 * 5, // 5分
    refetchOnWindowFocus: false,
  })
}