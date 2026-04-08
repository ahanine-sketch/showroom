import React from 'react';

const SalesFunnelMetrics = () => {
  return (
    <div className="bg-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-stone-100 flex flex-col justify-center group h-full">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] font-bold text-stone-400">Taux de Conversion</span>
          <span className="bg-emerald-50 text-emerald-600 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">+2.4%</span>
        </div>
        
        {/* Main Value */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[44px] font-headline font-bold italic text-yellow-700 tracking-tight leading-none group-hover:scale-105 transition-transform origin-left decoration-yellow-200/50 underline underline-offset-4">42.5%</span>
          <span className="text-[10px] text-stone-400 font-mono font-bold uppercase tracking-widest bg-stone-50 px-2 py-1 rounded-lg">Close</span>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-stone-50"></div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4 mt-1">
           <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest font-bold opacity-70">Devis Créés</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center text-stone-400 border border-stone-100">
                  <span className="material-symbols-outlined text-[16px]">description</span>
                </div>
                <span className="text-[20px] font-bold text-stone-900 font-mono">156</span>
              </div>
           </div>
           <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest font-bold opacity-70">Validés</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                </div>
                <span className="text-[20px] font-bold text-emerald-700 font-mono">68</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SalesFunnelMetrics;
