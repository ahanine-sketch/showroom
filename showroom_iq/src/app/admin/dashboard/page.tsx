'use client';

import React, { useEffect, useState } from 'react';
import ScorecardWrapper from '@/components/scorecard/ScorecardWrapper';

export default function AdminDashboard() {
  const [showroomId, setShowroomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:3001/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        console.log('Admin Profile Result:', result);
        
        if (result.success && result.data.showroomId) {
          setShowroomId(result.data.showroomId);
        } else {
          console.warn('Admin profile has no showroomId. Using fallback.');
          setShowroomId('310ac9fe-1066-462a-8ec7-48fdf7fc7653');
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        // Even on error, try to use the fallback ID
        setShowroomId('310ac9fe-1066-462a-8ec7-48fdf7fc7653');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

  return (
    <ScorecardWrapper 
      initialTab="commercial" 
      role="admin" 
      type="magasin" 
      id={showroomId} 
    />
  );
}

