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
  scores?: {
    ventes: number;
    ventesMax: number;
    comportement: number;
    comportementMax: number;
    presence: number;
    presenceMax: number;
    bonus: number;
    bonusMax: number;
  };
}

const ProfileHeader = ({ role, user, scores }: ProfileHeaderProps) => {
  const isMagasin = (scores as any)?.isMagasin;

  // Map data depending on context (Magasin vs Individual Commercial)
  const fullName = isMagasin 
    ? (user as any)?.manager?.fullName || (user as any)?.manager?.name || "Administrateur"
    : user?.fullName || "Commercial";

  const seniority = isMagasin 
    ? (user as any)?.manager?.seniority || ""
    : user?.seniority || "";

  const displaySubtitle = isMagasin 
    ? (user as any)?.name || "Magasin SIQ"
    : (user?.showroomName || user?.showroom?.name || "Magasin SIQ");

  const phone = isMagasin 
    ? (user as any)?.manager?.phone || "Non renseigné" 
    : user?.phone || "Non renseigné";

  // In Image 2, the subtitle icon is location_on for the showroom name.
  const subtitleIcon = "location_on";

  return (
    <div className="flex items-start justify-between mb-8 bg-white px-12 py-10 rounded-[32px] border border-stone-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-headline text-4xl text-stone-900 tracking-tight">{fullName}</h3>
          {seniority && (
            <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-[9px] uppercase font-black rounded-lg border border-yellow-100 tracking-widest">
              {seniority}
            </span>
          )}
        </div>
        <p className="text-stone-400 font-sans text-[13px] mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">{subtitleIcon}</span>
          {displaySubtitle}
        </p>
        <div className="flex items-center gap-6 text-[12px] text-stone-600 font-sans">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-stone-300">call</span>
            {phone}
          </span>
        </div>
      </div>
      <ScoreOverview role={role} scores={scores} />
    </div>
  );
};


export default ProfileHeader;
