'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signOut, useSession } from '@/lib/auth-client';

interface DashboardPresentationProps {
  statsSlot: ReactNode;
}

// Presentational Component (Client Component) - handles UI rendering and interactions
export function DashboardPresentation({ statsSlot }: DashboardPresentationProps) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Anki-X</CardTitle>
            <CardDescription>スペースドリピティション学習プラットフォーム</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = '/auth/signin')} className="w-full">
              サインイン
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Anki-X</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {session.user.name || session.user.email}
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                サインアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">{statsSlot}</div>
      </main>
    </div>
  );
}
