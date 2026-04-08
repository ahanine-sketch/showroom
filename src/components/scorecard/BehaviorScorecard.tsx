import React from 'react';
import ProfileHeader from './ProfileHeader';
import ScoreBadge from './ScoreBadge';

interface ScorecardProps {
  role: 'admin' | 'owner';
  activeTab: 'commercial' | 'behavior' | 'calendar' | 'ressources';
}

const BehaviorScorecard = ({ role, activeTab }: ScorecardProps) => {
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
          className={`py-4 border-b-2 text-[14px] ${activeTab === 'ressources' ? 'border-yellow-700 text-yellow-700 font-medium' : 'border-transparent text-stone-400 hover:text-stone-900 transition-colors'}`} 
          href={`${basePath}/ressources`}
        >
          Ressources
        </a>
      </nav>

      <div className="p-12 space-y-6 max-w-[1400px] mx-auto">
        <ProfileHeader role={role} />

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
                <ScoreBadge score={4} max={10} status="MOYEN" />
              </div>

              <div className="flex gap-6 mb-10 px-2">
                <div className="flex-1 bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl flex items-center justify-between transition-all hover:bg-emerald-50">
                  <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest leading-none">Avis Positifs</span>
                  <span className="font-mono text-3xl font-black text-emerald-600 leading-none">0</span>
                </div>
                <div className="flex-1 bg-rose-50/50 border border-rose-100 p-6 rounded-2xl flex items-center justify-between transition-all hover:bg-rose-50">
                  <span className="text-[11px] font-black text-rose-700 uppercase tracking-widest leading-none">Avis Négatifs</span>
                  <span className="font-mono text-3xl font-black text-rose-600 leading-none">0</span>
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
                <ScoreBadge score={0} max={10} status="MAUVAIS" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 px-2">
                 <div className="p-6 bg-stone-50 border border-stone-100 rounded-2xl flex flex-col items-center transition-all hover:bg-white hover:shadow-sm">
                    <span className="text-[11px] text-stone-400 uppercase tracking-widest font-black mb-2 opacity-60">Tickets</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[28px] font-mono font-black text-stone-900 leading-none">02</span>
                       <span className="material-symbols-outlined text-[20px] text-stone-300">hourglass_top</span>
                    </div>
                 </div>

                 <div className="p-6 bg-red-50/50 border border-red-100 rounded-2xl flex flex-col items-center transition-all hover:bg-red-50 hover:shadow-sm">
                    <span className="text-[11px] text-red-700 font-black uppercase tracking-widest mb-2">Plaintes</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[28px] font-mono font-black text-red-600 leading-none">01</span>
                       <span className="material-symbols-outlined text-[20px] text-red-400">report</span>
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
                <ScoreBadge score={4} max={10} status="MOYEN" />
              </div>
              
              <div className="space-y-8 px-2">
                 {(role === 'owner' || role === 'admin') && (
                   <div className="p-6 bg-stone-50 border border-stone-100 rounded-2xl space-y-6 shadow-inner">
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-3">
                       <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                       Donner un avertisment
                     </p>
                     
                     <div className="grid grid-cols-1 gap-4">
                       <select className="w-full appearance-none border border-stone-200 rounded-xl px-5 py-3.5 text-[13px] font-bold text-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-100 bg-white shadow-sm">
                         <option>Avertissement Process</option>
                         <option>Manquement Mise en place</option>
                         <option>Erreur Données Client</option>
                         <option>Retard Ouverture</option>
                       </select>
                       
                       <input 
                         type="number" 
                         placeholder="Malus (ex: -3)" 
                         className="w-full border border-stone-200 rounded-xl px-5 py-3.5 text-[13px] font-bold text-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-100 shadow-sm"
                         max="0"
                         min="-10"
                       />
                     </div>
                     <textarea 
                       placeholder="Commentaire..."
                       rows={3}
                       className="w-full border border-stone-200 rounded-xl px-5 py-3.5 text-[13px] font-bold text-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-100 shadow-sm"
                     ></textarea>
                     <button className="w-full py-4 bg-stone-900 text-white rounded-xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-lg active:scale-95">
                       Valider Notif
                     </button>
                   </div>
                 )}
 
                 <div className="space-y-4">
                   {[
                     { icon: "verified_user", title: "Mise en place", pts: "-3" },
                     { icon: "person_pin_circle", title: "Données Client", pts: "-3" }
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between p-5 border border-stone-100 bg-stone-50/50 rounded-2xl transition-all hover:bg-stone-50 hover:pl-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                             <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                           </div>
                           <h5 className="text-[14px] font-black text-stone-800">{item.title}</h5>
                        </div>
                        <span className="text-orange-600 font-mono text-[13px] font-black">{item.pts} pts</span>
                     </div>
                   ))}
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
