import React from 'react';
import ProfileHeader from './ProfileHeader';

interface ScorecardProps {
  role: 'admin' | 'owner';
  activeTab: 'commercial' | 'behavior' | 'calendar' | 'bonus' | 'ressources';
}

const BonusScorecard = ({ role, activeTab }: ScorecardProps) => {
  const basePath = `/${role}/scorecard`;

  return (
    <>
      <nav className="flex px-12 gap-10 border-b border-stone-100 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <a 
          className={`py-4 border-b-2 text-[14px] ${activeTab === 'commercial' ? 'border-yellow-700 text-yellow-700 font-medium' : 'border-transparent text-stone-400 hover:text-stone-900 transition-colors'}`} 
          href={`${basePath}/commercial`}
        >
          Ventes
        </a>
        <a 
          className={`py-4 border-b-2 text-[14px] ${activeTab === 'behavior' ? 'border-yellow-700 text-yellow-700 font-medium' : 'border-transparent text-stone-400 hover:text-stone-900 transition-colors'}`} 
          href={`${basePath}/behavior`}
        >
          Comportement
        </a>
        <a 
          className={`py-4 border-b-2 text-[14px] ${activeTab === 'calendar' ? 'border-yellow-700 text-yellow-700 font-medium' : 'border-transparent text-stone-400 hover:text-stone-900 transition-colors'}`} 
          href={`${basePath}/calendar`}
        >
          Calendrier
        </a>
        <a 
          className={`py-4 border-b-2 text-[14px] ${activeTab === 'bonus' ? 'border-yellow-700 text-yellow-700 font-medium' : 'border-transparent text-stone-400 hover:text-stone-900 transition-colors'}`} 
          href={`${basePath}/bonus`}
        >
          Bonus
        </a>
        <a 
          className={`py-4 border-b-2 text-[14px] ${activeTab === 'ressources' ? 'border-yellow-700 text-yellow-700 font-medium' : 'border-transparent text-stone-400 hover:text-stone-900 transition-colors'}`} 
          href={`${basePath}/ressources`}
        >
          Ressources
        </a>
      </nav>

      <div className="p-12 space-y-6 max-w-[1400px] mx-auto">
        <ProfileHeader role={role} />
        
        <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="font-headline text-3xl mb-1">Bonus & Gratifications</h4>
              <p className="text-stone-400 text-[13px]">Récapitulatif des primes et objectifs exceptionnels atteints.</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-2xl flex flex-col items-end">
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Total Cumulé 2025</span>
              <span className="text-[24px] font-mono font-bold text-emerald-700">12,500 MAD</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 relative group overflow-hidden">
               <div className="relative z-10">
                  <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-[9px] font-bold rounded-full uppercase tracking-tighter mb-4 inline-block">Objectif Atteint</span>
                  <h5 className="font-bold text-[16px] mb-2 font-headline italic">Challenge Printemps</h5>
                  <p className="text-[12px] text-stone-500 mb-4">Prime exceptionnelle pour avoir dépassé l'objectif de vente de 15% en Mars.</p>
                  <div className="flex justify-between items-end">
                    <span className="text-[20px] font-mono font-bold text-stone-900">+2,500 MAD</span>
                    <span className="text-[10px] text-stone-400 font-mono">Payé: 05/04/2025</span>
                  </div>
               </div>
               <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            </div>

            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 relative group overflow-hidden">
               <div className="relative z-10">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full uppercase tracking-tighter mb-4 inline-block">Qualité Service</span>
                  <h5 className="font-bold text-[16px] mb-2 font-headline italic">Prime Avis Clients</h5>
                  <p className="text-[12px] text-stone-500 mb-4">Bonus mensuel pour maintien d'une note client supérieure à 9/10.</p>
                  <div className="flex justify-between items-end">
                    <span className="text-[20px] font-mono font-bold text-stone-900">+1,000 MAD</span>
                    <span className="text-[10px] text-stone-400 font-mono">En attente</span>
                  </div>
               </div>
               <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            </div>

            <div className="p-6 bg-stone-900 rounded-2xl border border-stone-800 relative group overflow-hidden text-white shadow-xl">
               <div className="relative z-10">
                  <span className="px-2.5 py-0.5 bg-white/20 text-white text-[9px] font-bold rounded-full uppercase tracking-tighter mb-4 inline-block">En cours</span>
                  <h5 className="font-bold text-[16px] mb-2 font-headline italic">Grand Prix Annuel</h5>
                  <p className="text-[12px] text-white/60 mb-4">Voyage offert pour le meilleur vendeur du showroom sur l'année complète.</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-white/40">
                       <span>Progression</span>
                       <span>65%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-yellow-400 w-[65%]"></div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BonusScorecard;
