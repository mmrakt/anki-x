import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

const createDeckSchema = z.object({
  name: z.string().min(1, 'デッキ名は必須です').max(100, 'デッキ名は100文字以内にしてください'),
  description: z.string().optional(),
});

export async function GET() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
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

    return NextResponse.json(decks);
  } catch (error) {
    console.error('デッキの取得に失敗しました:', error);
    return NextResponse.json({ error: 'デッキの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession(request);

  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = createDeckSchema.parse(body);

    const deck = await prisma.deck.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error('デッキの作成に失敗しました:', error);
    return NextResponse.json({ error: 'デッキの作成に失敗しました' }, { status: 500 });
  }
}
