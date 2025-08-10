'use client';

import type { ReactNode } from 'react';

interface DashboardContentProps {
  statsSlot: ReactNode;
}

export function DashboardContent({ statsSlot }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      {statsSlot}
    </div>
  );
}