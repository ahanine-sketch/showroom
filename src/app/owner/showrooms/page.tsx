'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

const showroomsData = [
  {
    id: 'casablanca',
    name: 'Showroom Casablanca',
    address: 'Angle Boulevard Zerktouni & Rue Al Araar, Casablanca',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2670&auto=format&fit=crop',
    activeCommercials: 12,
    performance: '94%',
    status: 'Ouvert',
    manager: {
      name: 'Nabil Chraibi',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2574&auto=format&fit=crop'
    }
  },
  {
    id: 'marrakech',
    name: 'Showroom Marrakech',
    address: 'Avenue Mohammed VI, Hivernage, Marrakech',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2574&auto=format&fit=crop',
    activeCommercials: 8,
    performance: '88%',
    status: 'Ouvert',
    manager: {
      name: 'Zineb Amrani',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop'
    }
  },
  {
    id: 'rabat',
    name: 'Showroom Rabat',
    address: 'Avenue de la Victoire, Rabat',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop',
    activeCommercials: 10,
    performance: '91%',
    status: 'Ouvert',
    manager: {
      name: 'Yassine Berrada',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop'
    }
  },
  {
    id: 'tanger',
    name: 'Showroom Tanger',
    address: 'Place des Nations, Tanger',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2664&auto=format&fit=crop',
    activeCommercials: 6,
    performance: '85%',
    status: 'Fermé (Inventaire)',
    manager: {
      name: 'Sofia Alami',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2574&auto=format&fit=crop'
    }
  }
];

