import React from 'react';
import ProfileHeader from './ProfileHeader';

interface ScorecardProps {
  role: 'admin' | 'owner';
  activeTab: 'commercial' | 'behavior' | 'calendar' | 'ressources';
  hideNav?: boolean;
  isDashboard?: boolean;
  userData?: any;
  scores?: any;
}

const RessourcesScorecard = ({ role, activeTab, hideNav, isDashboard, userData, scores }: ScorecardProps) => {
  const basePath = `/${role}/scorecard`;

  return (
    <>
      <div className={`${isDashboard ? 'py-6 px-2' : 'p-12'} space-y-10 max-w-[1400px] mx-auto`}>
        <ProfileHeader 
          role={role} 
          user={userData}
          scores={scores}
        />
        <div className="flex justify-end -mb-4">
          {(role === 'owner' || role === 'admin') && (
             <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl active:scale-95 group border border-emerald-500/50">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Ajouter un document
             </button>
          )}
        </div>

        <div className="grid grid-cols-12 gap-10">
          {/* Left Column - Documents */}
          <div className="col-span-8 space-y-10">
            {/* Fiche de Poste */}
            <section className="bg-white p-10 rounded-3xl border border-stone-200/60 shadow-sm relative pt-24 transition-all hover:shadow-md">
              <div className="absolute top-8 left-10 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center text-stone-600 shadow-sm shadow-stone-100">
                   <span className="material-symbols-outlined text-[24px]">badge</span>
                 </div>
                 <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">Fiche de Poste</h4>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between group transition-all hover:border-emerald-200">
                 <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                     <span className="material-symbols-outlined font-bold">picture_as_pdf</span>
                   </div>
                   <div>
                     <h5 className="text-[15px] font-bold text-stone-900 leading-none">Commercial Indépendant - Contrat SIQ</h5>
                     <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest mt-2">{userData?.fullName || 'Utilisateur'} • 1.2 MB</p>
                   </div>
                 </div>
                 <button className="w-12 h-12 rounded-full border border-stone-100 flex flex-shrink-0 items-center justify-center text-stone-400 group-hover:text-amber-600 group-hover:border-amber-200 group-hover:bg-amber-50 transition-all">
                   <span className="material-symbols-outlined text-[20px]">download</span>
                 </button>
              </div>
            </section>

            {/* Processus */}
            <section className="bg-white p-10 rounded-3xl border border-stone-200/60 shadow-sm relative pt-24 transition-all hover:shadow-md">
              <div className="absolute top-8 left-10 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center text-stone-600 shadow-sm shadow-stone-100">
                   <span className="material-symbols-outlined text-[24px]">account_tree</span>
                 </div>
                 <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">Processus & Ventes</h4>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-2xl border border-stone-50 shadow-sm flex flex-col gap-6 group transition-all hover:border-blue-200 hover:bg-blue-50/10">
                   <div className="flex items-start justify-between">
                     <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                       <span className="material-symbols-outlined text-[20px]">description</span>
                     </div>
                     <button className="text-stone-300 group-hover:text-blue-600 transition-colors">
                       <span className="material-symbols-outlined text-[20px]">download</span>
                     </button>
                   </div>
                   <div>
                     <h5 className="text-[14px] font-bold text-stone-900 leading-tight">Process. de Commande</h5>
                     <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest mt-2">Signature & facturation</p>
                   </div>
                 </div>
                 
                 <div className="bg-white p-6 rounded-2xl border border-stone-50 shadow-sm flex flex-col gap-6 group transition-all hover:border-emerald-200 hover:bg-emerald-50/10">
                   <div className="flex items-start justify-between">
                     <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                       <span className="material-symbols-outlined text-[20px]">movie</span>
                     </div>
                     <button className="text-stone-300 group-hover:text-emerald-600 transition-colors">
                       <span className="material-symbols-outlined text-[20px]">play_circle</span>
                     </button>
                   </div>
                   <div>
                     <h5 className="text-[14px] font-bold text-stone-900 leading-tight">Demo Produit 2025</h5>
                     <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest mt-2">Webinar d'Onboarding</p>
                   </div>
                 </div>
              </div>
            </section>

            {/* Autres Documents */}
            <section className="bg-white p-10 rounded-3xl border border-stone-200/60 shadow-sm relative pt-24 transition-all hover:shadow-md">
              <div className="absolute top-8 left-10 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center text-stone-600 shadow-sm shadow-stone-100">
                   <span className="material-symbols-outlined text-[24px]">folder_open</span>
                 </div>
                 <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">Autres Documents</h4>
              </div>
              <div className="bg-white rounded-2xl border border-stone-50 shadow-sm overflow-hidden divide-y divide-stone-50">
                 <div className="p-5 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-stone-300 group-hover:text-stone-900 transition-colors">text_snippet</span>
                      <span className="text-[13px] font-bold text-stone-700 group-hover:text-stone-900 transition-colors">Charte du Showroom</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover:text-stone-900 transition-colors">chevron_right</span>
                 </div>
                 <div className="p-5 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-stone-300 group-hover:text-stone-900 transition-colors">text_snippet</span>
                      <span className="text-[13px] font-bold text-stone-700 group-hover:text-stone-900 transition-colors">Formulaire SAV & Litiges</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover:text-stone-900 transition-colors">chevron_right</span>
                 </div>
              </div>
            </section>
          </div>

          {/* Right Column - Formations */}
          <div className="col-span-4 space-y-10">
            <div className="bg-white border border-stone-200/60 rounded-[32px] p-10 shadow-sm relative overflow-hidden transition-all hover:shadow-md h-full">
               <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-10 pb-8 border-b border-stone-50">
                   <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shadow-sm">
                     <span className="material-symbols-outlined text-[24px] text-amber-600">school</span>
                   </div>
                   <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">Formations</h4>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-stone-50/50 border border-stone-100 p-6 rounded-[24px] transition-all hover:bg-white hover:shadow-md group">
                      <div className="flex justify-between items-start mb-4">
                         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">En cours</span>
                         <span className="text-[11px] font-black text-stone-900 font-mono tracking-tighter">35%</span>
                      </div>
                      <h5 className="text-[15px] font-black mb-6 line-clamp-2 leading-tight text-stone-900 transition-colors group-hover:text-emerald-700">Masterclass Closing Objections Clients</h5>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-emerald-500 w-[35%] rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                      </div>
                    </div>

                    <div className="bg-stone-50/30 border border-stone-100 p-6 rounded-[24px] opacity-60">
                      <div className="flex justify-between items-start mb-4">
                         <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 bg-stone-100 px-3 py-1 rounded-full">Prochainement</span>
                         <span className="material-symbols-outlined text-[18px] text-stone-200">lock</span>
                      </div>
                      <h5 className="text-[14px] font-bold line-clamp-2 leading-tight text-stone-500">Expertise Matières: Marbres et Céramiques</h5>
                    </div>
                 </div>
                 
                 <button className="w-full mt-12 py-4 bg-stone-900 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.25em] hover:bg-stone-800 transition-all shadow-xl active:scale-95">
                   Accéder au LMS
                 </button>
               </div>
               
               <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-amber-50/30 rounded-full blur-3xl -z-0"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RessourcesScorecard;
