import prisma from '../config/prisma';
import { EvaluationType } from '@prisma/client';

export class ScoringService {
  /**
   * 1. VENTES SCORING (65 pts total)
   */

  /**
   * CA Scoring (35 pts)
   * Based on % of Conservative and Likely targets
   * Now uses dynamic levels if provided
   */
  /**
   * CA Scoring (35 pts by default)
   * Based on % of Conservative and Likely targets from Objective
   */
  static async calculateCAScore(userId: string, ca: number, date: Date, dynamicLevels?: any[]): Promise<{ points: number; label: string }> {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const objective = await prisma.objective.findFirst({
      where: { userId, month, year, type: 'GLOBAL' },
    });

    if (!objective) return { points: 0, label: 'Mauvais' };

    const { conservativeCA, likelyCA, exceedCA } = objective;

    // Resolve dynamic point caps from settings
    const pointsTB = this.getLevelPointsByRank(dynamicLevels, 'tb', 35);
    const pointsB_Max = this.getLevelPointsByRank(dynamicLevels, 'b', 30);
    const pointsM_Max = this.getLevelPointsByRank(dynamicLevels, 'm', 20);
    const pointsMV_Points = this.getLevelPointsByRank(dynamicLevels, 'mv', 10);
    
    // Tres Bien: Above Exceed
    if (ca >= exceedCA) return { points: pointsTB, label: 'Très Bien' };

    // Bien: Above Likely
    if (ca >= likelyCA) {
      const gap = exceedCA - likelyCA;
      const progress = gap > 0 ? (ca - likelyCA) / gap : 0;
      const extra = Math.floor(progress / 0.2) * 1;
      return { points: Math.min(pointsTB, pointsB_Max + extra), label: 'Bien' };
    }

    // Moyen: Above Conservative
    if (ca >= conservativeCA) {
      const gap = likelyCA - conservativeCA;
      const progress = gap > 0 ? (ca - conservativeCA) / gap : 0;
      const extra = Math.floor(progress / 0.2) * 2;
      return { points: Math.min(pointsB_Max, pointsM_Max + extra), label: 'Moyen' };
    }

    // Mauvais: Close to Conservative (>= 50%)
    if (ca >= 0.5 * conservativeCA) {
      const gap = conservativeCA - (0.5 * conservativeCA);
      const progress = gap > 0 ? (ca - (0.5 * conservativeCA)) / gap : 0;
      const extra = Math.floor(progress / 0.2) * 2;
      return { points: Math.min(pointsM_Max, pointsMV_Points + extra), label: 'Mauvais' };
    }

    // Tres Mauvais: Below 0.5 * Conservative
    return { points: 0, label: 'Mauvais' };
  }

  /**
   * Helper to safely extract points from dynamic levels
   */
  private static getLevelPointsByRank(levels: any[] | undefined, id: string, fallback: number): number {
    if (!levels || !Array.isArray(levels)) return fallback;
    const level = levels.find(l => l.id === id);
    if (!level) return fallback;
    const p = parseInt(level.points);
    return isNaN(p) ? fallback : p;
  }


  /**
   * Conversion Score (15 pts)
   * Expects levels format: [{ name: 'TRÈS BIEN', criteria: 'Above 75%', points: '15' }, ...]
   */
  static calculateConversionScore(created: number, validated: number, lost: number, levels?: any[]): number {
    if (created === 0) return 0;
    const rate = ((validated + lost) / created) * 100;

    if (levels && levels.length > 0) {
      // Sort levels by points descending to find the highest match
      const sorted = [...levels].sort((a, b) => parseInt(b.points) - parseInt(a.points));
      for (const level of sorted) {
        // Extract threshold from criteria (e.g., "Above 75%" -> 75)
        const thresholdMatch = level.criteria.match(/(\d+)/);
        if (thresholdMatch) {
          const threshold = parseInt(thresholdMatch[1]);
          if (level.criteria.toLowerCase().includes('above') || level.criteria.includes('>')) {
            if (rate >= threshold) return parseInt(level.points);
          } else if (level.criteria.toLowerCase().includes('between')) {
             const points = level.criteria.match(/(\d+)\s*(?:and|&|-|to)\s*(\d+)/);
             if (points) {
               const low = parseInt(points[1]);
               const high = parseInt(points[2]);
               if (rate >= low && rate <= high) return parseInt(level.points);
             }
          } else if (level.criteria.toLowerCase().includes('below') || level.criteria.includes('<')) {
            if (rate < threshold) return parseInt(level.points);
          }
        }
      }
    }

    // Fallback to exact thresholds
    if (rate >= 75) return 15;
    if (rate >= 50) return 10;
    if (rate >= 35) return 5;
    return 0;
  }

