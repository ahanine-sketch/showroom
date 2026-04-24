import React, { Suspense } from 'react';
import OwnerSidebar from '@/components/OwnerSidebar';
import OwnerHeader from '@/components/OwnerHeader';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Suspense fallback={<div>Loading sidebar...</div>}>
        <OwnerSidebar />
      </Suspense>
      <div className="flex-1 ml-[240px] flex flex-col">
        <OwnerHeader />
        <main className="flex-1">
          <Suspense fallback={<div>Loading content...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
