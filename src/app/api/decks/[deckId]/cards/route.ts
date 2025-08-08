import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

const createCardSchema = z.object({
  front: z.string().min(1, '表面は必須です').max(1000, '表面は1000文字以内にしてください'),
  back: z.string().min(1, '裏面は必須です').max(1000, '裏面は1000文字以内にしてください'),
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
    });

    if (!deck) {
      return NextResponse.json({ error: 'デッキが見つかりません' }, { status: 404 });
    }

    const cards = await prisma.card.findMany({
      where: { deckId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error('カードの取得に失敗しました:', error);
    return NextResponse.json({ error: 'カードの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<Params> }) {
  const { deckId } = await context.params;
  const session = await getAuthSession(request);

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

    const body = await request.json();
    const validatedData = createCardSchema.parse(body);

    const card = await prisma.card.create({
      data: {
        front: validatedData.front,
        back: validatedData.back,
        deckId: deckId,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error('カードの作成に失敗しました:', error);
    return NextResponse.json({ error: 'カードの作成に失敗しました' }, { status: 500 });
  }
}
