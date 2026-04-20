'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import UserSlideOver from '@/components/UserSlideOver';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Commercial {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: string;
  avatarUrl: string;
  targets?: {
    conservative: number;
    likely: number;
    exceed: number;
  };
}

interface Manager {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  avatar: string;
}

interface MagasinData {
  id: string;
  name: string;
  manager: Manager | null;
  commercials: Commercial[];
  performance: number;
}

export default function Page() {
  const [search, setSearch] = useState('');
  const [selectedMagasinId, setSelectedMagasinId] = useState<string>('all');
  const searchParams = useSearchParams();
  const filterMagasinId = searchParams.get('magasinId');
  
  // SlideOver state
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [slideOverMode, setSlideOverMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Data State
  const [magasinsData, setMagasinsData] = useState<MagasinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [performanceScores, setPerformanceScores] = useState<Record<string, number>>({});

  // Delete Dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/showrooms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setMagasinsData(result.data);
        // Fetch scores for all commercials in parallel
        await fetchAllScores(result.data, token);
      }
    } catch (error) {
      console.error('Error fetching magasins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllScores = async (magasins: MagasinData[], token: string | null) => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Collect all unique commercial IDs
    const allCommercials = magasins.flatMap(m => m.commercials);
    if (allCommercials.length === 0) return;

    // Fetch scores in parallel
    const results = await Promise.allSettled(
      allCommercials.map(async (c) => {
        const res = await fetch(
          `http://localhost:3001/api/performance/global-score/${c.id}/${month}/${year}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await res.json();
        return { id: c.id, score: data.success ? data.data.globalScore : 0 };
      })
    );

    const scores: Record<string, number> = {};
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        scores[result.value.id] = result.value.score;
      }
    });
    setPerformanceScores(scores);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setSlideOverMode('create');
    setSelectedUser(null);
    setIsSlideOverOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, user: any, type: 'manager' | 'commercial', magasinId: string) => {
    e.preventDefault();
    setSlideOverMode('edit');
    
    // Map backend format to drawer format
    const drawerUser = {
      id: user.id,
      name: type === 'manager' ? user.name : user.fullName,
      email: user.email || '',
      phone: user.phone || '',
      role: type === 'manager' ? 'ADMIN' : user.role || 'COMMERCIAL',
      magasinId: magasinId,
      targets: user.targets ? {
        conservative: user.targets.conservative?.toString() || '',
        likely: user.targets.likely?.toString() || '',
        exceed: user.targets.exceed?.toString() || ''
      } : undefined
    };

    setSelectedUser(drawerUser);
    setIsSlideOverOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    setUserToDelete({ id, name });
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3001/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setIsDeleteOpen(false);
        setUserToDelete(null);
        fetchData();
      } else {
        alert(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur réseau');
    }
  };

  const handleSaveUser = async (data: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      const url = slideOverMode === 'edit' && selectedUser?.id
        ? `http://localhost:3001/api/users/${selectedUser.id}`
        : `http://localhost:3001/api/users`;
      
      const method = slideOverMode === 'edit' && selectedUser?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (result.success) {
        setIsSlideOverOpen(false);
        fetchData();
      } else {
        alert(result.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur réseau');
    }
  };

  const filteredMagasins = useMemo(() => {
    let data = magasinsData;
    
    // Filter by selectedMagasinId
    if (selectedMagasinId !== 'all') {
      data = data.filter(m => m.id === selectedMagasinId);
    }

    // Filter by magasinId from URL if present
    if (filterMagasinId) {
      data = data.filter(m => m.id === filterMagasinId);
    }

    if (!search) return data;
    
    return data.map(magasin => {
      const searchLower = search.toLowerCase();
      const showroomMatch = magasin.name.toLowerCase().includes(searchLower);

      // Filter out OWNERS from manager and commercials
      const mManager = (magasin.manager && magasin.manager.role !== 'OWNER' && 
        (magasin.manager.name.toLowerCase().includes(searchLower) || showroomMatch)) ? magasin.manager : null;
      
      const mCommercials = magasin.commercials.filter(c => 
        c.role !== 'OWNER' && (
          c.fullName.toLowerCase().includes(searchLower) || 
          c.role.toLowerCase().includes(searchLower) ||
          showroomMatch
        )
      );
      
      return {
        ...magasin,
        commercials: mCommercials,
        manager: mManager || (mCommercials.length > 0 && magasin.manager?.role !== 'OWNER' ? magasin.manager : null)
      };
    }).filter(magasin => 
      magasin.commercials.length > 0 || 
      (magasin.manager && magasin.manager.role !== 'OWNER' && (
        magasin.manager.name.toLowerCase().includes(search.toLowerCase()) || 
        magasin.name.toLowerCase().includes(search.toLowerCase())
      ))
    );
  }, [search, magasinsData, filterMagasinId, selectedMagasinId]);

  // Aggregate stats (excluding OWNERs)
  const totalEmployees = magasinsData.reduce((acc, mag) => {
    const commercialCount = mag.commercials.filter(c => c.role !== 'OWNER').length;
    const managerCount = (mag.manager && mag.manager.role !== 'OWNER') ? 1 : 0;
    return acc + commercialCount + managerCount;
  }, 0);

  // Map to select options
  const listMagasins = magasinsData.map(m => ({ id: m.id, name: m.name }));

  return (
    <div className="pt-[90px] p-12 space-y-8 max-w-[1400px] mx-auto min-h-screen bg-[#fbf9f4]">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-[12px] font-mono uppercase tracking-[0.3em] text-yellow-600 font-bold mb-3 font-serif italic">Force de Vente Réseau</h2>
          <h1 className="font-headline text-6xl italic tracking-tight text-stone-900 leading-tight">Nos Commerciaux</h1>
        </div>

        <div className="flex flex-col items-end gap-6 max-w-[600px] w-full">
          <div className="flex items-center gap-6 w-full">
            <div className="flex items-center h-14 bg-white border border-stone-100 rounded-2xl shadow-sm px-2 flex-1 group transition-all focus-within:border-yellow-600/30 focus-within:ring-4 focus-within:ring-yellow-600/5">
              <div className="flex items-center px-4 border-r border-stone-100 h-8 shrink-0">
                <select 
                  value={selectedMagasinId}
                  onChange={(e) => setSelectedMagasinId(e.target.value)}
                  className="bg-transparent text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 outline-none cursor-pointer hover:text-stone-900 transition-colors w-36 appearance-none"
                >
                  <option value="all">TOUS LES MAGASINS</option>
                  {magasinsData.map(m => (
                    <option key={m.id} value={m.id}>{m.name.toUpperCase()}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-[14px] text-stone-300 ml-1 pointer-events-none">unfold_more</span>
              </div>

              <div className="relative flex-1 group flex items-center h-full">
                 <span className="material-symbols-outlined absolute left-4 text-stone-300 text-[20px] group-focus-within:text-yellow-600 transition-colors">search</span>
                 <input 
                   type="text"
                   placeholder="Rechercher par nom ou rôle..."
                   className="w-full bg-transparent pl-12 pr-4 h-full text-[13px] outline-none placeholder:text-stone-300 font-sans text-stone-950"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
            </div>

            <button 
              onClick={handleOpenAdd}
              className="h-14 bg-stone-900 text-white px-8 rounded-2xl flex items-center justify-center gap-3 hover:bg-stone-800 transition-all shadow-lg active:scale-95 shrink-0 group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">add</span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Ajouter</span>
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-white border border-stone-100 rounded-2xl px-6 py-3 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-stone-400 uppercase font-mono font-bold tracking-widest">Effectif Réseau</span>
                  <span className="text-2xl font-mono font-bold text-stone-900 leading-none">{totalEmployees}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-stone-400">group</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center">
           <span className="material-symbols-outlined text-[48px] text-stone-300 animate-spin">refresh</span>
           <p className="mt-4 text-stone-500 font-mono text-[12px] uppercase tracking-widest">Chargement...</p>
        </div>
      ) : (
        <div className="space-y-16">
          {filteredMagasins.map((magasin) => (
            <div key={magasin.id} className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {/* Magasin Header */}
              <div className="flex items-center gap-6 mb-8">
                <h2 className="font-headline text-4xl italic text-stone-900 whitespace-nowrap">Equipe {magasin.name}</h2>
                <div className="h-px bg-stone-200 flex-1"></div>
                <span className="font-mono text-[11px] font-bold text-stone-400 uppercase tracking-widest bg-white border border-stone-100 px-4 py-1.5 rounded-full shadow-sm">
                  {magasin.commercials.filter(c => c.role !== 'OWNER').length + (magasin.manager && magasin.manager.role !== 'OWNER' ? 1 : 0)} Membres
                </span>
              </div>

              <div className="flex gap-8 flex-col md:flex-row">
                 {/* Left column: Responsable Profile */}
                 <div className="w-full md:w-[280px] shrink-0 md:sticky md:top-24 self-start">
                    {magasin.manager ? (
                      <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm flex flex-col items-center relative group">
                        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <button 
                            onClick={(e) => handleOpenEdit(e, magasin.manager, 'manager', magasin.id)}
                            className="w-8 h-8 rounded-full border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-yellow-600 transition-colors bg-stone-50"
                            title="Modifier"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                          </button>
                          <button 
                            onClick={(e) => handleDeleteClick(e, magasin.manager!.id, magasin.manager!.name)}
                            className="w-8 h-8 rounded-full border border-stone-100 flex items-center justify-center text-stone-400 hover:text-red-600 hover:border-red-600 transition-colors bg-stone-50"
                            title="Supprimer"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        </div>
                        
                        <span className="text-[10px] uppercase font-mono text-stone-400 font-bold mb-6 tracking-[0.2em] border-b border-stone-50 pb-2 w-full text-center pt-2">Responsable</span>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-headline text-2xl text-stone-900 text-center">{magasin.manager.name}</h3>
                          <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-300">
                             <span className="material-symbols-outlined text-[18px]">person</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-300 font-mono italic uppercase tracking-widest">Admin / Manager</p>
                        
                        <div className="mt-8 pt-8 border-t border-stone-50 w-full">
                            <Link href={`/owner/showrooms/${magasin.id}`}>
                              <button className="w-full py-3 bg-stone-900 text-white rounded-xl text-[12px] font-medium hover:bg-yellow-700 transition-colors duration-300 flex items-center justify-center gap-2">
                                Vue Magasin
                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                              </button>
                            </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-stone-50 border border-stone-100 border-dashed rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                        <span className="material-symbols-outlined text-stone-300 text-[48px] mb-4">person_off</span>
                        <p className="text-stone-400 font-serif italic text-sm mb-4">Aucun responsable assigné</p>
                        <button 
                          onClick={() => {
                            setSlideOverMode('create');
                            setSelectedUser({ magasinId: magasin.id, role: 'ADMIN' });
                            setIsSlideOverOpen(true);
                          }}
                          className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-stone-600 hover:text-stone-900 hover:border-stone-400 transition-colors shadow-sm"
                        >
                          Assigner
                        </button>
                      </div>
                    )}
                 </div>

                 {/* Right column: Commercial Cards Grid */}
                 <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {magasin.commercials.map((commercial) => (
                        <div key={commercial.id} className="group bg-white rounded-[2rem] p-8 border border-stone-100 shadow-sm hover:shadow-2xl hover:border-yellow-200 transition-all duration-500 relative overflow-hidden h-full flex flex-col justify-between">
                          {/* Inner Content */}
                          <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button 
                              onClick={(e) => handleOpenEdit(e, commercial, 'commercial', magasin.id)}
                              className="w-8 h-8 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-yellow-700 hover:text-white hover:border-yellow-700 transition-all shadow-sm"
                              title="Modifier"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                            </button>
                            <button 
                              onClick={(e) => handleDeleteClick(e, commercial.id, commercial.fullName)}
                              className="w-8 h-8 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
                              title="Supprimer"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                          
                          <Link href={`/owner/scorecard/commercial?id=${commercial.id}`}>
                            <div className="relative z-10 flex flex-col items-center pt-2 cursor-pointer">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-headline text-2xl text-stone-900 group-hover:text-yellow-800 transition-colors text-center">{commercial.fullName}</h3>
                                <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-300">
                                  <span className="material-symbols-outlined text-[18px]">person</span>
                                </div>
                              </div>
                              <p className="text-[11px] text-stone-400 font-mono italic mb-6 text-center">{commercial.role === 'ADMIN' ? 'Administrateur' : 'Commercial'}</p>

                              <div className="w-full flex items-center justify-between pt-6 border-t border-stone-50">
                                 <div className="flex flex-col items-end">
                                   <span className="text-[9px] uppercase font-mono text-stone-400 font-bold mb-1 tracking-widest">Performance</span>
                                   <div className="flex flex-col items-end gap-1">
                                     <span className={`text-[18px] font-mono font-bold leading-none ${
                                       (performanceScores[commercial.id] ?? 0) >= 80 ? 'text-emerald-600' :
                                       (performanceScores[commercial.id] ?? 0) >= 60 ? 'text-yellow-600' :
                                       (performanceScores[commercial.id] ?? 0) >= 40 ? 'text-orange-500' : 'text-red-500'
                                     }`}>
                                       {performanceScores[commercial.id] !== undefined
                                         ? `${performanceScores[commercial.id]}/100`
                                         : '—/100'}
                                     </span>
                                     {performanceScores[commercial.id] !== undefined && (
                                       <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                         performanceScores[commercial.id] >= 80 ? 'bg-emerald-50 text-emerald-600' :
                                         performanceScores[commercial.id] >= 60 ? 'bg-yellow-50 text-yellow-600' :
                                         performanceScores[commercial.id] >= 40 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                                       }`}>
                                         {performanceScores[commercial.id] >= 80 ? 'Très Bien' :
                                          performanceScores[commercial.id] >= 60 ? 'Bien' :
                                          performanceScores[commercial.id] >= 40 ? 'Moyen' : 'Mauvais'}
                                       </span>
                                     )}
                                   </div>
                                 </div>
                                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                                  <span className="material-symbols-outlined text-[18px] text-stone-400 group-hover:text-yellow-700 transition-colors">chevron_right</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}

                      {/* Add new commercial card */}
                      <div 
                        onClick={() => {
                          setSlideOverMode('create');
                          setSelectedUser({ magasinId: magasin.id, role: 'COMMERCIAL' });
                          setIsSlideOverOpen(true);
                        }}
                        className="group bg-stone-50 rounded-[2rem] p-8 border border-stone-200 border-dashed hover:border-yellow-600 hover:bg-yellow-50/50 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center h-full min-h-[250px]"
                      >
                         <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-stone-300 text-[24px] group-hover:text-yellow-600 transition-colors">add</span>
                         </div>
                         <p className="font-serif italic text-stone-400 group-hover:text-yellow-800 transition-colors text-center">Ajouter un commercial<br/>à cette équipe</p>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredMagasins.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center">
           <span className="material-symbols-outlined text-[64px] text-stone-200 mb-4 font-light italic">person_search</span>
           <h3 className="font-headline text-2xl text-stone-400">Aucun résultat trouvé pour "{search}"</h3>
        </div>
      )}

      {/* Slide-Over Form */}
      <UserSlideOver 
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        mode={slideOverMode}
        user={selectedUser}
        magasins={listMagasins}
        fixedMagasinId={selectedUser?.magasinId}
        onSubmit={handleSaveUser}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer ${userToDelete?.name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
}
