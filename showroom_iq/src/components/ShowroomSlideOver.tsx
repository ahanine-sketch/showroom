import React, { useEffect } from 'react';

interface ShowroomData {
  id?: string;
  name: string;
  location: string;
  objective: string;
  revenue: string;
  manager: string;
}

interface ShowroomSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  showroom: ShowroomData | null;
}

export default function ShowroomSlideOver({ isOpen, onClose, showroom }: ShowroomSlideOverProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
              Modifier le Magasin
            </h2>
            <p className="text-stone-500 font-mono text-[10px] mt-2 uppercase tracking-[0.2em]">
              Configuration des Objectifs
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
              <span className="material-symbols-outlined text-stone-400 text-[20px]">storefront</span>
              <h3 className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">Détails du Magasin</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Nom du Magasin</label>
                <input 
                  type="text" 
                  disabled
                  defaultValue={showroom?.name || ''}
                  className="w-full border border-stone-100 bg-stone-100/50 rounded-xl px-4 py-3.5 text-[14px] text-stone-500 cursor-not-allowed shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Localisation</label>
                <input 
                  type="text" 
                  disabled
                  defaultValue={showroom?.location || ''}
                  className="w-full border border-stone-100 bg-stone-100/50 rounded-xl px-4 py-3.5 text-[14px] text-stone-500 cursor-not-allowed shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Responsable Magasin</label>
                <input 
                  type="text" 
                  disabled
                  defaultValue={showroom?.manager || ''}
                  className="w-full border border-stone-100 bg-stone-100/50 rounded-xl px-4 py-3.5 text-[14px] text-stone-500 cursor-not-allowed shadow-inner"
                />
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Conservative Objective</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Ex: 4 000 000 MAD"
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
                      placeholder="Ex: 5 000 000 MAD"
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
                      placeholder="Ex: 6 500 000 MAD"
                      className="w-full border border-stone-100 bg-stone-50/50 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 transition-all shadow-inner"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[12px] font-mono">MAD</span>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-stone-400 italic">Ces objectifs impacteront les calculs de progression de toute l'équipe.</p>
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
            Mettre à jour l'objectif
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">check</span>
          </button>
        </div>
      </div>
    </div>
  );
}
