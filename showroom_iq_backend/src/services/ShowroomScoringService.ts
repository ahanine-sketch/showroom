import prisma from '../config/prisma';
import { EvaluationType } from '@prisma/client';

export class ShowroomScoringService {
  /**
   * Calculates the performance score for a showroom for a given month/year.
   * Logic: Ventes (70 pts) + Comportement (30 pts)
   * MUST match the frontend ScorecardWrapper scoring for magasin type.
   */
  static async calculatePerformance(showroomId: string, month: number, year: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // 1. Fetch Showroom Objective
    const objective = await prisma.objective.findFirst({
      where: { showroomId, month, year, type: 'SHOWROOM' },
    });

    // Use objective targets, falling back to defaults if stored values are all zero
    const rawConservativeCA = (objective as any)?.conservativeCA ?? 0;
    const rawLikelyCA       = (objective as any)?.likelyCA       ?? 0;
    const rawExceedCA       = (objective as any)?.exceedCA        ?? 0;

    // Bug B9 fix: never fall back to magic hardcoded numbers.
    // If objectives are not set (all zeros = DRAFT state), scoring is 0 for CA.
    const conservativeCA = rawConservativeCA;
    const likelyCA       = rawLikelyCA;
    const exceedCA       = rawExceedCA;

    // 2. Fetch only ACTIVE users in showroom — BLOCKED users must not affect scores (Bug B4)
    const users = await prisma.user.findMany({
      where: { showroomId, status: 'ACTIVE' },
      select: { id: true }
    });
    const userIds = users.map(u => u.id);

    if (userIds.length === 0) return {
      score: 0, salesScore: 0, behaviorScore: 0, presenceScore: 0,
      totalCA: 0, totalDevisCreated: 0, totalDevisValidated: 0, totalDevisLost: 0, totalDevisOpened: 0,
      avgBasket: 0, conservativeCA, likelyCA, exceedCA, caAchievedPct: 0,
      avisPositifs: 0, avisNegatifs: 0, savTickets: 0, savPlaintes: 0,
      processWarnings: 0, absences: 0, retards: 0, conges: 0, notesPositives: 0, notesNegatives: 0,
    };

    // 2.5 Fetch Dynamic Scoring Configs
    const configs = await prisma.scoringConfig.findMany();
    const getLevelPoints = (metric: string, id: string, fallback: number) => {
      const config = configs.find(c => c.metricName === metric);
      if (!config || !Array.isArray(config.levels)) return fallback;
      const level = (config.levels as any[]).find(l => l.id === id);
      if (!level) return fallback;
      
      const pStr = String(level.points || '');
      if (pStr.includes('-')) {
        const parts = pStr.split('-').map(v => parseInt(v.trim()));
        return Math.max(...parts.filter(v => !isNaN(v)));
      }
      return parseInt(pStr) || fallback;
    };

    // 3. Aggregate Sales Metrics
    const salesMetrics = await prisma.salesMetric.findMany({
      where: { 
        userId: { in: userIds },
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });

    const totalStats = salesMetrics.reduce((acc, m) => ({
      ca: acc.ca + m.ca,
      devisCreated: acc.devisCreated + m.devisCreated,
      devisValidated: acc.devisValidated + m.devisValidated,
      devisLost: acc.devisLost + m.devisLost,
      avgBasket: acc.avgBasket + m.avgBasket
    }), { ca: 0, devisCreated: 0, devisValidated: 0, devisLost: 0, avgBasket: 0 });

    const avgBasket = salesMetrics.length > 0 ? totalStats.avgBasket / salesMetrics.length : 0;

    const globalSettingsRaw = await prisma.globalSettings.findMany();
    const globalSettings: any = {};
    globalSettingsRaw.forEach(s => {
      globalSettings[s.key] = s.value;
    });

    const rawWeights = globalSettings.siq_showroom_weights || { ventes: 70, comportement: 30 };
    const weights = { ...rawWeights, presence: 0 };

    // --- SALES SCORING (Normalized to weights.ventes) ---
    // CA (50 pts by default)
    let caPoints = 0;
    const pointsTB_CA = getLevelPoints('showroom:objectif-ca', 'tb', 50);
    const pointsB_CA = getLevelPoints('showroom:objectif-ca', 'b', 45);
    const pointsM_CA = getLevelPoints('showroom:objectif-ca', 'm', 10); // Base points for conservative

    if (totalStats.ca > 0) {
      if (totalStats.ca >= exceedCA) caPoints = pointsTB_CA;
      else if (totalStats.ca >= likelyCA) caPoints = pointsB_CA;
      else if (totalStats.ca >= conservativeCA) caPoints = pointsM_CA;
      else if (totalStats.ca >= conservativeCA * 0.5) caPoints = pointsM_CA; // Minimum for conservative effort
    }

    // Devis (10 pts by default)
    const conversionRate = totalStats.devisCreated > 0 
      ? ((totalStats.devisValidated + totalStats.devisLost) / totalStats.devisCreated) * 100 
      : 0;
    
    let devisPoints = 0;
    const pointsTB_Conv = getLevelPoints('showroom:devis', 'tb', 10);
    const pointsB_Conv = getLevelPoints('showroom:devis', 'b', 8);
    const pointsM_Conv = getLevelPoints('showroom:devis', 'm', 4);

    if (conversionRate >= 75) devisPoints = pointsTB_Conv;
    else if (conversionRate >= 50) devisPoints = pointsB_Conv;
    else if (conversionRate >= 35) devisPoints = pointsM_Conv;

    // Basket (10 pts by default)
    let basketPoints = 0;
    const pointsTB_Basket = getLevelPoints('showroom:kpis-panier-moyen', 'tb', 10);
    const pointsB_Basket = getLevelPoints('showroom:kpis-panier-moyen', 'b', 8);
    const pointsM_Basket = getLevelPoints('showroom:kpis-panier-moyen', 'm', 4);

    if (avgBasket >= 20000) basketPoints = pointsTB_Basket;
    else if (avgBasket >= 15000) basketPoints = pointsB_Basket;
    else if (avgBasket >= 10000) basketPoints = pointsM_Basket;

    const totalSalesScore = caPoints + devisPoints + basketPoints;

    // --- BEHAVIOR SCORING (30 pts) ---
    // 1. AVIS (10 pts)
    const reviews = await prisma.clientReview.findMany({
      where: {
        OR: [
          { showroomId: showroomId },
          { userId: { in: userIds } }
        ],
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });

    const avisPositifs = reviews.filter(r => r.rating >= 4).length;
    const avisNegatifs = reviews.filter(r => r.rating <= 2).length;
    
    const pointsTB_Avis = getLevelPoints('showroom:avis', 'tb', 10);
    const pointsB_Avis = getLevelPoints('showroom:avis', 'b', 8);
    const pointsM_Avis = getLevelPoints('showroom:avis', 'm', 4);

    let avisPoints = pointsM_Avis; 
    if (avisNegatifs > 0) avisPoints = 0;
    else if (avisPositifs > 3) avisPoints = pointsTB_Avis;
    else if (avisPositifs > 0) avisPoints = pointsB_Avis;

    // 2. SAV (10 pts)
    const savEvaluations = await prisma.processEvaluation.findMany({
      where: {
        type: EvaluationType.SAV,
        userId: { in: userIds },
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });
    const savTickets = savEvaluations.reduce((acc, e) => acc + (e.ticketsCount || 0), 0);
    const savPlaintes = savEvaluations.reduce((acc, e) => acc + (e.complaintsCount || 0), 0);
    
    const pointsTB_SAV = getLevelPoints('showroom:service', 'tb', 10);
    const pointsB_SAV = getLevelPoints('showroom:service', 'b', 8);
    const pointsM_SAV = getLevelPoints('showroom:service', 'm', 4);

    let savPoints = pointsTB_SAV; 
    if (savPlaintes > 0) savPoints = 0;
    else if (savTickets > 4) savPoints = pointsM_SAV;
    else if (savTickets > 0) savPoints = pointsB_SAV;

    // 3. PROCESS (10 pts)
    const processEvaluations = await prisma.processEvaluation.findMany({
      where: {
        type: EvaluationType.PROCESS,
        OR: [
          { showroomId: showroomId },
          { userId: { in: userIds } }
        ],
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });
    const processWarningsCount = processEvaluations.length;
    
    const pointsTB_Proc = getLevelPoints('showroom:showroom', 'tb', 10);
    const pointsB_Proc = getLevelPoints('showroom:showroom', 'b', 8);
    const pointsM_Proc = getLevelPoints('showroom:showroom', 'm', 4);

    let processPoints = pointsTB_Proc;
    if (processWarningsCount === 1) processPoints = pointsB_Proc;
    else if (processWarningsCount === 2) processPoints = pointsM_Proc;
    else if (processWarningsCount >= 3) processPoints = 0;

    const totalBehaviorScore = avisPoints + savPoints + processPoints;

    // 4. PRESENCE (5 pts)
    const presenceLogs = await prisma.dailyLog.findMany({
      where: {
        OR: [
          { showroomId: showroomId },
          { userId: { in: userIds } }
        ],
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });
    const absences = presenceLogs.filter(l => l.status === 'Absence').length;
    const retards = presenceLogs.filter(l => l.status === 'Retard').length;
    const conges = presenceLogs.filter(l => l.status === 'Congé').length;
    const notesPositives = presenceLogs.filter(l => l.status === 'NotePositive').length;
    const notesNegatives = presenceLogs.filter(l => l.status === 'NoteNegative').length;
    const totalFaults = absences + retards;

    const pointsTB_Pres = getLevelPoints('assiduite', 'tb', 5);
    const pointsB_Pres = getLevelPoints('assiduite', 'b', 3);
    const pointsM_Pres = getLevelPoints('assiduite', 'm', 1);

    let presenceScore = 0;
    if (totalFaults === 0) presenceScore = pointsTB_Pres;
    else if (totalFaults === 1) presenceScore = pointsB_Pres;
    else if (totalFaults === 2) presenceScore = pointsM_Pres;

    const presenceScoreFinal = presenceScore;

    const presenceWeight = weights.presence || 0;
    const totalScore = Math.min(100, totalSalesScore + totalBehaviorScore + (presenceWeight > 0 ? presenceScoreFinal : 0));

    // Return rich object — controllers and snapshot service use what they need
    return {
      score: totalScore,
      salesScore: totalSalesScore,
      behaviorScore: totalBehaviorScore,
      presenceScore: presenceScoreFinal,
      // Ventes breakdown
      totalCA: totalStats.ca,
      totalDevisCreated: totalStats.devisCreated,
      totalDevisValidated: totalStats.devisValidated,
      totalDevisLost: totalStats.devisLost,
      totalDevisOpened: salesMetrics.reduce((acc, m) => acc + ((m as any).devisOpened || 0), 0),
      avgBasket,
      // Objectif at compute time
      conservativeCA,
      likelyCA,
      exceedCA,
      caAchievedPct: conservativeCA > 0 ? Math.min(200, (totalStats.ca / conservativeCA) * 100) : 0,
      // Comportement breakdown
      avisPositifs,
      avisNegatifs,
      savTickets,
      savPlaintes,
      processWarnings: processWarningsCount,
      // Calendrier summary
      absences,
      retards,
      conges,
      notesPositives,
      notesNegatives,
    };
  }
}

