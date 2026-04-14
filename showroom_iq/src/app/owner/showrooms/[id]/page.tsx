'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import UserSlideOver from '@/components/UserSlideOver';
import ShowroomSlideOver from '@/components/ShowroomSlideOver';
import CommercialScorecard from '@/components/scorecard/CommercialScorecard';
import BehaviorScorecard from '@/components/scorecard/BehaviorScorecard';
import CalendarScorecard from '@/components/scorecard/CalendarScorecard';
import RessourcesScorecard from '@/components/scorecard/RessourcesScorecard';

type TabType = 'commercial' | 'behavior' | 'calendar' | 'ressources';

const showroomsData: Record<string, any> = {
  casablanca: {
    name: 'Showroom Casa Anfa',
    location: 'Boulevard de l\'Océan, Casablanca',
    objective: '2 800 000',
    revenue: '2 450 000',
    manager: 'Omar Bensouda',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2574&auto=format&fit=crop'
  },
  rabat: {
    name: 'Showroom Rabat Agdal',
    location: 'Avenue de France, Rabat',
    objective: '1 900 000',
    revenue: '1 405 000',
    manager: 'Sofia Laroui',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop'
  },
  marrakech: {
    name: 'Showroom Marrakech',
    location: 'Hivernage, Marrakech',
    objective: '1 500 000',
    revenue: '765 000',
    manager: 'Youssef Amrani',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop'
  },
  tanger: {
    name: 'Showroom Tanger',
    location: 'Marina Bay, Tanger',
    objective: '1 200 000',
    revenue: '984 000',
    manager: 'Hassan Tazi',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2574&auto=format&fit=crop'
  }
};

export default function Page() {
  const params = useParams();
  const id = params?.id as string;
  
  const [showroom, setShowroom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [isShowroomDrawerOpen, setIsShowroomDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [activeTab, setActiveTab] = useState<TabType>('commercial');

  useEffect(() => {
    const fetchShowroom = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`http://localhost:3001/api/showrooms/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.success) {
          setShowroom(json.data);
        } else {
          console.error(json.message);
        }
      } catch (error) {
        console.error('Error fetching showroom:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShowroom();
  }, [id]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setDrawerMode('create');
    setIsUserDrawerOpen(true);
  };

  if (isLoading) {
    return <div className="pt-32 px-14 flex justify-center">Chargement...</div>;
  }

  if (!showroom) {
    return <div className="pt-32 px-14 flex justify-center">Magasin introuvable.</div>;
  }

  return (
    <>
      <main className="pt-[80px] px-14 pb-8 max-w-[1700px] mx-auto font-sans space-y-8 transition-all duration-700">
        {/* Secondary Navigation (Tabs) */}
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
        
        {/* Header Section with Precise Alignment */}
        <div className="flex items-end justify-between px-2">
          <div className="group relative">
            <nav className="font-mono text-[9px] uppercase tracking-[0.4em] text-yellow-700 mb-1 font-bold opacity-80">{showroom.location}</nav>
            <h2 className="text-4xl font-headline font-light italic text-stone-900 tracking-tighter leading-none whitespace-nowrap">{showroom.name}</h2>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsShowroomDrawerOpen(true)}
              className="px-6 py-2.5 bg-white border border-stone-200 text-stone-700 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-stone-50 active:scale-95 transition-all flex items-center gap-3 shadow-sm"
            >
              <span className="material-symbols-outlined text-[15px] opacity-60">settings_applications</span>
              Paramètres
            </button>
            <button 
              onClick={handleAddUser}
              className="px-8 py-2.5 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg hover:bg-yellow-700 active:scale-95 transition-all flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              Ajouter Commercial
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="pt-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
          {activeTab === 'commercial' && <CommercialScorecard role="owner" activeTab="commercial" hideNav={true} isDashboard={true} />}
          {activeTab === 'behavior' && <BehaviorScorecard role="owner" activeTab="behavior" hideNav={true} isDashboard={true} />}
          {activeTab === 'calendar' && <CalendarScorecard role="owner" activeTab="calendar" hideNav={true} isDashboard={true} />}
          {activeTab === 'ressources' && <RessourcesScorecard role="owner" activeTab="ressources" hideNav={true} isDashboard={true} />}
        </div>

      </main>

      <UserSlideOver 
        isOpen={isUserDrawerOpen} 
        onClose={() => setIsUserDrawerOpen(false)} 
        user={selectedUser}
        mode={drawerMode}
        fixedShowroom={showroom.name}
      />

      <ShowroomSlideOver 
        isOpen={isShowroomDrawerOpen}
        onClose={() => setIsShowroomDrawerOpen(false)}
        showroom={showroom}
      />

    </>
  );
}
