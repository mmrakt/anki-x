import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

const updateDeckSchema = z.object({
  name: z
    .string()
    .min(1, 'デッキ名は必須です')
    .max(100, 'デッキ名は100文字以内にしてください')
    .optional(),
  description: z.string().optional(),
});

type Params = { deckId: string };

export async function GET(_request: NextRequest, context: { params: Promise<Params> }) {
  const { deckId } = await context.params;
  const session = await getAuthSession(_request);

  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId: session.user.id,
      },
      include: {
        cards: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { cards: true },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'デッキが見つかりません' }, { status: 404 });
    }

    return NextResponse.json(deck);
  } catch (error) {
    console.error('デッキの取得に失敗しました:', error);
    return NextResponse.json({ error: 'デッキの取得に失敗しました' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<Params> }) {
  const { deckId } = await context.params;
  const session = await getAuthSession(request);

  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = updateDeckSchema.parse(body);

    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId: session.user.id,
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'デッキが見つかりません' }, { status: 404 });
    }

    const updatedDeck = await prisma.deck.update({
      where: { id: deckId },
      data: validatedData,
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    return NextResponse.json(updatedDeck);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error('デッキの更新に失敗しました:', error);
    return NextResponse.json({ error: 'デッキの更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<Params> }) {
  const { deckId } = await context.params;
  const session = await getAuthSession(_request);

  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId: session.user.id,
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'デッキが見つかりません' }, { status: 404 });
    }

    await prisma.deck.delete({
      where: { id: deckId },
    });

    return NextResponse.json({ message: 'デッキが削除されました' });
  } catch (error) {
    console.error('デッキの削除に失敗しました:', error);
    return NextResponse.json({ error: 'デッキの削除に失敗しました' }, { status: 500 });
  }
}