  /**
   * Average Basket Score (15 pts)
   */
  static calculateBasketScore(avgBasket: number, levels?: any[]): number {
    if (levels && levels.length > 0) {
      const sorted = [...levels].sort((a, b) => parseInt(b.points) - parseInt(a.points));
      for (const level of sorted) {
        const thresholdMatch = level.criteria.match(/(\d+[\s\d]*)/);
        if (thresholdMatch) {
          const threshold = parseInt(thresholdMatch[1].replace(/\s/g, ''));
          if (level.criteria.toLowerCase().includes('above') || level.criteria.includes('>')) {
            if (avgBasket >= threshold) return parseInt(level.points);
          } else if (level.criteria.toLowerCase().includes('between') || level.criteria.includes('-')) {
             const points = level.criteria.match(/(\d+[\s\d]*)\s*(?:and|&|-|to)\s*(\d+[\s\d]*)/);
             if (points) {
               const low = parseInt(points[1].replace(/\s/g, ''));
               const high = parseInt(points[2].replace(/\s/g, ''));
               if (avgBasket >= low && avgBasket <= high) return parseInt(level.points);
             }
          } else if (level.criteria.toLowerCase().includes('below') || level.criteria.includes('<')) {
            if (avgBasket < threshold) return parseInt(level.points);
          }
        }
      }
    }

    if (avgBasket >= 20000) return 15;
    if (avgBasket >= 15000) return 10;
    if (avgBasket >= 10000) return 5;
    return 0;
  }

  /**
   * 2. COMPORTEMENT SCORING (30 pts total)
   */

  static calculateAvisScore(plus: number, minus: number, levels?: any[]): number {
    if (levels && levels.length > 0) {
      // Handle the strict "Mauvais if any negative" rule first if present in config
      const mauvais = levels.find(l => l.name.toUpperCase().includes('MAUVAIS') || l.id === 'mv');
      if (mauvais && minus >= 1) return parseInt(mauvais.points);

      const sorted = [...levels].sort((a, b) => parseInt(b.points) - parseInt(a.points));
      for (const level of sorted) {
        if (level.name.toUpperCase().includes('MAUVAIS')) continue; // Handled above

        const thresholdMatch = level.criteria.match(/(\d+)/);
        const threshold = thresholdMatch ? parseInt(thresholdMatch[1]) : 0;

        if (level.criteria.toLowerCase().includes('more') || level.criteria.includes('>')) {
          if (plus > threshold) return parseInt(level.points);
        } else if (level.criteria.toLowerCase().includes('up to') || level.criteria.includes('<=')) {
          if (plus > 0 && plus <= threshold) return parseInt(level.points);
        } else if (level.criteria.toLowerCase().includes('no reviews') || (plus === 0 && minus === 0)) {
          if (plus === 0 && minus === 0) return parseInt(level.points);
        }
      }
    }

    if (minus === 1) return 8; // -2 pts
    if (minus === 2) return 6; // -4 pts
    if (minus >= 3) return 6;  // -4 pts
    
    if (plus > 3) return 10;
    if (plus > 0) return 8;
    return 4;
  }

  static calculateSAVScore(tickets: number, complaints: number, levels?: any[]): number {
    if (levels && levels.length > 0) {
      const mauvais = levels.find(l => l.name.toUpperCase().includes('MAUVAIS'));
      if (mauvais && complaints >= 1) return parseInt(mauvais.points);

      const sorted = [...levels].sort((a, b) => parseInt(b.points) - parseInt(a.points));
      for (const level of sorted) {
        if (level.name.toUpperCase().includes('MAUVAIS')) continue;

        const thresholdMatch = level.criteria.match(/(\d+)/);
        const threshold = thresholdMatch ? parseInt(thresholdMatch[1]) : 0;

        if (level.criteria.toLowerCase().includes('no tickets') || tickets === 0) {
          if (tickets === 0 && complaints === 0) return parseInt(level.points);
        } else if (level.criteria.toLowerCase().includes('up to') || level.criteria.includes('<=')) {
          if (tickets <= threshold && complaints === 0) return parseInt(level.points);
        } else if (level.criteria.toLowerCase().includes('more') || level.criteria.includes('>')) {
          if (tickets > threshold && complaints === 0) return parseInt(level.points);
        }
      }
    }

    if (complaints >= 1) return 0;
    if (tickets === 0) return 10;
    if (tickets <= 4) return 8;
    return 4;
  }

