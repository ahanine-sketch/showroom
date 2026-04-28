'use client';

import React, { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import ScoreBadge from './ScoreBadge';
import ObjectiveSalesCard from './ObjectiveSalesCard';
import QuotesDrawer from './QuotesDrawer';

interface ScorecardProps {
  role: 'admin' | 'owner';
  activeTab?: 'commercial' | 'behavior' | 'calendar' | 'ressources';
  hideNav?: boolean;
  isDashboard?: boolean;
  userData?: {
    fullName?: string;
    phone?: string;
    seniority?: string;
    avatarUrl?: string;
    showroomName?: string;
    showroom?: { name: string };
  };
  scores?: any;
  isMagasin?: boolean;
  viewMonth?: number;
  viewYear?: number;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

const CommercialScorecard = ({ 
    role, 
    isDashboard, 
    userData, 
    scores, 
    isMagasin: propIsMagasin,
    viewMonth,
    viewYear
  }: ScorecardProps) => {
  const isMagasin = propIsMagasin || scores?.isMagasin;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [drawerStatus, setDrawerStatus] = useState('');
  const [drawerQuotes, setDrawerQuotes] = useState<any[]>([]);
  
  const details = scores?.details;
  const metrics = details?.metrics;
  const setters = details?.setters;
  
  const totalDevisAmount = ((metrics?.devisValidated || 0) + (metrics?.devisVolee || 0) + (metrics?.devisOuvert || 0)) * 45000; 
  const currentPanierMoyen = metrics?.panierMoyen || 0;

  const handleStatClick = (status: string, count: number) => {
    setDrawerStatus(status);
    // Mock quotes data for now
    setDrawerQuotes(Array(count).fill({
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      client: "Client Placeholder",
      amount: "45,000",
      date: `${(metrics?.devisDate?.day || 14)} ${viewMonth ? [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ][viewMonth - 1] : "Mars"} ${viewYear || 2026}`
    }));
    setIsDrawerOpen(true);
  };




  return (
    <>
      <div className={`${isDashboard ? 'pt-0 px-2' : 'p-12'} space-y-12 max-w-[1400px] mx-auto relative text-sans`}>
        <div className="flex justify-end items-center gap-6 mb-2">


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
          scores={scores}
        />



        <QuotesDrawer 
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          status={drawerStatus}
          quotes={drawerQuotes}
        />

        <div className="grid grid-cols-12 gap-12">
            <ObjectiveSalesCard 
              className="col-span-8"
              isFrozen={scores?.isFrozen}
              score={details?.sales?.points || 0}
              maxScore={details?.sales?.maxScore || (isMagasin ? 50 : 35)}
              status={details?.sales?.status || "MAUVAIS"}
              color={details?.sales?.statusColor}
              caGenerated={(metrics?.caAmount || 0).toLocaleString('en-US')}
              baseValue={metrics?.conservativeCA || 30000}
              likelyValue={metrics?.likelyCA || 50000}
              totalValue={metrics?.exceedCA || 70000}
              currentValue={metrics?.caAmount || 0}
              onValueChange={(val) => setters?.setCaAmount(val)}
              title="Objectifs"
              icon="target"
              iconColor="text-yellow-600"
              iconBgColor="bg-yellow-50"
            />


            <div className="col-span-4">
              <div className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm flex flex-col justify-between relative min-h-[400px] transition-all hover:shadow-md">
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
                      <span className="font-mono text-[42px] font-black text-stone-900 leading-none tracking-tighter">{details?.conversionRate || 0}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <ScoreBadge 
                      score={details?.devis?.points || 0} 
                      max={details?.devis?.maxScore || (isMagasin ? 10 : 15)} 
                      status={details?.devis?.status || "MAUVAIS"} 
                      color={details?.devis?.statusColor}
                    />
                  </div>
                </div>

              <div className="flex-1 space-y-8 px-2 py-4 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => handleStatClick('Créés', metrics?.devisCreated || 0)}
                    className="flex-1 border-stone-100 p-3 transition-all hover:bg-stone-50 rounded-xl cursor-pointer group"
                  >
                    <span className="text-[9px] text-stone-400 uppercase font-black tracking-widest block mb-1.5 opacity-60 group-hover:text-stone-600">Créés</span>
                    <input 
                      type="number"
                      value={metrics?.devisCreated || 0}
                      onChange={(e) => setters?.setDevisCreated(Number(e.target.value))}
                      className="bg-transparent font-mono text-[24px] font-black text-stone-800 w-full focus:outline-none focus:text-stone-900"
                      onClick={(e) => e.stopPropagation()}
                      disabled={scores?.isFrozen}
                    />
                  </div>
                  <div 
                    onClick={() => handleStatClick('Validés', metrics?.devisValidated || 0)}
                    className="flex-1 border-emerald-100 p-3 transition-all hover:bg-emerald-50/30 rounded-xl cursor-pointer group"
                  >
                    <span className="text-[9px] text-emerald-600/60 uppercase font-black tracking-widest block mb-1.5 group-hover:text-emerald-600">Validés</span>
                    <input 
                      type="number"
                      value={metrics?.devisValidated || 0}
                      onChange={(e) => setters?.setDevisValidated(Number(e.target.value))}
                      className="bg-transparent font-mono text-[24px] font-black text-emerald-600 w-full focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                      disabled={scores?.isFrozen}
                    />
                  </div>
                  <div 
                    onClick={() => handleStatClick('Volées', metrics?.devisVolee || 0)}
                    className="flex-1 border-blue-100 p-3 transition-all hover:bg-blue-50/30 rounded-xl cursor-pointer group"
                  >
                    <span className="text-[9px] text-blue-500/60 uppercase font-black tracking-widest block mb-1.5 group-hover:text-blue-500">Volées</span>
                    <input 
                      type="number"
                      value={metrics?.devisVolee || 0}
                      onChange={(e) => setters?.setDevisVolee(Number(e.target.value))}
                      className="bg-transparent font-mono text-[24px] font-black text-blue-500 w-full focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                      disabled={scores?.isFrozen}
                    />
                  </div>
                  <div 
                    onClick={() => handleStatClick('Ouverts', metrics?.devisOuvert || 0)}
                    className="flex-1 border-stone-100 p-3 transition-all hover:bg-stone-100/30 rounded-xl cursor-pointer group"
                  >
                    <span className="text-[9px] text-amber-600/60 uppercase font-black tracking-widest block mb-1.5 group-hover:text-amber-600">Ouverts</span>
                    <input 
                      type="number"
                      value={metrics?.devisOuvert || 0}
                      onChange={(e) => setters?.setDevisOuvert(Number(e.target.value))}
                      className="bg-transparent font-mono text-[24px] font-black text-amber-600 w-full focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                      disabled={scores?.isFrozen}
                    />
                  </div>
                </div>

                
                <div className="mt-auto pt-8 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-stone-400 uppercase font-black tracking-widest opacity-60">Montant Devis</span>
                    <p className="font-mono text-[15px] font-bold text-stone-900 tracking-tighter">{totalDevisAmount.toLocaleString('en-US')} <span className="text-[10px] text-stone-300">MAD</span></p>
                  </div>
                  <div className="w-px h-6 bg-stone-100"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-stone-400 uppercase font-black tracking-widest opacity-60">Panier Moyen</span>
                    <p className="font-mono text-[15px] font-bold text-stone-900 tracking-tighter">{currentPanierMoyen.toLocaleString('en-US')} <span className="text-[10px] text-stone-300">MAD</span></p>
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
              <ScoreBadge 
                score={details?.perf?.points || 0} 
                max={details?.perf?.maxScore || (isMagasin ? 10 : 15)} 
                status={details?.perf?.status || "MAUVAIS"} 
                color={details?.perf?.statusColor}
              />
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
              <input 
                type="number"
                value={metrics?.panierMoyen || 0}
                onChange={(e) => setters?.setPanierMoyen(Number(e.target.value))}
                className="bg-transparent font-mono text-[20px] font-bold tracking-tighter text-center w-full focus:outline-none"
                disabled={scores?.isFrozen}
              />

              <span className="text-[8px] text-stone-400 uppercase font-bold">MAD</span>
            </div>
            <div className="p-2 flex flex-col justify-center items-center bg-emerald-50/30 border-r border-stone-100 text-stone-800">
              <span className="text-[20px] font-bold tracking-tighter">{metrics?.devisValidated || 0}</span>
              <span className="text-[8px] text-stone-400 uppercase font-bold">Conclues</span>
            </div>
            <div className="p-2 flex flex-col justify-center items-center bg-stone-50/20 border-r border-stone-100 text-stone-800">
              <span className="text-[20px] font-bold tracking-tighter">0</span>
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
