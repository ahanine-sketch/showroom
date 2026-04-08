import React from 'react';

const ReviewSAVSection = () => {
  const reviews = [
    { name: 'Jean-Pierre L.', text: 'Service exceptionnel et showroom magnifique.', rate: 5, date: '12 Mars' },
    { name: 'Sidi Brahim', text: 'Très satisfait de mon achat, merci à l\'équipe.', rate: 4, date: '08 Mars' },
    { name: 'Alice Morel', text: 'Un peu d\'attente, mais le conseil était parfait.', rate: 4, date: '01 Mars' },
    { name: 'Mohamed T.', text: 'Superbe accueil de bout en bout.', rate: 5, date: '25 Fév' },
  ];

  const advertisements = [
    { type: 'Avertissement 1', reason: 'Retard injustifié', date: '12 Mars', commercial: 'Commercial A' },
    { type: 'Punition', reason: 'Non-respect procédure SAV', date: '05 Mars', commercial: 'Commercial B' },
    { type: 'Avertissement 2', reason: 'Objectif non atteint', date: '28 Fév', commercial: 'Commercial C' },
    { type: 'Avertissement 1', reason: 'Omission dossier client', date: '20 Fév', commercial: 'Commercial A' },
    { type: 'Punition', reason: 'Comportement inadéquat', date: '15 Fév', commercial: 'Commercial D' },
  ];

  return (
    <div className="grid grid-cols-12 gap-8 w-full">
      {/* Reviews Block */}
      <div className="col-span-12 lg:col-span-4 bg-white rounded-[32px] p-8 pb-4 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-stone-100 flex flex-col group h-[550px]">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h4 className="font-headline text-3xl italic tracking-tight text-stone-900 mb-1">Avis Clients</h4>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-stone-300">Google Reviews</span>
          </div>
          <div className="flex flex-col items-end gap-2 px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100 group-hover:scale-110 transition-transform shadow-sm">
             <span className="text-[32px] font-bold text-emerald-600 font-mono leading-none tracking-tighter">4.8</span>
             <div className="flex text-yellow-500 scale-75 origin-right">
                <span className="material-symbols-outlined fill font-bold">star</span>
                <span className="material-symbols-outlined fill font-bold">star</span>
                <span className="material-symbols-outlined fill font-bold">star</span>
                <span className="material-symbols-outlined fill font-bold">star</span>
                <span className="material-symbols-outlined fill font-bold">star</span>
             </div>
          </div>
        </div>

        <div className="space-y-4 mb-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
           {reviews.map((review, i) => (
             <div key={i} className="p-4 bg-stone-50 rounded-2xl border border-stone-50 hover:bg-white hover:border-stone-100 hover:shadow-md transition-all cursor-default">
                <div className="flex justify-between items-center mb-1">
                   <p className="text-[14px] font-bold text-stone-900 italic tracking-tight">{review.name}</p>
                   <span className="text-[10px] font-mono text-stone-400 uppercase font-bold">{review.date}</span>
                </div>
                <div className="flex text-yellow-500 scale-50 origin-left mb-2">
                   {[...Array(5)].map((_, j) => (
                     <span key={j} className={`material-symbols-outlined ${j < review.rate ? 'fill' : ''} font-bold`}>star</span>
                   ))}
                </div>
                <p className="text-[12px] text-stone-500 leading-relaxed italic line-clamp-2">"{review.text}"</p>
             </div>
           ))}
        </div>
      </div>

      {/* SAV Block */}
      <div className="col-span-12 lg:col-span-4 bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-stone-100 flex flex-col group h-[550px]">
        <div className="mb-6">
          <h4 className="font-headline text-3xl italic tracking-tight text-stone-900 mb-1">Service Après-Vente</h4>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-stone-300">Operational Health</span>
        </div>

        <div className="flex flex-col gap-4 h-full justify-center">
           <div className="flex flex-col gap-4 py-4 px-4 bg-stone-50 rounded-[28px] border border-stone-100 group-hover:bg-white group-hover:shadow-xl group-hover:-translate-y-2 transition-all cursor-default relative overflow-hidden">
              <span className="material-symbols-outlined absolute -right-2 absolute -top-2 text-[80px] opacity-5 rotate-12">confirmation_number</span>
              <div className="flex flex-col items-center">
                 <span className="font-mono text-[64px] font-bold text-yellow-700 leading-none tracking-tighter">12</span>
                 <span className="text-[10px] font-mono font-bold uppercase tracking-widest mt-2 text-stone-400">Nb Tickets Ouverts</span>
              </div>
           </div>

           <div className="flex flex-col gap-4 py-4 px-4 bg-red-50/50 rounded-[28px] border border-red-100 group-hover:bg-white group-hover:shadow-xl group-hover:translate-y-2 transition-all cursor-default relative overflow-hidden">
              <span className="material-symbols-outlined absolute -right-2 absolute -top-2 text-[80px] opacity-10 rotate-12">report</span>
              <div className="flex flex-col items-center">
                 <span className="font-mono text-[64px] font-bold text-red-600 leading-none tracking-tighter">02</span>
                 <span className="text-[10px] font-mono font-bold uppercase tracking-widest mt-2 text-red-400">Plaintes Clients</span>
              </div>
           </div>
        </div>
      </div>

      {/* Advertisement Block */}
      <div className="col-span-12 lg:col-span-4 bg-stone-900 rounded-[32px] p-8 shadow-2xl relative overflow-hidden flex flex-col group h-[550px]">
        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[160px] opacity-10 rotate-12 text-white">history</span>
        
        <div className="mb-10 relative z-10">
          <h4 className="font-headline text-3xl italic tracking-tight text-white mb-1">Historique Avis</h4>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-white/40">Derniers Avertissements (5)</span>
        </div>

        <div className="space-y-4 relative z-10 overflow-y-auto pr-2 custom-scrollbar flex-1">
           {advertisements.map((adv, i) => (
             <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-default group/item">
                <div className="flex justify-between items-center mb-1">
                   <p className={`text-[12px] font-bold ${adv.type.includes('Punition') ? 'text-red-400' : 'text-yellow-500'} uppercase font-mono tracking-widest`}>{adv.type}</p>
                   <span className="text-[10px] font-mono text-white/30 uppercase font-bold">{adv.date}</span>
                </div>
                <p className="text-[13px] font-medium text-white/90 italic tracking-tight mb-2">"{adv.reason}"</p>
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/5">
                   <div className="w-1.5 h-1.5 rounded-full bg-stone-500"></div>
                   <span className="text-[10px] uppercase font-mono font-bold text-white/40 tracking-widest">{adv.commercial}</span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewSAVSection;
