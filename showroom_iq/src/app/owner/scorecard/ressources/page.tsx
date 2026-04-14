'use client';

import React, { Suspense } from 'react';
import ScorecardWrapper from '@/components/scorecard/ScorecardWrapper';

export default function Page() {
  return (
    <Suspense fallback={<div className="pt-32 px-14 flex justify-center text-stone-400 font-mono text-[11px] uppercase tracking-widest">Chargement du profil...</div>}>
      <ScorecardWrapper initialTab="ressources" role="owner" />
    </Suspense>
  );
}

