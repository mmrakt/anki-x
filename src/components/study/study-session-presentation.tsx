'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  studySessionAtom,
  currentCardAtom,
  nextCardAtom,
  markCardCompletedAtom,
  startStudySessionAtom,
  endStudySessionAtom,
  progressAtom,
  estimatedTimeAtom,
  updateStatsAfterReviewAtom,
  resetTodayStatsIfNeededAtom,
} from '@/lib/atoms/study'
import { submitReview } from '@/lib/actions/review'
import { addToastAtom } from '@/lib/atoms/ui'
import { RotateCcw, Heart, Smile, Frown, X } from 'lucide-react'

interface StudyCard {
  id: string
  front: string
  back: string
  dueAt: string
  interval: number
  repetitions: number
  easeFactor: number
  deckId: string
}

interface StudySessionPresentationProps {
  deckId: string
  initialCards: StudyCard[]
}

// Presentational Component (Client Component) - handles UI rendering and interactions
export function StudySessionPresentation({ deckId, initialCards }: StudySessionPresentationProps) {
  const [session, setSession] = useAtom(studySessionAtom)
  const currentCard = useAtomValue(currentCardAtom)
  const progress = useAtomValue(progressAtom)
  const estimatedTime = useAtomValue(estimatedTimeAtom)
  
  const nextCard = useSetAtom(nextCardAtom)
  const markCardCompleted = useSetAtom(markCardCompletedAtom)
  const startSession = useSetAtom(startStudySessionAtom)
  const endSession = useSetAtom(endStudySessionAtom)
  const updateStats = useSetAtom(updateStatsAfterReviewAtom)
  const resetTodayStats = useSetAtom(resetTodayStatsIfNeededAtom)
  const addToast = useSetAtom(addToastAtom)

  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewStartTime, setReviewStartTime] = useState<Date | null>(null)
  const [isPending, startTransition] = useTransition()

  // セッション初期化
  useEffect(() => {
    if (initialCards.length > 0 && !session) {
      resetTodayStats()
      startSession({ deckId, cards: initialCards })
      setReviewStartTime(new Date())
    }
  }, [initialCards, session, deckId, startSession, resetTodayStats])

  // セッション完了チェック
  useEffect(() => {
    if (session && session.currentIndex >= session.cards.length) {
      addToast({
        type: 'success',
        title: '復習完了！',
        description: `${session.totalCards}枚のカードを復習しました。`,
      })
      endSession()
    }
  }, [session, addToast, endSession])

  const handleReview = async (rating: 1 | 2 | 3 | 4) => {
    if (!currentCard || !reviewStartTime) return

    const duration = Math.floor((new Date().getTime() - reviewStartTime.getTime()) / 1000)

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('cardId', currentCard.id)
        formData.append('rating', rating.toString())
        formData.append('duration', duration.toString())

        await submitReview(formData)

        // 統計更新
        updateStats({ rating, duration })
        
        // カードを完了としてマーク
        markCardCompleted(currentCard.id)
        
        // 次のカードに進む
        nextCard()
        setShowAnswer(false)
        setReviewStartTime(new Date())

        // 成功トースト
        const ratingText = ['', '再学習', '難しい', '普通', '簡単'][rating]
        addToast({
          type: 'success',
          title: `評価: ${ratingText}`,
          description: '次のカードに進みます',
          duration: 2000,
        })

      } catch (error) {
        console.error('Review submission failed:', error)
        addToast({
          type: 'error',
          title: 'エラー',
          description: 'レビューの送信に失敗しました',
        })
      }
    })
  }

  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  const handleEndSession = () => {
    endSession()
    addToast({
      type: 'info',
      title: 'セッション終了',
      description: 'お疲れ様でした！',
    })
  }

  if (!session || !currentCard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">復習セッション完了</h2>
            <p className="text-muted-foreground mb-6">
              すべてのカードを復習しました！
            </p>
            <Button onClick={() => window.location.href = '/'}>
              ダッシュボードに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">復習セッション</h1>
            <Button variant="outline" size="sm" onClick={handleEndSession}>
              <X className="h-4 w-4 mr-2" />
              セッション終了
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{session.currentIndex + 1} / {session.totalCards}</span>
              {estimatedTime && <span>残り約 {estimatedTime} 分</span>}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* カード表示エリア */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="w-full min-h-[400px]">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* 問題面 */}
              <div className="mb-8">
                <h2 className="text-sm font-medium text-muted-foreground mb-2">問題</h2>
                <div className="text-2xl font-medium text-foreground leading-relaxed">
                  {currentCard.front}
                </div>
              </div>

              {/* 答え面 */}
              {showAnswer && (
                <div className="mb-8 border-t pt-8">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">答え</h3>
                  <div className="text-xl text-foreground leading-relaxed">
                    {currentCard.back}
                  </div>
                </div>
              )}

              {/* アクションボタン */}
              <div className="space-y-4">
                {!showAnswer ? (
                  <Button 
                    onClick={handleShowAnswer}
                    size="lg"
                    className="w-full max-w-xs"
                  >
                    答えを見る
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                    <Button
                      onClick={() => handleReview(1)}
                      disabled={isPending}
                      variant="outline"
                      className="flex flex-col h-20 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      <RotateCcw className="h-5 w-5 mb-1 text-red-600" />
                      <span className="text-red-600">再学習</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleReview(2)}
                      disabled={isPending}
                      variant="outline"
                      className="flex flex-col h-20 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                    >
                      <Frown className="h-5 w-5 mb-1 text-orange-600" />
                      <span className="text-orange-600">難しい</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleReview(3)}
                      disabled={isPending}
                      variant="outline"
                      className="flex flex-col h-20 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Smile className="h-5 w-5 mb-1 text-blue-600" />
                      <span className="text-blue-600">普通</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleReview(4)}
                      disabled={isPending}
                      variant="outline"
                      className="flex flex-col h-20 border-green-200 hover:bg-green-50 hover:border-green-300"
                    >
                      <Heart className="h-5 w-5 mb-1 text-green-600" />
                      <span className="text-green-600">簡単</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* カード情報 */}
              {showAnswer && (
                <div className="text-xs text-muted-foreground space-y-1 mt-8 pt-4 border-t">
                  <div>間隔: {currentCard.interval}日</div>
                  <div>繰り返し: {currentCard.repetitions}回</div>
                  <div>難易度: {currentCard.easeFactor.toFixed(2)}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}