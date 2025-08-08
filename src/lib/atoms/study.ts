import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export interface StudyCard {
  id: string
  front: string
  back: string
  dueAt: string
  interval: number
  repetitions: number
  easeFactor: number
  deckId: string
}

export interface StudySession {
  deckId: string
  cards: StudyCard[]
  currentIndex: number
  completedCards: string[]
  startTime: Date
  totalCards: number
}

// 復習セッションのメイン状態
export const studySessionAtom = atom<StudySession | null>(null)

// 現在のカード
export const currentCardAtom = atom(
  (get) => {
    const session = get(studySessionAtom)
    if (!session || session.currentIndex >= session.cards.length) {
      return null
    }
    return session.cards[session.currentIndex]
  }
)

// 次のカードに進む
export const nextCardAtom = atom(
  null,
  (get, set) => {
    const session = get(studySessionAtom)
    if (!session) return

    const nextIndex = session.currentIndex + 1
    set(studySessionAtom, {
      ...session,
      currentIndex: nextIndex
    })
  }
)

// カードを完了済みにマーク
export const markCardCompletedAtom = atom(
  null,
  (get, set, cardId: string) => {
    const session = get(studySessionAtom)
    if (!session) return

    set(studySessionAtom, {
      ...session,
      completedCards: [...session.completedCards, cardId]
    })
  }
)

// セッション開始
export const startStudySessionAtom = atom(
  null,
  (get, set, { deckId, cards }: { deckId: string; cards: StudyCard[] }) => {
    set(studySessionAtom, {
      deckId,
      cards,
      currentIndex: 0,
      completedCards: [],
      startTime: new Date(),
      totalCards: cards.length
    })
  }
)

// セッション終了
export const endStudySessionAtom = atom(
  null,
  (get, set) => {
    set(studySessionAtom, null)
  }
)

// 進捗率
export const progressAtom = atom(
  (get) => {
    const session = get(studySessionAtom)
    if (!session || session.totalCards === 0) return 0
    return Math.round((session.completedCards.length / session.totalCards) * 100)
  }
)

// 残り時間推定（分）
export const estimatedTimeAtom = atom(
  (get) => {
    const session = get(studySessionAtom)
    if (!session || session.completedCards.length === 0) return null

    const elapsed = new Date().getTime() - session.startTime.getTime()
    const avgTimePerCard = elapsed / session.completedCards.length
    const remainingCards = session.totalCards - session.completedCards.length
    const estimatedMs = remainingCards * avgTimePerCard
    
    return Math.round(estimatedMs / (1000 * 60)) // 分単位
  }
)

// セッション統計（ローカルストレージに保存）
export const sessionStatsAtom = atomWithStorage('study-session-stats', {
  totalSessions: 0,
  totalReviews: 0,
  averageAccuracy: 0,
  streakDays: 0,
  lastStudyDate: null as string | null,
})

// 今日の学習統計
export const todayStatsAtom = atomWithStorage('today-stats', {
  date: new Date().toDateString(),
  reviews: 0,
  correctAnswers: 0,
  studyTime: 0, // 秒
})

// 今日の統計をリセット（日付が変わった場合）
export const resetTodayStatsIfNeededAtom = atom(
  null,
  (get, set) => {
    const todayStats = get(todayStatsAtom)
    const today = new Date().toDateString()
    
    if (todayStats.date !== today) {
      set(todayStatsAtom, {
        date: today,
        reviews: 0,
        correctAnswers: 0,
        studyTime: 0,
      })
    }
  }
)

// レビュー完了時の統計更新
export const updateStatsAfterReviewAtom = atom(
  null,
  (get, set, { rating, duration }: { rating: number; duration?: number }) => {
    // 今日の統計を更新
    const todayStats = get(todayStatsAtom)
    set(todayStatsAtom, {
      ...todayStats,
      reviews: todayStats.reviews + 1,
      correctAnswers: rating >= 3 ? todayStats.correctAnswers + 1 : todayStats.correctAnswers,
      studyTime: todayStats.studyTime + (duration || 0),
    })

    // セッション統計を更新
    const sessionStats = get(sessionStatsAtom)
    const totalReviews = sessionStats.totalReviews + 1
    const accuracy = ((sessionStats.averageAccuracy * sessionStats.totalReviews) + (rating >= 3 ? 100 : 0)) / totalReviews
    
    set(sessionStatsAtom, {
      ...sessionStats,
      totalReviews,
      averageAccuracy: accuracy,
      lastStudyDate: new Date().toISOString(),
    })
  }
)