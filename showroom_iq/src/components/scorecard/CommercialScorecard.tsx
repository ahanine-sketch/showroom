'use client';

import React, { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import ScoreBadge from './ScoreBadge';
import BonusSlideOver from './BonusSlideOver';
import ObjectiveSalesCard from './ObjectiveSalesCard';
import QuotesDrawer from './QuotesDrawer';

interface ScorecardProps {
  role: 'admin' | 'owner';
  activeTab: 'commercial' | 'behavior' | 'calendar' | 'ressources';
  hideNav?: boolean;
  isDashboard?: boolean;
  userData?: any;
}

const CommercialScorecard = ({ role, activeTab, hideNav, isDashboard, userData }: ScorecardProps) => {
  const [isBonusOpen, setIsBonusOpen] = useState(false);
  
  // Extract objective data
  const monthObjective = userData?.objectives?.[0];
  const conservativeCA = monthObjective?.conservativeCA || 30000;
  const likelyCA = monthObjective?.likelyCA || 50000;
  const exceedCA = monthObjective?.exceedCA || 70000;

  // Dynamic State for Manual Overrides
  const [caAmount, setCaAmount] = useState(userData?.caAmount || 0);

  const [devisCreated, setDevisCreated] = useState(userData?.devisCreated || 11);
  const [devisValidated, setDevisValidated] = useState(userData?.devisValidated || 6);
  const [devisVolee, setDevisVolee] = useState(userData?.devisLost || 1); // "Volées" from lost
  const [devisOuvert, setDevisOuvert] = useState(userData?.devisOpened || 4);
  const [panierMoyen, setPanierMoyen] = useState(userData?.avgBasket || 23323);
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerStatus, setDrawerStatus] = useState('');
  const [drawerQuotes, setDrawerQuotes] = useState<any[]>([]);

  const handleStatClick = (status: string, count: number) => {
    setDrawerStatus(status);
    const mockQuotes = Array.from({ length: count }).map((_, i) => ({
      id: `${Math.floor(Math.random() * 9000) + 1000}`,
      clientName: ["Kabbaj Residence", "Villa Anfa", "Appartement Gauthier", "Hotel Kenzi"][i % 4],
      projectName: ["Cuisine Italienne", "Dressing Master", "Salle de Bain Art Deco", "Comptoir Accueil"][i % 4],
      amount: Math.floor(Math.random() * 150000) + 20000,
      date: "14 Mars 2026",
      status: status
    }));
    setDrawerQuotes(mockQuotes);
    setIsDrawerOpen(true);
  };

  // Calculations
  const conversionRate = devisCreated > 0 ? Math.round(((devisValidated + devisVolee) / devisCreated) * 100) : 0;
  const totalDevisAmount = (devisValidated + devisVolee + devisOuvert) * 45000; 
  const currentPanierMoyen = caAmount > 0 && 40 > 0 ? Math.round(caAmount / 40) : panierMoyen;
  
  // --- REAL SCORING LOGIC ---
  
  // 1. CA Score (35 pts max)
  const getSalesScore = () => {
    if (caAmount >= exceedCA) return { points: 35, status: "TRES BIEN" };
    if (caAmount >= likelyCA) return { points: 32, status: "TRES BIEN" };
    if (caAmount >= conservativeCA) {
        // Linear interpolation or fixed thresholds based on "BIEN" range (21-30)
        const progress = (caAmount - conservativeCA) / (likelyCA - conservativeCA);
        const points = 21 + Math.floor(progress * 10);
        return { points, status: "BIEN" };
    }
    if (caAmount >= conservativeCA * 0.5) return { points: 10, status: "MOYEN" };
    return { points: 0, status: "MAUVAIS" };
  };

  // 2. Conversion Score (15 pts max)
  const getDevisScore = () => {
    if (conversionRate >= 75) return { points: 15, status: "TRES BIEN" };
    if (conversionRate >= 50) return { points: 10, status: "BIEN" };
    if (conversionRate >= 35) return { points: 5, status: "MOYEN" };
    return { points: 0, status: "MAUVAIS" };
  };

  // 3. Panier Moyen Score (15 pts max)
  const getPerformanceScore = () => {
    if (panierMoyen >= 20000) return { points: 15, status: "TRES BIEN" };
    if (panierMoyen >= 15000) return { points: 12, status: "BIEN" };
    if (panierMoyen >= 10000) return { points: 5, status: "MOYEN" };
    return { points: 0, status: "MAUVAIS" };
  };

  const salesData = getSalesScore();
  const devisData = getDevisScore();
  const perfData = getPerformanceScore();
  const totalSalesScore = salesData.points + devisData.points + perfData.points;
  
  const currentScores = {
    ventes: totalSalesScore,
    ventesMax: 65,
    comportement: userData?.comportementScore || 8,
    comportementMax: 30,
    presence: userData?.presenceScore || 1,
    presenceMax: 5,
    bonus: userData?.bonusScore || 3,
    bonusMax: 5,
  };

  const basePath = `/${role}/scorecard`;

  return (
    <>
      <div className={`${isDashboard ? 'pt-0 px-2' : 'p-12'} space-y-6 max-w-[1400px] mx-auto relative text-sans`}>
        <div className="flex justify-end items-center gap-6 mb-2">

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
          scores={currentScores}
        />


        <BonusSlideOver 
          isOpen={isBonusOpen} 
          onClose={() => setIsBonusOpen(false)} 
          userId={userData?.id || "d66de368-0c61-461d-ba73-483ff04334f4"} 
        />

        <QuotesDrawer 
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          status={drawerStatus}
          quotes={drawerQuotes}
        />

        <div className="grid grid-cols-12 gap-8">
            <ObjectiveSalesCard 
              className="col-span-8"
              score={salesData.points}
              maxScore={35}
              status={salesData.status}
              caGenerated={caAmount.toLocaleString('en-US')}
              baseValue={conservativeCA}
              likelyValue={likelyCA}
              totalValue={exceedCA}
              currentValue={caAmount}
              onValueChange={(val) => setCaAmount(val)}
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
                      <span className="font-mono text-[42px] font-black text-stone-900 leading-none tracking-tighter">{conversionRate}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <ScoreBadge score={devisData.points} max={15} status={devisData.status} />
                  </div>
                </div>

              <div className="flex-1 space-y-8 px-2 py-4 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => handleStatClick('Créés', devisCreated)}
                    className="flex-1 border-stone-100 p-3 transition-all hover:bg-stone-50 rounded-xl cursor-pointer group"
                  >
                    <span className="text-[9px] text-stone-400 uppercase font-black tracking-widest block mb-1.5 opacity-60 group-hover:text-stone-600">Créés</span>
                    <input 
                      type="number"
                      value={devisCreated}
                      onChange={(e) => setDevisCreated(Number(e.target.value))}
                      className="bg-transparent font-mono text-[24px] font-black text-stone-800 w-full focus:outline-none focus:text-stone-900"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div 
                    onClick={() => handleStatClick('Validés', devisValidated)}
                    className="flex-1 border-emerald-100 p-3 transition-all hover:bg-emerald-50/30 rounded-xl cursor-pointer group"
                  >
                    <span className="text-[9px] text-emerald-600/60 uppercase font-black tracking-widest block mb-1.5 group-hover:text-emerald-600">Validés</span>
                    <input 
                      type="number"
                      value={devisValidated}
                      onChange={(e) => setDevisValidated(Number(e.target.value))}
                      className="bg-transparent font-mono text-[24px] font-black text-emerald-600 w-full focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div 
                    onClick={() => handleStatClick('Volées', devisVolee)}
                    className="flex-1 border-blue-100 p-3 transition-all hover:bg-blue-50/30 rounded-xl cursor-pointer group"
                  >
                    <span className="text-[9px] text-blue-500/60 uppercase font-black tracking-widest block mb-1.5 group-hover:text-blue-500">Volées</span>
                    <input 
                      type="number"
                      value={devisVolee}
                      onChange={(e) => setDevisVolee(Number(e.target.value))}
                      className="bg-transparent font-mono text-[24px] font-black text-blue-500 w-full focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div 
                    onClick={() => handleStatClick('Ouverts', devisOuvert)}
                    className="flex-1 border-stone-100 p-3 transition-all hover:bg-stone-100/30 rounded-xl cursor-pointer group"
                  >
                    <span className="text-[9px] text-amber-600/60 uppercase font-black tracking-widest block mb-1.5 group-hover:text-amber-600">Ouverts</span>
                    <input 
                      type="number"
                      value={devisOuvert}
                      onChange={(e) => setDevisOuvert(Number(e.target.value))}
                      className="bg-transparent font-mono text-[24px] font-black text-amber-600 w-full focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
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
             <ScoreBadge score={perfData.points} max={15} status={perfData.status} />
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
                value={panierMoyen}
                onChange={(e) => setPanierMoyen(Number(e.target.value))}
                className="bg-transparent font-mono text-[20px] font-bold tracking-tighter text-center w-full focus:outline-none"
              />
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
