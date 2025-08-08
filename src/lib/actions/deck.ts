'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getAuthSession } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

const createDeckSchema = z.object({
  name: z.string().min(1, 'デッキ名は必須です').max(100, 'デッキ名は100文字以内にしてください'),
  description: z.string().optional(),
})

const updateDeckSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'デッキ名は必須です').max(100, 'デッキ名は100文字以内にしてください').optional(),
  description: z.string().optional(),
})

export async function createDeck(formData: FormData) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    throw new Error('認証が必要です')
  }

  try {
    const validatedData = createDeckSchema.parse({
      name: formData.get('name'),
      description: formData.get('description'),
    })

    const deck = await prisma.deck.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        userId: session.user.id,
      },
    })

    revalidatePath('/')
    redirect(`/decks/${deck.id}`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0]?.message || 'バリデーションエラー')
    }
    throw new Error('デッキの作成に失敗しました')
  }
}

export async function updateDeck(formData: FormData) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    throw new Error('認証が必要です')
  }

  try {
    const validatedData = updateDeckSchema.parse({
      id: formData.get('id'),
      name: formData.get('name'),
      description: formData.get('description'),
    })

    // 所有権確認
    const existingDeck = await prisma.deck.findFirst({
      where: {
        id: validatedData.id,
        userId: session.user.id,
      }
    })

    if (!existingDeck) {
      throw new Error('デッキが見つかりません')
    }

    await prisma.deck.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
      },
    })

    revalidatePath('/')
    revalidatePath(`/decks/${validatedData.id}`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0]?.message || 'バリデーションエラー')
    }
    throw new Error('デッキの更新に失敗しました')
  }
}

export async function deleteDeck(formData: FormData) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    throw new Error('認証が必要です')
  }

  try {
    const deckId = formData.get('id') as string

    // 所有権確認
    const existingDeck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId: session.user.id,
      }
    })

    if (!existingDeck) {
      throw new Error('デッキが見つかりません')
    }

    await prisma.deck.delete({
      where: { id: deckId }
    })

    revalidatePath('/')
    redirect('/')
  } catch (error) {
    throw new Error('デッキの削除に失敗しました')
  }
}