export default function Page() {
  const [search, setSearch] = useState('');
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit' | null>(null);

  const filteredShowrooms = useMemo(() => {
    return showroomsData.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.address.toLowerCase().includes(search.toLowerCase()) ||
      s.manager.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <>
      <div className="p-12 space-y-10 max-w-[1400px] mx-auto min-h-screen">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-[12px] font-mono uppercase tracking-[0.3em] text-yellow-600 font-bold mb-3">Gestion de Réseau</h2>
            <h1 className="font-headline text-5xl italic tracking-tight text-stone-900 leading-tight">Nos Showrooms</h1>
          </div>

          <div className="flex flex-col items-end gap-6">
            <div className="flex items-center gap-4">
              <div className="relative w-80 group">
                 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-[20px] group-focus-within:text-yellow-600 transition-colors">search</span>
                 <input 
                   type="text"
                   placeholder="Rechercher par ville, responsable..."
                   className="w-full bg-white border border-stone-100 rounded-2xl pl-12 pr-4 py-3.5 text-[13px] shadow-sm focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 outline-none transition-all placeholder:text-stone-300 font-serif italic"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
              <button 
                onClick={() => setDrawerMode('add')}
                className="px-6 py-3.5 bg-stone-900 text-white rounded-2xl text-[13px] font-bold tracking-wide hover:bg-stone-800 transition-colors shadow-lg flex items-center gap-2 group"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">add</span>
                AJOUTER SHOWROOM
              </button>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-stone-50 border border-stone-100 rounded-xl px-6 py-3 flex flex-col items-end shadow-sm">
                <span className="text-[10px] text-stone-400 uppercase font-mono font-bold">Total Showrooms</span>
                <span className="text-2xl font-mono font-bold text-stone-900">04</span>
              </div>
              <div className="bg-stone-50 border border-stone-100 rounded-xl px-6 py-3 flex flex-col items-end shadow-sm">
                <span className="text-[10px] text-stone-400 uppercase font-mono font-bold">Performance Réseau</span>
                <span className="text-2xl font-mono font-bold text-emerald-600">91.5%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {filteredShowrooms.map((showroom) => (
            <Link key={showroom.id} href={`/owner/showrooms/${showroom.id}`}>
              <div className="group relative bg-white rounded-[2.5rem] border border-stone-100 overflow-hidden shadow-sm hover:shadow-2xl hover:border-yellow-200 transition-all duration-1000 cursor-pointer h-[460px]">
                {/* Background with subtle parallax-ready overlay */}
                <div className="absolute inset-0 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000">
                  <img 
                    src={showroom.image} 
                    alt={showroom.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 translate-y-[10%] group-hover:translate-y-0 transition-transform duration-1000"></div>
                </div>
                
                <div className="absolute top-8 right-8">
                  <div className={`px-4 py-1.5 rounded-full backdrop-blur-xl border text-[10px] font-bold uppercase tracking-widest font-mono shadow-xl ${
                    showroom.status === 'Ouvert' 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-stone-500/10 border-stone-400/30 text-stone-300'
                  }`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${showroom.status === 'Ouvert' ? 'bg-emerald-500' : 'bg-stone-400'}`}></span>
                    {showroom.status}
                  </div>
                </div>

                <div className="absolute bottom-10 left-10 right-10 text-white z-10 space-y-6">
                  <div>
                    <h3 className="font-headline text-4xl mb-2 group-hover:text-yellow-400 transition-colors duration-500 italic">{showroom.name}</h3>
                    <p className="text-[14px] text-white/50 font-light max-w-[80%] line-clamp-1">{showroom.address}</p>
                  </div>
                  
                  <div className="flex items-end justify-between pt-8 border-t border-white/10">
                    <div className="flex items-center gap-10">
                      {/* Responsable Section */}
                      <div className="flex flex-col space-y-2">
                         <span className="text-[9px] uppercase font-mono text-white/40 font-bold tracking-[0.2em]">Responsable</span>
                         <div className="flex items-center gap-3">
                            <div className="relative">
                               <div className="absolute inset-0 bg-white/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                               <img src={showroom.manager.avatar} className="w-10 h-10 rounded-full object-cover border border-white/20 relative z-10" alt={showroom.manager.name} />
                            </div>
                            <span className="text-[14px] font-medium text-white/90 group-hover:text-white transition-colors">{showroom.manager.name}</span>
                         </div>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <span className="text-[9px] uppercase font-mono text-white/40 font-bold tracking-[0.2em]">Commerciaux</span>
                        <span className="text-2xl font-mono font-bold flex items-baseline gap-2">
                           {showroom.activeCommercials}
                           <span className="text-[10px] font-light italic text-white/40">Actifs</span>
                        </span>
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        <span className="text-[9px] uppercase font-mono text-white/40 font-bold tracking-[0.2em]">Performance</span>
                        <span className="text-2xl font-mono font-bold text-yellow-500">{showroom.performance}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <button 
                         onClick={(e) => { e.preventDefault(); setDrawerMode('edit'); }} 
                         className="px-5 py-2.5 rounded-full border border-white/30 text-white/90 text-[10px] uppercase tracking-widest font-bold hover:bg-white/20 hover:text-white transition-all backdrop-blur-md z-20"
                       >
                         Modifier
                       </button>
                       <div className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-yellow-600 group-hover:border-yellow-500 transition-all duration-500 shadow-2xl z-20">
                         <span className="material-symbols-outlined text-white text-[24px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredShowrooms.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
             <span className="material-symbols-outlined text-[64px] text-stone-200 mb-4 font-light">home_pin</span>
             <h3 className="font-headline text-2xl text-stone-400">Aucun showroom trouvé pour "{search}"</h3>
             <p className="text-stone-300 text-[13px] mt-2 italic font-serif">Essayez de rechercher par ville. (Ex: Casablanca, Tanger...)</p>
          </div>
        )}
      </div>

      {/* --- Overlay & Drawer --- */}
      {/* Overlay */}
      {drawerMode !== null && (
        <div 
          className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-500 opacity-100"
          onClick={() => setDrawerMode(null)}
        ></div>
      )}

      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${
          drawerMode !== null ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div>
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold mb-1">
              {drawerMode === 'edit' ? 'Modifier Site' : 'Nouveau Site'}
            </h2>
            <h3 className="font-headline text-3xl italic tracking-tight text-stone-900">
              {drawerMode === 'edit' ? 'Modifier Showroom' : 'Ajouter Showroom'}
            </h3>
          </div>
          <button 
            onClick={() => setDrawerMode(null)}
            className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Drawer Body - Form Fields */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
          
          {/* Image Upload Zone */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Photo de Couverture</label>
            <div className="w-full h-32 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50 flex flex-col items-center justify-center text-stone-400 hover:bg-stone-100 hover:border-yellow-500 hover:text-yellow-600 transition-colors cursor-pointer group">
               <span className="material-symbols-outlined text-[28px] mb-2 group-hover:scale-110 transition-transform">add_photo_alternate</span>
               <span className="text-[12px] font-medium font-sans text-stone-600 group-hover:text-yellow-700">Glissez-déposez ou parcourez</span>
               <span className="text-[10px] italic font-serif mt-0.5 opacity-70">JPG, PNG (Max 5MB)</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Nom du Showroom</label>
            <input 
              type="text" 
              placeholder="Ex: Showroom Agadir" 
              className="w-full border border-stone-200 rounded-xl px-4 py-3.5 text-[14px] font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-colors placeholder:font-serif placeholder:italic placeholder:text-stone-300 placeholder:font-normal"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Administrateur / Manager</label>
            <div className="relative">
              <select className="w-full appearance-none border border-stone-200 rounded-xl px-4 py-3.5 text-[14px] font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-colors bg-white">
                <option value="">Sélectionner un responsable...</option>
                <option value="1">Ahmed Alami</option>
                <option value="2">Nadia Tazi</option>
                <option value="3">Youssef Benali</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="material-symbols-outlined text-stone-400 text-[20px]">keyboard_arrow_down</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-end">
               <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Commerciaux (Utilisateurs)</label>
               <span className="text-[10px] text-stone-400 font-mono">Optionnel</span>
            </div>
            
            <div className="p-4 border border-stone-200 rounded-xl bg-stone-50/50 space-y-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">search</span>
                <input 
                  type="text" 
                  placeholder="Rechercher des commerciaux..." 
                  className="w-full bg-white border border-stone-200 rounded-lg pl-10 pr-3 py-2 text-[13px] focus:outline-none focus:border-yellow-600 transition-colors"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {/* Mock Tag 1 */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-lg shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-stone-200 flex-shrink-0 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop" alt="avatar" />
                  </div>
                  <span className="text-[12px] font-medium text-stone-700">Othmane Benjelloun</span>
                  <button className="text-stone-400 hover:text-red-500 ml-1"><span className="material-symbols-outlined text-[14px]">close</span></button>
                </div>
                {/* Mock Tag 2 */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-lg shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-stone-200 flex-shrink-0 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="avatar" />
                  </div>
                  <span className="text-[12px] font-medium text-stone-700">Sara Chraibi</span>
                  <button className="text-stone-400 hover:text-red-500 ml-1"><span className="material-symbols-outlined text-[14px]">close</span></button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Objectif CA Global (Mensuel)</label>
            <div className="relative">
               <input 
                 type="text" 
                 placeholder="ex: 1 500 000" 
                 className="w-full border border-stone-200 rounded-xl pl-4 pr-16 py-3.5 text-[18px] font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-colors"
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 <div className="w-px h-6 bg-stone-200"></div>
                 <span className="text-[13px] font-bold text-stone-400">MAD</span>
               </div>
            </div>
            <p className="text-[10px] text-stone-400 leading-relaxed mt-2 border-l-2 border-yellow-500 pl-3">
              Note: Le paramétrage détaillé des KPIs, scores maximum, et limites (Rattrapage, Behaviors, etc.) se gère indépendamment dans <span className="font-semibold text-stone-500">Paramètres &gt; Configuration Score</span> pour séparer la gestion RH de la gestion Financière.
            </p>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-stone-100 bg-stone-50 flex gap-3">
          <button 
            onClick={() => setDrawerMode(null)}
            className="flex-1 py-3.5 px-4 rounded-xl border border-stone-200 bg-white text-stone-600 font-bold text-[13px] hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={() => setDrawerMode(null)}
            className="flex-[2] py-3.5 px-4 rounded-xl bg-stone-900 text-white font-bold text-[13px] shadow-lg hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/20 transition-colors flex justify-center items-center gap-2 group"
          >
            <span>{drawerMode === 'edit' ? 'Sauvegarder' : 'Créer le Showroom'}</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
               {drawerMode === 'edit' ? 'check' : 'arrow_forward'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
