'use client';

import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateDeckDialog } from '@/components/create-deck-dialog';
import type { Deck } from '@/lib/queries/deck';
import { useDecks } from '@/lib/queries/deck';

interface DeckListProps {
  decks: Deck[];
}

export function DeckList({ decks: initialDecks }: DeckListProps) {
  const { data: decks, isLoading } = useDecks(initialDecks);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">マイデッキ</h2>
        <CreateDeckDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新しいデッキを作成
          </Button>
        </CreateDeckDialog>
      </div>

      {!decks || decks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">デッキがありません</h3>
            <p className="text-gray-500 text-center mb-6">
              最初のデッキを作成して学習を始めましょう
            </p>
            <CreateDeckDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                デッキを作成
              </Button>
            </CreateDeckDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Card key={deck.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">{deck.name}</CardTitle>
                {deck.description && <CardDescription>{deck.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{deck._count.cards} カード</span>
                  <span>{new Date(deck.updatedAt).toLocaleDateString('ja-JP')}</span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button size="sm" className="flex-1">
                    学習開始
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    編集
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
