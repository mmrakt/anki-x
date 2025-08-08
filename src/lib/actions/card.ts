'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getAuthSession } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

const createCardSchema = z.object({
  deckId: z.string(),
  front: z.string().min(1, '表面は必須です').max(1000, '表面は1000文字以内にしてください'),
  back: z.string().min(1, '裏面は必須です').max(1000, '裏面は1000文字以内にしてください'),
})

const updateCardSchema = z.object({
  id: z.string(),
  front: z.string().min(1, '表面は必須です').max(1000, '表面は1000文字以内にしてください').optional(),
  back: z.string().min(1, '裏面は必須です').max(1000, '裏面は1000文字以内にしてください').optional(),
})

export async function createCard(formData: FormData) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    throw new Error('認証が必要です')
  }

  try {
    const validatedData = createCardSchema.parse({
      deckId: formData.get('deckId'),
      front: formData.get('front'),
      back: formData.get('back'),
    })

    // デッキの所有権確認
    const deck = await prisma.deck.findFirst({
      where: {
        id: validatedData.deckId,
        userId: session.user.id,
      }
    })

    if (!deck) {
      throw new Error('デッキが見つかりません')
    }

    await prisma.card.create({
      data: {
        front: validatedData.front,
        back: validatedData.back,
        deckId: validatedData.deckId,
      },
    })

    revalidatePath(`/decks/${validatedData.deckId}`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0]?.message || 'バリデーションエラー')
    }
    throw new Error('カードの作成に失敗しました')
  }
}

export async function updateCard(formData: FormData) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    throw new Error('認証が必要です')
  }

  try {
    const validatedData = updateCardSchema.parse({
      id: formData.get('id'),
      front: formData.get('front'),
      back: formData.get('back'),
    })

    // カードの所有権確認
    const card = await prisma.card.findFirst({
      where: {
        id: validatedData.id,
        deck: {
          userId: session.user.id,
        }
      }
    })

    if (!card) {
      throw new Error('カードが見つかりません')
    }

    await prisma.card.update({
      where: { id: validatedData.id },
      data: {
        front: validatedData.front,
        back: validatedData.back,
      },
    })

    revalidatePath(`/decks/${card.deckId}`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0]?.message || 'バリデーションエラー')
    }
    throw new Error('カードの更新に失敗しました')
  }
}

export async function deleteCard(formData: FormData) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    throw new Error('認証が必要です')
  }

  try {
    const cardId = formData.get('id') as string

    // カードの所有権確認
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        deck: {
          userId: session.user.id,
        }
      }
    })

    if (!card) {
      throw new Error('カードが見つかりません')
    }

    await prisma.card.delete({
      where: { id: cardId }
    })

    revalidatePath(`/decks/${card.deckId}`)
  } catch (error) {
    throw new Error('カードの削除に失敗しました')
  }
}