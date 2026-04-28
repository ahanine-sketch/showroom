'use client';

import React from 'react';
import ProfileHeader from './ProfileHeader';

interface BonusHistory {
  id: string;
  date: string;
  amount: number;
  description: string;
  month: number;
  year: number;
}

interface ScorecardProps {
  role: 'admin' | 'owner';
  activeTab?: 'commercial' | 'behavior' | 'calendar' | 'bonus' | 'ressources';
  hideNav?: boolean;
  isDashboard?: boolean;
  userData?: any;
  scores?: any;
  bonuses?: BonusHistory[];
  viewMonth?: number;
  viewYear?: number;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

const BonusScorecard = ({ 
  role, 
  isDashboard, 
  userData, 
  scores, 
  bonuses = [],
  viewMonth,
  viewYear,
  onPrevMonth,
  onNextMonth
}: ScorecardProps) => {
  
  const totalBonus = scores?.bonus || 0;
  
  // Format currency
  const formatMAD = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(amount);
  };

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const currentMonthName = viewMonth ? monthNames[viewMonth - 1] : '';

  return (
    <div className={`${isDashboard ? 'pt-0 px-2' : 'p-12'} space-y-12 max-w-[1400px] mx-auto relative text-sans`}>
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
      
      <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h4 className="font-headline text-3xl italic mb-1">Bonus & Gratifications</h4>
            <p className="text-stone-400 text-[13px] font-mono uppercase tracking-widest">
              Récapitulatif des primes pour {currentMonthName} {viewYear}
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 px-8 py-4 rounded-2xl flex flex-col items-end shadow-sm">
            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mb-1">Total Période</span>
            <span className="text-[32px] font-mono font-bold text-emerald-700 leading-none">
              {totalBonus > 5 ? formatMAD(totalBonus) : `+${totalBonus} pts`}
            </span>
          </div>
        </div>

        {bonuses.length === 0 ? (
          <div className="py-20 text-center bg-stone-50/50 rounded-3xl border border-dashed border-stone-200">
            <span className="material-symbols-outlined text-stone-200 text-[64px] mb-4">redeem</span>
            <p className="text-stone-400 font-medium italic">Aucun bonus enregistré pour cette période.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bonuses.map((bonus) => (
              <div key={bonus.id} className="p-8 bg-stone-50 rounded-3xl border border-stone-100 relative group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 hover:border-yellow-200/50">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-[9px] font-black rounded-full uppercase tracking-widest">
                      PRIME PERFORMANCE
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono font-bold">
                      {new Date(bonus.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <h5 className="font-bold text-[18px] mb-3 font-headline italic text-stone-900 leading-tight">
                    {bonus.description.length > 40 ? bonus.description.substring(0, 40) + '...' : bonus.description}
                  </h5>
                  
                  <p className="text-[13px] text-stone-500 mb-8 line-clamp-2 italic leading-relaxed">
                    "{bonus.description}"
                  </p>
                  
                  <div className="flex justify-between items-end pt-4 border-t border-stone-200/50">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter">Montant</span>
                      <span className="text-[26px] font-mono font-bold text-stone-900">
                        {bonus.amount > 5 ? `+${formatMAD(bonus.amount)}` : `+${bonus.amount} pts`}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-yellow-600 border border-stone-100">
                      <span className="material-symbols-outlined text-[20px]">verified</span>
                    </div>
                  </div>
                </div>
                <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BonusScorecard;
