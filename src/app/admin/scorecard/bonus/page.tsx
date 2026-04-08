'use client';

import React from 'react';
import BonusScorecard from '@/components/scorecard/BonusScorecard';

export default function BonusPage() {
  return (
    <div className="min-h-screen bg-stone-50/30">
      <BonusScorecard role="admin" activeTab="bonus" />
    </div>
  );
}
