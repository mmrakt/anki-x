import { Suspense } from 'react'
import { getDecks, getStats } from '@/lib/data/deck'
import { DashboardPresentation } from './dashboard-presentation'
import { DeckListPresentation } from './deck-list-presentation'
import { DashboardStats } from './dashboard-stats'

// Container Component (Server Component) - handles data fetching
async function StatsContainer() {
  const stats = await getStats()
  
  if (!stats) {
    return null
  }

  return <DashboardStats stats={stats} />
}

async function DeckListContainer() {
  const decks = await getDecks()
  
  const serializedDecks = decks.map(deck => ({
    ...deck,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
  }))

  return <DeckListPresentation decks={serializedDecks} />
}

export function DashboardContainer() {
  return (
    <DashboardPresentation
      statsSlot={
        <Suspense fallback={<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg" />
          ))}
        </div>}>
          <StatsContainer />
        </Suspense>
      }
      deckListSlot={
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />}>
          <DeckListContainer />
        </Suspense>
      }
    />
  )
}