import React from 'react';
import OwnerSidebar from '@/components/OwnerSidebar';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <OwnerSidebar />
      <div className="flex-1 ml-[240px]">
        {children}
      </div>
    </div>
  );
}
