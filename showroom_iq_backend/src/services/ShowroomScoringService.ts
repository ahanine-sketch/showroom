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
      where: { showroomId, month, year },
    });

    if (!objective) return 0;
    const { conservativeCA, likelyCA, exceedCA } = objective;

    // 2. Fetch all users in showroom
    const users = await prisma.user.findMany({
      where: { showroomId },
      select: { id: true }
    });
    const userIds = users.map(u => u.id);

    if (userIds.length === 0) return 0;

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

    // --- SALES SCORING (70 pts) --- Matches frontend isMagasin logic exactly
    // CA (50 pts)
    let caPoints = 0;
    if (totalStats.ca >= exceedCA) caPoints = 50;
    else if (totalStats.ca >= likelyCA) caPoints = 45; // Math.floor(50 * 0.9)
    else if (totalStats.ca >= conservativeCA) {
      const progress = (totalStats.ca - conservativeCA) / (likelyCA - conservativeCA);
      caPoints = 10 + Math.floor(progress * 35);
    } else if (totalStats.ca >= conservativeCA * 0.5) {
      caPoints = 10;
    }

    // Devis (10 pts) — frontend uses (validated + lost) / created for magasin
    const conversionRate = totalStats.devisCreated > 0 
      ? ((totalStats.devisValidated + totalStats.devisLost) / totalStats.devisCreated) * 100 
      : 0;
    let devisPoints = 0;
    if (conversionRate >= 75) devisPoints = 10;
    else if (conversionRate >= 50) devisPoints = 8;
    else if (conversionRate >= 35) devisPoints = 4;

    // Basket (10 pts)
    let basketPoints = 0;
    if (avgBasket >= 20000) basketPoints = 10;
    else if (avgBasket >= 15000) basketPoints = 8;
    else if (avgBasket >= 10000) basketPoints = 4;

    const totalSalesScore = caPoints + devisPoints + basketPoints;

    // --- BEHAVIOR SCORING (30 pts) --- Must match frontend exactly
    // 1. AVIS (Strictly Magasin only per user request)
    const reviews = await prisma.clientReview.findMany({
      where: {
        showroomId: showroomId,
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });

    const avisPositifs = reviews.filter(r => r.rating >= 4).length;
    const avisNegatifs = reviews.filter(r => r.rating <= 2).length;
    let avisPoints = 4; // default MOYEN
    if (avisNegatifs > 0) avisPoints = 0;
    else if (avisPositifs > 3) avisPoints = 10;
    else if (avisPositifs > 0) avisPoints = 8;

    // 2. SAV (Aggregated from commercials)
    const savEvaluations = await prisma.processEvaluation.findMany({
      where: {
        type: EvaluationType.SAV,
        userId: { in: userIds },
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });
    const savTickets = savEvaluations.reduce((acc, e) => acc + (e.ticketsCount || 0), 0);
    const savPlaintes = savEvaluations.reduce((acc, e) => acc + (e.complaintsCount || 0), 0);
    
    let savPoints = 10; // default TRES BIEN (no issues)
    if (savPlaintes > 0) savPoints = 0;
    else if (savTickets > 4) savPoints = 4;
    else if (savTickets > 0) savPoints = 8;

    // 3. PROCESS (Strictly Magasin only per user request)
    const processEvaluations = await prisma.processEvaluation.findMany({
      where: {
        type: EvaluationType.PROCESS,
        showroomId: showroomId,
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });
    const processWarningsCount = processEvaluations.length;
    let processPoints = 10; // default TRES BIEN
    if (processWarningsCount === 1) processPoints = 8;
    else if (processWarningsCount === 2) processPoints = 4;
    else if (processWarningsCount >= 3) processPoints = 0;

    const totalBehaviorScore = avisPoints + savPoints + processPoints;

    return Math.min(100, totalSalesScore + totalBehaviorScore);
  }
}
