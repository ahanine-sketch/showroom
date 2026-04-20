'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import CommercialScorecard from './CommercialScorecard';
import BehaviorScorecard from './BehaviorScorecard';
import CalendarScorecard from './CalendarScorecard';
import RessourcesScorecard from './RessourcesScorecard';
import BonusSlideOver from './BonusSlideOver';


type TabType = 'commercial' | 'behavior' | 'calendar' | 'ressources';

interface ScorecardWrapperProps {
  initialTab: TabType;
  role: 'admin' | 'owner';
  type?: 'commercial' | 'magasin';
  id?: string | null;
}

const ScorecardWrapper = ({ initialTab, role, type = 'commercial', id: propId }: ScorecardWrapperProps) => {
  const isMagasin = type === 'magasin';
  const searchParams = useSearchParams();
  const userId = propId || searchParams.get('id');

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBonusOpen, setIsBonusOpen] = useState(false);

  // Calendar Date State
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };


  // --- CENTRALIZED STATE ---
  const [evaluations, setEvaluations] = useState<any[]>([]);
  
  // Ventes State
  const [caAmount, setCaAmount] = useState(0);
  const [devisCreated, setDevisCreated] = useState(0);
  const [devisValidated, setDevisValidated] = useState(0);
  const [devisVolee, setDevisVolee] = useState(0);
  const [devisOuvert, setDevisOuvert] = useState(0);
  const [panierMoyen, setPanierMoyen] = useState(0);

  // Behavior derived from evaluations
  const behaviorStats = useMemo(() => {
    if (!evaluations) return { avisPositifs: 0, avisNegatifs: 0, savTickets: 0, savPlaintes: 0, processusList: [] };
    
    const avis = evaluations.filter(e => e.type === 'AVIS').reduce((acc, e) => ({
      plus: acc.plus + (e.plusAvis || 0),
      minus: acc.minus + (e.minusAvis || 0)
    }), { plus: 0, minus: 0 });

    const sav = evaluations.filter(e => e.type === 'SAV').reduce((acc, e) => ({
      tickets: acc.tickets + (e.ticketsCount || 0),
      complaints: acc.complaints + (e.complaintsCount || 0)
    }), { tickets: 0, complaints: 0 });

    const processes = evaluations.filter(e => e.type === 'PROCESS').map(e => ({
      title: e.notes || 'Avertissement',
      pts: e.warningLevel === 1 ? -2 : e.warningLevel === 2 ? -4 : -10,
      icon: 'report_problem'
    }));

    return {
      avisPositifs: avis.plus,
      avisNegatifs: avis.minus,
      savTickets: sav.tickets,
      savPlaintes: sav.complaints,
      processusList: processes
    };
  }, [evaluations]);

  const { avisPositifs, avisNegatifs, savTickets, savPlaintes, processusList } = behaviorStats;
  const [processusMalus, setProcessusMalus] = useState(0); 

  // Calendar & Presence State
  const [presenceLogs, setPresenceLogs] = useState<any[]>([]);
  const [notesList, setNotesList] = useState<any[]>([]);
  const [bonusScore, setBonusScore] = useState(0);



  // Sync state when userData loads (reads real metrics from backend for magasin)
  useEffect(() => {
    if (userData) {
      setCaAmount(userData.caAmount || 0);
      setDevisCreated(userData.devisCreated || 0);
      setDevisValidated(userData.devisValidated || 0);
      setDevisVolee(userData.devisLost || 0);
      setDevisOuvert(userData.devisOpened || 0);
      setPanierMoyen(userData.avgBasket || 0);
    }
  }, [userData]);

  const fetchEvaluations = async () => {
    try {
      const endpoint = isMagasin 
        ? `http://localhost:3001/api/performance/evaluations/showroom/${userId}/${viewMonth}/${viewYear}`
        : `http://localhost:3001/api/performance/evaluations/${userId}/${viewMonth}/${viewYear}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setEvaluations(result.data);
        
        // Handle Calendar Logs
        if (result.dailyLogs) {
          const rawLogs = result.dailyLogs.filter((l: any) => l.activity === 'PRESENCE');
          const rawNotes = result.dailyLogs.filter((l: any) => l.activity === 'DAILY_NOTE');
          
          setPresenceLogs(rawLogs.map((l: any) => ({
            date: l.date.split('T')[0],
            status: l.status,
            motif: l.notes,
            userId: l.userId,
            userName: l.user?.fullName || (userData?.fullName && l.userId === userData.id ? userData.fullName : '')
          })));

          setNotesList(rawNotes.map((n: any) => ({
            date: n.date.split('T')[0],
            type: n.status,
            text: n.notes,
            userId: n.userId,
            userName: n.user?.fullName || (userData?.fullName && n.userId === userData.id ? userData.fullName : '')
          })));
        }
        
        // Capture total bonus from backend aggregation
        if (typeof result.bonusTotal === 'number') {
          setBonusScore(result.bonusTotal);
        }
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [userId, viewMonth, viewYear]);

  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        const endpoint = isMagasin 
          ? `http://localhost:3001/api/showrooms/${userId}`
          : `http://localhost:3001/api/users/${userId}`;

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setUserData(result.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, isMagasin, viewMonth, viewYear]);

  if (loading) {
    return (
      <div className="pt-32 px-14 flex justify-center text-stone-400 font-mono text-[11px] uppercase tracking-widest">
        Chargement...
      </div>
    );
  }

  const showroomName = userData?.showroom?.name || 'Magasin Casablanca';

  // --- SCORING LOGIC ---
  const monthObjective = userData?.objectives?.[0];
  const conservativeCA = isMagasin ? (userData?.targets?.conservative || 30000) : (monthObjective?.conservativeCA || 30000);
  const likelyCA = isMagasin ? (userData?.targets?.likely || 50000) : (monthObjective?.likelyCA || 50000);
  const exceedCA = isMagasin ? (userData?.targets?.exceed || 70000) : (monthObjective?.exceedCA || 70000);

  // 1. Sales Score (35 pts for Commercial, 50 pts for Magasin)
  const getSalesScore = () => {
    const maxPoints = isMagasin ? 50 : 35;
    
    if (caAmount >= exceedCA) return { points: maxPoints, status: "TRES BIEN" };
    if (caAmount >= likelyCA) return { points: Math.floor(maxPoints * 0.9), status: "TRES BIEN" };
    if (caAmount >= conservativeCA) {
        const progress = (caAmount - conservativeCA) / (likelyCA - conservativeCA);
        // Map [conservative, likely] to points
        // For Magasin: 10 -> 45
        // For Commercial: 21 -> 31
        const startPoints = isMagasin ? 10 : 21;
        const pointRange = isMagasin ? 35 : 10;
        const points = startPoints + Math.floor(progress * pointRange);
        return { points, status: "BIEN" };
    }
    if (caAmount >= conservativeCA * 0.5) return { points: 10, status: "MOYEN" };
    return { points: 0, status: "MAUVAIS" };
  };

  // 2. Devis Score (15 pts for Commercial, 10 pts for Magasin)
  const conversionRate = devisCreated > 0 ? Math.round(((devisValidated + devisVolee) / devisCreated) * 100) : 0;
  const getDevisScore = () => {
    if (isMagasin) {
      if (conversionRate >= 75) return { points: 10, status: "TRES BIEN" };
      if (conversionRate >= 50) return { points: 8, status: "BIEN" };
      if (conversionRate >= 35) return { points: 4, status: "MOYEN" };
      return { points: 0, status: "MAUVAIS" };
    }

    if (conversionRate > 75) return { points: 15, status: "TRES BIEN" };
    if (conversionRate >= 50) return { points: 10, status: "BIEN" };
    if (conversionRate >= 35) return { points: 5, status: "MOYEN" };
    return { points: 0, status: "MAUVAIS" };
  };

  // 3. Performance Score (15 pts for Commercial, 10 pts for Magasin)
  const getPerformanceScore = () => {
    if (isMagasin) {
      if (panierMoyen >= 20000) return { points: 10, status: "TRES BIEN" };
      if (panierMoyen >= 15000) return { points: 8, status: "BIEN" };
      if (panierMoyen >= 10000) return { points: 4, status: "MOYEN" };
      return { points: 0, status: "MAUVAIS" };
    }

    if (panierMoyen >= 20000) return { points: 15, status: "TRES BIEN" };
    if (panierMoyen >= 15000) return { points: 10, status: "BIEN" };
    if (panierMoyen >= 10000) return { points: 5, status: "MOYEN" };
    return { points: 0, status: "MAUVAIS" };
  };

  // 4. Behavior Scores (30 pts)
  const getAvisScore = () => {
    let points = 0;
    let status = "MAUVAIS";

    if (avisNegatifs > 0) {
      points = 0;
      status = "MAUVAIS";
    } else if (avisPositifs > 3) {
      points = 10;
      status = "TRES BIEN";
    } else if (avisPositifs > 0) {
      points = 8;
      status = "BIEN";
    } else {
      points = 4;
      status = "MOYEN";
    }
    
    return { points, status };
  };

  const getSavScore = () => {
    let points = 0;
    let status = "MAUVAIS";

    if (savPlaintes > 0) {
      points = 0;
      status = "MAUVAIS";
    } else if (savTickets > 4) {
      points = 4;
      status = "MOYEN";
    } else if (savTickets > 0) {
      points = 8;
      status = "BIEN";
    } else {
      points = 10;
      status = "TRES BIEN";
    }

    return { points, status };
  };

  const getProcessusScore = () => {
    // Robust check for array existence
    const warnings = Array.isArray(processusList) ? processusList.length : 0;
    
    let points = 10;
    let status = "TRES BIEN";

    if (warnings === 1) {
      points = 8;
      status = "BIEN";
    } else if (warnings === 2) {
      points = 4;
      status = "MOYEN";
    } else if (warnings >= 3) {
      points = 0;
      status = "MAUVAIS";
    }

    return { points, status };
  };

  // 5. Presence Score (5 pts)
  const getPresenceScore = () => {
    const absences = presenceLogs.filter(l => l.status === 'Absence').length;
    const retards = presenceLogs.filter(l => l.status === 'Retard').length;
    const totalFaults = absences + retards;
    
    // Exact user thresholds: TB: 5pts (0 faults), Bien: 3pts (1 fault), Moyen: 1pts (2 faults), Mauvais: 0pts (>=3 faults)
    let points = 5;
    let status = "TRES BIEN";
    
    if (totalFaults >= 3) {
      points = 0;
      status = "MAUVAIS";
    } else if (totalFaults >= 2) {
      points = 1;
      status = "MOYEN";
    } else if (totalFaults >= 1) {
      points = 3;
      status = "BIEN";
    } else {
      points = 5;
      status = "TRES BIEN";
    }
    
    return { points, status, absences, retards };
  };

  const salesData = getSalesScore();
  const devisData = getDevisScore();
  const perfData = getPerformanceScore();
  const avisData = getAvisScore();
  const savData = getSavScore();
  const prosData = getProcessusScore();
  const presenceData = getPresenceScore();

  const totalSalesScore = salesData.points + devisData.points + perfData.points;
  const totalBehaviorScore = avisData.points + savData.points + prosData.points;

  // Category Status Helpers
  const getVentesStatus = (score: number) => {
    if (isMagasin) {
      if (score >= 56) return "TRES BIEN";  // 80% of 70
      if (score >= 42) return "BIEN";       // 60% of 70
      if (score >= 28) return "MOYEN";      // 40% of 70
      return "MAUVAIS";
    }
    if (score >= 52) return "TRES BIEN";   // 80% of 65
    if (score >= 39) return "BIEN";        // 60% of 65
    if (score >= 26) return "MOYEN";       // 40% of 65
    return "MAUVAIS";
  };

  const getBehaviorStatus = (score: number) => {
    if (score >= 24) return "TRES BIEN";  // 80% of 30
    if (score >= 18) return "BIEN";       // 60% of 30
    if (score >= 12) return "MOYEN";      // 40% of 30
    return "MAUVAIS";
  };

  const currentScores = {
    isMagasin,
    ventes: totalSalesScore,
    ventesMax: isMagasin ? 70 : 65,
    ventesStatus: getVentesStatus(totalSalesScore),
    comportement: totalBehaviorScore,
    comportementMax: 30,
    behaviorStatus: getBehaviorStatus(totalBehaviorScore),
    presence: isMagasin ? 0 : presenceData.points,
    presenceMax: isMagasin ? 0 : 5,
    presenceStatus: isMagasin ? "N/A" : presenceData.status,
    bonus: isMagasin ? 0 : bonusScore,
    bonusMax: isMagasin ? 0 : 5,

    details: {
      sales: salesData,
      devis: devisData,
      perf: perfData,
      avis: avisData,
      sav: savData,
      processus: prosData,
      processusList,
      presenceData,
      presenceLogs,
      notesList,
      conversionRate,

      metrics: {
        caAmount, devisCreated, devisValidated, devisVolee, devisOuvert, panierMoyen,
        avisPositifs, avisNegatifs, savTickets, savPlaintes, processusMalus,
        conservativeCA, likelyCA, exceedCA
      },
      setters: {
        setCaAmount, 
        setDevisCreated: (val: number) => setDevisCreated(Math.max(0, val)),
        setDevisValidated: (val: number) => setDevisValidated(Math.max(0, val)),
        setDevisVolee: (val: number) => setDevisVolee(Math.max(0, val)),
        setDevisOuvert: (val: number) => setDevisOuvert(Math.max(0, val)),
        setPanierMoyen: (val: number) => setPanierMoyen(Math.max(0, val)),
        setAvisPositifs: () => {}, // Disabled as derived from history
        setAvisNegatifs: () => {}, 
        setSavTickets: () => {}, 
        setSavPlaintes: () => {}, 
        setProcessusMalus, 
        setProcessusList: () => {},
        setPresenceLogs,
        setNotesList,
        setBonusScore
      }


    }
  };


  return (
    <main className="pt-[80px] px-14 pb-8 max-w-[1700px] mx-auto font-sans space-y-4 animate-in fade-in duration-700">
      {/* Floating Pill Navigation */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-stone-100 p-1 flex items-center justify-between shadow-sm mb-4">
        <nav className="flex gap-2">
          {[
            { id: 'commercial', label: 'Ventes' },
            { id: 'behavior', label: 'Comportement' },
            { id: 'calendar', label: 'Calendrier' },
            { id: 'ressources', label: 'Ressources' }
          ].filter(tab => {
            if (isMagasin) {
                // Show Ventes, Behavior, and Calendar for Magasin
                return tab.id !== 'ressources';
            }
            return true;
          }).map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`text-[12px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        
        {(role === 'owner' || role === 'admin') && !isMagasin && (
          <button 
            onClick={() => setIsBonusOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-yellow-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-stone-900 transition-all shadow-md active:scale-95 mr-1 group transition-all"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">workspace_premium</span>
            Attribuer Bonus
          </button>
        )}

      </div>


      {/* Header Section */}
      <div className="flex items-end justify-between px-2 mb-0">
        <div className="group relative">
          <h2 className="text-4xl font-headline font-normal text-stone-900 tracking-tighter leading-none whitespace-nowrap">
            {isMagasin ? userData?.name || 'Magasin' : showroomName}
          </h2>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center bg-white/60 backdrop-blur-md border border-stone-100 shadow-sm p-1 rounded-xl">
            <button 
              onClick={handlePrevMonth}
              className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all active:scale-90"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <span className="px-4 py-1 text-[12px] font-black text-stone-900 font-mono tracking-tighter uppercase whitespace-nowrap min-w-[120px] text-center">
              {monthNames[viewMonth - 1]} {viewYear}
            </span>
            <button 
              onClick={handleNextMonth}
              className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all active:scale-90"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="pt-0 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        {activeTab === 'commercial' && (
          <CommercialScorecard 
            role={role} 
            activeTab="commercial" 
            hideNav={true} 
            isDashboard={true} 
            userData={userData} 
            scores={currentScores}
            viewMonth={viewMonth}
            viewYear={viewYear}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        )}

        {activeTab === 'behavior' && (
          <BehaviorScorecard 
            role={role} 
            activeTab="behavior" 
            hideNav={true} 
            isDashboard={true} 
            userData={userData} 
            scores={currentScores}
            evaluations={evaluations}
            viewMonth={viewMonth}
            viewYear={viewYear}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onRefresh={async () => {
              await fetchEvaluations();
              // Refresh data from correct endpoint based on type
              const endpoint = isMagasin
                ? `http://localhost:3001/api/showrooms/${userId}`
                : `http://localhost:3001/api/users/${userId}`;
              const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
              });
              const result = await response.json();
              if (result.success) setUserData(result.data);
            }}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarScorecard 
            role={role} 
            activeTab="calendar" 
            hideNav={true} 
            isDashboard={true} 
            userData={userData} 
            scores={currentScores}
            viewMonth={viewMonth}
            viewYear={viewYear}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            setViewMonth={setViewMonth}
            setViewYear={setViewYear}
            onRefresh={async () => {
              await fetchEvaluations();
              const endpoint = isMagasin
                ? `http://localhost:3001/api/showrooms/${userId}`
                : `http://localhost:3001/api/users/${userId}`;
              const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
              });
              const result = await response.json();
              if (result.success) setUserData(result.data);
            }}
          />
        )}
        {activeTab === 'ressources' && (
          <RessourcesScorecard 
            role={role} 
            activeTab="ressources" 
            hideNav={true} 
            isDashboard={true} 
            userData={userData} 
            scores={currentScores}
          />
        )}
      </div>

      {userData && (
        <BonusSlideOver 
          isOpen={isBonusOpen}
          onClose={() => setIsBonusOpen(false)}
          userId={userData.id}
          viewMonth={viewMonth}
          viewYear={viewYear}
          onBonusAssigned={async () => {
            await fetchEvaluations();
          }}
        />
      )}

    </main>

  );
};

export default ScorecardWrapper;
