'use client';

import React, { Suspense } from 'react';
import ScorecardWrapper from '@/components/scorecard/ScorecardWrapper';

export default function BonusPage() {
  return (
    <Suspense fallback={<div className="pt-32 px-14 flex justify-center text-stone-400 font-mono text-[11px] uppercase tracking-widest">Chargement...</div>}>
      <ScorecardWrapper initialTab="bonus" role="owner" />
    </Suspense>
  );
}
