'use client';

import React, { useState } from 'react';
import UserSlideOver from '@/components/UserSlideOver';
import ShowroomSlideOver from '@/components/ShowroomSlideOver';
import ObjectiveSalesCard from '@/components/scorecard/ObjectiveSalesCard';
import SalesFunnelMetrics from '@/components/dashboard/SalesFunnelMetrics';
import MetricsTable from '@/components/dashboard/MetricsTable';
import ReviewSAVSection from '@/components/dashboard/ReviewSAVSection';
import AttendanceCalendar from '@/components/dashboard/AttendanceCalendar';

export default function Page() {
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [isShowroomDrawerOpen, setIsShowroomDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');

  const showroomData = {
    name: 'Pavillon Haussmann',
    location: '8ème Arrd, Paris',
    objective: '5 200 000',
    revenue: '3 640 000',
    manager: 'Julian Vasseur'
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setDrawerMode('create');
    setIsUserDrawerOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] h-[70px] z-40 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl flex items-center justify-between px-10 border-b border-stone-100/50 transition-all duration-500">
        <div className="flex items-center gap-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400">ADMIN / DASHBOARD</span>
          <div className="h-4 w-[1px] bg-stone-200"></div>
          <span className="text-stone-900 border-b-2 border-yellow-600 pb-1 font-headline italic text-[14px]">Espace Gestionnaire</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center text-stone-400 hover:text-yellow-600 hover:border-yellow-200 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
            <div className="text-right">
              <p className="text-[12px] font-bold text-stone-900 leading-none">Julian Vasseur</p>
              <span className="text-[10px] text-stone-400 font-mono uppercase tracking-widest mt-1 inline-block">Directeur Showroom</span>
            </div>
            <img alt="Admin Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-stone-100" src="https://lh3.googleusercontent.com/yann-le-cun-original-image-url-placeholder"/>
          </div>
        </div>
      </header>

      <main className="pt-20 px-14 pb-8 max-w-[1600px] mx-auto font-sans space-y-8 transition-all duration-700">
        
        {/* Header Section with Precise Alignment */}
        <div className="flex items-end justify-between px-2">
          <div className="group relative">
            <nav className="font-mono text-[9px] uppercase tracking-[0.4em] text-yellow-700 mb-1 font-bold opacity-80">Evolution Mensuelle</nav>
            <h2 className="text-4xl font-headline font-light italic text-stone-900 tracking-tighter leading-none whitespace-nowrap">Vue d'ensemble</h2>
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
              Nouveau
            </button>
          </div>
        </div>

        {/* Section 1: Strategic Performance & Funnel */}
        <section className="grid grid-cols-12 gap-4 items-stretch">
          <ObjectiveSalesCard 
            className="col-span-12 lg:col-span-8"
            score={29}
            maxScore={35}
            status="TRES BIEN"
            caGenerated="932,900"
            baseValue={789447}
            likelyValue={964879}
            totalValue={1140312}
            currentValue={932900}
          />
          <div className="col-span-12 lg:col-span-4 h-full">
            <SalesFunnelMetrics />
          </div>
        </section>

        {/* Section 2: KPIs Matrix */}
        <section>
           <MetricsTable />
        </section>

        {/* Section 3: Operational Health */}
        <section>
           <ReviewSAVSection />
        </section>

        {/* Section 4: Human Capital */}
        <section className="pb-4">
           <AttendanceCalendar />
        </section>

      </main>

      {/* Drawers */}
      <UserSlideOver 
        isOpen={isUserDrawerOpen} 
        onClose={() => setIsUserDrawerOpen(false)} 
        user={selectedUser}
        mode={drawerMode}
        fixedShowroom={showroomData.name}
      />

      <ShowroomSlideOver 
        isOpen={isShowroomDrawerOpen}
        onClose={() => setIsShowroomDrawerOpen(false)}
        showroom={showroomData}
      />

      <footer className="px-12 py-12 border-t border-stone-100 flex justify-between items-center bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-6">
           <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
              <span className="text-yellow-600 font-headline italic font-bold">IQ</span>
           </div>
           <p className="font-mono text-[10px] text-stone-400 uppercase tracking-[0.2em]">© 2024 ShowroomIQ Intelligence — Premium Management Platform</p>
        </div>
        <div className="flex gap-10">
          <a className="font-mono text-[10px] text-stone-400 hover:text-yellow-600 transition-colors uppercase tracking-widest font-bold" href="#">Support Technique</a>
          <a className="font-mono text-[10px] text-stone-400 hover:text-yellow-600 transition-colors uppercase tracking-widest font-bold" href="#">Documentation</a>
          <a className="font-mono text-[10px] text-stone-400 hover:text-yellow-600 transition-colors uppercase tracking-widest font-bold" href="#">Billing</a>
        </div>
      </footer>
    </>
  );
}
