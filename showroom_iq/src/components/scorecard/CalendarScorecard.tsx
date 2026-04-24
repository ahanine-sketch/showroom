'use client';

import { API_BASE_URL } from '@/config';
import React, { useState, useEffect } from 'react';
import ProfileHeader from './ProfileHeader';
import ScoreBadge from './ScoreBadge';

interface ScorecardProps {
  role: 'admin' | 'owner';
  activeTab: 'commercial' | 'behavior' | 'calendar' | 'ressources';
  hideNav?: boolean;
  isDashboard?: boolean;
  userData?: any;
  scores?: any;
  onRefresh?: () => Promise<void>;
  viewMonth?: number;
  viewYear?: number;
  setViewMonth?: (m: number) => void;
  setViewYear?: (y: number) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

const CalendarScorecard = ({ 
  role = 'owner', 
  activeTab = 'calendar', 
  hideNav = false, 
  isDashboard = false, 
  userData, 
  scores, 
  onRefresh,
  viewMonth = new Date().getMonth() + 1,
  viewYear = new Date().getFullYear(),
  setViewMonth,
  setViewYear,
  onPrevMonth,
  onNextMonth
}: ScorecardProps) => {
  const isMagasin = scores?.isMagasin;
  const details = scores?.details || {};
  const currentLogs = details.presenceLogs || [];
  const currentNotes = details.notesList || [];
  const setters = details.setters || {};

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Grid Calculation
  const firstDayOfMonth = new Date(viewYear, viewMonth - 1, 1);
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

  // Handlers for manual inputs (commercial only)
  const [presenceStatus, setPresenceStatus] = useState('Retard');
  const [presenceDate, setPresenceDate] = useState(`${viewYear}-${String(viewMonth).padStart(2, '0')}-01`);
  const [presenceMotif, setPresenceMotif] = useState('');
  const [noteType, setNoteType] = useState('positive');
  const [noteDate, setNoteDate] = useState(`${viewYear}-${String(viewMonth).padStart(2, '0')}-01`);
  const [noteContent, setNoteContent] = useState('');

  const handleAddPresence = async () => {
    if (setters.setPresenceLogs) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/performance/evaluation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            userId: userData.id,
            type: 'PRESENCE',
            date: presenceDate,
            presenceStatus: presenceStatus,
            motif: presenceMotif
          })
        });

        const result = await response.json();
        if (result.success) {
          if (onRefresh) await onRefresh();
          setPresenceMotif('');
        } else {
          alert('Erreur: ' + result.error);
        }
      } catch (error) {
        console.error('Error adding presence:', error);
        alert('Une erreur est survenue lors de l\'enregistrement.');
      }
    }
  };

  const handleAddNote = async () => {
    if (setters.setNotesList) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/performance/evaluation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            userId: userData.id,
            type: 'DAILY_NOTE',
            date: noteDate,
            noteType: noteType,
            content: noteContent
          })
        });

        const result = await response.json();
        if (result.success) {
          if (onRefresh) await onRefresh();
          setNoteContent('');
        } else {
          alert('Erreur: ' + result.error);
        }
      } catch (error) {
        console.error('Error adding note:', error);
        alert('Une erreur est survenue lors de l\'enregistrement.');
      }
    }
  };

  // For magasin: the backend already returns team-aggregated logs/notes in currentLogs/currentNotes
  const effectiveLogs = currentLogs;
  const effectiveNotes = currentNotes;

  const getDayStatus = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const log = effectiveLogs.find((l: any) => l.date === dateStr);
    const dayNotes = effectiveNotes.filter((n: any) => n.date === dateStr);
    // For magasin: get all logs for this day (multiple commercials)
    const allDayLogs = effectiveLogs.filter((l: any) => l.date === dateStr);
    return { log, dayNotes, allDayLogs };
  };

  // Aggregate overview stats for magasin (all commercials)
  const overviewLogs = isMagasin ? effectiveLogs : currentLogs;
  const overviewNotes = isMagasin ? effectiveNotes : currentNotes;

  return (
    <div className={`${isDashboard ? 'py-6 px-2' : 'p-12'} space-y-8 max-w-[1400px] mx-auto`}>
      <ProfileHeader 
        role={role} 
        user={userData}
        scores={scores}
      />

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-8 space-y-8">
          {/* Calendar Card */}
          <div className="bg-white p-10 rounded-3xl border border-stone-200/60 shadow-sm relative pt-24 min-h-[700px]">
            <div className="absolute top-8 left-10 flex flex-col items-start gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                </div>
                <div>
                  <h4 className="font-headline text-[28px] font-bold tracking-tight text-stone-900 leading-none">Calendrier</h4>
                </div>
              </div>
              

            </div>

            <div className="w-full h-32"></div>

            <div className="grid grid-cols-7 gap-3 mb-4">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3">
              {[...Array(startingDayIndex)].map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square opacity-5 bg-stone-50 rounded-2xl"></div>
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const { log, dayNotes, allDayLogs } = getDayStatus(day);
                const isSelected = selectedDay === day;

                return (
                  <div 
                    key={day} 
                    onClick={() => {
                      setSelectedDay(day);
                      const d = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      setPresenceDate(d);
                      setNoteDate(d);
                    }}
                    className={`aspect-square p-2 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected ? 'border-stone-900 bg-stone-900 text-white shadow-xl scale-105 z-10' : 'border-stone-50 hover:border-stone-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`font-mono text-[13px] font-bold ${isSelected ? 'text-white' : 'text-stone-300 group-hover:text-stone-900'}`}>
                        {String(day).padStart(2, '0')}
                      </span>
                      
                      <div className="flex flex-col gap-0.5">
                        {dayNotes.some((n: any) => n.type === 'positive') && (
                          <span className="text-[12px] font-black leading-none text-emerald-500">
                            +
                          </span>
                        )}
                        {dayNotes.some((n: any) => n.type === 'negative') && (
                          <span className="text-[12px] font-black leading-none text-rose-500">
                            -
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 justify-end">
                      {(isMagasin ? allDayLogs : [log]).filter(Boolean).map((l: any, idx: number) => (
                        <React.Fragment key={idx}>
                          {l?.status === 'Retard' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>}
                          {l?.status === 'Absence' && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
                          {l?.status === 'Congé' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 pt-10 border-t border-stone-50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Retard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Absence</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Congé</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-black text-sm">+</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Note Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-500 font-black text-sm">-</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Note Négative</span>
              </div>
            </div>

            {/* Center Modal for Day Details */}
            {selectedDay !== null && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div 
                  className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" 
                  onClick={() => setSelectedDay(null)}
                ></div>
                
                <div className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl border border-stone-100 animate-in fade-in zoom-in duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-headline text-2xl font-bold text-stone-900 leading-tight">Détails du Jour</h3>
                      <p className="text-[11px] font-bold text-blue-500 uppercase tracking-[0.2em] mt-1">
                        {new Date(viewYear, viewMonth - 1, selectedDay).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedDay(null)} 
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-50 text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Presence Section */}
                    <div>
                      <h4 className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] mb-3">Logs de Présence</h4>
                      {getDayStatus(selectedDay).allDayLogs.length > 0 ? (
                        <div className="space-y-2">
                          {getDayStatus(selectedDay).allDayLogs.map((l: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  l?.status === 'Retard' ? 'bg-amber-100 text-amber-600' :
                                  l?.status === 'Absence' ? 'bg-red-100 text-red-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                  <span className="material-symbols-outlined text-[18px]">
                                    {l?.status === 'Retard' ? 'schedule' : 
                                     l?.status === 'Absence' ? 'event_busy' : 'beach_access'}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  {l?.userName && (
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{l.userName}</span>
                                  )}
                                  <span className="text-[14px] font-bold text-stone-800 leading-tight">{l?.status}</span>
                                </div>
                              </div>
                              {l?.motif && (
                                <span className="text-[11px] font-medium text-stone-400 italic">"{l?.motif}"</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : getDayStatus(selectedDay).log ? (
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              getDayStatus(selectedDay).log?.status === 'Retard' ? 'bg-amber-100 text-amber-600' :
                              getDayStatus(selectedDay).log?.status === 'Absence' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              <span className="material-symbols-outlined text-[18px]">
                                {getDayStatus(selectedDay).log?.status === 'Retard' ? 'schedule' : 
                                 getDayStatus(selectedDay).log?.status === 'Absence' ? 'event_busy' : 'beach_access'}
                              </span>
                            </div>
                           <div className="flex flex-col gap-0.5">
                             {getDayStatus(selectedDay).log?.userName && (
                               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{getDayStatus(selectedDay).log.userName}</span>
                             )}
                             <span className="text-[14px] font-bold text-stone-800 leading-tight">{getDayStatus(selectedDay).log?.status}</span>
                           </div>
                          </div>
                          {getDayStatus(selectedDay).log?.motif && (
                            <span className="text-[11px] font-medium text-stone-400 italic">"{getDayStatus(selectedDay).log?.motif}"</span>
                          )}
                        </div>
                      ) : (
                        <div className="p-10 rounded-2xl border border-dashed border-stone-100 flex flex-col items-center justify-center text-center">
                          <span className="material-symbols-outlined text-stone-200 text-3xl mb-2">person_off</span>
                          <p className="text-[12px] text-stone-400 italic font-medium">Aucun log enregistré</p>
                        </div>
                      )}
                    </div>

                    {/* Notes Section */}
                    <div>
                      <h4 className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] mb-3">Notes de Performance</h4>
                      {getDayStatus(selectedDay).dayNotes.length > 0 ? (
                        <div className="space-y-3">
                          {getDayStatus(selectedDay).dayNotes.map((n: any, i: number) => (
                            <div key={i} className={`p-4 rounded-2xl border ${
                              n.type === 'positive' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'
                            }`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  n.type === 'positive' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                }`}>
                                  <span className="font-bold text-[16px]">{n.type === 'positive' ? '+' : '-'}</span>
                                </div>
                                <div className="flex flex-col gap-1 pr-4">
                                  {n.userName && (
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{n.userName}</span>
                                  )}
                                  <p className="text-[13px] font-medium text-stone-700 leading-relaxed">{n.text}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-10 rounded-2xl border border-dashed border-stone-100 flex flex-col items-center justify-center text-center">
                          <span className="material-symbols-outlined text-stone-200 text-3xl mb-2">history_edu</span>
                          <p className="text-[12px] text-stone-400 italic font-medium">Aucune note pour ce jour</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-stone-50 flex justify-end">
                    <button 
                      onClick={() => setSelectedDay(null)}
                      className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg active:scale-95"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interaction Cards — ONLY for commercial (not magasin) */}
          {!isMagasin && (role === 'owner' || role === 'admin') && (
            <div className="grid grid-cols-2 gap-8">
              {/* Log Presence Form */}
              <div className="bg-white p-8 rounded-3xl border border-stone-200/60 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
                  </div>
                  <h5 className="font-headline text-xl font-bold text-stone-900">Log de Présence</h5>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Statut</label>
                      <select 
                        value={presenceStatus}
                        onChange={(e) => setPresenceStatus(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-[13px] font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer appearance-none"
                      >
                        <option>Retard</option>
                        <option>Absence</option>
                        <option>Congé</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Date</label>
                      <input 
                        type="date"
                        value={presenceDate}
                        onChange={(e) => setPresenceDate(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-[13px] font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Motif</label>
                    <textarea 
                      placeholder="Indiquer le motif..." 
                      rows={2}
                      value={presenceMotif}
                      onChange={(e) => setPresenceMotif(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-[13px] font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-stone-300"
                    ></textarea>
                  </div>
                  <button 
                    onClick={handleAddPresence}
                    className="w-full py-4 bg-stone-900 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-lg active:scale-95"
                  >
                    Valider Log
                  </button>
                </div>
              </div>

              {/* Day Note Form */}
              <div className="bg-white p-8 rounded-3xl border border-stone-200/60 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-[22px]">edit_note</span>
                  </div>
                  <h5 className="font-headline text-xl font-bold text-stone-900">Note Journalière</h5>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Type</label>
                      <select 
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-[13px] font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer appearance-none"
                      >
                        <option value="positive">Note Positive (+)</option>
                        <option value="negative">Note Négative (-)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Date</label>
                      <input 
                        type="date"
                        value={noteDate}
                        onChange={(e) => setNoteDate(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-[13px] font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Observations</label>
                    <textarea 
                      placeholder="Commentaire de performance..." 
                      rows={2}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-[13px] font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-stone-300"
                    ></textarea>
                  </div>
                  <button 
                    onClick={handleAddNote}
                    className="w-full py-4 bg-stone-900 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-lg active:scale-95"
                  >
                    Enregistrer Note
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Overview & History Column */}
        <div className="col-span-4 space-y-10">
          {/* Unified Overview Card — No score badge for magasin */}
          <div className="bg-white border border-stone-200/60 rounded-3xl p-8 shadow-sm relative transition-all hover:shadow-md flex flex-col">
            <div className="flex items-start justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-lg shadow-stone-200">
                  <span className="material-symbols-outlined text-[24px]">analytics</span>
                </div>
                <div>
                  <h4 className="font-headline text-[22px] font-bold tracking-tight text-stone-900 leading-none">Overview</h4>
                  {isMagasin && (
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mt-1 opacity-60">Tous les commerciaux</p>
                  )}
                </div>
              </div>
              {/* Score badge only for commercial, not magasin */}
              {!isMagasin && (
                <ScoreBadge 
                  score={scores?.details?.presenceData?.points ?? 5} 
                  max={scores?.details?.presenceData?.maxScore || 5} 
                  status={scores?.details?.presenceData?.status || "TRES BIEN"} 
                  color={scores?.details?.presenceData?.statusColor}
                />
              )}
            </div>

            <div className="flex-1 space-y-6">
               {/* Statistics List */}
               <div className="grid grid-cols-1 gap-3 mt-4">
                 {[
                   { label: 'Retards', value: overviewLogs.filter((l: any) => l.status === 'Retard').length, icon: 'schedule', color: 'amber' },
                   { label: 'Absences', value: overviewLogs.filter((l: any) => l.status === 'Absence').length, icon: 'event_busy', color: 'red' },
                   { label: 'Notes Positives', value: overviewNotes.filter((n: any) => n.type === 'positive').length, icon: 'add_task', color: 'emerald' },
                   { label: 'Notes Négatives', value: overviewNotes.filter((n: any) => n.type === 'negative').length, icon: 'thumb_down', color: 'rose' }
                 ].map((stat, i) => (
                   <div key={i} className={`flex items-center justify-between p-4 bg-white border border-stone-50 rounded-2xl shadow-sm hover:border-${stat.color}-200 transition-all group`}>
                     <div className="flex items-center gap-3">
                       <div className={`w-9 h-9 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                         <span className="material-symbols-outlined text-[18px]">{stat.icon}</span>
                       </div>
                       <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest group-hover:text-stone-900">{stat.label}</span>
                     </div>
                     <span className="text-xl font-mono font-bold text-stone-900">
                       {String(stat.value).padStart(2, '0')}
                     </span>
                   </div>
                 ))}
               </div>


            </div>
          </div>

          {/* Note History Card */}
          <div className="bg-white border border-stone-200/60 rounded-3xl p-10 shadow-sm relative transition-all hover:shadow-md">
             <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[24px]">history</span>
                </div>
                <div>
                  <h4 className="font-headline text-[22px] font-bold tracking-tight text-stone-900 leading-none mb-1">Historique Notes</h4>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold opacity-60">
                    {isMagasin ? 'Tous les commerciaux' : 'Derniers feedbacks'}
                  </p>
                </div>
             </div>

             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {overviewNotes.map((note: any, idx: number) => (
                  <div key={idx} className="flex gap-4 p-4 border border-stone-50 rounded-2xl bg-stone-50/30 hover:bg-white hover:border-stone-100 hover:shadow-sm transition-all group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      note.type === 'positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      <span className="font-bold text-[18px]">{note.type === 'positive' ? '+' : '-'}</span>
                    </div>
                    <div className="min-w-0">
                       <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                         <span>{new Date(note.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}</span>
                       </p>
                       <p className="text-[13px] font-medium text-stone-700 truncate group-hover:text-stone-900 transition-colors uppercase leading-tight font-headline">{note.text}</p>
                    </div>
                  </div>
                ))}
                {overviewNotes.length === 0 && (
                  <p className="text-[12px] text-stone-400 italic text-center py-8">Aucun historique de notes.</p>
                )}
             </div>
             
             <button className="w-full mt-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors border-t border-stone-50 pt-8">
               Voir Tout
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarScorecard;
