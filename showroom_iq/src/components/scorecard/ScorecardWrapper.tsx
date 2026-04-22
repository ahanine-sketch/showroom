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

  // Dynamic Weights from Configs
  const weights = isMagasin 
    ? (globalSettings.siq_showroom_weights || { 
        ventes: 70, ventes_tb: 55, ventes_b: 45, ventes_m: 35, ventes_mv: 0,
        comportement: 30, comportement_tb: 25, comportement_b: 16, comportement_m: 10, comportement_mv: 0,
        presence: 0, presence_tb: 5, presence_b: 3, presence_m: 1, presence_mv: 0
      })
    : (globalSettings.siq_weights || { 
        ventes: 65, ventes_tb: 55, ventes_b: 45, ventes_m: 35, ventes_mv: 0,
        comportement: 30, comportement_tb: 25, comportement_b: 16, comportement_m: 10, comportement_mv: 0,
        presence: 5, presence_tb: 5, presence_b: 3, presence_m: 1, presence_mv: 0
      });

  // Helper for dynamic points from settings
  const getLevelPoints = (metric: string, levelId: string, fallback: number) => {
    const config = scoringConfigs.find(c => c.metricName === metric);
    if (!config || !Array.isArray(config.levels)) return fallback;
    const level = (config.levels as any[]).find(l => l.id === levelId);
    if (!level) return fallback;
    
    const pStr = String(level.points || '');
    if (pStr.includes('-')) {
        const parts = pStr.split('-').map(v => parseInt(v.trim()));
        return Math.max(...parts.filter(v => !isNaN(v)));
    }
    return parseInt(pStr) || fallback;
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
    const points = config.levels.map(l => {
        const pStr = String(l.points || '');
        if (pStr.includes('-')) {
            const parts = pStr.split('-').map(v => parseInt(v.trim()));
            return Math.max(...parts.filter(v => !isNaN(v)));
        }
        return parseInt(pStr) || 0;
    });
    return points.length > 0 ? Math.max(...points) : fallback;
  };

  // Category Status Helpers

  const getVentesStatus = (metric: string, score: number, max: number) => {
    let levelId = 'mv';
    const tb = weights.ventes_tb !== undefined ? weights.ventes_tb : max * 0.8;
    const b = weights.ventes_b !== undefined ? weights.ventes_b : max * 0.6;
    const m = weights.ventes_m !== undefined ? weights.ventes_m : max * 0.4;
    const mv = weights.ventes_mv !== undefined ? weights.ventes_mv : 0;

    if (score >= tb) levelId = 'tb';
    else if (score >= b) levelId = 'b';
    else if (score >= m) levelId = 'm';
    else if (score >= mv) levelId = 'mv';

    const defaultColors: Record<string, string> = { tb: '#2A7D4F', b: '#EAB308', m: '#EA580C', mv: '#C0392B' };

    return { 
      name: getLevelName(metric, levelId, levelId === 'tb' ? "TRÈS BIEN" : levelId === 'b' ? "BIEN" : levelId === 'm' ? "MOYEN" : "MAUVAIS"), 
      color: getLevelColor(metric, levelId) || defaultColors[levelId],
      id: levelId
    };
  };

  const getBehaviorStatus = (metric: string, score: number, max: number) => {
    let levelId = 'mv';
    const tb = weights.comportement_tb !== undefined ? weights.comportement_tb : max * 0.8;
    const b = weights.comportement_b !== undefined ? weights.comportement_b : max * 0.6;
    const m = weights.comportement_m !== undefined ? weights.comportement_m : max * 0.4;
    const mv = weights.comportement_mv !== undefined ? weights.comportement_mv : 0;

    if (score >= tb) levelId = 'tb';
    else if (score >= b) levelId = 'b';
    else if (score >= m) levelId = 'm';
    else if (score >= mv) levelId = 'mv';

    const defaultColors: Record<string, string> = { tb: '#2A7D4F', b: '#EAB308', m: '#EA580C', mv: '#C0392B' };

    return { 
      name: getLevelName(metric, levelId, levelId === 'tb' ? "TRÈS BIEN" : levelId === 'b' ? "BIEN" : levelId === 'm' ? "MOYEN" : "MAUVAIS"), 
      color: getLevelColor(metric, levelId) || defaultColors[levelId],
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
    const configKey = isMagasin ? 'siq_showroom_conclusions' : 'siq_conclusions';
    let levelsData = globalSettings[configKey];
    
    // Handle potential stringified JSON from older versions or misconfiguration
    if (typeof levelsData === 'string') {
        try { levelsData = JSON.parse(levelsData); } catch (e) { levelsData = null; }
    }

    if (Array.isArray(levelsData)) {
        // Try to find the matching level based on thresholds
        const levels = [...levelsData].sort((a, b) => {
            const numA = parseInt(String(a.range || '').match(/\d+/)?.[0] || '0');
            const numB = parseInt(String(b.range || '').match(/\d+/)?.[0] || '0');
            return numB - numA;
        });

        for (const level of levels) {
            const rangeStr = String(level.range || '');
            const numbers = rangeStr.match(/\d+/g)?.map(Number) || [];
            
            if (rangeStr.includes('≥') || rangeStr.includes('>') || rangeStr.toLowerCase().includes('sup')) {
                const threshold = numbers[0] || 0;
                if (score >= threshold) return { name: level.name, color: level.color };
            } else if (rangeStr.includes('<') || rangeStr.toLowerCase().includes('inf')) {
                const threshold = numbers[0] || 0;
                if (score < threshold) return { name: level.name, color: level.color };
            } else if (rangeStr.includes('-') || numbers.length >= 2) {
                const min = Math.min(...numbers);
                const max = Math.max(...numbers);
                if (score >= min && score <= max) return { name: level.name, color: level.color };
            } else if (numbers.length === 1) {
                // Single number fallback, treat as minimum threshold unless it looks like a max
                if (score >= numbers[0]) return { name: level.name, color: level.color };
            }
        }
    }

    // Fallback to defaults
    const metric = isMagasin ? 'showroom:objectif-ca' : 'objectif-ca';
    const defaultColors: Record<string, string> = { tb: '#2A7D4F', b: '#EAB308', m: '#EA580C', mv: '#C0392B' };
    
    if (score >= 80) return { name: getLevelName(metric, 'tb', "TRÈS BIEN"), color: getLevelColor(metric, 'tb') || defaultColors['tb'] };
    if (score >= 60) return { name: getLevelName(metric, 'b', "BIEN"), color: getLevelColor(metric, 'b') || defaultColors['b'] };
    if (score >= 40) return { name: getLevelName(metric, 'm', "MOYEN"), color: getLevelColor(metric, 'm') || defaultColors['m'] };
    return { name: getLevelName(metric, 'mv', "MAUVAIS"), color: getLevelColor(metric, 'mv') || defaultColors['mv'] };
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
        return { 
            points: pointsTB, 
            status: getLevelName(metric, 'tb', "TRÈS BIEN"), 
            statusColor: getLevelColor(metric, 'tb') || '#2A7D4F' 
        };
    }
    
    if (caAmount >= likelyCA) {
        const progress = (caAmount - likelyCA) / (exceedCA - likelyCA);
        const points = pointsB + Math.floor(progress * (pointsTB - pointsB));
        return { 
            points, 
            status: getLevelName(metric, 'b', "BIEN"), 
            statusColor: getLevelColor(metric, 'b') || '#EAB308' 
        };
    }

    if (caAmount >= conservativeCA) {
        const progress = (caAmount - conservativeCA) / (likelyCA - conservativeCA);
        const points = pointsM + Math.floor(progress * (pointsB - pointsM));
        return { 
            points, 
            status: getLevelName(metric, 'm', "MOYEN"), 
            statusColor: getLevelColor(metric, 'm') || '#EA580C' 
        };
    }
    
    if (caAmount >= conservativeCA * 0.5) {
        return { 
            points: pointsMV, 
            status: getLevelName(metric, 'mv', "MAUVAIS"), 
            statusColor: getLevelColor(metric, 'mv') || '#C0392B' 
        };
    }
    
    return { 
        points: 0, 
        status: getLevelName(metric, 'mv', "MAUVAIS"), 
        statusColor: getLevelColor(metric, 'mv') || '#C0392B' 
    };
  };

  // 2. Devis Score (15 pts for Commercial, 10 pts for Magasin)
  const conversionRate = devisCreated > 0 ? Math.round(((devisValidated + devisVolee) / devisCreated) * 100) : 0;
  const getDevisScore = () => {
    const metric = isMagasin ? 'showroom:devis' : 'conversion-rate';
    const pointsTB = getLevelPoints(metric, 'tb', isMagasin ? 10 : 15);
    const pointsB = getLevelPoints(metric, 'b', isMagasin ? 8 : 10);
    const pointsM = getLevelPoints(metric, 'm', isMagasin ? 4 : 5);

    if (conversionRate >= 75) {
        return { 
            points: pointsTB, 
            status: getLevelName(metric, 'tb', "TRÈS BIEN"), 
            statusColor: getLevelColor(metric, 'tb') || '#2A7D4F' 
        };
    }
    if (conversionRate >= 50) {
        const progress = (conversionRate - 50) / (75 - 50);
        const points = pointsB + Math.floor(progress * (pointsTB - pointsB));
        return { 
            points, 
            status: getLevelName(metric, 'b', "BIEN"), 
            statusColor: getLevelColor(metric, 'b') || '#EAB308' 
        };
    }
    if (conversionRate >= 25) {
        const progress = (conversionRate - 25) / (50 - 25);
        const points = pointsM + Math.floor(progress * (pointsB - pointsM));
        return { 
            points, 
            status: getLevelName(metric, 'm', "MOYEN"), 
            statusColor: getLevelColor(metric, 'm') || '#EA580C' 
        };
    }
    return { 
        points: 0, 
        status: getLevelName(metric, 'mv', "MAUVAIS"), 
        statusColor: getLevelColor(metric, 'mv') || '#C0392B' 
    };
  };

  // 3. Performance Score (15 pts for Commercial, 10 pts for Magasin)
  const getPerformanceScore = () => {
    const metric = isMagasin ? 'showroom:kpis-panier-moyen' : 'panier-moyen';
    const pointsTB = getLevelPoints(metric, 'tb', isMagasin ? 10 : 15);
    const pointsB = getLevelPoints(metric, 'b', isMagasin ? 8 : 10);
    const pointsM = getLevelPoints(metric, 'm', isMagasin ? 4 : 5);

    if (panierMoyen >= (isMagasin ? 20000 : exceedCA * 0.1)) {
        return { 
            points: pointsTB, 
            status: getLevelName(metric, 'tb', "TRÈS BIEN"), 
            statusColor: getLevelColor(metric, 'tb') || '#2A7D4F' 
        };
    }
    if (panierMoyen >= (isMagasin ? 15000 : exceedCA * 0.08)) {
        const threshold = isMagasin ? 15000 : exceedCA * 0.08;
        const nextThreshold = isMagasin ? 20000 : exceedCA * 0.1;
        const progress = (panierMoyen - threshold) / (nextThreshold - threshold);
        const points = pointsB + Math.floor(progress * (pointsTB - pointsB));
        return { 
            points, 
            status: getLevelName(metric, 'b', "BIEN"), 
            statusColor: getLevelColor(metric, 'b') || '#EAB308' 
        };
    }
    if (panierMoyen >= (isMagasin ? 10000 : exceedCA * 0.05)) {
        const threshold = isMagasin ? 10000 : exceedCA * 0.05;
        const nextThreshold = isMagasin ? 15000 : exceedCA * 0.08;
        const progress = (panierMoyen - threshold) / (nextThreshold - threshold);
        const points = pointsM + Math.floor(progress * (pointsB - pointsM));
        return { 
            points, 
            status: getLevelName(metric, 'm', "MOYEN"), 
            statusColor: getLevelColor(metric, 'm') || '#EA580C' 
        };
    }
    return { 
        points: 0, 
        status: getLevelName(metric, 'mv', "MAUVAIS"), 
        statusColor: getLevelColor(metric, 'mv') || '#C0392B' 
    };
  };

  // 4. Behavior Scores (30 pts)
  const getAvisScore = () => {
    const metric = isMagasin ? 'showroom:avis' : 'avis-reputation';
    const pointsTB = getLevelPoints(metric, 'tb', 10);
    const pointsB = getLevelPoints(metric, 'b', 8);
    const pointsM = getLevelPoints(metric, 'm', 4);

    if (avisNegatifs > 0) {
        return { 
            points: 0, 
            status: getLevelName(metric, 'mv', "MAUVAIS"), 
            statusColor: getLevelColor(metric, 'mv') || '#C0392B' 
        };
    }
    if (avisPositifs > 3) {
        return { 
            points: pointsTB, 
            status: getLevelName(metric, 'tb', "TRÈS BIEN"), 
            statusColor: getLevelColor(metric, 'tb') || '#2A7D4F' 
        };
    }
    if (avisPositifs > 0) {
        return { 
            points: pointsB, 
            status: getLevelName(metric, 'b', "BIEN"), 
            statusColor: getLevelColor(metric, 'b') || '#EAB308' 
        };
    }
    return { 
        points: pointsM, 
        status: getLevelName(metric, 'm', "MOYEN"), 
        statusColor: getLevelColor(metric, 'm') || '#EA580C' 
    };
  };

  const getSavScore = () => {
    const metric = isMagasin ? 'showroom:service' : 'sav-service';
    const pointsTB = getLevelPoints(metric, 'tb', 10);
    const pointsB = getLevelPoints(metric, 'b', 8);
    const pointsM = getLevelPoints(metric, 'm', 4);

    if (savPlaintes > 0) {
        return { 
            points: 0, 
            status: getLevelName(metric, 'mv', "MAUVAIS"), 
            statusColor: getLevelColor(metric, 'mv') || '#C0392B' 
        };
    }
    if (savTickets > 4) {
        return { 
            points: pointsM, 
            status: getLevelName(metric, 'm', "MOYEN"), 
            statusColor: getLevelColor(metric, 'm') || '#EA580C' 
        };
    }
    if (savTickets > 0) {
        return { 
            points: pointsB, 
            status: getLevelName(metric, 'b', "BIEN"), 
            statusColor: getLevelColor(metric, 'b') || '#EAB308' 
        };
    }
    return { 
        points: pointsTB, 
        status: getLevelName(metric, 'tb', "TRÈS BIEN"), 
        statusColor: getLevelColor(metric, 'tb') || '#2A7D4F' 
    };
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
    
    let levelId = 'mv';
    if (finalPoints >= pointsTB) levelId = 'tb';
    else if (finalPoints >= pointsB) levelId = 'b';
    else if (finalPoints >= pointsM) levelId = 'm';

    return { 
        points: finalPoints, 
        status: getLevelName(metric, levelId, levelId.toUpperCase()), 
        statusColor: getLevelColor(metric, levelId) || (levelId === 'tb' ? '#2A7D4F' : levelId === 'b' ? '#EAB308' : levelId === 'm' ? '#EA580C' : '#C0392B')
    };
  };

  // 5. Presence Score (5 pts)
  const getPresenceScore = () => {
    const absences = presenceLogs.filter(l => l.status === 'Absence').length;
    const retards = presenceLogs.filter(l => l.status === 'Retard').length;
    const totalFaults = absences + retards;
    
    const metric = isMagasin ? 'showroom:assiduite' : 'assiduite';
    const pointsTB = getLevelPoints(metric, 'tb', 5);
    const pointsB = getLevelPoints(metric, 'b', 3);
    const pointsM = getLevelPoints(metric, 'm', 1);

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


  // Dynamic Max Scores from Configs (Individual metrics)
  const salesMax = getMaxPoints(isMagasin ? 'showroom:objectif-ca' : 'objectif-ca', isMagasin ? 50 : 35);
  const devisMax = getMaxPoints(isMagasin ? 'showroom:devis' : 'conversion-rate', isMagasin ? 10 : 15);
  const perfMax = getMaxPoints(isMagasin ? 'showroom:kpis-panier-moyen' : 'panier-moyen', isMagasin ? 10 : 15);
  const avisMax = getMaxPoints(isMagasin ? 'showroom:avis' : 'avis-reputation', 10);
  const savMax = getMaxPoints(isMagasin ? 'showroom:service' : 'sav-service', 10);
  const prosMax = getMaxPoints(isMagasin ? 'showroom:showroom' : 'discipline-process', 10);
  const presenceMaxVal = getMaxPoints('assiduite', 5);
  const bonusMax = 5;

  const totalSalesScore = salesData.points + devisData.points + perfData.points;
  const totalSalesMax = weights.ventes;
  
  const totalBehaviorScore = avisData.points + savData.points + prosData.points;
  const totalBehaviorMax = weights.comportement;


    const totalPoints = totalSalesScore + totalBehaviorScore + (presenceData?.points || 0) + bonusScore;
    const globalStatusObj = getGlobalStatus(totalPoints);
    const presenceMax = weights.presence || 0;

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
    presence: presenceData.points,
    presenceMax,
    presenceStatus: presenceData.status,
    presenceStatusColor: (presenceData.color || '#C0392B'),
    bonus: bonusScore,
    bonusMax: bonusMax,

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
                // Show Ventes, Behavior and Calendar for Magasin. Hide only Ressources.
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
