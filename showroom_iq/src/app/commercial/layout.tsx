import React from 'react';
import CommercialSidebar from '@/components/CommercialSidebar';

export default function CommercialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <CommercialSidebar />
      <div className="pl-[240px]">
        {children}
      </div>
    </div>
  );
}