  static calculateProcessScore(warningLevel: number, levels?: any[]): number {
    if (levels && levels.length > 0) {
      const sorted = [...levels].sort((a, b) => parseInt(b.points) - parseInt(a.points));
      for (const level of sorted) {
        const thresholdMatch = level.criteria.match(/(\d+)/);
        const threshold = thresholdMatch ? parseInt(thresholdMatch[1]) : 0;

        if (level.criteria.toLowerCase().includes('no warnings') || level.id === 'tb') {
          if (warningLevel === 0) return parseInt(level.points);
        } else if (level.criteria.match(/(\d+)(?:st|nd|rd|th)/) || level.criteria.includes('Warning')) {
          const match = level.criteria.match(/(\d+)/);
          if (match && warningLevel === parseInt(match[1])) return parseInt(level.points);
        }
      }
    }

    if (warningLevel >= 3) return 6; // -4 pts
    if (warningLevel === 2) return 6; // -4 pts
    if (warningLevel === 1) return 8; // -2 pts
    return 10;
  }

  /**
   * 3. PRESENCE SCORING (5 pts total)
   */
  static calculatePresenceScore(retards: number, absences: number, levels?: any[]): number {
    const total = retards + absences;
    
    if (levels && levels.length > 0) {
      const sorted = [...levels].sort((a, b) => parseInt(b.points) - parseInt(a.points));
      for (const level of sorted) {
        const thresholdMatch = level.criteria.match(/(\d+)/);
        if (level.criteria.toLowerCase().includes('pas de retards') || level.id === 'tb') {
          if (total === 0) return parseInt(level.points);
        } else if (level.criteria.toLowerCase().includes('moins de') || level.criteria.includes('<')) {
          if (thresholdMatch && total < parseInt(thresholdMatch[1])) return parseInt(level.points);
        } else if (level.criteria.toLowerCase().includes('entre') || level.criteria.includes('-')) {
          const points = level.criteria.match(/(\d+)\s*(?:et|and|&|-|to)\s*(\d+)/);
          if (points) {
            const low = parseInt(points[1]);
            const high = parseInt(points[2]);
            if (total >= low && total <= high) return parseInt(level.points);
          }
        } else if (level.criteria.toLowerCase().includes('plus de') || level.criteria.includes('>')) {
          if (thresholdMatch && total > parseInt(thresholdMatch[1])) return parseInt(level.points);
        }
      }
    }

    if (total === 0) return 5;
    if (total < 2) return 3;
    if (total <= 4) return 1;
    return 0;
  }

  /**
   * 4. TOTAL EVALUATION AND LABELS
   */
  static getGlobalTier(score: number, conclusions?: any[]): { label: string; commission: string } {
    if (conclusions && conclusions.length > 0) {
      // Sort conclusions to find the right range
      // Expected format: { id: 'c1', name: 'Très Bien', range: 'Score > 80', commission: '5 000 MAD', color: '#2A7D4F' }
      for (const conc of conclusions) {
        const thresholdMatch = conc.range.match(/(\d+)/);
        if (thresholdMatch) {
          const threshold = parseInt(thresholdMatch[1]);
          if (conc.range.includes('>') || conc.range.toLowerCase().includes('above')) {
            if (score > threshold) return { label: conc.name, commission: conc.commission };
          } else if (conc.range.includes('<') || conc.range.toLowerCase().includes('below')) {
            if (score < threshold) return { label: conc.name, commission: conc.commission };
          } else {
            const rangePoints = conc.range.match(/(\d+)\s*(?:-|to)\s*(\d+)/);
            if (rangePoints) {
              const low = parseInt(rangePoints[1]);
              const high = parseInt(rangePoints[2]);
              if (score >= low && score <= high) return { label: conc.name, commission: conc.commission };
            }
          }
        }
      }
    }

    if (score > 80) return { label: 'Très Bien', commission: '5 000 MAD' };
    if (score >= 60) return { label: 'Bien', commission: '1 500 MAD' };
    if (score >= 40) return { label: 'Moyen', commission: '500 MAD' };
    return { label: 'Mauvais', commission: '0 MAD' };
  }

