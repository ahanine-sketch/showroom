'use client';

import React from 'react';
import Link from 'next/link';

interface ShowroomCardProps {
  id: string;
  name: string;
  address: string;
  city: string;
  manager: {
    name: string;
    avatar: string;
    seniority?: string;
  };
  performance: number;
  score: number;
  commercialCount?: number;
  onUpdate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ShowroomCard = ({ id, name, address, city, manager, performance, score, commercialCount = 0, onUpdate, onDelete }: ShowroomCardProps) => {
  return (
    <Link href={`/owner/showrooms/${id}`} className="block group">
      <div className="bg-white rounded-[24px] p-6 border border-stone-100 shadow-sm transition-all duration-500 hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:border-yellow-500/30 relative h-full flex flex-col group/card border-b-[3px] border-b-transparent hover:border-b-yellow-500">
        
        {/* Action Buttons (Hover) */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity z-10">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUpdate?.(id); }} 
            className="w-8 h-8 rounded-full bg-stone-50 hover:bg-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors shadow-sm"
            title="Modifier"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(id); }} 
            className="w-8 h-8 rounded-full bg-stone-50 hover:bg-red-50 flex items-center justify-center text-stone-400 hover:text-red-500 transition-colors shadow-sm"
            title="Supprimer"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>

        {/* Header section with Badge */}
        <div className="flex justify-between items-start mb-4 pr-24">
          <div className="space-y-1">
            <h3 className="text-[19px] font-headline font-semibold text-stone-900 leading-tight">{name}</h3>
            <p className="text-[12px] text-stone-400 font-light truncate max-w-[180px]">{address}</p>
          </div>
          <div className="px-2.5 py-0.5 bg-stone-50 border border-stone-100 rounded-lg">
            <span className="text-[8px] font-mono font-bold text-stone-400 uppercase tracking-widest">{city}</span>
          </div>
        </div>

        {/* Responsable Section */}
        <div className="flex items-center justify-between mb-6 pt-2 border-b border-stone-50 pb-4">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-stone-400 uppercase tracking-widest font-bold">Responsable</span>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-stone-800">{manager.name}</span>
              {manager.seniority && (
                <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[8px] uppercase font-black rounded border border-yellow-100 tracking-widest">
                  {manager.seniority}
                </span>
              )}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-300">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>



        {/* Team Section */}
        <div className="pt-4 pb-1 border-t border-stone-50 flex items-center justify-between mb-4">
          <div className="flex -space-x-1.5">
            {Array.from({ length: Math.min(commercialCount, 3) }).map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-stone-50 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[12px] text-stone-400">person</span>
              </div>
            ))}
            {commercialCount === 0 && (
               <div className="w-6 h-6 rounded-full border-2 border-dashed border-stone-100 bg-stone-50/30 flex items-center justify-center">
                 <span className="material-symbols-outlined text-[10px] text-stone-200">person_off</span>
               </div>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/owner/commercials?magasinId=${id}`;
            }}
            className="group/team flex items-center gap-2 px-3 py-1.5 bg-stone-50 hover:bg-yellow-50 rounded-xl transition-all duration-300"
          >
            <span className="text-[10px] font-bold text-stone-600 group-hover/team:text-yellow-700 uppercase tracking-wider">
              {commercialCount} {commercialCount <= 1 ? 'Commercial' : 'Commerciaux'}
            </span>
            <span className="material-symbols-outlined text-[14px] text-stone-300 group-hover/team:text-yellow-600 transition-transform group-hover/team:translate-x-0.5">
              chevron_right
            </span>
          </button>
        </div>

        {/* Footer Score section */}
        <div className="mt-auto flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className={`text-3xl font-mono font-bold ${getStatusColor(score).text}`}>{score}</span>
                <span className="text-stone-300 text-[12px] font-mono font-medium">/ 100</span>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded inline-block w-fit ${getStatusColor(score).badge}`}>
                {getStatusColor(score).label}
              </span>
            </div>
           <div className="flex items-center gap-2 group/btn">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-stone-400 group-hover/btn:text-yellow-600 transition-colors">Voir détails</span>
              <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover/btn:bg-yellow-500 group-hover/btn:text-white transition-all shadow-sm">
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </div>
           </div>
        </div>
      </div>
    </Link>
  );
};

function getStatusColor(score: number) {
  if (score >= 90) return { text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-600', label: 'Très Bien' };
  if (score >= 60) return { text: 'text-yellow-600', badge: 'bg-yellow-50 text-yellow-600', label: 'Bien' };
  if (score >= 50) return { text: 'text-orange-500', badge: 'bg-orange-50 text-orange-600', label: 'Moyen' };
  return { text: 'text-red-500', badge: 'bg-red-50 text-red-600', label: 'Mauvais' };
}

export default ShowroomCard;
