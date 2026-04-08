import React from 'react';
import Link from 'next/link';

const commercials = [
  {
    id: 'youssef-benali',
    name: 'Youssef Benali',
    role: 'Senior Sales Advisor',
    performance: '92%',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop',
    status: 'En poste',
    lastUpdate: 'Aujourd\'hui, 14:30'
  },
  {
    id: 'sophie-berger',
    name: 'Sophie Berger',
    role: 'Sales Specialist',
    performance: '88%',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop',
    status: 'En poste',
    lastUpdate: 'Hier, 17:15'
  },
  {
    id: 'amine-tazi',
    name: 'Amine Tazi',
    role: 'Junior Sales Executive',
    performance: '74%',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop',
    status: 'Formation',
    lastUpdate: 'Lundi, 09:00'
  },
  {
    id: 'leila-hassan',
    name: 'Leila Hassan',
    role: 'Senior Sales Advisor',
    performance: '95%',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2574&auto=format&fit=crop',
    status: 'En poste',
    lastUpdate: 'Aujourd\'hui, 11:20'
  }
];

export default function Page({ params }: { params: { id: string } }) {
  const showroomName = params.id.charAt(0).toUpperCase() + params.id.slice(1);

  return (
    <div className="p-12 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/owner/showrooms">
          <button className="p-3 rounded-full border border-stone-100 bg-white hover:bg-stone-50 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        </Link>
        <div>
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-stone-400 font-bold">Réseau {showroomName}</h2>
          <h1 className="font-headline text-4xl italic tracking-tight">Showroom {showroomName}</h1>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Showroom Overview */}
        <div className="col-span-4 space-y-6">
           <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-visible p-10 flex flex-col items-center justify-center relative">
            
            {/* Gauge Graphic */}
            <div className="relative w-72 h-36 mt-8 overflow-visible flex flex-col items-center justify-end mb-8">
              {/* SVG Arcs */}
              <svg viewBox="0 0 200 100" className="w-full h-full absolute top-0 left-0 overflow-visible drop-shadow-sm">
                {/* Red Arch */}
                <path d="M 20 100 A 80 80 0 0 1 95 21" fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="butt" />
                {/* Yellow Arch */}
                <path d="M 100 20 A 80 80 0 0 1 145 35" fill="none" stroke="#eab308" strokeWidth="16" strokeLinecap="butt" />
                {/* Green Arch */}
                <path d="M 152 42 A 80 80 0 0 1 180 100" fill="none" stroke="#22c55e" strokeWidth="16" strokeLinecap="butt" />
                
                {/* Needle */}
                <g className="origin-[100px_100px] transition-transform duration-1000 ease-out" style={{ transform: 'rotate(45deg)' }}>
                  <polygon points="100,105 105,100 150,25" fill="rgba(0,0,0,0.1)" className="blur-md" />
                  <polygon points="98,102 102,98 150,20" fill="#292524" />
                  <circle cx="100" cy="100" r="12" fill="#292524" />
                  <circle cx="100" cy="100" r="5" fill="#ffffff" />
                </g>
              </svg>
              
              <div className="absolute -bottom-8 left-4 right-4 flex justify-between px-2 text-stone-400 font-bold text-[16px] tracking-widest font-mono">
                <span>0</span>
                <span>30</span>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-yellow-600 mt-6 mb-12 tracking-tight font-headline">Likely</h2>
            
            {/* Legends */}
            <div className="w-full flex justify-between border-t border-stone-100 pt-8 px-2">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-1.5 rounded-full bg-red-500"></div>
                <span className="text-[11px] uppercase font-bold tracking-widest text-stone-400">Cons.</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]"></div>
                <span className="text-[11px] uppercase font-bold tracking-widest text-stone-900">Likely</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-1.5 rounded-full bg-green-500"></div>
                <span className="text-[11px] uppercase font-bold tracking-widest text-stone-400">Exceed</span>
              </div>
            </div>

            {/* Financial Overview restored */}
            <div className="w-full mt-10 space-y-1 pt-6 border-t border-stone-100">
               <div className="flex justify-between items-center py-3">
                  <span className="text-[11px] text-stone-400 font-bold uppercase tracking-widest">Objectif CA</span>
                  <span className="font-mono font-bold text-stone-900 italic text-[14px]">2.5M MAD</span>
               </div>
               <div className="flex justify-between items-center py-3 border-t border-stone-50">
                  <span className="text-[11px] text-stone-400 font-bold uppercase tracking-widest">CA Mensuel</span>
                  <span className="font-mono font-bold text-[14px]">1.2M MAD</span>
               </div>
               <div className="flex justify-between items-center py-3 border-t border-stone-50">
                  <span className="text-[11px] text-stone-400 font-bold uppercase tracking-widest">Performance</span>
                  <span className="font-mono font-bold text-yellow-600 text-[14px]">92.4%</span>
               </div>
            </div>
               
          </div>
        </div>

        {/* Right Column: Commercials List */}
        <div className="col-span-8 bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-headline text-3xl">Force de Vente</h3>
            <div className="flex bg-stone-50 border border-stone-100 p-1 rounded-xl">
               <button className="px-5 py-2 bg-white rounded-lg shadow-sm border border-stone-100 text-[12px] font-bold text-stone-900 uppercase tracking-tighter">Performance</button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {commercials.map((commercial) => (
              <Link key={commercial.id} href="/owner/scorecard/commercial">
                <div className="group flex items-center justify-between p-6 rounded-2xl border border-stone-50 hover:border-yellow-200 hover:bg-yellow-50/20 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img alt={commercial.name} src={commercial.avatar} className="w-16 h-16 rounded-2xl object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                    </div>
                    <div>
                      <h4 className="font-headline text-2xl group-hover:text-yellow-800 transition-colors">{commercial.name}</h4>
                      <p className="text-[12px] text-stone-400 font-mono italic">{commercial.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-right">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-mono text-stone-400 font-bold">Performance</span>
                      <span className={`text-[20px] font-mono font-bold ${parseFloat(commercial.performance) > 90 ? 'text-emerald-600' : 'text-yellow-700'}`}>
                        {commercial.performance}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-yellow-600 group-hover:text-white transition-all duration-300">
                      <span className="material-symbols-outlined text-[18px]">analytics</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 p-6 border-t border-stone-100 flex items-center justify-center">
             <button className="text-[12px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2">
               Voir les 8 autres commerciaux
               <span className="material-symbols-outlined text-[16px]">expand_more</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
