'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import UserSlideOver from '@/components/UserSlideOver';

export default function TeamPage() {
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');

  const teamMembers = [
    { 
      id: '1', 
      name: 'Hajar El Rhiti', 
      role: 'Commercial Senior', 
      email: 'hajar@showroomiq.com', 
      performance: 66, 
      status: 'online', 
      avatar: 'https://lh3.googleusercontent.com/pw/AP1GczPrV6qGvTOfn8U7u3VdEPHD_2N5pXq9Nf2i7r_S6A-1y7qNf2i7r_S6A-1y7qNf2i7r_S6A-1y7qN',
      metrics: {
        ventes: { value: 54, max: 65, color: 'bg-yellow-400' }, // Yellow
        comportement: { value: 8, max: 30, color: 'bg-rose-400' }, // Red
        presence: { value: 1, max: 5, color: 'bg-orange-400' }, // Orange
        bonus: { value: 3, max: 5, color: 'bg-stone-300' } // Gray
      },
      perfColor: 'bg-yellow-400' // Changed to Yellow
    },
    { 
      id: '2', 
      name: 'Zakaria Fadil', 
      role: 'Commercial Junior', 
      email: 'zakaria@showroomiq.com', 
      performance: 68, 
      status: 'offline', 
      avatar: 'https://lh3.googleusercontent.com/pw/AP1GczPrV6qGvTOfn8U7u3VdEPHD_2N5pXq9Nf2i7r_S6A-1y7qNf2i7r_S6A-1y7qNf2i7r_S6A-1y7qN', 
      metrics: {
        ventes: { value: 40, max: 65, color: 'bg-orange-400' },
        comportement: { value: 22, max: 30, color: 'bg-yellow-400' },
        presence: { value: 3, max: 5, color: 'bg-yellow-400' },
        bonus: { value: 3, max: 5, color: 'bg-stone-300' }
      },
      perfColor: 'bg-yellow-400' // Changed to Yellow
    },
    { 
      id: '3', 
      name: 'Oussama El Kamili', 
      role: 'Commercial Junior', 
      email: 'oussama@showroomiq.com', 
      performance: 59, // Changed from 60 to 59
      status: 'offline', 
      avatar: 'https://lh3.googleusercontent.com/pw/AP1GczPrV6qGvTOfn8U7u3VdEPHD_2N5pXq9Nf2i7r_S6A-1y7qNf2i7r_S6A-1y7qNf2i7r_S6A-1y7qN', 
      metrics: {
        ventes: { value: 43, max: 65, color: 'bg-orange-400' },
        comportement: { value: 12, max: 30, color: 'bg-orange-400' },
        presence: { value: 1, max: 5, color: 'bg-orange-400' }, 
        bonus: { value: 3, max: 5, color: 'bg-stone-300' }
      },
      perfColor: 'bg-orange-400'
    }
  ];

  const bestPerformer = teamMembers.reduce((prev, current) => (prev.performance > current.performance) ? prev : current);

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setDrawerMode('edit');
    setIsUserDrawerOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setDrawerMode('create');
    setIsUserDrawerOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] h-[70px] z-40 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl flex items-center justify-between px-10 border-b border-stone-100/50">
        <div className="flex items-center gap-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400">ADMIN / EQUIPE</span>
          <div className="h-4 w-[1px] bg-stone-200"></div>
          <span className="text-stone-900 border-b-2 border-yellow-600 pb-1 font-headline italic text-[14px]">Gestion des Commerciaux</span>
        </div>
        <div className="flex items-center gap-4">
           <button 
              onClick={handleAddUser}
              className="px-6 py-2.5 bg-stone-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-full shadow-lg hover:bg-yellow-700 transition-all flex items-center gap-2"
           >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Ajouter
           </button>
        </div>
      </header>

      <main className="pt-28 px-12 pb-20 max-w-[1600px] mx-auto font-sans">
                {/* Page Hero */}
        <div className="mb-12">
          <div className="flex items-end justify-between">
            <div>
              <nav className="font-mono text-[9px] uppercase tracking-[0.4em] text-yellow-700 mb-2 font-bold opacity-70">Protocol Showroom</nav>
              <h2 className="text-4xl font-headline font-light italic text-stone-900 tracking-tight">Focus Équipe</h2>
            </div>
            <div className="text-right">
              <p className="text-4xl font-headline italic text-stone-900 leading-none">{teamMembers.length}</p>
              <p className="text-[9px] font-mono text-stone-400 uppercase tracking-widest mt-1">Directeurs & Commerciaux</p>
            </div>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <Link key={member.id} href="/admin/scorecard/commercial" className="block h-full group">
              <div className="bg-white rounded-[32px] p-7 border border-stone-100 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all overflow-hidden relative h-full flex flex-col group/card border-b-[3px] border-b-transparent hover:border-b-yellow-500">
                
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-stone-100 flex items-center justify-center bg-stone-100">
                         <span className="material-symbols-outlined text-stone-400">{member.name === 'Zakaria' ? 'person' : 'account_circle'}</span>
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-emerald-500' : 'bg-stone-300'}`}></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 group-hover:text-yellow-700 transition-colors text-[16px]">{member.name}</h4>
                      <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mt-0.5">{member.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditUser(member);
                    }}
                    className="w-9 h-9 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-white hover:border-stone-200 transition-all shadow-sm z-20"
                  >
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                      <span className="flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${member.perfColor || 'bg-emerald-500'}`}></span>
                         Performance Globale
                      </span>
                      <span className="text-stone-900">{member.performance}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                       <div className={`h-full ${member.perfColor || 'bg-emerald-400'} rounded-full`} style={{ width: `${member.performance}%` }}></div>
                    </div>
                  </div>

                  {/* Metrics Matrix (Requested Structure) */}
                  <div className="pt-6 border-t border-stone-50 grid grid-cols-2 gap-x-10 gap-y-6">
                    {/* Ventes */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-[0.2em] font-bold">Ventes</span>
                        <span className="text-[13px] font-bold text-stone-900 font-mono">{member.metrics.ventes.value}</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                        <div className={`h-full ${member.metrics.ventes.color} rounded-full`} style={{ width: `${(member.metrics.ventes.value / member.metrics.ventes.max) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Présence */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-[0.2em] font-bold">Présence</span>
                        <span className="text-[13px] font-bold text-stone-900 font-mono">{member.metrics.presence.value}</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                        <div className={`h-full ${member.metrics.presence.color} rounded-full`} style={{ width: `${(member.metrics.presence.value / member.metrics.presence.max) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Comportement */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-[0.2em] font-bold">Comport.</span>
                        <span className="text-[13px] font-bold text-stone-900 font-mono">{member.metrics.comportement.value}</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                        <div className={`h-full ${member.metrics.comportement.color} rounded-full`} style={{ width: `${(member.metrics.comportement.value / member.metrics.comportement.max) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Bonus */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-[0.2em] font-bold">Bonus</span>
                        <span className="text-[13px] font-bold text-stone-900 font-mono">{member.metrics.bonus.value}</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                        <div className={`h-full ${member.metrics.bonus.color} rounded-full`} style={{ width: `${(member.metrics.bonus.value / member.metrics.bonus.max) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend Footer for Scorecard Look */}
                <div className="mt-8 pt-4 border-t border-stone-50/50 flex justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                   <span className="text-[9px] font-mono text-yellow-600 font-bold uppercase tracking-[0.4em] italic">Open Detailed Scorecard</span>
                </div>
              </div>
            </Link>
          ))}
          
          {/* Add Member Placeholder */}
          <button 
            onClick={handleAddUser}
            className="rounded-[32px] border-2 border-dashed border-stone-200 flex flex-col items-center justify-center p-8 text-stone-300 hover:border-yellow-300 hover:text-yellow-600 hover:bg-yellow-50/20 transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-stone-50 group-hover:bg-yellow-100 flex items-center justify-center mb-4 transition-colors">
              <span className="material-symbols-outlined text-[32px]">group_add</span>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] font-bold">Nouveau Commercial</p>
          </button>
        </div>

      </main>

      <UserSlideOver 
        isOpen={isUserDrawerOpen} 
        onClose={() => setIsUserDrawerOpen(false)} 
        user={selectedUser}
        mode={drawerMode}
        fixedShowroom="Pavillon Haussmann"
      />

    </>
  );
}
