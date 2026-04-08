import React, { useEffect } from 'react';

interface UserData {
  id?: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  showroom?: string;
  objective?: string;
}

interface UserSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserData | null;
  mode: 'create' | 'edit';
  fixedShowroom?: string;
}

export default function UserSlideOver({ isOpen, onClose, user, mode, fixedShowroom }: UserSlideOverProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isRoleEditable = mode === 'create' && !fixedShowroom;
  const isShowroomEditable = !fixedShowroom;

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
              {mode === 'create' ? 'Ajouter un membre' : 'Modifier le profil'}
            </h2>
            <p className="text-stone-500 font-mono text-[10px] mt-2 uppercase tracking-[0.2em]">
              {mode === 'create' ? 'Nouveau collaborateur' : 'Mise à jour des données'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-stone-400 transition-colors bg-white shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-stone-400 text-[20px]">person</span>
              <h3 className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">Informations Principales</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Nom Complet</label>
                <input 
                  type="text" 
                  defaultValue={user?.name || ''}
                  placeholder="Ex: Youssef Benali"
                  className="w-full border border-stone-100 bg-stone-50/50 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Rôle</label>
                  <div className="relative">
                    <select 
                      disabled={!isRoleEditable}
                      defaultValue={user?.role || 'commercial'}
                      className="w-full appearance-none border border-stone-100 bg-stone-50/50 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner disabled:opacity-60"
                    >
                      <option value="commercial">Commercial</option>
                      <option value="admin">Showroom Manager</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-[18px]">expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Showroom</label>
                  <div className="relative">
                    <select 
                      disabled={!isShowroomEditable}
                      defaultValue={fixedShowroom || user?.showroom || 'Casablanca'}
                      className="w-full appearance-none border border-stone-100 bg-stone-50/50 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner disabled:opacity-60"
                    >
                      <option value="Casablanca">Casablanca</option>
                      <option value="Rabat">Rabat</option>
                      <option value="Marrakech">Marrakech</option>
                      <option value="Tanger">Tanger</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-[18px]">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Conservative Objective</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Ex: 400 000 MAD"
                      className="w-full border border-stone-100 bg-stone-50/50 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[12px] font-mono">MAD</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Likely Objective</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Ex: 500 000 MAD"
                      className="w-full border border-stone-100 bg-stone-50/50 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[12px] font-mono">MAD</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Exceed Objective</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Ex: 650 000 MAD"
                      className="w-full border border-stone-100 bg-stone-50/50 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[12px] font-mono">MAD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-stone-400 text-[20px]">contact_mail</span>
              <h3 className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">Coordonnées</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Email Professionnel</label>
                <input 
                  type="email" 
                  defaultValue={user?.email || ''}
                  placeholder="contact@showroomiq.com"
                  className="w-full border border-stone-100 bg-stone-50/50 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Téléphone</label>
                <input 
                  type="tel" 
                  defaultValue={user?.phone || ''}
                  placeholder="+212 600 000 000"
                  className="w-full border border-stone-100 bg-stone-50/50 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-stone-100 bg-[#fbf9f4]">
          <button 
            onClick={onClose}
            className="w-full bg-stone-900 text-white rounded-xl py-4 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-yellow-700 transition-all shadow-lg flex items-center justify-center gap-2 group"
          >
            {mode === 'create' ? 'Créer le profil' : 'Enregistrer les modifications'}
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
