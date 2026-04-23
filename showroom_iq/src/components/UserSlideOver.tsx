import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

export interface UserData {
  id?: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  magasinId?: string;
  targets?: { conservative?: string, likely?: string, exceed?: string };
}

interface UserSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserData | null;
  mode: 'create' | 'edit';
  fixedMagasinId?: string;
  magasins?: { id: string; name: string }[];
  onSubmit?: (data: any) => void;
  lockRole?: boolean;
}

export default function UserSlideOver({ isOpen, onClose, user, mode, fixedMagasinId, magasins = [], onSubmit, lockRole }: UserSlideOverProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResultUser, setSelectedResultUser] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset search state when opening for creation
      if (mode === 'create') {
        setSearchQuery('');
        setSelectedResultUser(null);
      } else if (user) {
        setSearchQuery(user.name);
        setSelectedResultUser(user);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, mode, user]);

  // Close search results on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.length < 2 || (selectedResultUser && searchQuery === selectedResultUser.fullName)) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`http://localhost:3001/api/users/search?q=${searchQuery}&role=COMMERCIAL`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          setSearchResults(result.data);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedResultUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!onSubmit) return;
    
    const formData = new FormData(e.currentTarget);
    const userId = selectedResultUser?.id || user?.id;

    if (mode === 'create' && !selectedResultUser) {
      toast.error('Veuillez sélectionner un utilisateur dans la liste');
      return;
    }
    
    const data = {
      id: userId,
      fullName: formData.get('fullName') || selectedResultUser?.fullName || user?.name,
      email: formData.get('email'),
      phone: formData.get('phone'),
      role: formData.get('role') || user?.role || 'COMMERCIAL',
      showroomId: formData.get('magasinId') || fixedMagasinId || user?.magasinId,
      targets: {
        conservative: formData.get('conservative'),
        likely: formData.get('likely'),
        exceed: formData.get('exceed')
      }
    };

    onSubmit(data);
    toast.success('Modifications enregistrées avec succès', {
      style: {
        borderRadius: '16px',
        background: '#1c1917',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        padding: '16px 24px',
      },
      iconTheme: {
        primary: '#b8960c',
        secondary: '#fff',
      },
    });
  };

  const handleSelectUser = (u: any) => {
    setSelectedResultUser(u);
    setSearchQuery(u.fullName);
    setSearchResults([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-stone-100 bg-[#fbf9f4]">
          <div>
            <h2 className="font-headline text-3xl italic text-stone-900 leading-none">
              {mode === 'create' ? 'Assigner un commercial' : 'Modifier le profil'}
            </h2>
            <p className="text-stone-500 font-mono text-[10px] mt-2 uppercase tracking-[0.2em]">
              {mode === 'create' ? 'Affectation showroom' : 'Mise à jour des objectifs'}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-stone-400 transition-colors bg-white shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-stone-400 text-[20px]">person</span>
                <h3 className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">Identification</h3>
              </div>
              
              <div className="space-y-4">
                  {mode === 'edit' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Nom Complet</label>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 text-[20px]">person</span>
                            <input 
                              type="text" 
                              name="fullName"
                              defaultValue={user?.name}
                              className="w-full border border-stone-100 bg-stone-50/50 rounded-xl pl-12 pr-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Rôle</label>
                            <div className="relative">
                              <select 
                                name="role"
                                defaultValue={user?.role || 'COMMERCIAL'}
                                className="w-full appearance-none border border-stone-100 bg-stone-50/50 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner"
                              >
                                <option value="COMMERCIAL">Commercial</option>
                                <option value="ADMIN">Administrateur</option>
                                <option value="OWNER">Propriétaire</option>
                              </select>
                              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-[18px]">expand_more</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Téléphone</label>
                            <div className="relative">
                              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 text-[18px]">call</span>
                              <input 
                                type="text" 
                                name="phone"
                                defaultValue={user?.phone}
                                className="w-full border border-stone-100 bg-stone-50/50 rounded-xl pl-10 pr-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Email Professional</label>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 text-[18px]">mail</span>
                            <input 
                              type="email" 
                              name="email"
                              defaultValue={user?.email}
                              className="w-full border border-stone-100 bg-stone-50/50 rounded-xl pl-12 pr-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div ref={searchRef} className="relative">
                      <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Rechercher un Commercial</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 text-[20px]">search</span>
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Tapez un nom..."
                          className="w-full border border-stone-100 bg-stone-50/50 rounded-xl pl-12 pr-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner disabled:opacity-60"
                        />
                        {isSearching && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>

                      {/* Search Results Dropdown */}
                      {searchResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-stone-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          {searchResults.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => handleSelectUser(u)}
                              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-stone-50 transition-colors text-left border-b border-stone-50 last:border-0"
                            >
                              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-stone-400 text-[20px]">person</span>
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-stone-900">{u.fullName}</p>
                                <p className="text-[11px] text-stone-400 font-mono uppercase tracking-widest">{u.role}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                <div>
                  <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Magasin Assigné</label>
                  <div className="relative">
                    <select 
                      name="magasinId"
                      defaultValue={fixedMagasinId || user?.magasinId || ''}
                      disabled={!!fixedMagasinId && mode === 'create'}
                      className="w-full appearance-none border border-stone-100 bg-stone-50/50 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>Sélectionner un magasin</option>
                      {magasins.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-[18px]">expand_more</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-stone-50">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-stone-400 text-[20px]">target</span>
                    <h3 className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">Objectifs Mensuels</h3>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Conservative Target</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="conservative"
                        defaultValue={user?.targets?.conservative || ''}
                        placeholder="Ex: 400 000"
                        className="w-full border border-stone-100 bg-stone-50/50 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[12px] font-mono">MAD</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Likely Target</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="likely"
                        defaultValue={user?.targets?.likely || ''}
                        placeholder="Ex: 500 000"
                        className="w-full border border-stone-100 bg-stone-50/50 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[12px] font-mono">MAD</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Exceed Target</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="exceed"
                        defaultValue={user?.targets?.exceed || ''}
                        placeholder="Ex: 700 000"
                        className="w-full border border-stone-100 bg-stone-50/50 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[12px] font-mono">MAD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-8 border-t border-stone-100 bg-[#fbf9f4]">
            <button 
              type="submit"
              className="w-full bg-stone-900 text-white rounded-xl py-4 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-yellow-700 transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              {mode === 'create' ? 'Assigner au showroom' : 'Enregistrer les modifications'}
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
