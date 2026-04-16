'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import UserSlideOver from '@/components/UserSlideOver';

interface CommercialScores {
  global: number;
  ventes: number;
  comportement: number;
  presence: number;
  bonus: number;
}

interface Commercial {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: string;
  seniority?: string;
  avatarUrl?: string;
  showroom?: { id: string; name: string } | null;
  scores: CommercialScores;
}

/** Returns Tailwind color class for each metric bar based on exact point thresholds */
function getBarColor(metric: 'ventes' | 'comportement' | 'presence' | 'bonus', value: number): string {
  switch (metric) {
    case 'ventes':
      if (value >= 55) return 'bg-emerald-400';  // Très Bien
      if (value >= 45) return 'bg-yellow-400';   // Bien
      if (value >= 35) return 'bg-orange-400';   // Moyen
      return 'bg-rose-500';                       // Mauvais
    case 'comportement':
      if (value >= 25) return 'bg-emerald-400';
      if (value >= 16) return 'bg-yellow-400';
      if (value >= 10) return 'bg-orange-400';
      return 'bg-rose-500';
    case 'presence':
      if (value >= 5) return 'bg-emerald-400';
      if (value >= 3) return 'bg-yellow-400';
      if (value >= 1) return 'bg-orange-400';
      return 'bg-rose-500';
    case 'bonus':
    default:
      return 'bg-stone-300';
  }
}

/** Returns text + dot color for the global score card */
function getGlobalColor(score: number): { text: string; dot: string; badge: string } {
  if (score >= 85) return { text: 'text-emerald-600', dot: 'bg-emerald-400', badge: 'text-emerald-600' };
  if (score >= 64) return { text: 'text-yellow-600',  dot: 'bg-yellow-400',  badge: 'text-yellow-600' };
  if (score >= 46) return { text: 'text-orange-500',  dot: 'bg-orange-400',  badge: 'text-orange-500' };
  return             { text: 'text-red-500',    dot: 'bg-rose-500',    badge: 'text-red-500' };
}


