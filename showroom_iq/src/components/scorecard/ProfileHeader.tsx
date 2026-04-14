import React from 'react';
import ScoreOverview from './ScoreOverview';

interface ProfileHeaderProps {
  role: 'admin' | 'owner';
  user?: {
    fullName: string;
    phone: string;
    seniority: string;
    avatarUrl?: string;
    showroomName?: string;
  };
}

const ProfileHeader = ({ role, user }: ProfileHeaderProps) => {
  // Map external userData structure to local props
  const fullName = user?.fullName || "Utilisateur";
  const phone = user?.phone || "Non renseigné";
  const seniority = user?.seniority || "";
  const avatarUrl = user?.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop";
  const showroomName = user?.showroomName || user?.showroom?.name || "Magasin Casablanca";

  return (
    <div className="flex items-start justify-between mb-8 bg-white px-12 py-10 rounded-[32px] border border-stone-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-12">
        <div className="relative">
          <img 
            src={avatarUrl} 
            className="w-24 h-24 rounded-2xl object-cover border-4 border-stone-50 shadow-sm"
            alt={fullName}
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white"></div>
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-headline text-4xl text-on-surface tracking-tight">{fullName}</h3>
            {seniority && (
              <span className="px-3 py-1 bg-stone-100 text-stone-500 text-[10px] uppercase font-bold rounded-md tracking-widest">
                {seniority}
              </span>
            )}
          </div>
          <p className="text-stone-400 font-mono text-[13px] mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            {showroomName}
          </p>
          <div className="flex items-center gap-6 text-[12px] text-stone-600 font-mono">
            
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-stone-300">call</span>
              {phone}
            </span>
          </div>
        </div>
      </div>
      <ScoreOverview role={role} />
    </div>
  );
};

export default ProfileHeader;