  /**
   * Main entry point to update daily/monthly scores
   */
  static async updateDailyScore(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const month = startOfDay.getMonth() + 1;
    const year = startOfDay.getFullYear();

    // Fetch Configurations
    const configs = await prisma.scoringConfig.findMany();
    const metricConfigs: Record<string, any> = {};
    configs.forEach(c => {
      metricConfigs[c.metricName] = c.levels;
    });

    const globalConfigObj = await prisma.globalSettings.findUnique({ where: { key: 'siq_conclusions' } });
    const conclusions = globalConfigObj ? (globalConfigObj.value as any) : undefined;

    // Fetch Metrics
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await prisma.salesMetric.findFirst({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
    });

    const evaluations = await prisma.processEvaluation.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
    });

    const clientReviews = await prisma.clientReview.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
    });

    // 1. Calculate Ventes (65 pts)
    const { points: caPoints, label: caLabel } = sales 
      ? await this.calculateCAScore(userId, sales.ca, date, metricConfigs['objectif-ca'])
      : { points: 0, label: 'Mauvais' };
    
    const convPoints = sales 
      ? this.calculateConversionScore(sales.devisCreated, sales.devisValidated, sales.devisLost, metricConfigs['conversion-rate'])
      : 0;
    
    const basketPoints = sales ? this.calculateBasketScore(sales.avgBasket, metricConfigs['panier-moyen']) : 0;
    const finalSalesScore = caPoints + convPoints + basketPoints;

    // 2. Calculate Comportement (30 pts)
    const avisStats = {
      plus: (clientReviews || []).filter(r => r && r.rating >= 4).length,
      minus: (clientReviews || []).filter(r => r && r.rating <= 2).length
    };

    const savStats = (evaluations || [])
      .filter(e => e && e.type === EvaluationType.SAV)
      .reduce((acc, e) => ({ 
        tickets: acc.tickets + (e.ticketsCount || 0), 
        complaints: acc.complaints + (e.complaintsCount || 0) 
      }), { tickets: 0, complaints: 0 });

    // Process scoring - Cumulative deductions
    const processEvals = (evaluations || []).filter(e => e && e.type === EvaluationType.PROCESS);
    let processDeduction = 0;
    processEvals.forEach(e => {
      if (e.warningLevel === 1) processDeduction += 2;
      else if (e.warningLevel === 2) processDeduction += 4;
      else if (e.warningLevel === 3) processDeduction += 4;
    });
    
    const avisPoints = this.calculateAvisScore(avisStats.plus, avisStats.minus, metricConfigs['avis-reputation']);
    const savPoints = this.calculateSAVScore(savStats.tickets, savStats.complaints, metricConfigs['sav-service']);
    
    // Process points from config (tb level usually defines max points)
    const maxProcessPoints = this.getLevelPointsByRank(metricConfigs['process-qualite'], 'tb', 10);
    const procPoints = Math.max(0, maxProcessPoints - processDeduction);
    const finalBehaviorScore = avisPoints + savPoints + procPoints;


    // 3. Calculate Presence (5 pts)
    const presEval = evaluations.find(e => e.type === EvaluationType.PRESENCE);
    const finalPresenceScore = this.calculatePresenceScore(presEval?.retardsCount || 0, presEval?.absencesCount || 0, metricConfigs['assiduite']);

    // 4. Manual Bonus
    const existingScore = await prisma.dailyScore.findUnique({
      where: { userId_date: { userId, date: startOfDay } },
    });
    const bonusScore = existingScore?.bonusScore || 0;

    const totalScore = finalSalesScore + finalBehaviorScore + finalPresenceScore + bonusScore;

    const tier = this.getGlobalTier(totalScore, conclusions);

    return await prisma.dailyScore.upsert({
      where: { userId_date: { userId, date: startOfDay } },
      update: {
        totalScore,
        salesScore: finalSalesScore,
        behaviorScore: finalBehaviorScore,
        presenceScore: finalPresenceScore,
        bonusScore,
        details: {
          tier,
          ca: { points: caPoints, label: caLabel },
          conversion: convPoints,
          basket: basketPoints,
          avis: avisPoints,
          sav: savPoints,
          process: procPoints,
          presence: finalPresenceScore
        }
      },
      create: {
        userId,
        date: startOfDay,
        totalScore,
        salesScore: finalSalesScore,
        behaviorScore: finalBehaviorScore,
        presenceScore: finalPresenceScore,
        bonusScore,
        details: {
          tier,
          ca: { points: caPoints, label: caLabel },
          conversion: convPoints,
          basket: basketPoints,
          avis: avisPoints,
          sav: savPoints,
          process: procPoints,
          presence: finalPresenceScore
        }
      },
    });
  }
}

