import { type NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

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

    const now = new Date();
    const dueCards = await prisma.card.findMany({
      where: {
        deckId,
        dueAt: {
          lte: now,
        },
      },
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'asc' }],
      take: 20, // 一度に最大20枚まで
    });

    const newCards = await prisma.card.findMany({
      where: {
        deckId,
        repetitions: 0,
        dueAt: {
          gt: now,
        },
      },
      orderBy: { createdAt: 'asc' },
      take: Math.max(0, 20 - dueCards.length), // 残りの枠で新しいカード
    });

    const studyCards = [...dueCards, ...newCards];

    return NextResponse.json({
      cards: studyCards,
      dueCount: dueCards.length,
      newCount: newCards.length,
      totalCount: studyCards.length,
    });
  } catch (error) {
    console.error('学習用カードの取得に失敗しました:', error);
    return NextResponse.json({ error: '学習用カードの取得に失敗しました' }, { status: 500 });
  }
}
