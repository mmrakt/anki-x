'use client';

import { Button } from '@/components/ui/button';
import { signOut, useSession } from '@/lib/auth-client';

export function AppHeader() {
  const { data: session } = useSession();

  return (
    <header className="bg-card border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Anki-X</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {session?.user?.name || session?.user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              サインアウト
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}