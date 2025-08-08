import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

const updateCardSchema = z.object({
  front: z
    .string()
    .min(1, '表面は必須です')
    .max(1000, '表面は1000文字以内にしてください')
    .optional(),
  back: z
    .string()
    .min(1, '裏面は必須です')
    .max(1000, '裏面は1000文字以内にしてください')
    .optional(),
});

type Params = { cardId: string };

export async function PUT(request: NextRequest, context: { params: Promise<Params> }) {
  const { cardId } = await context.params;
  const session = await getAuthSession(request);

  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        deck: {
          userId: session.user.id,
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'カードが見つかりません' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateCardSchema.parse(body);

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: validatedData,
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error('カードの更新に失敗しました:', error);
    return NextResponse.json({ error: 'カードの更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<Params> }) {
  const { cardId } = await context.params;
  const session = await getAuthSession(_request);

  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        deck: {
          userId: session.user.id,
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'カードが見つかりません' }, { status: 404 });
    }

    await prisma.card.delete({
      where: { id: cardId },
    });

    return NextResponse.json({ message: 'カードが削除されました' });
  } catch (error) {
    console.error('カードの削除に失敗しました:', error);
    return NextResponse.json({ error: 'カードの削除に失敗しました' }, { status: 500 });
  }
}
