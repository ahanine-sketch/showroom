'use client';

import React from 'react';

interface Quote {
  id: string;
  clientName: string;
  projectName: string;
  amount: number;
  date: string;
  status: string;
}

interface QuotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  status: string;
  quotes: Quote[];
}

const QuotesDrawer = ({ isOpen, onClose, status, quotes }: QuotesDrawerProps) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-[60] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-[500px] bg-stone-50 shadow-2xl z-[70] transform transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-10 bg-white border-b border-stone-200/60 relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2 opacity-60">Devis Section</p>
              <h2 className="font-headline text-[36px] font-black text-stone-900 leading-tight">
                {status} <span className="text-[20px] font-normal text-stone-300 ml-2">({quotes.length})</span>
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-white hover:border-stone-200 transition-all active:scale-95 group"
            >
              <span className="material-symbols-outlined text-[24px] group-hover:rotate-90 transition-transform duration-300">close</span>
            </button>
          </div>
          <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-emerald-50/50 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-4">
          {quotes.length > 0 ? (
            quotes.map((quote) => (
              <div 
                key={quote.id} 
                className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm hover:border-yellow-200 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-[15px] font-black text-stone-900 mb-1 group-hover:text-yellow-600 transition-colors uppercase tracking-tight">{quote.clientName}</h3>
                    <p className="text-[12px] text-stone-400 font-medium">{quote.projectName}</p>
                  </div>
                  <div className="px-3 py-1 bg-stone-50 border border-stone-100 rounded-lg text-[10px] font-mono font-bold text-stone-500">
                    {quote.date}
                  </div>
                </div>
                
                <div className="flex justify-between items-end pt-4 border-t border-stone-50">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest leading-none">ID</span>
                    <span className="text-[12px] font-mono font-bold text-stone-600">#{quote.id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest block mb-1 opacity-60">Montant Total</span>
                    <p className="text-[18px] font-mono font-black text-stone-900">
                      {quote.amount.toLocaleString('en-US')} <span className="text-[10px] text-stone-300 ml-0.5">MAD</span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-stone-300 py-20 opacity-50">
              <span className="material-symbols-outlined text-[64px] mb-4">folder_off</span>
              <p className="text-[14px] font-bold uppercase tracking-[0.2em]">Aucun devis trouvé</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-stone-200/60 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-stone-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.15em] hover:bg-stone-800 transition-all shadow-xl active:scale-[0.98]"
          >
            Fermer
          </button>
        </div>
      </div>
    </>
  );
};

export default QuotesDrawer;
