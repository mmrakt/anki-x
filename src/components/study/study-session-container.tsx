import { getStudySession } from '@/lib/data/deck'
import { StudySessionPresentation } from './study-session-presentation'

interface StudySessionContainerProps {
  deckId: string
}

// Container Component (Server Component) - handles data fetching
export async function StudySessionContainer({ deckId }: StudySessionContainerProps) {
  const studyData = await getStudySession(deckId)
  
  if (!studyData || studyData.cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">復習するカードがありません</h2>
          <p className="text-gray-600">すべてのカードは次回の復習予定日まで待機中です。</p>
        </div>
      </div>
    )
  }

  const serializedCards = studyData.cards.map(card => ({
    ...card,
    dueAt: card.dueAt.toISOString(),
    createdAt: card.createdAt.toISOString(),
  }))

  return (
    <StudySessionPresentation 
      deckId={deckId}
      initialCards={serializedCards}
    />
  )
}