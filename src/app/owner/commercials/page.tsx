'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import UserSlideOver from '@/components/UserSlideOver';

interface Commercial {
  id: string;
  name: string;
  role: string;
  performance: string;
  avatar: string;
}

interface Manager {
  name: string;
  role: string;
  avatar: string;
}

interface ShowroomData {
  name: string;
  manager: Manager;
  commercials: Commercial[];
}

const showroomsData = [
  {
    name: 'Casablanca',
    manager: {
      name: 'Nabil Chraibi',
      role: 'Showroom Manager',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2574&auto=format&fit=crop'
    },
    commercials: [
      { id: 'youssef-benali', name: 'Youssef Benali', role: 'Senior Sales Advisor', performance: '92%', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop' },
      { id: 'sophie-berger', name: 'Sophie Berger', role: 'Sales Specialist', performance: '88%', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop' },
      { id: 'amine-tazi', name: 'Amine Tazi', role: 'Junior Executive', performance: '74%', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop' }
    ]
  },
  {
    name: 'Marrakech',
    manager: {
      name: 'Zineb Amrani',
      role: 'Showroom Manager',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop'
    },
    commercials: [
      { id: 'leila-hassan', name: 'Leila Hassan', role: 'Senior Advisor', performance: '95%', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2574&auto=format&fit=crop' },
      { id: 'omar-radi', name: 'Omar Radi', role: 'Sales Advisor', performance: '82%', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2574&auto=format&fit=crop' }
    ]
  },
  {
    name: 'Rabat',
    manager: {
      name: 'Yassine Berrada',
      role: 'Showroom Manager',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop'
    },
    commercials: [
      { id: 'anass-farih', name: 'Anass Farih', role: 'Showroom lead', performance: '91%', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2574&auto=format&fit=crop' },
      { id: 'nadia-mansouri', name: 'Nadia Mansouri', role: 'Sales Specialist', performance: '89%', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2574&auto=format&fit=crop' }
    ]
  },
  {
    name: 'Tanger',
    manager: {
      name: 'Sofia Alami',
      role: 'Showroom Manager',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2574&auto=format&fit=crop'
    },
    commercials: [
      { id: 'mehdi-amine', name: 'Mehdi Amine', role: 'Sales Advisor', performance: '85%', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2574&auto=format&fit=crop' }
    ]
  }
];

export default function Page() {
  const [search, setSearch] = useState('');
  
  // SlideOver state
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [slideOverMode, setSlideOverMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<any>(null); // Kept as any because UserSlideOver expects its own internal UserData structure which is slightly different

  const handleOpenAdd = () => {
    setSlideOverMode('create');
    setSelectedUser(null);
    setIsSlideOverOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, user: Commercial | Manager, showroomName: string) => {
    e.preventDefault();
    setSlideOverMode('edit');
    // Ensure role matches the select value in drawer ('commercial' or 'admin')
    const roleValue = user.role.toLowerCase().includes('manager') ? 'admin' : 'commercial';
    setSelectedUser({ ...user, role: roleValue, showroom: showroomName });
    setIsSlideOverOpen(true);
  };

  const filteredShowrooms = useMemo(() => {
    if (!search) return showroomsData;
    
    return showroomsData.map(showroom => ({
      ...showroom,
      commercials: showroom.commercials.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.role.toLowerCase().includes(search.toLowerCase())
      )
    })).filter(showroom => showroom.commercials.length > 0);
  }, [search]);

  return (
    <div className="p-12 space-y-12 max-w-[1400px] mx-auto min-h-screen bg-[#fbf9f4]">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-[12px] font-mono uppercase tracking-[0.3em] text-yellow-600 font-bold mb-3 font-serif italic">Force de Vente Réseau</h2>
          <h1 className="font-headline text-6xl italic tracking-tight text-stone-900 leading-tight">Nos Commerciaux</h1>
        </div>

        <div className="flex flex-col items-end gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-80 group">
               <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-[20px] group-focus-within:text-yellow-600 transition-colors">search</span>
               <input 
                 type="text"
                 placeholder="Rechercher par nom ou rôle..."
                 className="w-full bg-white border border-stone-100 rounded-2xl pl-12 pr-4 py-3.5 text-[13px] shadow-sm focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 outline-none transition-all placeholder:text-stone-300 font-serif italic"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <button 
              onClick={handleOpenAdd}
              className="bg-stone-900 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="text-[11px] font-bold uppercase tracking-widest">Ajouter</span>
            </button>
          </div>
          
          <div className="bg-white border border-stone-100 rounded-2xl px-8 py-4 shadow-sm flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-stone-400 uppercase font-mono font-bold">Total Réseau</span>
                <span className="text-3xl font-mono font-bold text-stone-900">42</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] text-stone-400">group</span>
              </div>
          </div>
        </div>
      </div>

      <div className="space-y-24">
        {filteredShowrooms.map((showroom) => (
          <div key={showroom.name} className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Showroom Header */}
            <div className="flex items-center gap-6 mb-12">
              <h2 className="font-headline text-4xl italic text-stone-900 whitespace-nowrap">Equipe {showroom.name}</h2>
              <div className="h-px bg-stone-200 flex-1"></div>
              <span className="font-mono text-[11px] font-bold text-stone-400 uppercase tracking-widest bg-white border border-stone-100 px-4 py-1.5 rounded-full shadow-sm">
                {showroom.commercials.length} Membres
              </span>
            </div>

            <div className="flex gap-12">
               {/* Left column: Responsable Profile */}
               <div className="w-[280px] shrink-0 sticky top-24 self-start">
                  <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm flex flex-col items-center relative group">
                     <button 
                       onClick={(e) => handleOpenEdit(e, showroom.manager, showroom.name)}
                       className="absolute top-6 right-6 w-8 h-8 rounded-full border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-yellow-600 transition-colors bg-stone-50 z-20 opacity-0 group-hover:opacity-100"
                     >
                       <span className="material-symbols-outlined text-[14px]">edit</span>
                     </button>
                     
                     <span className="text-[10px] uppercase font-mono text-stone-400 font-bold mb-6 tracking-[0.2em] border-b border-stone-50 pb-2 w-full text-center">Responsable</span>
                     <div className="relative mb-6">
                        <div className="absolute inset-0 bg-stone-200 rounded-full blur-2xl scale-90 opacity-40"></div>
                        <img 
                          src={showroom.manager.avatar} 
                          alt={showroom.manager.name}
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl relative z-10"
                        />
                     </div>
                     <h3 className="font-headline text-2xl text-stone-900 text-center mb-1">{showroom.manager.name}</h3>
                     <p className="text-[11px] text-stone-300 font-mono italic uppercase tracking-widest">Showroom Manager</p>
                     
                     <div className="mt-8 pt-8 border-t border-stone-50 w-full">
                        <Link href={`/owner/showrooms/${showroom.name.toLowerCase()}`}>
                           <button className="w-full py-3 bg-stone-900 text-white rounded-xl text-[12px] font-medium hover:bg-yellow-700 transition-colors duration-300 flex items-center justify-center gap-2">
                             Performance Unitée
                             <span className="material-symbols-outlined text-[16px]">trending_up</span>
                           </button>
                        </Link>
                     </div>
                  </div>
               </div>

               {/* Right column: Commercial Cards Grid */}
               <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {showroom.commercials.map((commercial) => (
                      <Link key={commercial.id} href="/owner/scorecard/commercial">
                        <div className="group bg-white rounded-[2rem] p-8 border border-stone-100 shadow-sm hover:shadow-2xl hover:border-yellow-200 transition-all duration-500 cursor-pointer relative overflow-hidden h-full flex flex-col justify-between">
                          {/* Inner Content */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="relative mb-6">
                              <div className="absolute inset-0 bg-yellow-600/10 rounded-[2rem] blur-xl scale-90 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <img 
                                src={commercial.avatar} 
                                alt={commercial.name}
                                className="w-20 h-20 rounded-[1.5rem] object-cover border-2 border-white shadow-md grayscale group-hover:grayscale-0 transition-all duration-700 relative z-10"
                              />
                               <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white z-20 shadow-sm"></div>
                            </div>

                            <h3 className="font-headline text-2xl text-stone-900 mb-1 group-hover:text-yellow-800 transition-colors text-center">{commercial.name}</h3>
                            <p className="text-[11px] text-stone-400 font-mono italic mb-6 text-center">{commercial.role}</p>

                            <div className="w-full flex items-center justify-between pt-6 border-t border-stone-50">
                              <div className="flex flex-col">
                                 <span className="text-[9px] uppercase font-mono text-stone-400 font-bold mb-1 tracking-widest">Performance</span>
                                 <span className={`text-[18px] font-mono font-bold ${parseFloat(commercial.performance) > 90 ? 'text-emerald-600' : 'text-yellow-700'}`}>
                                   {commercial.performance}
                                 </span>
                              </div>
                              <button 
                                onClick={(e) => handleOpenEdit(e, commercial, showroom.name)}
                                className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-yellow-700 group-hover:text-white transition-all duration-300"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {filteredShowrooms.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center">
           <span className="material-symbols-outlined text-[64px] text-stone-200 mb-4 font-light italic">person_search</span>
           <h3 className="font-headline text-2xl text-stone-400">Aucun commercial trouvé pour "{search}"</h3>
           <p className="text-stone-300 text-[13px] mt-2 italic font-serif">Essayez de rechercher par nom ou rôle.</p>
        </div>
      )}

      {/* Admin/User Slide-Over Form */}
      <UserSlideOver 
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        mode={slideOverMode}
        user={selectedUser}
      />
    </div>
  );
}
