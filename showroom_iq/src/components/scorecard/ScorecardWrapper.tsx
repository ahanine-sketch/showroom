'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CommercialScorecard from './CommercialScorecard';
import BehaviorScorecard from './BehaviorScorecard';
import CalendarScorecard from './CalendarScorecard';
import RessourcesScorecard from './RessourcesScorecard';

type TabType = 'commercial' | 'behavior' | 'calendar' | 'ressources';

interface ScorecardWrapperProps {
  initialTab: TabType;
  role: 'admin' | 'owner';
}

const ScorecardWrapper = ({ initialTab, role }: ScorecardWrapperProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setUserData(result.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="pt-32 px-14 flex justify-center text-stone-400 font-mono text-[11px] uppercase tracking-widest">
        Chargement...
      </div>
    );
  }

  const showroomName = userData?.showroom?.name || 'Magasin Casablanca';

  return (
    <main className="pt-[80px] px-14 pb-8 max-w-[1700px] mx-auto font-sans space-y-8 animate-in fade-in duration-700">
      {/* Floating Pill Navigation */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-stone-100 p-1 flex items-center justify-between shadow-sm mb-6">
        <nav className="flex gap-2">
          {[
            { id: 'commercial', label: 'Ventes' },
            { id: 'behavior', label: 'Comportement' },
            { id: 'calendar', label: 'Calendrier' },
            { id: 'ressources', label: 'Ressources' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`text-[12px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Header Section */}
      <div className="flex items-end justify-between px-2">
        <div className="group relative">
          <h2 className="text-4xl font-headline font-normal text-stone-900 tracking-tighter leading-none whitespace-nowrap">{showroomName}</h2>
        </div>
        <div className="flex gap-3">
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="pt-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        {activeTab === 'commercial' && <CommercialScorecard role={role} activeTab="commercial" hideNav={true} isDashboard={true} userData={userData} />}
        {activeTab === 'behavior' && <BehaviorScorecard role={role} activeTab="behavior" hideNav={true} isDashboard={true} userData={userData} />}
        {activeTab === 'calendar' && <CalendarScorecard role={role} activeTab="calendar" hideNav={true} isDashboard={true} userData={userData} />}
        {activeTab === 'ressources' && <RessourcesScorecard role={role} activeTab="ressources" hideNav={true} isDashboard={true} userData={userData} />}
      </div>
    </main>
  );
};

export default ScorecardWrapper;
