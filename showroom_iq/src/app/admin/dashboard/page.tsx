'use client';

import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import ScorecardWrapper from '@/components/scorecard/ScorecardWrapper';

export default function AdminDashboard() {
  const [showroomId, setShowroomId] = useState<string | null>(null);
  const [magasins, setMagasins] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowrooms = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        const response = await fetch(`${API_BASE_URL}/api/users/my-team?month=${month}&year=${year}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
          if (result.managedShowrooms && result.managedShowrooms.length > 0) {
            setMagasins(result.managedShowrooms);
            setShowroomId(result.managedShowrooms[0].id);
          } else if (result.showroom) {
            setMagasins([result.showroom]);
            setShowroomId(result.showroom.id);
          }
        }
      } catch (error) {
        console.error('Error fetching admin showrooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowrooms();
  }, []);

  if (loading) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="text-yellow-600 font-serif italic text-4xl">SIQ</div>
          <div className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!showroomId) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center p-10">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-stone-200 text-6xl">storefront</span>
          <p className="text-stone-500 font-medium italic">Aucun showroom associé à ce compte administrateur.</p>
        </div>
      </div>
    );
  }

  // Pure showroom buttons UI to be injected into the scorecard header
  const showroomButtons = magasins.length > 1 ? (
    <div className="flex items-center gap-3 p-1.5 bg-stone-100/50 backdrop-blur-sm rounded-2xl w-fit border border-stone-200/50">
      {magasins.map((mag) => (
        <button
          key={mag.id}
          onClick={() => setShowroomId(mag.id)}
          className={`px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
            showroomId === mag.id
              ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-900/5'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          {mag.name}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div key={showroomId}>
      <ScorecardWrapper
        initialTab="commercial"
        role="admin"
        type="magasin"
        id={showroomId}
        headerContent={showroomButtons}
      />
    </div>
  );
}
