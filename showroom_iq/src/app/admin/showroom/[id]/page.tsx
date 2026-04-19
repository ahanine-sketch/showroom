'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ScorecardWrapper from '@/components/scorecard/ScorecardWrapper';

export default function Page() {
  const params = useParams();
  const id = params?.id as string;
  
  return (
    <ScorecardWrapper 
      initialTab="commercial" 
      role="admin" 
      type="magasin" 
      id={id} 
    />
  );
}
