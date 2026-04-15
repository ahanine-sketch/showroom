import React from 'react';
import ProfileHeader from './ProfileHeader';
import ScoreBadge from './ScoreBadge';

interface ScorecardProps {
  role: 'admin' | 'owner';
  activeTab: 'commercial' | 'behavior' | 'calendar' | 'ressources';
  hideNav?: boolean;
  isDashboard?: boolean;
  userData?: any;
  scores?: any;
}


const BehaviorScorecard = ({ role, activeTab, hideNav, isDashboard, userData, scores }: ScorecardProps) => {
  const basePath = `/${role}/scorecard`;
  
  const details = scores?.details;
  const metrics = details?.metrics;
  const setters = details?.setters;


  const allPossibleWarnings = ['Avertissement 1', 'Avertissement 2', 'Avertissement 3'];
  const existingWarnings = details?.processusList?.map((w: any) => w.title) || [];
  const availableWarnings = allPossibleWarnings.filter(w => !existingWarnings.includes(w));

  const [malusType, setMalusType] = React.useState('');
  const [malusComment, setMalusComment] = React.useState('');

  // Sync malusType with first available warning
  React.useEffect(() => {
    if (availableWarnings.length > 0 && !availableWarnings.includes(malusType)) {
      setMalusType(availableWarnings[0]);
    }
  }, [availableWarnings, malusType]);

  const handleAddMalus = () => {
    if (malusComment && setters?.setProcessusList && malusType) {
      const newMalus = {
        title: malusType,
        comment: malusComment,
        icon: 'report_problem',
        pts: "-1",
        date: new Date().toLocaleDateString('fr-FR')
      };
      
      setters.setProcessusList((prev: any[]) => [newMalus, ...prev]);
      setMalusComment('');
      // malusType will be updated by useEffect
    }
  };



  return (
    <>


      <div className={`${isDashboard ? 'py-6 px-2' : 'p-12'} space-y-6 max-w-[1400px] mx-auto`}>
        <ProfileHeader 
          role={role} 
          user={userData}
          scores={scores}
        />


        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-8 space-y-6">
            
            {/* Avis Card */}
            <div className="bg-white p-10 rounded-2xl border border-stone-200/60 shadow-sm transition-all hover:shadow-md relative min-h-[500px] flex flex-col">
              <div className="absolute top-8 left-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">forum</span>
                </div>
                <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">Avis</h4>
              </div>

              <div className="w-full h-16"></div> {/* Spacer for header */}

              <div className="flex justify-end items-center mb-10 pb-6 border-b border-stone-50 px-2">
                <ScoreBadge score={details?.avis?.points || 0} max={10} status={details?.avis?.status || "MAUVAIS"} />
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10 px-2">
                <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl flex items-center justify-between transition-all hover:bg-emerald-50 group">
                  <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest leading-none">Avis Positifs</span>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      min={0}
                      value={metrics?.avisPositifs || 0}
                      onChange={(e) => setters?.setAvisPositifs(Number(e.target.value))}
                      className="bg-transparent font-mono text-3xl font-black text-emerald-600 leading-none w-16 text-right focus:outline-none"
                    />
                  </div>
                </div>
                <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-2xl flex items-center justify-between transition-all hover:bg-rose-50">
                  <span className="text-[11px] font-black text-rose-700 uppercase tracking-widest leading-none">Avis Négatifs</span>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      min={0}
                      value={metrics?.avisNegatifs || 0}
                      onChange={(e) => setters?.setAvisNegatifs(Number(e.target.value))}
                      className="bg-transparent font-mono text-3xl font-black text-rose-600 leading-none w-16 text-right focus:outline-none"
                    />
                  </div>
                </div>
              </div>


              {/* Phrase before the list */}
              <div className="flex items-center gap-4 mb-8 px-2">
                <div className="w-2 h-4 bg-stone-200 rounded-full"></div>
                <span className="text-[11px] text-stone-400 uppercase tracking-[0.25em] font-black opacity-60">Derniers Avis Clients</span>
              </div>
              
              <div className="space-y-5 max-h-[480px] overflow-y-auto pr-3 custom-scrollbar px-2 flex-1">
                {[
                  { name: "Marc L.", stars: 5, comment: "Sophie a été d'une aide précieuse pour le choix des finitions de mon salon.", date: "Hier" },
                  { name: "Inès K.", stars: 4, comment: "Très bon accueil, même si l'attente en showroom était un peu longue à mon arrivée.", date: "2 jours" },
                  { name: "Thomas R.", stars: 3, comment: "Le conseil était bon, mais j'aurais aimé voir plus d'échantillons de tissus disponibles.", date: "4 jours" },
                  { name: "Julie D.", stars: 5, comment: "Excellent service ! Sophie a vraiment l'œil pour le design d'intérieur.", date: "1 semaine" },
                  { name: "Antoine M.", stars: 2, comment: "Déçu par les délais de livraison annoncés par rapport au catalogue.", date: "2 semaines" }
                ].map((avis, i) => (
                  <div key={i} className="p-5 bg-stone-50/50 rounded-2xl border border-stone-100 transition-all hover:bg-white hover:shadow-sm">
                    <div className="flex justify-between mb-3">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-[11px] font-black text-stone-600">
                           {avis.name[0]}
                         </div>
                         <span className="font-bold text-[14px] text-stone-800 tracking-tight">{avis.name}</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <span className="text-[11px] text-stone-400 italic font-medium">{avis.date}</span>
                         <div className="flex text-amber-400 scale-90 origin-right">
                           {[...Array(5)].map((_, j) => (
                             <span key={j} className={`material-symbols-outlined text-[18px] ${j < avis.stars ? 'fill-1' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                           ))}
                         </div>
                       </div>
                    </div>
                    <p className="text-[13px] text-stone-600 italic leading-relaxed px-1">"{avis.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-4 space-y-10">
            
            {/* Section: SAV */}
            <div className="bg-white p-10 rounded-2xl border border-stone-200/60 shadow-sm transition-all hover:shadow-md relative">
              <div className="absolute top-8 left-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">support_agent</span>
                </div>
                <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">SAV</h4>
              </div>
              
              <div className="w-full h-16"></div> {/* Spacer for header */}

              <div className="flex justify-end items-center mb-8 px-2">
                <ScoreBadge score={details?.sav?.points || 0} max={10} status={details?.sav?.status || "MAUVAIS"} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 px-2">
                 <div className="p-6 bg-stone-50 border border-stone-100 rounded-2xl flex flex-col items-center transition-all hover:bg-white hover:shadow-sm">
                    <span className="text-[11px] text-stone-400 uppercase tracking-widest font-black mb-2 opacity-60">Tickets</span>
                    <div className="flex items-center gap-2">
                       <input 
                        type="number"
                        min={0}
                        value={metrics?.savTickets || 0}
                        onChange={(e) => setters?.setSavTickets(Number(e.target.value))}
                        className="bg-transparent font-mono text-[28px] font-black text-stone-900 leading-none w-16 text-center focus:outline-none"
                       />
                       <span className="material-symbols-outlined text-[20px] text-stone-300">confirmation_number</span>
                    </div>
                 </div>

                 <div className="p-6 bg-red-50/50 border border-red-100 rounded-2xl flex flex-col items-center transition-all hover:bg-red-50 hover:shadow-sm">
                    <span className="text-[11px] text-red-700 font-black uppercase tracking-widest mb-2">Plaintes</span>
                    <div className="flex items-center gap-2">
                       <input 
                        type="number"
                        min={0}
                        value={metrics?.savPlaintes || 0}
                        onChange={(e) => setters?.setSavPlaintes(Number(e.target.value))}
                        className="bg-transparent font-mono text-[28px] font-black text-red-600 leading-none w-16 text-center focus:outline-none"
                       />
                       <span className="material-symbols-outlined text-[20px] text-red-400">warning</span>
                    </div>
                 </div>
              </div>



            </div>

            {/* Section: Processus */}
            <div className="bg-white p-10 rounded-2xl border border-stone-200/60 shadow-sm transition-all hover:shadow-md relative">
              <div className="absolute top-8 left-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
                </div>
                <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">Processus</h4>
              </div>
              
              <div className="w-full h-16"></div> {/* Spacer for header */}

              <div className="flex justify-end items-center mb-8 px-2">
                <ScoreBadge score={details?.processus?.points || 0} max={10} status={details?.processus?.status || "MAUVAIS"} />
              </div>
              
              <div className="space-y-8 px-2">
                 {role === 'owner' && availableWarnings.length > 0 && (
                   <div className="p-6 bg-stone-50 border border-stone-100 rounded-2xl space-y-6 shadow-inner">
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-3">
                       <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                       Émettre un avertissement
                     </p>
                     
                      <div className="grid grid-cols-1 gap-4">
                        <select 
                         value={malusType}
                         onChange={(e) => setMalusType(e.target.value)}
                         className="w-full appearance-none border border-stone-200 rounded-xl px-5 py-3.5 text-[13px] font-bold text-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-100 bg-white shadow-sm"
                        >
                          {availableWarnings.map((w) => (
                            <option key={w}>{w}</option>
                          ))}
                        </select>
                      </div>
                     <textarea 
                       placeholder="Commentaire..."
                       value={malusComment}
                       onChange={(e) => setMalusComment(e.target.value)}
                       rows={3}
                       className="w-full border border-stone-200 rounded-xl px-5 py-3.5 text-[13px] font-bold text-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-100 shadow-sm"
                     ></textarea>
                     <button 
                      onClick={handleAddMalus}
                      className="w-full py-4 bg-stone-900 text-white rounded-xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-lg active:scale-95"
                     >
                       Valider la notification
                     </button>
                   </div>
                 )}

                 {role === 'owner' && availableWarnings.length === 0 && (
                   <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-center">
                     <span className="material-symbols-outlined text-rose-400 text-3xl mb-2">gavel</span>
                     <p className="text-[11px] font-black uppercase text-rose-600 tracking-widest">Toutes les sanctions ont été appliquées</p>
                   </div>
                 )}

 
                 <div className="space-y-4">
                   {details?.processusList && details.processusList.length > 0 ? (
                     details.processusList.map((item: any, i: number) => (
                       <div key={i} className="flex items-center justify-between p-5 border border-stone-100 bg-stone-50/50 rounded-2xl transition-all hover:bg-stone-50 hover:pl-6 animate-in slide-in-from-right duration-500">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                               <span className="material-symbols-outlined text-[20px]">{item.icon || 'verified_user'}</span>
                             </div>
                              <div className="flex flex-col">
                                <h5 className="text-[14px] font-black text-stone-800">{item.title}</h5>
                                {item.comment && (
                                  <p className="text-[11px] text-stone-500 italic mt-0.5">{item.comment}</p>
                                )}
                              </div>
                           </div>
                           <span className="text-orange-600 font-mono text-[13px] font-black">
                             {item.title === 'Avertissement 1' ? '-2 pts' : '-4 pts'}
                           </span>
                       </div>
                     ))
                   ) : (
                     <div className="p-10 border-2 border-dashed border-stone-100 rounded-3xl flex flex-col items-center justify-center text-stone-300">
                       <span className="material-symbols-outlined text-4xl mb-2 opacity-20">history_edu</span>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Aucun avertissement enregistré</p>
                     </div>
                   )}
                 </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BehaviorScorecard;
