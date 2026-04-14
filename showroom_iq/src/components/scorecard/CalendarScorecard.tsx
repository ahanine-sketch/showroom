import React from 'react';
import ProfileHeader from './ProfileHeader';
import ScoreBadge from './ScoreBadge';

interface ScorecardProps {
  role: 'admin' | 'owner';
  activeTab: 'commercial' | 'behavior' | 'calendar' | 'ressources';
  hideNav?: boolean;
  isDashboard?: boolean;
}

const CalendarScorecard = ({ role, activeTab, hideNav, isDashboard }: ScorecardProps) => {
  const basePath = `/${role}/scorecard`;

  return (
    <>


      <div className={`${isDashboard ? 'py-6 px-2' : 'p-12'} space-y-6 max-w-[1400px] mx-auto`}>
        <ProfileHeader role={role} />
        


        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-8 bg-white p-10 rounded-2xl border border-stone-200/60 shadow-sm relative pt-24">
            {/* Internal Title Header */}
            <div className="absolute top-8 left-10 flex flex-col items-start gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">calendar_today</span>
                </div>
                <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900 leading-none">Calendrier</h4>
              </div>
              
              <div className="flex items-center bg-stone-50 border border-stone-100 shadow-sm p-1.5 rounded-xl">
                <button className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <span className="px-5 py-0.5 text-[11px] font-black text-stone-900 font-mono tracking-tighter uppercase">Mars 2026</span>
                <button className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="w-full h-32"></div> {/* Increased gap for the two-line header */}

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="text-center text-[11px] font-bold text-stone-400 uppercase tracking-widest py-3">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              <div className="aspect-square opacity-20 bg-stone-50 rounded-xl border border-stone-50"></div>
              {[...Array(30)].map((_, i) => {
                const day = i + 1;
                const isSelected = day === 8;
                const hasLate = day === 1 || day === 8 || day === 15;
                const hasAbsence = day === 12;
                const hasPositiveNote = day === 3 || day === 22 || day === 25;
                const hasNegativeNote = day === 10 || day === 18;

                return (
                  <div key={day} className={`aspect-square p-2.5 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                    isSelected ? 'border-yellow-700 bg-yellow-50/50 shadow-md ring-1 ring-yellow-700' : 'border-stone-50 hover:border-stone-200 bg-white shadow-sm'
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className={`font-mono text-[14px] ${isSelected ? 'font-bold text-yellow-700' : 'text-stone-900 opacity-60 group-hover:opacity-100'}`}>
                        {day < 10 ? `0${day}` : day}
                      </span>
                      
                      {/* Note Indicators (+ / -) */}
                      <div className="flex flex-col gap-0.5">
                        {hasPositiveNote && (
                          <span className="text-[14px] font-black text-emerald-500 leading-none drop-shadow-sm">+</span>
                        )}
                        {hasNegativeNote && (
                          <span className="text-[14px] font-black text-rose-500 leading-none drop-shadow-sm">-</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 justify-end">
                      {hasLate && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>}
                      {hasAbsence && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 pt-8 border-t border-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-stone-400 font-bold">Retard</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-stone-400 font-bold">Absence</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-stone-400 font-bold">Congé</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-black text-sm">+</span>
                <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-stone-400 font-bold">Note Positive</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-rose-500 font-black text-sm">-</span>
                <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-stone-400 font-bold">Note Négative</span>
              </div>
            </div>

            {/* Manual Edit Panels for Admin & Owner */}
            {role === 'owner' && (
              <div className="mt-12 grid grid-cols-2 gap-6">
                {/* 1. Log de Présence */}
                <div className="bg-white p-7 rounded-3xl border border-stone-100 shadow-sm transition-all hover:shadow-md">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                      </div>
                      <h5 className="font-headline text-xl font-bold text-stone-900">Log de Présence</h5>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5 ml-1">Statut</label>
                          <select className="w-full appearance-none bg-stone-50 border border-stone-100 rounded-xl px-4 py-2.5 text-[13px] font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm">
                            <option>Présent</option>
                            <option>Retard</option>
                            <option>Absence</option>
                            <option>Congé</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-4 top-[34px] -translate-y-1/2 text-stone-400 pointer-events-none scale-75">keyboard_arrow_down</span>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5 ml-1">Date</label>
                          <input type="date" className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-[13px] font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm" />
                        </div>
                      </div>
                     
                     <div>
                       <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5 ml-1">Description / Motif</label>
                       <textarea placeholder="Justification ou commentaire..." rows={2} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2.5 text-[13px] font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm placeholder:text-stone-300"></textarea>
                     </div>
                     
                     <button className="w-full py-3 bg-stone-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                       Enregistrer Présence
                     </button>
                   </div>
                </div>

                {/* 2. Note Journalière */}
                <div className="bg-white p-7 rounded-3xl border border-stone-100 shadow-sm transition-all hover:shadow-md">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">edit_note</span>
                      </div>
                      <h5 className="font-headline text-xl font-bold text-stone-900">Note Journalière</h5>
                   </div>

                   <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-3">
                       <div className="relative">
                         <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5 ml-1">Type de Note</label>
                         <select className="w-full appearance-none bg-stone-50 border border-stone-100 rounded-xl px-4 py-2.5 text-[13px] font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-100 shadow-sm">
                           <option>Note Positive</option>
                           <option>Note Négative</option>
                         </select>
                         <span className="material-symbols-outlined absolute right-4 top-[34px] -translate-y-1/2 text-stone-400 pointer-events-none scale-75">keyboard_arrow_down</span>
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5 ml-1">Date</label>
                         <input type="date" className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-[13px] font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-100 shadow-sm" />
                       </div>
                     </div>

                     <div>
                       <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5 ml-1">Commentaire / Feedback</label>
                       <textarea placeholder="Donner du feedback précis..." rows={2} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2.5 text-[13px] font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-100 shadow-sm placeholder:text-stone-300"></textarea>
                     </div>

                     <button className="w-full py-3 bg-stone-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg active:scale-95">
                       Enregistrer la Note
                     </button>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-span-4">
            <div className="bg-white border border-stone-200/60 rounded-3xl p-8 shadow-sm text-stone-900 relative transition-all hover:shadow-md">
              <div className="w-full flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-stone-50 text-stone-400 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">analytics</span>
                </div>
                <h4 className="font-headline text-2xl font-bold tracking-tight leading-none uppercase">Overview</h4>
              </div>

              <div className="flex justify-end items-center mb-12 pb-6 border-b border-stone-50">
                <ScoreBadge score={1} max={5} status="MOYEN" />
              </div>
              
              <div className="space-y-4 relative z-10">
                 <div className="bg-stone-50/50 border border-stone-100 p-5 rounded-2xl transition-all duration-300">
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold block mb-2">Retards Cumulés</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-[32px] font-bold font-mono text-amber-500 tracking-tighter">00</span>
                      <span className="text-[10px] text-stone-300 uppercase font-mono tracking-widest">Fois</span>
                    </div>
                 </div>

                 <div className="bg-stone-50/50 border border-stone-100 p-5 rounded-2xl transition-all duration-300">
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold block mb-2 font-headline">Absences</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-[32px] font-bold font-mono text-red-500 tracking-tighter">02</span>
                      <span className="text-[10px] text-stone-300 uppercase font-mono tracking-widest">Jour</span>
                    </div>
                 </div>

                 <div className="bg-emerald-50/10 border border-emerald-100 p-5 rounded-2xl transition-all duration-300 border-l-4 border-l-emerald-500/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-emerald-600 uppercase tracking-widest font-extrabold block">Notes positives</span>
                      <span className="material-symbols-outlined text-[14px] text-emerald-500/50">add_reaction</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-[32px] font-bold font-mono text-emerald-600 tracking-tighter">03</span>
                      <span className="text-[10px] text-stone-300 uppercase font-mono tracking-widest">Entrées</span>
                    </div>
                 </div>

                 <div className="bg-rose-50/10 border border-rose-100 p-5 rounded-2xl transition-all duration-300 border-l-4 border-l-rose-500/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-rose-600 uppercase tracking-widest font-extrabold block">Notes négatives</span>
                      <span className="material-symbols-outlined text-[14px] text-rose-500/50">sentiment_neutral</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-[32px] font-bold font-mono text-rose-600 tracking-tighter">01</span>
                      <span className="text-[10px] text-stone-300 uppercase font-mono tracking-widest">Entrées</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Historique des Notes Qualitatives */}
            <div className="mt-8 bg-white border border-stone-200/60 rounded-3xl p-10 shadow-sm relative">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">history_edu</span>
                  </div>
                  <h4 className="font-headline text-2xl font-bold tracking-tight">Historique Notes</h4>
               </div>
               <div className="space-y-4">
                  {[
                    { date: '10 Avril', type: 'negative', text: 'Retard de 15min sans prévenir.' },
                    { date: '08 Avril', type: 'positive', text: 'Excellente gestion du client.' },
                    { date: '03 Avril', type: 'positive', text: 'Showroom très bien rangé.' },
                    { date: '01 Avril', type: 'positive', text: 'Vente additionnelle réussie.' }
                  ].map((note, idx) => (
                    <div key={idx} className="flex gap-4 p-4 border border-stone-50 rounded-2xl bg-stone-50/30 hover:bg-stone-50 transition-colors group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                        note.type === 'positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        <span className="font-bold text-[18px]">{note.type === 'positive' ? '+' : '-'}</span>
                      </div>
                      <div className="min-w-0">
                         <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">{note.date}</p>
                         <p className="text-[13px] font-medium text-stone-700 truncate group-hover:text-stone-900 transition-colors uppercase leading-tight font-headline">{note.text}</p>
                      </div>
                    </div>
                  ))}
               </div>
               
               <button className="w-full mt-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-950 transition-colors border-t border-stone-50 pt-6">
                 Voir tout l'historique
               </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarScorecard;
