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
        <div className="flex items-center gap-3 mb-6 pt-2">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-stone-100 shadow-sm bg-stone-100 flex items-center justify-center">
            {manager.avatar ? (
              <img src={manager.avatar} alt={manager.name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-stone-300 text-[18px]">person</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-stone-400 uppercase tracking-widest font-bold">Responsable</span>
            <span className="text-[13px] font-semibold text-stone-800">{manager.name}</span>
          </div>
        </div>

        {/* Performance CA Section */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-end">
             <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest">Performance CA</span>
             <span className="text-[12px] font-bold text-stone-900">{performance}%</span>
          </div>
          <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden shadow-inner">
             <div 
               className="h-full bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.3)] transition-all duration-1000" 
               style={{ width: `${performance}%` }}
             ></div>
          </div>
        </div>

        {/* Team Section */}
        <div className="pt-4 pb-1 border-t border-stone-50 flex items-center justify-between mb-4">
          <div className="flex -space-x-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-stone-50 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[12px] text-stone-400">person</span>
              </div>
            ))}
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
              {commercialCount} Commercial
            </span>
            <span className="material-symbols-outlined text-[14px] text-stone-300 group-hover/team:text-yellow-600 transition-transform group-hover/team:translate-x-0.5">
              chevron_right
            </span>
          </button>
        </div>

        {/* Footer Score section */}
        <div className="mt-auto flex items-end justify-between">
           <div className="flex items-baseline gap-1.5">
             <span className="text-3xl font-mono font-bold text-stone-900">{score}</span>
             <span className="text-stone-300 text-[12px] font-mono font-medium">/ 100</span>
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

export default ShowroomCard;
