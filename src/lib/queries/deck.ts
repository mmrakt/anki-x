import { useQuery } from '@tanstack/react-query'

export interface Deck {
  id: string
  name: string
  description?: string | null
  _count: {
    cards: number
  }
  createdAt: string
  updatedAt: string
}

export interface DeckDetail extends Omit<Deck, '_count'> {
  cards: Array<{
    id: string
    front: string
    back: string
    dueAt: string
    interval: number
    repetitions: number
    easeFactor: number
    createdAt: string
  }>
  _count: {
    cards: number
  }
}

export interface StudySession {
  cards: Array<{
    id: string
    front: string
    back: string
    dueAt: string
    interval: number
    repetitions: number
    easeFactor: number
    deckId: string
  }>
  dueCount: number
  newCount: number
  totalCount: number
}

async function fetchDecks(): Promise<Deck[]> {
  const response = await fetch('/api/decks')
  if (!response.ok) {
    throw new Error('Failed to fetch decks')
  }
  return response.json()
}

async function fetchDeck(deckId: string): Promise<DeckDetail> {
  const response = await fetch(`/api/decks/${deckId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch deck')
  }
  return response.json()
}

async function fetchStudySession(deckId: string): Promise<StudySession> {
  const response = await fetch(`/api/decks/${deckId}/study`)
  if (!response.ok) {
    throw new Error('Failed to fetch study session')
  }
  return response.json()
}

export const deckKeys = {
  all: ['decks'] as const,
  lists: () => [...deckKeys.all, 'list'] as const,
  list: (filters: string) => [...deckKeys.lists(), { filters }] as const,
  details: () => [...deckKeys.all, 'detail'] as const,
  detail: (id: string) => [...deckKeys.details(), id] as const,
  study: (id: string) => [...deckKeys.all, 'study', id] as const,
}

export function useDecks(initialData?: Deck[]) {
  return useQuery({
    queryKey: deckKeys.lists(),
    queryFn: fetchDecks,
    initialData,
    staleTime: 1000 * 60 * 5, // 5分
  })
}

export function useDeck(deckId: string, initialData?: DeckDetail) {
  return useQuery({
    queryKey: deckKeys.detail(deckId),
    queryFn: () => fetchDeck(deckId),
    initialData,
    staleTime: 1000 * 60 * 2, // 2分
    enabled: !!deckId,
  })
}

export function useStudySession(deckId: string, initialData?: StudySession) {
  return useQuery({
    queryKey: deckKeys.study(deckId),
    queryFn: () => fetchStudySession(deckId),
    initialData,
    staleTime: 0, // 常に最新のデータを取得
    enabled: !!deckId,
  })
}