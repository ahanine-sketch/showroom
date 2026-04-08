import React from 'react';
import ScoreOverview from './ScoreOverview';

interface ProfileHeaderProps {
  role: 'admin' | 'owner';
}

const ProfileHeader = ({ role }: ProfileHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-8 bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
      <div className="flex items-center gap-8">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop" 
            className="w-24 h-24 rounded-2xl object-cover border-4 border-stone-50 shadow-sm"
            alt="Hajar El Rhiti"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white"></div>
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-headline text-4xl text-on-surface tracking-tight italic">Hajar El Rhiti</h3>
            <span className="px-3 py-1 bg-stone-100 text-stone-500 text-[10px] uppercase font-bold rounded-md tracking-widest">Commercial Senior</span>
          </div>
          <p className="text-stone-400 font-mono text-[13px] mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            Showroom Casa Ain Diab
          </p>
          <div className="flex items-center gap-6 text-[12px] text-stone-600 font-mono">
            
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-stone-300">call</span>
              +212 66777229
            </span>
          </div>
        </div>
      </div>
      <ScoreOverview role={role} />
    </div>
  );
};

export default ProfileHeader;
