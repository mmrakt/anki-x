import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 基本統計
    const [totalDecks, totalCards, todayReviews, weekReviews, monthReviews] = await Promise.all([
      prisma.deck.count({
        where: { userId: session.user.id },
      }),

      prisma.card.count({
        where: {
          deck: { userId: session.user.id },
        },
      }),

      prisma.review.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: today },
        },
      }),

      prisma.review.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: weekAgo },
        },
      }),

      prisma.review.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: monthAgo },
        },
      }),
    ]);

    // 今日の期限切れカード数
    const dueCardsToday = await prisma.card.count({
      where: {
        deck: { userId: session.user.id },
        dueAt: { lte: now },
      },
    });

    // 評価別レビュー数（今週）
    const reviewsByRating = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        userId: session.user.id,
        createdAt: { gte: weekAgo },
      },
      _count: {
        rating: true,
      },
    });

    // 日別レビュー数（過去7日）
    const dailyReviews = await prisma.review.groupBy({
      by: ['createdAt'],
      where: {
        userId: session.user.id,
        createdAt: { gte: weekAgo },
      },
      _count: {
        id: true,
      },
    });

    // 日別集計を整理
    const dailyStats = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const reviews = dailyReviews
        .filter((r: any) => r.createdAt.toISOString().split('T')[0] === dateStr)
        .reduce((sum: number, r: any) => sum + r._count.id, 0);

      return {
        date: dateStr,
        reviews,
      };
    }).reverse();

    return NextResponse.json({
      basic: {
        totalDecks,
        totalCards,
        dueCardsToday,
        todayReviews,
        weekReviews,
        monthReviews,
      },
      reviewsByRating: reviewsByRating.reduce(
        (acc: Record<string, number>, item: any) => {
          acc[item.rating] = item._count.rating;
          return acc;
        },
        {} as Record<string, number>,
      ),
      dailyStats,
    });
  } catch (error) {
    console.error('統計の取得に失敗しました:', error);
    return NextResponse.json({ error: '統計の取得に失敗しました' }, { status: 500 });
  }
}
