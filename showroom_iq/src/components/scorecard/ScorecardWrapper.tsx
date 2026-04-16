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
}

const ScorecardWrapper = ({ initialTab, role }: ScorecardWrapperProps) => {
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBonusOpen, setIsBonusOpen] = useState(false);


  // --- CENTRALIZED STATE ---
  const [evaluations, setEvaluations] = useState<any[]>([]);
  
  // Ventes State
  const [caAmount, setCaAmount] = useState(0);
  const [devisCreated, setDevisCreated] = useState(11);
  const [devisValidated, setDevisValidated] = useState(6);
  const [devisVolee, setDevisVolee] = useState(1);
  const [devisOuvert, setDevisOuvert] = useState(4);
  const [panierMoyen, setPanierMoyen] = useState(23323);

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



  // Sync initial state when userData loads
  useEffect(() => {
    if (userData) {
      setCaAmount(0); // Default to 0 as requested
      setDevisCreated(userData.devisCreated || 11);
      setDevisValidated(userData.devisValidated || 6);
      setDevisVolee(userData.devisLost || 1);
      setDevisOuvert(userData.devisOpened || 4);
      setPanierMoyen(userData.avgBasket || 23323);
      setBonusScore(userData.bonusScore || 0);
    }
  }, [userData]);

  const fetchEvaluations = async () => {
    if (!userId) return;
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const response = await fetch(`http://localhost:3001/api/performance/evaluations/${userId}/${month}/${year}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setEvaluations(result.data);
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [userId]);

  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
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
  }, [userId]);

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
  const conservativeCA = monthObjective?.conservativeCA || 30000;
  const likelyCA = monthObjective?.likelyCA || 50000;
  const exceedCA = monthObjective?.exceedCA || 70000;

  // 1. Sales Score (35 pts)
  const getSalesScore = () => {
    if (caAmount >= exceedCA) return { points: 35, status: "TRES BIEN" };
    if (caAmount >= likelyCA) return { points: 32, status: "TRES BIEN" };
    if (caAmount >= conservativeCA) {
        const progress = (caAmount - conservativeCA) / (likelyCA - conservativeCA);
        const points = 21 + Math.floor(progress * 10);
        return { points, status: "BIEN" };
    }
    if (caAmount >= conservativeCA * 0.5) return { points: 10, status: "MOYEN" };
    return { points: 0, status: "MAUVAIS" };
  };

  // 2. Devis Score (15 pts)
  const conversionRate = devisCreated > 0 ? Math.round(((devisValidated + devisVolee) / devisCreated) * 100) : 0;
  const getDevisScore = () => {
    if (conversionRate >= 75) return { points: 15, status: "TRES BIEN" };
    if (conversionRate >= 50) return { points: 10, status: "BIEN" };
    if (conversionRate >= 35) return { points: 5, status: "MOYEN" };
    return { points: 0, status: "MAUVAIS" };
  };

  // 3. Performance Score (15 pts)
  const getPerformanceScore = () => {
    if (panierMoyen >= 20000) return { points: 15, status: "TRES BIEN" };
    if (panierMoyen >= 15000) return { points: 12, status: "BIEN" };
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
    
    let points = 5;
    let status = "EXCELLENT";
    
    if (totalFaults >= 5) {
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

  const currentScores = {
    ventes: totalSalesScore,
    ventesMax: 65,
    comportement: totalBehaviorScore,
    comportementMax: 30,
    presence: presenceData.points,
    presenceMax: 5,
    bonus: bonusScore,
    bonusMax: 5,

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
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`text-[12px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        
        {(role === 'owner' || role === 'admin') && (
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
          <h2 className="text-4xl font-headline font-normal text-stone-900 tracking-tighter leading-none whitespace-nowrap">{showroomName}</h2>
        </div>
        <div className="flex gap-3">
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
            onRefresh={async () => {
              await fetchEvaluations();
              // Also refresh user data for scores
              const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
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
          onBonusAssigned={setBonusScore}
        />
      )}

    </main>

  );
};

export default ScorecardWrapper;