export default function TeamPage() {
  const [team, setTeam] = useState<Commercial[]>([]);
  const [showroom, setShowroom] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:3001/api/users/my-team', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setTeam(result.data);
        setShowroom(result.showroom || null);
      }
    } catch (err) {
      console.error('Error fetching team:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTeam(); }, []);

  const handleEditUser = (e: React.MouseEvent, member: Commercial) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedUser({
      id: member.id,
      name: member.fullName,
      email: member.email || '',
      phone: member.phone || '',
      role: member.role,
      magasinId: member.showroom?.id
    });
    setDrawerMode('edit');
    setIsUserDrawerOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(showroom ? { magasinId: showroom.id, role: 'COMMERCIAL' } : null);
    setDrawerMode('create');
    setIsUserDrawerOpen(true);
  };

  const handleSaveUser = async (data: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      const url = drawerMode === 'edit' && selectedUser?.id
        ? `http://localhost:3001/api/users/${selectedUser.id}`
        : `http://localhost:3001/api/users`;
      const method = drawerMode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        setIsUserDrawerOpen(false);
        fetchTeam();
      } else {
        alert(result.error || 'Erreur lors de la sauvegarde');
      }
    } catch {
      alert('Erreur réseau');
    }
  };

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] h-[70px] z-40 bg-white/80 backdrop-blur-xl flex items-center justify-between px-10 border-b border-stone-100/50">
        <div className="flex items-center gap-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400">ADMIN / EQUIPE</span>
          <div className="h-4 w-[1px] bg-stone-200" />
          <span className="text-stone-900 border-b-2 border-yellow-600 pb-1 font-headline italic text-[14px]">Gestion des Commerciaux</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAddUser}
            className="px-6 py-2.5 bg-stone-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-full shadow-lg hover:bg-yellow-700 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Ajouter
          </button>
        </div>
      </header>

      <main className="pt-28 px-12 pb-20 max-w-[1600px] mx-auto font-sans">
        {/* Page Hero */}
        <div className="mb-12">
          <div className="flex items-end justify-between">
            <div>
              <nav className="font-mono text-[9px] uppercase tracking-[0.4em] text-yellow-700 mb-2 font-bold opacity-70">
                {showroom ? showroom.name : 'Protocol Showroom'}
              </nav>
              <h2 className="text-4xl font-headline font-light italic text-stone-900 tracking-tight">Focus Équipe</h2>
            </div>
            <div className="text-right">
              <p className="text-4xl font-headline italic text-stone-900 leading-none">{isLoading ? '–' : team.length}</p>
              <p className="text-[9px] font-mono text-stone-400 uppercase tracking-widest mt-1">Commerciaux</p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-[48px] text-stone-300 animate-spin">refresh</span>
            <p className="font-mono text-[11px] uppercase tracking-widest text-stone-400">Chargement de l'équipe…</p>
          </div>
        )}

        {/* Team Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => {
              const globalColors = getGlobalColor(member.scores.global);

              return (
                <Link key={member.id} href={`/admin/scorecard/commercial?id=${member.id}`} className="block h-full group">
                  <div className="bg-white rounded-[32px] p-7 border border-stone-100 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all overflow-hidden relative h-full flex flex-col group/card border-b-[3px] border-b-transparent hover:border-b-yellow-500">

                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-stone-100 flex items-center justify-center bg-stone-100">
                            <span className="material-symbols-outlined text-stone-400">account_circle</span>
                          </div>
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-stone-900 group-hover:text-yellow-700 transition-colors text-[16px]">{member.fullName}</h4>
                          <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mt-0.5">
                            Commercial {member.seniority ? member.seniority.charAt(0) + member.seniority.slice(1).toLowerCase() : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleEditUser(e, member)}
                        className="w-9 h-9 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-white hover:border-stone-200 transition-all shadow-sm z-20"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </div>

                    {/* Scores */}
                    <div className="space-y-6">
                      {/* Global Performance */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${globalColors.dot}`} />
                            Performance Globale
                          </span>
                          <span className={`font-mono font-bold text-[14px] ${globalColors.text}`}>
                            {member.scores.global}/100
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                          <div className={`h-full ${globalColors.dot} rounded-full transition-all duration-700`} style={{ width: `${member.scores.global}%` }} />
                        </div>
                      </div>

                      {/* Metrics Matrix */}
                      <div className="pt-6 border-t border-stone-50 grid grid-cols-2 gap-x-10 gap-y-6">
                        {/* Ventes */}
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-[0.2em] font-bold">Ventes</span>
                            <span className="text-[13px] font-bold text-stone-900 font-mono">{member.scores.ventes}</span>
                          </div>
                          <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                            <div className={`h-full ${getBarColor('ventes', member.scores.ventes)} rounded-full`} style={{ width: `${(member.scores.ventes / 65) * 100}%` }} />
                          </div>
                        </div>

                        {/* Présence */}
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-[0.2em] font-bold">Présence</span>
                            <span className="text-[13px] font-bold text-stone-900 font-mono">{member.scores.presence}</span>
                          </div>
                          <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                            <div className={`h-full ${getBarColor('presence', member.scores.presence)} rounded-full`} style={{ width: `${(member.scores.presence / 5) * 100}%` }} />
                          </div>
                        </div>

                        {/* Comportement */}
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-[0.2em] font-bold">Comport.</span>
                            <span className="text-[13px] font-bold text-stone-900 font-mono">{member.scores.comportement}</span>
                          </div>
                          <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                            <div className={`h-full ${getBarColor('comportement', member.scores.comportement)} rounded-full`} style={{ width: `${(member.scores.comportement / 30) * 100}%` }} />
                          </div>
                        </div>

                        {/* Bonus */}
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-[0.2em] font-bold">Bonus</span>
                            <span className="text-[13px] font-bold text-stone-900 font-mono">{member.scores.bonus}</span>
                          </div>
                          <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                            <div className="h-full bg-stone-300 rounded-full" style={{ width: `${(member.scores.bonus / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="mt-8 pt-4 border-t border-stone-50/50 flex justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <span className="text-[9px] font-mono text-yellow-600 font-bold uppercase tracking-[0.4em] italic">Open Detailed Scorecard</span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Empty state */}
            {team.length === 0 && !isLoading && (
              <div className="col-span-3 py-20 flex flex-col items-center gap-4 text-stone-300">
                <span className="material-symbols-outlined text-[64px]">group_off</span>
                <p className="font-mono text-[12px] uppercase tracking-widest">Aucun commercial dans votre équipe</p>
              </div>
            )}

            {/* Add Member Placeholder */}
            <button
              onClick={handleAddUser}
              className="rounded-[32px] border-2 border-dashed border-stone-200 flex flex-col items-center justify-center p-8 text-stone-300 hover:border-yellow-300 hover:text-yellow-600 hover:bg-yellow-50/20 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-stone-50 group-hover:bg-yellow-100 flex items-center justify-center mb-4 transition-colors">
                <span className="material-symbols-outlined text-[32px]">group_add</span>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] font-bold">Nouveau Commercial</p>
            </button>
          </div>
        )}
      </main>

      <UserSlideOver
        isOpen={isUserDrawerOpen}
        onClose={() => setIsUserDrawerOpen(false)}
        user={selectedUser}
        mode={drawerMode}
        magasins={showroom ? [{ id: showroom.id, name: showroom.name }] : []}
        fixedMagasinId={showroom?.id}
        onSubmit={handleSaveUser}
      />
    </>
  );
}
