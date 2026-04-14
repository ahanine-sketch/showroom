'use client';

import React, { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import ScoreBadge from './ScoreBadge';
import BonusSlideOver from './BonusSlideOver';
import ObjectiveSalesCard from './ObjectiveSalesCard';

interface ScorecardProps {
  role: 'admin' | 'owner';
  activeTab: 'commercial' | 'behavior' | 'calendar' | 'ressources';
  hideNav?: boolean;
  isDashboard?: boolean;
  userData?: any;
}

const CommercialScorecard = ({ role, activeTab, hideNav, isDashboard, userData }: ScorecardProps) => {
  const [isBonusOpen, setIsBonusOpen] = useState(false);
  const basePath = `/${role}/scorecard`;

  return (
    <>


      <div className={`${isDashboard ? 'py-6 px-2' : 'p-12'} space-y-6 max-w-[1400px] mx-auto relative text-sans`}>
        <div className="flex justify-end items-center gap-6 mb-8">
          <div className="flex items-center bg-stone-50 border border-stone-100 shadow-sm p-1.5 rounded-xl">
            <button className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <span className="px-4 py-1 text-[12px] font-black text-stone-900 font-mono tracking-tighter uppercase">Mars 2026</span>
            <button className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
          
          {role === 'owner' && (
            <button 
              onClick={() => setIsBonusOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600/90 backdrop-blur-xl text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-yellow-700 transition-all shadow-xl active:scale-95 group border border-yellow-500/50"
            >
              <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
              Attribuer Bonus
            </button>
          )}
        </div>

        <ProfileHeader 
          role={role} 
          user={userData || {
            fullName: "...",
            phone: "...",
            seniority: "...",
            showroomName: "...",
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder`
          }}
        />

        <BonusSlideOver 
          isOpen={isBonusOpen} 
          onClose={() => setIsBonusOpen(false)} 
          userId={userData?.id || "d66de368-0c61-461d-ba73-483ff04334f4"} 
        />

        <div className="grid grid-cols-12 gap-8">
          <ObjectiveSalesCard 
            className="col-span-8"
            score={29}
            maxScore={35}
            status="TRES BIEN"
            caGenerated="932,900"
            baseValue={789447}
            likelyValue={964879}
            totalValue={1140312}
            currentValue={932900}
            title="Objectifs"
            icon="target"
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-50"
          />

          <div className="col-span-4">
            <div className="bg-white p-10 rounded-2xl border border-stone-200/60 shadow-sm flex flex-col justify-between relative min-h-[440px] transition-all hover:shadow-md">
              <div className="absolute top-8 left-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">request_quote</span>
                </div>
                <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">Devis</h4>
              </div>

              <div className="w-full h-16"></div>

              <div className="flex justify-between items-start mb-6 px-2">
                <div className="flex flex-col">
                  <span className="text-[11px] text-stone-400 uppercase tracking-widest font-black mb-3 opacity-60">Taux de Conversion</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-[42px] font-black text-stone-900 leading-none tracking-tighter">55%</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <ScoreBadge score={10} max={15} status="BIEN" />
                </div>
              </div>

              <div className="flex-1 space-y-8 px-2 py-4 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 border-stone-100 py-1 transition-all hover:bg-stone-50/50 rounded-lg">
                    <span className="text-[9px] text-stone-400 uppercase font-black tracking-widest block mb-1.5 opacity-60">Créés</span>
                    <p className="font-mono text-[20px] font-bold text-stone-800">11</p>
                  </div>
                  <div className="flex-1 border-emerald-200 py-1 transition-all hover:bg-emerald-50/20 rounded-lg">
                    <span className="text-[9px] text-emerald-600/60 uppercase font-black tracking-widest block mb-1.5">Validés</span>
                    <p className="font-mono text-[20px] font-bold text-emerald-600">6</p>
                  </div>
                  <div className="flex-1 border-red-200 py-1 transition-all hover:bg-red-50/20 rounded-lg">
                    <span className="text-[9px] text-red-500/60 uppercase font-black tracking-widest block mb-1.5">Perdus</span>
                    <p className="font-mono text-[20px] font-bold text-red-500">1</p>
                  </div>
                </div>
                
                <div className="mt-auto pt-8 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-stone-400 uppercase font-black tracking-widest opacity-60">Montant Devis</span>
                    <p className="font-mono text-[15px] font-bold text-stone-900 tracking-tighter">451,312 <span className="text-[10px] text-stone-300">MAD</span></p>
                  </div>
                  <div className="w-px h-6 bg-stone-100"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-stone-400 uppercase font-black tracking-widest opacity-60">Panier Moyen</span>
                    <p className="font-mono text-[15px] font-bold text-stone-900 tracking-tighter">41,028 <span className="text-[10px] text-stone-300">MAD</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm overflow-hidden mb-12 relative pt-24 mt-12 transition-all hover:shadow-md">
           <div className="absolute top-8 left-10 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
               <span className="material-symbols-outlined text-[24px]">analytics</span>
             </div>
             <h4 className="font-headline text-[28px] font-bold tracking-tight text-stone-900">Indicateur de Performance</h4>
           </div>

           <div className="px-10 py-6 border-b border-stone-100 flex justify-end items-center bg-stone-50/10">
             <ScoreBadge score={15} max={15} status="TRES BIEN" />
           </div>
          
          <div className="grid grid-cols-6 bg-stone-50 border-b border-stone-100 font-mono text-[8px] font-bold uppercase text-stone-400 tracking-widest">
            <div className="p-2 text-center flex flex-col items-center gap-0.5 border-r border-stone-100">
              <span className="material-symbols-outlined text-[14px]">payments</span>
              <span>Panier Moyen</span>
            </div>
            <div className="p-2 text-center flex flex-col items-center gap-0.5 border-r border-stone-100">
              <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
              <span>Nb Vente</span>
            </div>
            <div className="p-2 text-center flex flex-col items-center gap-0.5 border-r border-stone-100">
              <span className="material-symbols-outlined text-[14px]">person_check</span>
              <span>Client Unique</span>
            </div>
            <div className="p-2 text-center flex flex-col items-center gap-0.5 border-r border-stone-100 opacity-20"><span className="material-symbols-outlined text-[14px]">more_horiz</span><span>-</span></div>
            <div className="p-2 text-center flex flex-col items-center gap-0.5 border-r border-stone-100 opacity-20"><span className="material-symbols-outlined text-[14px]">more_horiz</span><span>-</span></div>
            <div className="p-2 text-center flex flex-col items-center gap-0.5 opacity-20"><span className="material-symbols-outlined text-[14px]">more_horiz</span><span>-</span></div>
          </div>
          
          <div className="grid grid-cols-6 items-stretch h-[65px] font-mono">
            <div className="p-2 flex flex-col justify-center items-center bg-stone-50/20 border-r border-stone-100 text-stone-800">
              <span className="text-[20px] font-bold tracking-tighter">23,323</span>
              <span className="text-[8px] text-stone-400 uppercase font-bold">MAD</span>
            </div>
            <div className="p-2 flex flex-col justify-center items-center bg-emerald-50/30 border-r border-stone-100 text-stone-800">
              <span className="text-[20px] font-bold tracking-tighter">40</span>
              <span className="text-[8px] text-stone-400 uppercase font-bold">Conclues</span>
            </div>
            <div className="p-2 flex flex-col justify-center items-center bg-stone-50/20 border-r border-stone-100 text-stone-800">
              <span className="text-[20px] font-bold tracking-tighter">33</span>
              <span className="text-[8px] text-stone-400 uppercase font-bold">Distincts</span>
            </div>
            <div className="bg-stone-50/5 border-r border-stone-100 flex items-center justify-center text-stone-100 text-xl">-</div>
            <div className="bg-stone-50/5 border-r border-stone-100 flex items-center justify-center text-stone-100 text-xl">-</div>
            <div className="bg-stone-50/5 flex items-center justify-center text-stone-100 text-xl">-</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommercialScorecard;
