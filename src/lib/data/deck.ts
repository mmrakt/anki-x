import { getAuthSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function getDecks() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return [];
  }

  try {
    const decks = await prisma.deck.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { cards: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return decks;
  } catch (error) {
    console.error('Failed to fetch decks:', error);
  }
}

export async function getDeck(deckId: string) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return null;
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

    return deck;
  } catch (error) {
    console.error('Failed to fetch deck:', error);
    return null;
  }
}

export async function getStats() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return null;
  }

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

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

    const dueCardsToday = await prisma.card.count({
      where: {
        deck: { userId: session.user.id },
        dueAt: { lte: now },
      },
    });

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

    return {
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
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return null;
  }
}

export async function getStudySession(deckId: string) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return null;
  }

  try {
    const now = new Date();

    const cards = await prisma.card.findMany({
      where: {
        deck: {
          id: deckId,
          userId: session.user.id,
        },
        dueAt: {
          lte: now,
        },
      },
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'asc' }],
      take: 20, // 一度に最大20枚まで
    });

    const dueCount = await prisma.card.count({
      where: {
        deck: {
          id: deckId,
          userId: session.user.id,
        },
        dueAt: {
          lte: now,
        },
      },
    });

    const newCount = await prisma.card.count({
      where: {
        deck: {
          id: deckId,
          userId: session.user.id,
        },
        repetitions: 0,
      },
    });

    return {
      cards,
      dueCount,
      newCount,
      totalCount: dueCount + newCount,
    };
  } catch (error) {
    console.error('Failed to fetch study session:', error);
    return null;
  }
}
