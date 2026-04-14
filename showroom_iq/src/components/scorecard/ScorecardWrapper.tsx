'use client';

import React, { useState } from 'react';
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
  
  // Mock data - in production this would be fetched from API
  const showroom = {
    name: 'Showroom Casa Ain Diab',
    location: 'Corniche, Casablanca'
  };

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
          <nav className="font-mono text-[9px] uppercase tracking-[0.4em] text-yellow-700 mb-1 font-bold opacity-80">{showroom.location}</nav>
          <h2 className="text-4xl font-headline font-light italic text-stone-900 tracking-tighter leading-none whitespace-nowrap">{showroom.name}</h2>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-white border border-stone-200 text-stone-700 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-stone-50 active:scale-95 transition-all flex items-center gap-3 shadow-sm">
            <span className="material-symbols-outlined text-[15px] opacity-60">print</span>
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="pt-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        {activeTab === 'commercial' && <CommercialScorecard role={role} activeTab="commercial" hideNav={true} isDashboard={true} />}
        {activeTab === 'behavior' && <BehaviorScorecard role={role} activeTab="behavior" hideNav={true} isDashboard={true} />}
        {activeTab === 'calendar' && <CalendarScorecard role={role} activeTab="calendar" hideNav={true} isDashboard={true} />}
        {activeTab === 'ressources' && <RessourcesScorecard role={role} activeTab="ressources" hideNav={true} isDashboard={true} />}
      </div>
    </main>
  );
};

export default ScorecardWrapper;
