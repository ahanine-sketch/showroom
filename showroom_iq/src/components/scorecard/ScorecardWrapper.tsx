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
  headerContent?: React.ReactNode;
}

const ScorecardWrapper = ({ initialTab, role, type = 'commercial', id: propId, headerContent }: ScorecardWrapperProps) => {
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
  const [scoringConfigs, setScoringConfigs] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>({});
  
  // Ventes State
  const [caAmount, setCaAmount] = useState(0);
  const [devisCreated, setDevisCreated] = useState(0);
  const [devisValidated, setDevisValidated] = useState(0);
  const [devisVolee, setDevisVolee] = useState(0);
  const [devisOuvert, setDevisOuvert] = useState(0);
  const [panierMoyen, setPanierMoyen] = useState(0);

  // Helper for dynamic points from settings
  const getLevelPoints = (metric: string, levelId: string, fallback: number) => {
    const config = scoringConfigs.find(c => c.metricName === metric);
    if (!config || !Array.isArray(config.levels)) return fallback;
    const level = (config.levels as any[]).find(l => l.id === levelId);
    return level ? parseInt(level.points) : fallback;
  };

  const getLevelName = (metric: string, levelId: string, fallback: string) => {
    const config = scoringConfigs.find(c => c.metricName === metric);
    if (!config || !Array.isArray(config.levels)) return fallback;
    const level = (config.levels as any[]).find(l => l.id === levelId);
    return level ? level.name : fallback;
  };

  const getLevelColor = (metric: string, id: string) => {
    const config = scoringConfigs.find(c => c.metricName === metric);
    if (!config || !Array.isArray(config.levels)) return '';
    const level = (config.levels as any[]).find(l => l.id === id);
    return level?.color || '';
  };

  const getMaxPoints = (metric: string, fallback: number) => {
    const config = scoringConfigs.find(c => c.metricName === metric);
    if (!config || !Array.isArray(config.levels)) return fallback;
    const points = config.levels.map(l => parseInt(l.points) || 0);
    return points.length > 0 ? Math.max(...points) : fallback;
  };

  // Category Status Helpers

  const getVentesStatus = (metric: string, score: number, max: number) => {
    let levelId = 'mv';
    if (max > 0) {
      if (score >= max * 0.8) levelId = 'tb';
      else if (score >= max * 0.6) levelId = 'b';
      else if (score >= max * 0.4) levelId = 'm';
    }
    return { 
      name: getLevelName(metric, levelId, levelId === 'tb' ? "TRÈS BIEN" : levelId === 'b' ? "BIEN" : levelId === 'm' ? "MOYEN" : "MAUVAIS"), 
      color: getLevelColor(metric, levelId),
      id: levelId
    };
  };

  const getBehaviorStatus = (metric: string, score: number, max: number) => {
    let levelId = 'mv';
    if (max > 0) {
      if (score >= max * 0.8) levelId = 'tb';
      else if (score >= max * 0.6) levelId = 'b';
      else if (score >= max * 0.4) levelId = 'm';
    }
    return { 
      name: getLevelName(metric, levelId, levelId === 'tb' ? "TRÈS BIEN" : levelId === 'b' ? "BIEN" : levelId === 'm' ? "MOYEN" : "MAUVAIS"), 
      color: getLevelColor(metric, levelId),
      id: levelId
    };
  };

  const getStatusId = (status: string) => {
    switch (status) {
      case "TRES BIEN": return 'tb';
      case "BIEN": return 'b';
      case "MOYEN": return 'm';
      case "MAUVAIS": return 'mv';
      default: return 'mv';
    }
  };

  const getGlobalStatus = (score: number) => {
    const metric = isMagasin ? 'showroom:conclusion' : 'commercial-conclusion';
    const config = scoringConfigs.find(c => c.metricName === metric);
    
    if (config && Array.isArray(config.levels)) {
        // Try to find the matching level based on thresholds
        const levels = [...config.levels].sort((a, b) => {
            const valA = parseInt(a.range?.replace(/[^0-9]/g, '') || '0');
            const valB = parseInt(b.range?.replace(/[^0-9]/g, '') || '0');
            return valB - valA; // Descending
        });

        for (const level of levels) {
            const rangeStr = level.range || '';
            const threshold = parseInt(rangeStr.replace(/[^0-9]/g, '') || '0');
            if (rangeStr.includes('≥') || rangeStr.includes('>')) {
                if (score >= threshold) return { name: level.name, color: level.color };
            } else if (rangeStr.includes('-')) {
                const [min, max] = rangeStr.split('-').map(v => parseInt(v));
                if (score >= min && score <= max) return { name: level.name, color: level.color };
            }
        }
    }

    // Fallback to defaults
    if (score >= 80) return { name: getLevelName(metric, 'tb', "TRÈS BIEN"), color: getLevelColor(metric, 'tb') };
    if (score >= 60) return { name: getLevelName(metric, 'b', "BIEN"), color: getLevelColor(metric, 'b') };
    if (score >= 40) return { name: getLevelName(metric, 'm', "MOYEN"), color: getLevelColor(metric, 'm') };
    return { name: getLevelName(metric, 'mv', "MAUVAIS"), color: getLevelColor(metric, 'mv') };
  };

  // Behavior derived from evaluations
  const behaviorStats = useMemo(() => {
    if (!evaluations) return { avisPositifs: 0, avisNegatifs: 0, savTickets: 0, savPlaintes: 0, processusList: [] };
    
    const avis = evaluations.filter(e => e.type === 'AVIS').reduce((acc, e) => {
        // Fallback to plusAvis if evaluated directly on showroom
        const plus = e.plusAvis || (e.rating >= 4 ? 1 : 0);
        const minus = e.minusAvis || (e.rating <= 2 ? 1 : 0);
        return {
            plus: acc.plus + plus,
            minus: acc.minus + minus
        };
    }, { plus: 0, minus: 0 });

    const sav = evaluations.filter(e => e.type === 'SAV').reduce((acc, e) => ({
      tickets: acc.tickets + (e.ticketsCount || 0),
      complaints: acc.complaints + (e.complaintsCount || 0)
    }), { tickets: 0, complaints: 0 });

    const processes = evaluations.filter(e => e.type === 'PROCESS').map(e => ({
      title: e.notes || 'Avertissement',
      pts: e.warningLevel === 1 ? -2 : e.warningLevel === 2 ? -4 : -10,
      icon: 'report_problem',
      level: e.warningLevel
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

  const fetchScoringConfigs = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings/configs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const result = await response.json();
      if (result.success) {
        setScoringConfigs(result.data.metrics || []);
        setGlobalSettings(result.data.global || {});
      }
    } catch (e) {
      console.error('Error fetching configs:', e);
    }
  };

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
        
        if (typeof result.bonusTotal === 'number') {
          setBonusScore(result.bonusTotal);
        }
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    }
  };

  useEffect(() => {
    fetchScoringConfigs();
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

  // --- SCORING LOGIC (DYNAMIC) ---
  const monthObjective = userData?.objectives?.[0];
  const conservativeCA = isMagasin ? (userData?.targets?.conservative || 30000) : (monthObjective?.conservativeCA || 30000);
  const likelyCA = isMagasin ? (userData?.targets?.likely || 50000) : (monthObjective?.likelyCA || 50000);
  const exceedCA = isMagasin ? (userData?.targets?.exceed || 70000) : (monthObjective?.exceedCA || 70000);

  // 1. Sales Score (35 pts for Commercial, 50 pts for Magasin by default)
  const getSalesScore = () => {
    const metric = isMagasin ? 'showroom:objectif-ca' : 'objectif-ca';
    const pointsTB = getLevelPoints(metric, 'tb', isMagasin ? 50 : 35);
    const pointsB = getLevelPoints(metric, 'b', isMagasin ? 45 : 30);
    const pointsM = getLevelPoints(metric, 'm', isMagasin ? 10 : 20); // base for conservative
    const pointsMV = getLevelPoints(metric, 'mv', 10);
    
    if (caAmount >= exceedCA) {
        return { points: pointsTB, status: getVentesStatus(metric, pointsTB, pointsTB).name, statusColor: getVentesStatus(metric, pointsTB, pointsTB).color };
    }
    
    if (caAmount >= likelyCA) {
        const progress = (caAmount - likelyCA) / (exceedCA - likelyCA);
        const pointRange = pointsTB - pointsB;
        const points = pointsB + Math.floor(progress * pointRange);
        const statusObj = getVentesStatus(metric, points, pointsTB);
        return { points, status: statusObj.name, statusColor: statusObj.color };
    }

    if (caAmount >= conservativeCA) {
        const progress = (caAmount - conservativeCA) / (likelyCA - conservativeCA);
        const startPoints = isMagasin ? pointsM : (pointsM + 1);
        const pointRange = pointsB - startPoints;
        const points = startPoints + Math.floor(progress * pointRange);
        const statusObj = getVentesStatus(metric, points, pointsTB);
        return { points, status: statusObj.name, statusColor: statusObj.color };
    }
    
    if (caAmount >= conservativeCA * 0.5) {
        return { points: pointsMV, status: getVentesStatus(metric, pointsMV, pointsTB).name, statusColor: getVentesStatus(metric, pointsMV, pointsTB).color };
    }
    
    const mvStatus = getVentesStatus(metric, 0, pointsTB);
    return { points: 0, status: mvStatus.name, statusColor: mvStatus.color };
  };

  // 2. Devis Score (15 pts for Commercial, 10 pts for Magasin)
  const conversionRate = devisCreated > 0 ? Math.round(((devisValidated + devisVolee) / devisCreated) * 100) : 0;
  const getDevisScore = () => {
    const metric = isMagasin ? 'showroom:devis' : 'conversion-rate';
    const pointsTB = getLevelPoints(metric, 'tb', isMagasin ? 10 : 15);
    const pointsB = getLevelPoints(metric, 'b', isMagasin ? 8 : 10);
    const pointsM = getLevelPoints(metric, 'm', isMagasin ? 4 : 5);

    if (conversionRate >= 75) {
        return { points: pointsTB, status: getVentesStatus(metric, pointsTB, pointsTB).name, statusColor: getVentesStatus(metric, pointsTB, pointsTB).color };
    }
    if (conversionRate >= 50) {
        const progress = (conversionRate - 50) / (75 - 50);
        const points = pointsB + Math.floor(progress * (pointsTB - pointsB));
        const statusObj = getVentesStatus(metric, points, pointsTB);
        return { points, status: statusObj.name, statusColor: statusObj.color };
    }
    if (conversionRate >= 35) {
        const progress = (conversionRate - 35) / (50 - 35);
        const points = pointsM + Math.floor(progress * (pointsB - pointsM));
        const statusObj = getVentesStatus(metric, points, pointsTB);
        return { points, status: statusObj.name, statusColor: statusObj.color };
    }
    const mvStatus = getVentesStatus(metric, 0, pointsTB);
    return { points: 0, status: mvStatus.name, statusColor: mvStatus.color };
  };

  // 3. Performance Score (15 pts for Commercial, 10 pts for Magasin)
  const getPerformanceScore = () => {
    const metric = isMagasin ? 'showroom:kpis-panier-moyen' : 'panier-moyen';
    const pointsTB = getLevelPoints(metric, 'tb', isMagasin ? 10 : 15);
    const pointsB = getLevelPoints(metric, 'b', isMagasin ? 8 : 10);
    const pointsM = getLevelPoints(metric, 'm', isMagasin ? 4 : 5);

    if (panierMoyen >= 20000) {
        return { points: pointsTB, status: getVentesStatus(metric, pointsTB, pointsTB).name, statusColor: getVentesStatus(metric, pointsTB, pointsTB).color };
    }
    if (panierMoyen >= 15000) {
        const progress = (panierMoyen - 15000) / (20000 - 15000);
        const points = pointsB + Math.floor(progress * (pointsTB - pointsB));
        const statusObj = getVentesStatus(metric, points, pointsTB);
        return { points, status: statusObj.name, statusColor: statusObj.color };
    }
    if (panierMoyen >= 10000) {
        const progress = (panierMoyen - 10000) / (15000 - 10000);
        const points = pointsM + Math.floor(progress * (pointsB - pointsM));
        const statusObj = getVentesStatus(metric, points, pointsTB);
        return { points, status: statusObj.name, statusColor: statusObj.color };
    }
    const mvStatus = getVentesStatus(metric, 0, pointsTB);
    return { points: 0, status: mvStatus.name, statusColor: mvStatus.color };
  };

  // 4. Behavior Scores (30 pts)
  const getAvisScore = () => {
    const metric = isMagasin ? 'showroom:avis' : 'avis-reputation';
    const pointsTB = getLevelPoints(metric, 'tb', 10);
    const pointsB = getLevelPoints(metric, 'b', 8);
    const pointsM = getLevelPoints(metric, 'm', 4);

    if (avisNegatifs > 0) return { points: 0, status: getBehaviorStatus(metric, 0, pointsTB).name, statusColor: getBehaviorStatus(metric, 0, pointsTB).color };
    if (avisPositifs > 3) return { points: pointsTB, status: getBehaviorStatus(metric, pointsTB, pointsTB).name, statusColor: getBehaviorStatus(metric, pointsTB, pointsTB).color };
    if (avisPositifs > 0) return { points: pointsB, status: getBehaviorStatus(metric, pointsB, pointsTB).name, statusColor: getBehaviorStatus(metric, pointsB, pointsTB).color };
    const mStatus = getBehaviorStatus(metric, pointsM, pointsTB);
    return { points: pointsM, status: mStatus.name, statusColor: mStatus.color };
  };

  const getSavScore = () => {
    const metric = isMagasin ? 'showroom:service' : 'sav-service';
    const pointsTB = getLevelPoints(metric, 'tb', 10);
    const pointsB = getLevelPoints(metric, 'b', 8);
    const pointsM = getLevelPoints(metric, 'm', 4);

    if (savPlaintes > 0) return { points: 0, status: getBehaviorStatus(metric, 0, pointsTB).name, statusColor: getBehaviorStatus(metric, 0, pointsTB).color };
    if (savTickets > 4) return { points: pointsM, status: getBehaviorStatus(metric, pointsM, pointsTB).name, statusColor: getBehaviorStatus(metric, pointsM, pointsTB).color };
    if (savTickets > 0) return { points: pointsB, status: getBehaviorStatus(metric, pointsB, pointsTB).name, statusColor: getBehaviorStatus(metric, pointsB, pointsTB).color };
    const tbStatus = getBehaviorStatus(metric, pointsTB, pointsTB);
    return { points: pointsTB, status: tbStatus.name, statusColor: tbStatus.color };
  };

  const getProcessusScore = () => {
    const metric = isMagasin ? 'showroom:showroom' : 'discipline-process';
    const pointsTB = getLevelPoints(metric, 'tb', 10);
    const pointsB = getLevelPoints(metric, 'b', 8);
    const pointsM = getLevelPoints(metric, 'm', 4);
    
    // Process is handled by calculating deductions from TB base
    let totalDeductions = 0;
    processusList.forEach((p: any) => {
        if (p.level === 1) totalDeductions += (pointsTB - pointsB);
        else if (p.level === 2) totalDeductions += (pointsTB - pointsM);
        else if (p.level >= 3) totalDeductions += pointsTB;
    });

    const finalPoints = Math.max(0, pointsTB - totalDeductions);
    const pStatus = getBehaviorStatus(metric, finalPoints, pointsTB);
    return { points: finalPoints, status: pStatus.name, statusColor: pStatus.color };
  };

  // 5. Presence Score (5 pts)
  const getPresenceScore = () => {
    const absences = presenceLogs.filter(l => l.status === 'Absence').length;
    const retards = presenceLogs.filter(l => l.status === 'Retard').length;
    const totalFaults = absences + retards;
    
    const pointsTB = getLevelPoints('assiduite', 'tb', 5);
    const pointsB = getLevelPoints('assiduite', 'b', 3);
    const pointsM = getLevelPoints('assiduite', 'm', 1);

    let levelId = 'mv';
    let points = 0;
    if (totalFaults === 0) { levelId = 'tb'; points = pointsTB; }
    else if (totalFaults === 1) { levelId = 'b'; points = pointsB; }
    else if (totalFaults === 2) { levelId = 'm'; points = pointsM; }
    
    return { 
      points, 
      id: levelId,
      status: getLevelName('assiduite', levelId, levelId === 'tb' ? "TRES BIEN" : levelId === 'b' ? "BIEN" : levelId === 'm' ? "MOYEN" : "MAUVAIS"), 
      color: getLevelColor('assiduite', levelId),
      absences, 
      retards 
    };
  };


  const salesData = getSalesScore();
  const devisData = getDevisScore();
  const perfData = getPerformanceScore();
  const avisData = getAvisScore();
  const savData = getSavScore();
  const prosData = getProcessusScore();
  const presenceData = getPresenceScore();

  // Dynamic Max Scores from Configs
  const salesMax = getMaxPoints(isMagasin ? 'showroom:objectif-ca' : 'objectif-ca', isMagasin ? 50 : 35);
  const devisMax = getMaxPoints(isMagasin ? 'showroom:devis' : 'conversion-rate', isMagasin ? 10 : 15);
  const perfMax = getMaxPoints(isMagasin ? 'showroom:kpis-panier-moyen' : 'panier-moyen', isMagasin ? 10 : 15);
  const avisMax = getMaxPoints(isMagasin ? 'showroom:avis' : 'avis-reputation', 10);
  const savMax = getMaxPoints(isMagasin ? 'showroom:service' : 'sav-service', 10);
  const prosMax = getMaxPoints(isMagasin ? 'showroom:showroom' : 'discipline-process', 10);
  const presenceMax = isMagasin ? 0 : getMaxPoints('assiduite', 5);
  const bonusMax = 5; // Bonus is usually fixed small amount, but could be dynamic if needed

  const totalSalesScore = salesData.points + devisData.points + perfData.points;
  const totalSalesMax = salesMax + devisMax + perfMax;
  
  const totalBehaviorScore = avisData.points + savData.points + prosData.points;
  const totalBehaviorMax = avisMax + savMax + prosMax;


    const totalPoints = totalSalesScore + totalBehaviorScore + (isMagasin ? 0 : presenceData.points + bonusScore);
    const globalStatusObj = getGlobalStatus(totalPoints);

  const currentScores = {
    isMagasin,
    totalScore: totalPoints,
    globalStatus: globalStatusObj.name,
    globalStatusColor: globalStatusObj.color,
    ventes: totalSalesScore,
    ventesMax: totalSalesMax,
    ventesStatus: getVentesStatus(isMagasin ? 'showroom:objectif-ca' : 'objectif-ca', totalSalesScore, totalSalesMax).name,
    ventesStatusColor: getVentesStatus(isMagasin ? 'showroom:objectif-ca' : 'objectif-ca', totalSalesScore, totalSalesMax).color,
    comportement: totalBehaviorScore,
    comportementMax: totalBehaviorMax,
    behaviorStatus: getBehaviorStatus(isMagasin ? 'showroom:showroom' : 'discipline-process', totalBehaviorScore, totalBehaviorMax).name,
    behaviorStatusColor: getBehaviorStatus(isMagasin ? 'showroom:showroom' : 'discipline-process', totalBehaviorScore, totalBehaviorMax).color,
    presence: isMagasin ? 0 : presenceData.points,
    presenceMax: isMagasin ? 0 : presenceMax,
    presenceStatus: isMagasin ? "N/A" : presenceData.status,
    presenceStatusColor: isMagasin ? '' : presenceData.color,
    bonus: isMagasin ? 0 : bonusScore,
    bonusMax: isMagasin ? 0 : bonusMax,

    details: {
      sales: { ...salesData, maxScore: salesMax, statusColor: salesData.statusColor },
      devis: { ...devisData, maxScore: devisMax, statusColor: devisData.statusColor },
      perf: { ...perfData, maxScore: perfMax, statusColor: perfData.statusColor },
      avis: { ...avisData, maxScore: avisMax, statusColor: avisData.statusColor },
      sav: { ...savData, maxScore: savMax, statusColor: savData.statusColor },
      processus: { ...prosData, maxScore: prosMax, statusColor: prosData.statusColor },
      presenceData: { ...presenceData, maxScore: presenceMax, statusColor: presenceData.color },
      processusList,
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


      {headerContent && (
        <div className="mb-2">
          {headerContent}
        </div>
      )}

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
