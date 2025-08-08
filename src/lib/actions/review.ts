'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getAuthSession } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { calculateNextReview, ReviewRating } from '@/lib/srs'

const submitReviewSchema = z.object({
  cardId: z.string(),
  rating: z.number().int().min(1).max(4),
  duration: z.number().int().positive().optional(),
})

export async function submitReview(formData: FormData) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    throw new Error('認証が必要です')
  }

  try {
    const validatedData = submitReviewSchema.parse({
      cardId: formData.get('cardId'),
      rating: parseInt(formData.get('rating') as string),
      duration: formData.get('duration') ? parseInt(formData.get('duration') as string) : undefined,
    })

    // カードの所有権確認
    const card = await prisma.card.findFirst({
      where: {
        id: validatedData.cardId,
        deck: {
          userId: session.user.id,
        }
      }
    })

    if (!card) {
      throw new Error('カードが見つかりません')
    }

    // SRSアルゴリズムで次の復習日を計算
    const srsData = {
      interval: card.interval,
      repetitions: card.repetitions,
      easeFactor: card.easeFactor,
      dueAt: card.dueAt,
    }

    const nextReview = calculateNextReview(srsData, validatedData.rating as ReviewRating)

    // トランザクションでレビュー記録とカード更新を実行
    await prisma.$transaction([
      // レビュー記録を作成
      prisma.review.create({
        data: {
          rating: (() => {
            switch (validatedData.rating) {
              case 1: return 'AGAIN'
              case 2: return 'HARD'
              case 3: return 'GOOD'
              case 4: return 'EASY'
              default: return 'GOOD'
            }
          })(),
          duration: validatedData.duration,
          userId: session.user.id,
          cardId: validatedData.cardId,
        }
      }),
      
      // カードのSRSデータを更新
      prisma.card.update({
        where: { id: validatedData.cardId },
        data: {
          interval: nextReview.interval,
          repetitions: nextReview.repetitions,
          easeFactor: nextReview.easeFactor,
          dueAt: nextReview.dueAt,
        }
      })
    ])

    revalidatePath(`/decks/${card.deckId}`)
    revalidatePath('/')
    
    return {
      success: true,
      nextReview,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0]?.message || 'バリデーションエラー')
    }
    throw new Error('レビューの記録に失敗しました')
  }
}