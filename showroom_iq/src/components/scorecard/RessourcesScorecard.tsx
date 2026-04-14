import React from 'react';
import ProfileHeader from './ProfileHeader';

interface ScorecardProps {
  role: 'admin' | 'owner';
  activeTab: 'commercial' | 'behavior' | 'calendar' | 'ressources';
  hideNav?: boolean;
  isDashboard?: boolean;
  userData?: any;
}

const RessourcesScorecard = ({ role, activeTab, hideNav, isDashboard, userData }: ScorecardProps) => {
  const basePath = `/${role}/scorecard`;

  return (
    <>


      <div className={`${isDashboard ? 'py-6 px-2' : 'p-12'} space-y-6 max-w-[1400px] mx-auto`}>
        <ProfileHeader 
          role={role} 
          user={userData || {
            fullName: "...",
            phone: "...",
            seniority: "...",
            showroomName: "...",
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder`
          }}
        />
        <div className="flex justify-end mb-6">
          {(role === 'owner' || role === 'admin') && (
             <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl active:scale-95 group border border-emerald-500/50">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Ajouter un document
             </button>
          )}
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Documents */}
          <div className="col-span-8 space-y-8">
            {/* Fiche de Poste */}
            <section className="bg-white p-10 rounded-2xl border border-stone-200/60 shadow-sm relative pt-24 transition-all hover:shadow-md">
              <div className="absolute top-8 left-10 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 shadow-sm">
                   <span className="material-symbols-outlined text-[24px]">badge</span>
                 </div>
                 <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">Fiche de Poste</h4>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between group transition-all hover:border-yellow-200">
                 <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                     <span className="material-symbols-outlined font-bold">picture_as_pdf</span>
                   </div>
                   <div>
                     <h5 className="text-[15px] font-bold text-stone-900">Commercial Indépendant - Contrat SIQ</h5>
                     <p className="text-[12px] text-stone-500 font-mono mt-0.5">Mis à jour le 12 Jan 2024 • 1.2 MB</p>
                   </div>
                 </div>
                 <button className="w-10 h-10 rounded-full border border-stone-200 flex flex-shrink-0 items-center justify-center text-stone-400 group-hover:text-stone-900 group-hover:border-stone-400 transition-colors">
                   <span className="material-symbols-outlined text-[18px]">download</span>
                 </button>
              </div>
            </section>

            {/* Processus */}
            <section className="bg-white p-10 rounded-2xl border border-stone-200/60 shadow-sm relative pt-24 transition-all hover:shadow-md">
              <div className="absolute top-8 left-10 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 shadow-sm">
                   <span className="material-symbols-outlined text-[24px]">account_tree</span>
                 </div>
                 <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">Processus & Ventes</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-5 group transition-all hover:border-yellow-200">
                   <div className="flex items-start justify-between">
                     <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                       <span className="material-symbols-outlined text-[20px]">description</span>
                     </div>
                     <button className="text-stone-400 group-hover:text-stone-900 transition-colors">
                       <span className="material-symbols-outlined text-[20px]">download</span>
                     </button>
                   </div>
                   <div>
                     <h5 className="text-[14px] font-bold text-stone-900 leading-tight">Process. de Commande</h5>
                     <p className="text-[11px] text-stone-500 font-mono mt-1 w-full truncate">Signature & facturation client</p>
                   </div>
                 </div>
                 
                 <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-5 group transition-all hover:border-yellow-200">
                   <div className="flex items-start justify-between">
                     <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                       <span className="material-symbols-outlined text-[20px]">movie</span>
                     </div>
                     <button className="text-stone-400 group-hover:text-stone-900 transition-colors">
                       <span className="material-symbols-outlined text-[20px]">play_circle</span>
                     </button>
                   </div>
                   <div>
                     <h5 className="text-[14px] font-bold text-stone-900 leading-tight">Demo Produit 2025</h5>
                     <p className="text-[11px] text-stone-500 font-mono mt-1 w-full truncate">Webinar d'Onboarding (Vidéo)</p>
                   </div>
                 </div>
              </div>
            </section>

            {/* Autres Documents */}
            <section className="bg-white p-10 rounded-2xl border border-stone-200/60 shadow-sm relative pt-24 transition-all hover:shadow-md">
              <div className="absolute top-8 left-10 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 shadow-sm">
                   <span className="material-symbols-outlined text-[24px]">folder_open</span>
                 </div>
                 <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">Autres Documents</h4>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden divide-y divide-stone-50">
                 <div className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-stone-400">text_snippet</span>
                      <span className="text-[13px] font-medium text-stone-900">Charte du Showroom</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-stone-400">chevron_right</span>
                 </div>
                 <div className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-stone-400">text_snippet</span>
                      <span className="text-[13px] font-medium text-stone-900">Formulaire SAV & Litiges</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-stone-400">chevron_right</span>
                 </div>
              </div>
            </section>
          </div>

          {/* Right Column - Formations */}
          <div className="col-span-4 space-y-6">
            <div className="bg-white border border-stone-200/60 rounded-3xl p-10 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
               <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-10 pb-6 border-b border-stone-50">
                   <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shadow-sm">
                     <span className="material-symbols-outlined text-[24px] text-emerald-600">school</span>
                   </div>
                   <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">Formations</h4>
                 </div>

                 <div className="space-y-4">
                    <div className="bg-stone-50 border border-stone-100 p-5 rounded-xl transition-all hover:bg-stone-100/50">
                      <div className="flex justify-between items-start mb-3">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">En cours</span>
                         <span className="text-[11px] font-mono text-stone-400">35%</span>
                      </div>
                      <h5 className="text-[14px] font-bold mb-4 line-clamp-2 leading-tight text-stone-900">Masterclass Closing Objections Clients (Niveau Avancé)</h5>
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[35%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                      </div>
                    </div>

                    <div className="bg-stone-50 border border-stone-100 p-5 rounded-xl opacity-70">
                      <div className="flex justify-between items-start mb-3">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 w-fit">À venir</span>
                         <span className="material-symbols-outlined text-[16px] text-stone-300">lock</span>
                      </div>
                      <h5 className="text-[14px] font-bold line-clamp-2 leading-tight text-stone-600">Expertise Matières: Marbres et Céramiques</h5>
                    </div>
                 </div>
                 
                 <button className="w-full mt-8 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-[12px] font-bold uppercase tracking-widest text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-all active:scale-[0.98]">
                   Accéder au LMS
                 </button>
               </div>
               
               <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-emerald-50/50 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RessourcesScorecard;
