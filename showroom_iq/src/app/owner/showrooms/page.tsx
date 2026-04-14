'use client';

import React, { useState, useMemo, useEffect } from 'react';
import ShowroomCard from '@/components/ShowroomCard';
import ConfirmDialog from '@/components/ConfirmDialog';
import toast from 'react-hot-toast';

interface User {
  id: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
}

interface Showroom {
  id: string;
  name: string;
  location: string;
  city: string;
  manager: {
    id?: string;
    name: string;
    avatar: string;
  } | null;
  commercials: {
    id: string;
    fullName: string;
  }[];
  targets: {
    conservative: number | null;
    likely: number | null;
    exceed: number | null;
  } | null;
  performance: number;
  score: number;
  status: string;
}

export default function Page() {
  const [search, setSearch] = useState('');
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Delete Check
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showroomToDelete, setShowroomToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    location: '',
    managerId: '',
    commercialIds: [] as string[],
    targets: {
      conservative: '',
      likely: '',
      exceed: ''
    }
  });

  // Search States
  const [managerQuery, setManagerQuery] = useState('');
  const [managerResults, setManagerResults] = useState<User[]>([]);
  const [commercialQuery, setCommercialQuery] = useState('');
  const [commercialResults, setCommercialResults] = useState<User[]>([]);
  const [selectedCommercials, setSelectedCommercials] = useState<User[]>([]);
  const [selectedManager, setSelectedManager] = useState<User | null>(null);

  useEffect(() => {
    fetchShowrooms();
  }, []);

  const fetchShowrooms = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:3001/api/showrooms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setShowrooms(data.data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des showrooms');
    } finally {
      setIsLoading(false);
    }
  };

  // Search Managers
  useEffect(() => {
    const searchManagers = async () => {
      if (managerQuery.length < 2) {
        setManagerResults([]);
        return;
      }
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`http://localhost:3001/api/users/search?q=${managerQuery}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setManagerResults(data.data);
        }
      } catch (error) {}
    };
    const timer = setTimeout(searchManagers, 300);
    return () => clearTimeout(timer);
  }, [managerQuery]);

  // Search Commercials
  useEffect(() => {
    const searchComms = async () => {
      if (commercialQuery.length < 2) {
        setCommercialResults([]);
        return;
      }
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`http://localhost:3001/api/users/search?q=${commercialQuery}&role=COMMERCIAL`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCommercialResults(data.data);
        }
      } catch (error) {}
    };
    const timer = setTimeout(searchComms, 300);
    return () => clearTimeout(timer);
  }, [commercialQuery]);

  const toggleCommercial = (user: User) => {
    if (selectedCommercials.find(u => u.id === user.id)) {
      setSelectedCommercials(selectedCommercials.filter(u => u.id !== user.id));
    } else {
      setSelectedCommercials([...selectedCommercials, user]);
    }
    setCommercialQuery('');
    setCommercialResults([]);
  };

  const filteredShowrooms = useMemo(() => {
    return showrooms.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      (s.city && s.city.toLowerCase().includes(search.toLowerCase())) ||
      (s.manager && s.manager.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, showrooms]);

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Le nom du magasin est requis');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const payload = {
        ...formData,
        commercialIds: selectedCommercials.map(c => c.id)
      };

      const url = drawerMode === 'edit' && editId 
        ? `http://localhost:3001/api/showrooms/${editId}` 
        : 'http://localhost:3001/api/showrooms';
      
      const method = drawerMode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Magasin ${drawerMode === 'edit' ? 'mis à jour' : 'créé'} avec succès`);
        setDrawerMode(null);
        setEditId(null);
        fetchShowrooms();
        // Reset form
        setFormData({
          name: '', city: '', location: '', managerId: '',
          commercialIds: [], targets: { conservative: '', likely: '', exceed: '' }
        });
        setSelectedCommercials([]);
        setManagerQuery('');
        setSelectedManager(null);
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur réseau');
    }
  };

  const handleDeleteShowroom = async () => {
    if (!showroomToDelete) return;

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:3001/api/showrooms/${showroomToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Magasin supprimé');
        fetchShowrooms();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur réseau');
    } finally {
      setIsDeleteOpen(false);
      setShowroomToDelete(null);
    }
  };

  return (
    <>
      <div className="pt-[60px] p-12 space-y-10 max-w-[1400px] mx-auto min-h-screen">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-[12px] font-mono uppercase tracking-[0.3em] text-yellow-600 font-bold mb-3">Gestion de Réseau</h2>
            <h1 className="font-headline text-5xl italic tracking-tight text-stone-900 leading-tight">Nos Magasins</h1>
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
                AJOUTER UN MAGASIN
              </button>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-stone-50 border border-stone-100 rounded-xl px-6 py-3 flex flex-col items-end shadow-sm">
                <span className="text-[10px] text-stone-400 uppercase font-mono font-bold">Total Magasins</span>
                <span className="text-2xl font-mono font-bold text-stone-900">
                  {showrooms.length.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="bg-stone-50 border border-stone-100 rounded-xl px-6 py-3 flex flex-col items-end shadow-sm">
                <span className="text-[10px] text-stone-400 uppercase font-mono font-bold">Performance Réseau</span>
                <span className="text-2xl font-mono font-bold text-emerald-600">
                  {showrooms.length > 0 ? (showrooms.reduce((acc, curr) => acc + curr.performance, 0) / showrooms.length).toFixed(1) : '0'}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-stone-400 font-serif italic">Chargement des magasins...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {filteredShowrooms.map((showroom) => {
              const isCasa = showroom.name.toLowerCase().includes('casa');
              const displayPerformance = isCasa ? 0 : showroom.performance;
              const displayScore = isCasa ? 0 : showroom.score;
              
              return (
                <ShowroomCard 
                  key={showroom.id}
                  id={showroom.id}
                  name={showroom.name}
                  address={showroom.location || 'Adresse non spécifiée'}
                  city={showroom.city || 'SANS VILLE'}
                  manager={showroom.manager || { name: 'Non assigné', avatar: '' }}
                  performance={displayPerformance}
                  score={displayScore}
                  commercialCount={showroom.commercials?.length || 0}
                  onDelete={(id) => {
                    setShowroomToDelete(id);
                    setIsDeleteOpen(true);
                  }}
                  onUpdate={(id) => {
                    const magasin = showrooms.find(s => s.id === id);
                  if (magasin) {
                    setFormData({
                      name: magasin.name,
                      city: magasin.city || '',
                      location: magasin.location || '',
                      managerId: magasin.manager?.id || '',
                      commercialIds: magasin.commercials?.map(c => c.id) || [],
                      targets: {
                        conservative: magasin.targets?.conservative?.toString() || '',
                        likely: magasin.targets?.likely?.toString() || '',
                        exceed: magasin.targets?.exceed?.toString() || ''
                      }
                    });
                    setSelectedManager(magasin.manager ? {
                      id: magasin.manager.id,
                      fullName: magasin.manager.name,
                      avatarUrl: magasin.manager.avatar,
                      role: 'MANAGER'
                    } as any : null);
                    setSelectedCommercials(magasin.commercials?.map(c => ({
                      id: c.id,
                      fullName: c.fullName,
                      role: 'COMMERCIAL'
                    })) as any || []);
                    setEditId(id);
                    setDrawerMode('edit');
                  }
                }}
              />
            );
          })}
        </div>
      )}

        {!isLoading && filteredShowrooms.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
             <span className="material-symbols-outlined text-[64px] text-stone-200 mb-4 font-light">home_pin</span>
             <h3 className="font-headline text-2xl text-stone-400">Aucun magasin trouvé</h3>
             <p className="text-stone-300 text-[13px] mt-2 italic font-serif">Commencez par ajouter un nouveau magasin au réseau.</p>
          </div>
        )}
      </div>

      {/* --- Overlay & Drawer --- */}
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
              Configuration Magasin
            </h2>
            <h3 className="font-headline text-3xl italic tracking-tight text-stone-900">
              {drawerMode === 'edit' ? 'Modifier Magasin' : 'Ajouter Magasin'}
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
          
          <div className="space-y-4">
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Nom du Magasin</label>
              <input 
                type="text" 
                placeholder="Ex: Magasin Agadir" 
                className="w-full border border-stone-200 rounded-xl px-4 py-3.5 text-[14px] font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-colors"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Ville (Tag)</label>
                <input 
                  type="text" 
                  placeholder="Ex: AGADIR" 
                  className="w-full border border-stone-200 rounded-xl px-4 py-3.5 text-[14px] font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-colors"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Adresse / Quartier</label>
                <input 
                  type="text" 
                  placeholder="Ex: Rue 123, Secteur A" 
                  className="w-full border border-stone-200 rounded-xl px-4 py-3.5 text-[14px] font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-colors"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-end">
               <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Responsable / Manager</label>
               <span className="text-[10px] text-stone-400 font-mono">Requis</span>
            </div>
            
            <div className="p-4 border border-stone-200 rounded-xl bg-stone-50/50 space-y-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">search</span>
                <input 
                  type="text" 
                  placeholder="Rechercher un manager..." 
                  className="w-full bg-white border border-stone-200 rounded-lg pl-10 pr-3 py-2 text-[13px] focus:outline-none focus:border-yellow-600 transition-colors"
                  value={managerQuery}
                  onChange={(e) => setManagerQuery(e.target.value)}
                />
                
                {managerResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-stone-100 rounded-lg shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                    {managerResults.map(u => (
                      <button 
                        key={u.id}
                        onClick={() => {
                          setFormData({...formData, managerId: u.id});
                          setSelectedManager(u);
                          setManagerQuery('');
                          setManagerResults([]);
                        }}
                        className="w-full px-3 py-2 text-left text-[12px] hover:bg-stone-50 border-b border-stone-50 last:border-0"
                      >
                        {u.fullName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedManager && (
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-lg shadow-sm animate-in fade-in zoom-in duration-200">
                    <span className="text-[11px] font-medium text-stone-700">{selectedManager.fullName}</span>
                    <button 
                      onClick={() => {
                        setFormData({...formData, managerId: ''});
                        setSelectedManager(null);
                      }}
                      className="text-stone-400 hover:text-red-500"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-end">
               <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Commerciaux (Équipe)</label>
               <span className="text-[10px] text-stone-400 font-mono">Optionnel</span>
            </div>
            
            <div className="p-4 border border-stone-200 rounded-xl bg-stone-50/50 space-y-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">search</span>
                <input 
                  type="text" 
                  placeholder="Rechercher des commerciaux..." 
                  className="w-full bg-white border border-stone-200 rounded-lg pl-10 pr-3 py-2 text-[13px] focus:outline-none focus:border-yellow-600 transition-colors"
                  value={commercialQuery}
                  onChange={(e) => setCommercialQuery(e.target.value)}
                />
                
                {commercialResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-stone-100 rounded-lg shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                    {commercialResults.filter(u => !selectedCommercials.find(sc => sc.id === u.id)).map(u => (
                      <button 
                        key={u.id}
                        onClick={() => toggleCommercial(u)}
                        className="w-full px-3 py-2 text-left text-[12px] hover:bg-stone-50 border-b border-stone-50 last:border-0"
                      >
                        {u.fullName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {selectedCommercials.map(u => (
                  <div key={u.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-lg shadow-sm animate-in fade-in zoom-in duration-200">
                    <span className="text-[11px] font-medium text-stone-700">{u.fullName}</span>
                    <button 
                      onClick={() => toggleCommercial(u)}
                      className="text-stone-400 hover:text-red-500"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">Objectifs de CA (Mensuel)</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-stone-400">Conservative Target</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="Ex: 1500000" 
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-[16px] font-mono font-bold focus:border-stone-400 outline-none"
                      value={formData.targets.conservative}
                      onChange={(e) => setFormData({...formData, targets: {...formData.targets, conservative: e.target.value}})}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 text-[11px] font-bold">MAD</span>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-emerald-600/60 transition-colors">Likely Target</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="Ex: 2000000" 
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-[16px] font-mono font-bold focus:border-stone-400 outline-none"
                      value={formData.targets.likely}
                      onChange={(e) => setFormData({...formData, targets: {...formData.targets, likely: e.target.value}})}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 text-[11px] font-bold">MAD</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-yellow-600/60">Exceed Target</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="Ex: 2500000" 
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-[16px] font-mono font-bold focus:border-stone-400 outline-none"
                      value={formData.targets.exceed}
                      onChange={(e) => setFormData({...formData, targets: {...formData.targets, exceed: e.target.value}})}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 text-[11px] font-bold">MAD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-stone-100 bg-stone-50 flex gap-3">
          <button 
            onClick={() => setDrawerMode(null)}
            className="flex-1 py-3.5 px-4 rounded-xl border border-stone-200 bg-white text-stone-600 font-bold text-[13px] hover:bg-stone-50 outline-none transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={handleSave}
            className="flex-[2] py-3.5 px-4 rounded-xl bg-stone-900 text-white font-bold text-[13px] shadow-lg hover:bg-stone-800 outline-none transition-colors flex justify-center items-center gap-2 group"
          >
            <span>{drawerMode === 'edit' ? 'Sauvegarder' : 'Créer le Magasin'}</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isDeleteOpen}
        title="Supprimer le magasin"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce magasin ? L'historique et les statistiques associés seront perdus."
        confirmText="Supprimer"
        isDestructive={true}
        onConfirm={handleDeleteShowroom}
        onCancel={() => {
          setIsDeleteOpen(false);
          setShowroomToDelete(null);
        }}
      />
    </>
  );
}
