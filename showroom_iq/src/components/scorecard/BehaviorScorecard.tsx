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
  evaluations?: any[];
  onRefresh?: () => Promise<void>;
  viewMonth?: number;
  viewYear?: number;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}


const BehaviorScorecard = ({ role, activeTab, hideNav, isDashboard, userData, scores, evaluations, onRefresh }: ScorecardProps) => {
  const basePath = `/${role}/scorecard`;
  const isMagasin = scores?.isMagasin;
  
  // For magasin: evaluations are linked to the showroom itself
  const targetId = userData?.id;
  
  const details = scores?.details;
  const metrics = details?.metrics;
  const setters = details?.setters;


  // --- FILTERS ---
  const avisEvaluations = evaluations?.filter(e => e.type === 'AVIS') || [];
  const savEvaluations = evaluations?.filter(e => e.type === 'SAV') || [];
  const processusEvaluations = evaluations?.filter(e => e.type === 'PROCESS') || [];

  // Calculate Avis Counts from evaluations
  const positiveAvisCount = avisEvaluations.filter(e => e.plusAvis === 1).length;
  const negativeAvisCount = avisEvaluations.filter(e => e.minusAvis === 1).length;

  const allPossibleWarnings = ['Avertissement 1', 'Avertissement 2', 'Avertissement 3'];
  const existingWarnings = processusEvaluations.map((w: any) => {
    try {
      if (w.notes && w.notes.startsWith('{')) {
        return JSON.parse(w.notes).title;
      }
    } catch (e) {}
    return w.notes;
  }) || []; 
  const availableWarnings = allPossibleWarnings.filter(w => !existingWarnings.includes(w));

  const [malusType, setMalusType] = React.useState('');
  const [malusComment, setMalusComment] = React.useState('');

  // Avis Form State
  const [showAvisForm, setShowAvisForm] = React.useState(false);
  const [newAvisName, setNewAvisName] = React.useState('');
  const [newAvisRating, setNewAvisRating] = React.useState(5);
  const [newAvisComment, setNewAvisComment] = React.useState('');

  // SAV Form State
  const [showSavForm, setShowSavForm] = React.useState(false);
  const [savType, setSavType] = React.useState<'TICKET' | 'COMPLAINTE'>('TICKET');
  const [savComment, setSavComment] = React.useState('');

  // Sync malusType with first available warning
  React.useEffect(() => {
    if (availableWarnings.length > 0 && !availableWarnings.includes(malusType)) {
      setMalusType(availableWarnings[0]);
    }
  }, [availableWarnings, malusType]);

  const handleAddMalus = async () => {
    if (malusComment && malusType && targetId) {
      try {
        const response = await fetch('http://localhost:3001/api/performance/evaluation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            userId: isMagasin ? null : targetId,
            showroomId: isMagasin ? targetId : null,
            type: 'PROCESS',
            warningLevel: malusType === 'Avertissement 1' ? 1 : malusType === 'Avertissement 2' ? 2 : 3,
            notes: JSON.stringify({ title: malusType, comment: malusComment }),
            date: new Date()
          })
        });
        
        if (response.ok) {
          setMalusComment('');
          if (onRefresh) await onRefresh();
        }
      } catch (error) {
        console.error('Error adding warning:', error);
      }
    }
  };

  const handleAddAvis = async () => {
    if (newAvisName && newAvisComment && targetId) {
      try {
        const response = await fetch('http://localhost:3001/api/performance/evaluation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            userId: isMagasin ? null : targetId,
            showroomId: isMagasin ? targetId : null,
            type: 'AVIS',
            plusAvis: newAvisRating >= 4 ? 1 : 0,
            minusAvis: newAvisRating <= 2 ? 1 : 0,
            notes: JSON.stringify({ name: newAvisName, rating: newAvisRating, comment: newAvisComment }),
            date: new Date()
          })
        });
        
        if (response.ok) {
          setNewAvisName('');
          setNewAvisComment('');
          setShowAvisForm(false);
          if (onRefresh) await onRefresh();
        }
      } catch (error) {
        console.error('Error adding avis:', error);
      }
    }
  };

  const handleAddSav = async () => {
    if (savComment && targetId) {
      try {
        const response = await fetch('http://localhost:3001/api/performance/evaluation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            userId: isMagasin ? null : targetId,
            showroomId: isMagasin ? targetId : null,
            type: 'SAV',
            ticketsCount: savType === 'TICKET' ? 1 : 0,
            complaintsCount: savType === 'COMPLAINTE' ? 1 : 0,
            notes: savComment,
            date: new Date()
          })
        });
        
        if (response.ok) {
          setSavComment('');
          setShowSavForm(false);
          if (onRefresh) await onRefresh();
        }
      } catch (error) {
        console.error('Error adding SAV:', error);
      }
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
                <ScoreBadge 
                  score={details?.avis?.points || 0} 
                  max={details?.avis?.maxScore || 10} 
                  status={details?.avis?.status || "MAUVAIS"} 
                  color={details?.avis?.statusColor}
                />
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10 px-2">
                <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl flex items-center justify-between transition-all hover:bg-emerald-50 group">
                  <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest leading-none">Avis Positifs</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-3xl font-black text-emerald-600 leading-none">{positiveAvisCount}</span>
                  </div>
                </div>
                <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-2xl flex items-center justify-between transition-all hover:bg-rose-50">
                  <span className="text-[11px] font-black text-rose-700 uppercase tracking-widest leading-none">Avis Négatifs</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-3xl font-black text-rose-600 leading-none">{negativeAvisCount}</span>
                  </div>
                </div>
              </div>

              {/* Review Form Toggle */}
              {(role === 'owner' || role === 'admin') && (
                <div className="px-2 mb-6">
                  {!showAvisForm ? (
                    <button 
                      onClick={() => setShowAvisForm(true)}
                      className="w-full py-4 border-2 border-dashed border-stone-200 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-600 hover:border-stone-400 transition-all flex items-center justify-center gap-2 group"
                    >
                      <span className="material-symbols-outlined text-[18px] group-hover:scale-125 transition-all">add_comment</span>
                      Enregistrer un avis client
                    </button>
                  ) : (
                    <div className="p-6 bg-stone-50 border border-stone-100 rounded-2xl space-y-4 shadow-inner animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex items-center justify-between">
                         <p className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Nouvel Avis</p>
                         <button onClick={() => setShowAvisForm(false)} className="text-stone-300 hover:text-stone-600 transition-all">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                         </button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Nom du client..."
                        value={newAvisName}
                        onChange={(e) => setNewAvisName(e.target.value)}
                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-[13px] font-bold text-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-100 bg-white"
                      />
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest">Note :</span>
                        <div className="flex text-amber-400 cursor-pointer">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span 
                              key={s} 
                              onClick={() => setNewAvisRating(s)}
                              className={`material-symbols-outlined text-[24px] ${s <= newAvisRating ? 'fill-1' : ''}`}
                              style={{ fontVariationSettings: `'FILL' ${s <= newAvisRating ? 1 : 0}` }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <textarea 
                        placeholder="Commentaire du client..."
                        value={newAvisComment}
                        onChange={(e) => setNewAvisComment(e.target.value)}
                        rows={2}
                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-[13px] font-bold text-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-100 bg-white"
                      ></textarea>
                      <button 
                        onClick={handleAddAvis}
                        className="w-full py-3 bg-amber-500 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-stone-900 transition-all shadow-md active:scale-98"
                      >
                        Valider l'avis
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-5 max-h-[480px] overflow-y-auto pr-3 custom-scrollbar px-2 flex-1">
                {avisEvaluations.length > 0 ? (
                  avisEvaluations.map((evalItem: any, i: number) => {
                    let parsedNotes = { name: "Client", rating: 5, comment: "" };
                    try {
                      parsedNotes = JSON.parse(evalItem.notes || '{}');
                    } catch (e) {
                      parsedNotes.comment = evalItem.notes || "";
                    }
                    
                    return (
                      <div key={i} className="p-5 bg-stone-50/50 rounded-2xl border border-stone-100 transition-all hover:bg-white hover:shadow-sm animate-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-[11px] font-black text-stone-600">
                               {parsedNotes.name?.[0] || 'C'}
                             </div>
                             <span className="font-bold text-[14px] text-stone-800 tracking-tight">{parsedNotes.name}</span>
                           </div>
                           <div className="flex text-amber-400 scale-90 origin-right">
                             {[...Array(5)].map((_, j) => (
                               <span key={j} className={`material-symbols-outlined text-[18px] ${j < parsedNotes.rating ? 'fill-1' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                             ))}
                           </div>
                        </div>
                        
                        <p className="text-[13px] text-stone-600 italic leading-relaxed px-1 mb-4">"{parsedNotes.comment}"</p>
                        
                        <div className="flex justify-end pt-3 border-t border-stone-100/50">
                           <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                             Reçu le {new Date(evalItem.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                           </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-stone-300 py-10 opacity-60">
                    <span className="material-symbols-outlined text-4xl mb-2">reviews</span>
                    <p className="text-[10px] font-black uppercase tracking-widest">Aucun avis récent</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-4 space-y-10">
            
            {/* Section: SAV */}
            <div className="bg-white p-10 rounded-2xl border border-stone-200/60 shadow-sm transition-all hover:shadow-md relative">
              <div className="absolute top-8 left-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">headset_mic</span>
                </div>
                <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">SAV</h4>
              </div>
              
              <div className="w-full h-16"></div> {/* Spacer for header */}

              <div className="flex justify-end items-center mb-8 px-2">
                <ScoreBadge 
                  score={details?.sav?.points || 0} 
                  max={details?.sav?.maxScore || 10} 
                  status={details?.sav?.status || "MAUVAIS"} 
                  color={details?.sav?.statusColor}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 px-2 mb-6">
                 <div className="p-6 bg-stone-50 border border-stone-100 rounded-2xl flex flex-col items-center transition-all hover:bg-white hover:shadow-sm group">
                    <span className="text-[11px] text-stone-400 uppercase tracking-widest font-black mb-2 opacity-60">Tickets</span>
                    <div className="flex items-center gap-2">
                       <span className="font-mono text-[28px] font-black text-stone-900 leading-none">{metrics?.savTickets || 0}</span>
                       <span className="material-symbols-outlined text-[20px] text-stone-300">confirmation_number</span>
                    </div>
                 </div>

                 <div className="p-6 bg-red-50/50 border border-red-100 rounded-2xl flex flex-col items-center transition-all hover:bg-red-50 hover:shadow-sm group">
                    <span className="text-[11px] text-red-700 font-black uppercase tracking-widest mb-2">Plaintes</span>
                    <div className="flex items-center gap-2">
                       <span className="font-mono text-[28px] font-black text-red-600 leading-none">{metrics?.savPlaintes || 0}</span>
                       <span className="material-symbols-outlined text-[20px] text-red-400">warning</span>
                    </div>
                 </div>
              </div>

              {(role === 'owner' || role === 'admin') && (
                <div className="px-2">
                  {!showSavForm ? (
                    <button 
                      onClick={() => setShowSavForm(true)}
                      className="w-full py-3 border-2 border-dashed border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-700 hover:border-red-300 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      Enregistrer un incident SAV
                    </button>
                  ) : (
                    <div className="p-5 bg-red-50/30 border border-red-100 rounded-2xl space-y-4 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between">
                        <select 
                          value={savType}
                          onChange={(e) => setSavType(e.target.value as any)}
                          className="bg-white border border-red-100 rounded-lg px-3 py-1.5 text-[11px] font-bold text-red-700 outline-none"
                        >
                          <option value="TICKET">Ticket simple</option>
                          <option value="COMPLAINTE">Plainte client</option>
                        </select>
                        <button onClick={() => setShowSavForm(false)} className="text-red-300 hover:text-red-600">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                      <textarea 
                        placeholder="Détails de l'incident..."
                        value={savComment}
                        onChange={(e) => setSavComment(e.target.value)}
                        rows={2}
                        className="w-full border border-red-100 rounded-xl px-4 py-2.5 text-[12px] font-bold text-stone-800 focus:outline-none focus:ring-4 focus:ring-red-50 bg-white"
                      ></textarea>
                      <button 
                        onClick={handleAddSav}
                        className="w-full py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-900 transition-all shadow-sm"
                      >
                        Valider l'enregistrement
                      </button>
                    </div>
                  )}
                </div>
              )}



            </div>

            {/* Section: Processus */}
            <div className="bg-white p-10 rounded-2xl border border-stone-200/60 shadow-sm transition-all hover:shadow-md relative">
              <div className="absolute top-8 left-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">storefront</span>
                </div>
                <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">{isMagasin ? 'Magasin' : 'Processus'}</h4>
              </div>
              
              <div className="w-full h-16"></div> {/* Spacer for header */}

              <div className="flex justify-end items-center mb-8 px-2">
                <ScoreBadge 
                  score={details?.processus?.points || 0} 
                  max={details?.processus?.maxScore || 10} 
                  status={details?.processus?.status || "MAUVAIS"} 
                  color={details?.processus?.statusColor}
                />
              </div>
              
              <div className="space-y-8 px-2">
                 {role === 'owner' && availableWarnings.length > 0 && (
                   <div className="p-6 bg-stone-50 border border-stone-100 rounded-2xl space-y-6 shadow-inner">
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-3">
                       <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                       {isMagasin ? "Note d'inspection / Contrôle" : "Émettre un avertissement"}
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
                    {processusEvaluations && processusEvaluations.length > 0 ? (
                      processusEvaluations.map((item: any, i: number) => {
                        let parsed = { title: item.notes || 'Avertissement', comment: '' };
                        try {
                          if (item.notes && item.notes.startsWith('{')) {
                            parsed = JSON.parse(item.notes);
                          }
                        } catch (e) {}

                        return (
                          <div key={i} className="flex items-center justify-between p-5 border border-stone-100 bg-stone-50/50 rounded-2xl transition-all hover:bg-stone-50 hover:pl-6 animate-in slide-in-from-right duration-500">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                                  <span className="material-symbols-outlined text-[20px]">report_problem</span>
                                </div>
                                 <div className="flex flex-col">
                                   <h5 className="text-[14px] font-black text-stone-800">{isMagasin && parsed.title.includes('Avertissement') ? parsed.title.replace('Avertissement', 'Observation') : parsed.title}</h5>
                                   {parsed.comment && <p className="text-[12px] text-stone-600 italic mt-1 font-medium">"{parsed.comment}"</p>}
                                   <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2">
                                     Le {new Date(item.date).toLocaleDateString('fr-FR')}
                                   </p>
                                 </div>
                              </div>
                              <span className="text-orange-600 font-mono text-[13px] font-black">
                                {item.warningLevel === 1 ? '-2 pts' : item.warningLevel === 2 ? '-4 pts' : '-4 pts'}
                              </span>
                          </div>
                        );
                      })
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
