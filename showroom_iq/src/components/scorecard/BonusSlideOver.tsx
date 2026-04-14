'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface BonusHistory {
  id: number;
  date: string;
  amount: number;
  description: string;
}

interface BonusSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function BonusSlideOver({ isOpen, onClose, userId }: BonusSlideOverProps) {
  const [bonusAmount, setBonusAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [history, setHistory] = useState<BonusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [limits, setLimits] = useState({ min: 0, max: 5 });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchData();
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      // Fetch Bonus History
      const historyRes = await fetch(`http://localhost:3001/api/performance/bonus-history/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const historyData = await historyRes.json();
      if (historyData.success) setHistory(historyData.data);

      // Fetch Global settings for limits
      const settingsRes = await fetch('http://localhost:3001/api/settings/configs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.data.global.siq_bonus_config) {
        setLimits(settingsData.data.global.siq_bonus_config);
        setBonusAmount(settingsData.data.global.siq_bonus_config.min);
      }
    } catch (err) {
      console.error("Failed to fetch bonus data", err);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) return toast.error("Veuillez saisir une description");
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/performance/bonus', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          amount: bonusAmount,
          description,
          date: new Date().toISOString()
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Bonus attribué avec succès !");
        setDescription('');
        fetchData(); // Refresh history
      } else {
        toast.error(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      console.error("Failed to submit bonus", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-stone-100 bg-stone-50/50">
          <div>
            <h2 className="font-headline text-3xl italic text-stone-900 leading-none">
              Attribuer un Bonus
            </h2>
            <p className="text-stone-500 font-mono text-[10px] mt-2 uppercase tracking-[0.2em]">
              Récompense Performance
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors bg-white shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Slider Section */}
          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest">Valeur du Bonus</label>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl font-bold text-yellow-600">{bonusAmount}</span>
                <span className="text-[12px] font-bold text-stone-400 uppercase tracking-widest">points</span>
              </div>
            </div>
            
            <div className="relative pt-6">
              <input 
                type="range" 
                min={limits.min}
                max={limits.max}
                step="1"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(parseInt(e.target.value))}
                className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-yellow-600"
              />
              <div className="flex justify-between mt-4 px-1">
                {Array.from({ length: limits.max - limits.min + 1 }).map((_, idx) => {
                  const val = limits.min + idx;
                  return (
                    <span key={val} className={`text-[10px] font-mono font-bold transition-all duration-300 ${bonusAmount === val ? 'text-yellow-600 scale-150' : 'text-stone-300'}`}>
                      {val}
                    </span>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Description Section */}
          <section className="space-y-4">
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest">Description / Justification</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expliquez pourquoi vous attribuez ce bonus..."
              className="w-full border border-stone-100 rounded-2xl px-6 py-4 text-[14px] text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-600/10 focus:border-yellow-600/30 transition-all min-h-[120px] bg-stone-50/30 shadow-inner placeholder:italic placeholder:text-stone-300"
            ></textarea>
          </section>

          {/* History Section */}
          <section className="space-y-6 pt-6 border-t border-stone-100">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-stone-400 text-[20px]">history_edu</span>
              <h3 className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">Historique des Bonus</h3>
            </div>
            
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="p-5 bg-stone-50/50 border border-stone-100 rounded-2xl flex justify-between items-start group hover:bg-stone-50 hover:border-yellow-100 transition-all">
                  <div className="space-y-2">
                    <p className="text-[10px] text-stone-400 font-mono font-bold uppercase tracking-widest">
                      {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-[13px] font-medium text-stone-700 leading-relaxed italic pr-4">"{item.description}"</p>
                  </div>
                  <div className="bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-xl border border-yellow-100 font-mono text-[14px] font-bold shadow-sm shrink-0">
                    +{item.amount} pts
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-stone-100 bg-stone-50/50">
          <button 
            disabled={isLoading}
            onClick={handleSubmit}
            className="w-full bg-stone-900 text-white rounded-xl py-4 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-yellow-600 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            {isLoading ? 'Attribution en cours...' : "Valider l'attribution"}
            {!isLoading && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">verified</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
