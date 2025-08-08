import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { calculateNextReview, type ReviewRating } from '@/lib/srs';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(4),
  duration: z.number().int().positive().optional(),
});

type Params = { cardId: string };

export async function POST(request: NextRequest, context: { params: Promise<Params> }) {
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
    const validatedData = reviewSchema.parse(body);

    const srsData = {
      interval: card.interval,
      repetitions: card.repetitions,
      easeFactor: card.easeFactor,
      dueAt: card.dueAt,
    };

    const nextReview = calculateNextReview(srsData, validatedData.rating as ReviewRating);

    await prisma.$transaction([
      // レビュー記録を作成
      prisma.review.create({
        data: {
          rating: (() => {
            switch (validatedData.rating) {
              case 1:
                return 'AGAIN';
              case 2:
                return 'HARD';
              case 3:
                return 'GOOD';
              case 4:
                return 'EASY';
              default:
                return 'GOOD';
            }
          })(),
          duration: validatedData.duration,
          userId: session.user.id,
          cardId: cardId,
        },
      }),

      // カードのSRSデータを更新
      prisma.card.update({
        where: { id: cardId },
        data: {
          interval: nextReview.interval,
          repetitions: nextReview.repetitions,
          easeFactor: nextReview.easeFactor,
          dueAt: nextReview.dueAt,
        },
      }),
    ]);

    const updatedCard = await prisma.card.findUnique({
      where: { id: cardId },
    });

    return NextResponse.json({
      card: updatedCard,
      nextReview: nextReview,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error('レビューの記録に失敗しました:', error);
    return NextResponse.json({ error: 'レビューの記録に失敗しました' }, { status: 500 });
  }
}
