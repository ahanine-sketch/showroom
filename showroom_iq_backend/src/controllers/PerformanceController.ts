import { Request, Response } from 'express';
import { ScoringService } from '../services/ScoringService';
import prisma from '../config/prisma';
import { EvaluationType } from '@prisma/client';
import { MonthlySnapshotService } from '../services/MonthlySnapshotService';

export class PerformanceController {
  /**
   * Add a sales metric and update the daily score.
   */
  static async addMetric(req: Request, res: Response) {
    try {
      const { userId, ca, devisCount, devisAmount, savCount, date } = req.body;

      const metricDate = date ? new Date(date) : new Date();

      // Basic creation
      const metric = await prisma.salesMetric.create({
        data: {
          userId,
          ca: parseFloat(ca),
          devisCount: parseInt(devisCount),
          devisAmount: parseFloat(devisAmount),
          savCount: parseInt(savCount),
          date: metricDate,
        },
      });

      // TRIGGER AUTOMATED SCORING
      await ScoringService.updateDailyScore(userId, metricDate);

      return res.status(201).json({
        success: true,
        data: metric,
        message: 'Metric added and daily score updated.',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get Daily performance for a user.
   */
  static async getDailyPerformance(req: Request, res: Response) {
    try {
        const userId = req.params.userId as string;
        const date = req.params.date as string;
        const targetDate = new Date(date as string);
        targetDate.setHours(0, 0, 0, 0);

        const performance = await prisma.dailyScore.findUnique({
            where: {
                userId_date: { userId: userId as string, date: targetDate }
            }
        });

        return res.json({ success: true, data: performance });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Add a manual bonus and update total points.
   */
  static async addBonus(req: Request, res: Response) {
    try {
      const { userId, amount, description, date } = req.body;
      
      if (!userId || isNaN(parseFloat(amount))) {
        return res.status(400).json({ success: false, error: "Données invalides (ID utilisateur ou montant manquant)" });
      }

      const bonusDate = date ? new Date(date) : new Date();
      bonusDate.setHours(0, 0, 0, 0);

      // Verify user exists first to avoid confusing Prisma errors
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ success: false, error: "Utilisateur non trouvé dans la base de données" });
      }

      const month = bonusDate.getMonth() + 1;
      const year = bonusDate.getFullYear();

      // Ensure only one bonus per month
      const existingMonthBonus = await prisma.bonusHistory.findFirst({
        where: { userId, month, year }
      });

      if (existingMonthBonus) {
        return res.status(400).json({ success: false, error: "Un bonus a déjà été attribué à cet utilisateur pour ce mois." });
      }

      // 1. Create Bonus History Entry
      const bonus = await prisma.bonusHistory.create({
        data: {
          userId,
          amount: parseFloat(amount),
          description,
          date: bonusDate,
          month,
          year
        }
      });

      // 2. Fetch or Create Daily Score for this user/date
      let dailyScore = await prisma.dailyScore.findUnique({
        where: { userId_date: { userId, date: bonusDate } }
      });

      // 3. Update Bonus Score (Additive or Override?)
      // User said "manual bonus entries", usually additive for history, but we keep the current sum on the day.
      // We will sum all historical bonuses for this day.
      const dayBonuses = await prisma.bonusHistory.aggregate({
        where: { userId, date: bonusDate },
        _sum: { amount: true }
      });

      const totalBonusForDay = dayBonuses._sum.amount || 0;

      if (!dailyScore) {
        // If no daily score yet, create one with 0 for other metrics
        dailyScore = await prisma.dailyScore.create({
          data: {
            userId,
            date: bonusDate,
            bonusScore: totalBonusForDay,
            totalScore: totalBonusForDay
          }
        });
      } else {
        // Recalculate total score
        const newTotal = dailyScore.salesScore + dailyScore.behaviorScore + dailyScore.presenceScore + totalBonusForDay;
        
        dailyScore = await prisma.dailyScore.update({
          where: { id: dailyScore.id },
          data: {
            bonusScore: totalBonusForDay,
            totalScore: newTotal
          }
        });
      }

      return res.json({ success: true, data: bonus, dailyScore });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get Bonus History for a user.
   */
  static async getBonusHistory(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      const history = await prisma.bonusHistory.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 3
      });
      return res.json({ success: true, data: history });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Add a process evaluation (Avis, SAV, Process, Presence)
   */
  static async addEvaluation(req: Request, res: Response) {
    try {
      const { userId, showroomId, type, plusAvis, minusAvis, ticketsCount, complaintsCount, warningLevel, notes, date } = req.body;

      if (!userId && !showroomId) {
        return res.status(400).json({ success: false, error: "UserID or ShowroomId is required" });
      }
      if (!type) {
        return res.status(400).json({ success: false, error: "Type is required" });
      }

      const evalDate = date ? new Date(date) : new Date();
      evalDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone shifts

      if (type === 'AVIS') {
        // Parse the notes if it was sent as JSON string from frontend
        let parsed = { name: '', rating: 5, comment: '' };
        try {
          if (notes && typeof notes === 'string' && notes.startsWith('{')) {
            parsed = JSON.parse(notes);
          } else if (notes && typeof notes === 'string') {
            parsed.comment = notes;
          }
        } catch (e) {}

        const review = await prisma.clientReview.create({
          data: {
            userId: userId || null,
            showroomId: showroomId || null,
            name: parsed.name,
            rating: parsed.rating,
            comment: parsed.comment,
            date: evalDate
          }
        });

        if (userId) await ScoringService.updateDailyScore(userId, evalDate);
        return res.status(201).json({ success: true, data: review });
      }

      if (type === 'DAILY_NOTE') {
        const { noteType, content } = req.body;
        const log = await prisma.dailyLog.create({
          data: {
            userId: userId || null,
            showroomId: showroomId || null,
            date: evalDate,
            activity: 'DAILY_NOTE',
            status: noteType || 'positive',
            notes: content || notes
          }
        });
        if (userId) await ScoringService.updateDailyScore(userId, evalDate);
        return res.status(201).json({ success: true, data: log });
      }

      if (type === 'PRESENCE') {
        const { presenceStatus, motif } = req.body;
        
        // 1. Create the detailed DailyLog
        const log = await prisma.dailyLog.create({
          data: {
            userId,
            date: evalDate,
            activity: 'PRESENCE',
            status: presenceStatus || 'Retard',
            notes: motif || notes
          }
        });

        // 2. Update the ProcessEvaluation counts for scoring
        // We'll increment the counts for the day if it's a Retard or Absence
        if (presenceStatus === 'Retard' || presenceStatus === 'Absence') {
          const existingEval = await prisma.processEvaluation.findFirst({
            where: { 
              userId, 
              type: 'PRESENCE',
              date: {
                gte: new Date(evalDate.setHours(0,0,0,0)),
                lte: new Date(evalDate.setHours(23,59,59,999))
              }
            }
          });

          if (existingEval) {
            await prisma.processEvaluation.update({
              where: { id: existingEval.id },
              data: {
                retardsCount: presenceStatus === 'Retard' ? (existingEval.retardsCount || 0) + 1 : existingEval.retardsCount,
                absencesCount: presenceStatus === 'Absence' ? (existingEval.absencesCount || 0) + 1 : existingEval.absencesCount,
              }
            });
          } else {
            await prisma.processEvaluation.create({
              data: {
                userId,
                type: 'PRESENCE',
                date: evalDate,
                retardsCount: presenceStatus === 'Retard' ? 1 : 0,
                absencesCount: presenceStatus === 'Absence' ? 1 : 0,
              }
            });
          }
        }

        await ScoringService.updateDailyScore(userId, evalDate);
        return res.status(201).json({ success: true, data: log });
      }

      const evaluation = await prisma.processEvaluation.create({
        data: {
          userId: userId || null,
          showroomId: showroomId || null,
          type,
          plusAvis: plusAvis !== undefined ? parseInt(plusAvis) : null,
          minusAvis: minusAvis !== undefined ? parseInt(minusAvis) : null,
          ticketsCount: ticketsCount !== undefined ? parseInt(ticketsCount) : null,
          complaintsCount: complaintsCount !== undefined ? parseInt(complaintsCount) : null,
          warningLevel: warningLevel !== undefined ? parseInt(warningLevel) : null,
          notes,
          date: evalDate,
        },
      });

      // TRIGGER AUTOMATED SCORING (only for user-linked evaluations)
      if (userId) await ScoringService.updateDailyScore(userId, evalDate);

      return res.status(201).json({
        success: true,
        data: evaluation,
        message: 'Evaluation added and daily score updated.',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get the computed global score for a user for a specific month/year.
   * Uses the same scoring logic as the frontend ScorecardWrapper.
   */
  static async getGlobalScore(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      const { month, year } = req.params;
      const m = parseInt(month as string);
      const y = parseInt(year as string);

      // Verify user is active
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { status: true }
      });

      if (!user || user.status !== 'ACTIVE') {
        return res.status(404).json({ success: false, error: 'Utilisateur introuvable ou bloqué' });
      }

      if (isNaN(m) || isNaN(y)) {
        return res.status(400).json({ success: false, error: 'Invalid month or year' });
      }

      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59, 999);

      // --- DATA FETCHING (Always Live for Behavior/Presence/Bonus) ---
      const evaluations = await prisma.processEvaluation.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
      });

      const clientReviews = await prisma.clientReview.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
      });

      const bonusHistory = await prisma.bonusHistory.findMany({
        where: { userId, month: m, year: y },
      });

      const presenceLogs = await prisma.dailyLog.findMany({
        where: { userId, activity: 'PRESENCE', date: { gte: startDate, lte: endDate } },
      });

      // --- Ventes Data (Snapshot if closed, else Live) ---
      let totalCA = 0;
      let totalDevisCreated = 0;
      let totalDevisValidated = 0;
      let totalDevisLost = 0;
      let avgBasket = 0;
      let isSnapshot = false;
      let frozenAt = null;

      const isClosed = MonthlySnapshotService.isClosedMonth(m, y);
      const snapshot = isClosed ? await MonthlySnapshotService.getCommercialSnapshot(userId, m, y) : null;

      if (snapshot) {
        totalCA = snapshot.totalCA || 0;
        totalDevisCreated = snapshot.totalDevisCreated || 0;
        totalDevisValidated = snapshot.totalDevisValidated || 0;
        totalDevisLost = snapshot.totalDevisLost || 0;
        avgBasket = snapshot.avgBasket || 0;
        isSnapshot = true;
        frozenAt = snapshot.frozenAt;
      } else {
        const salesMetrics = await prisma.salesMetric.findMany({
          where: { userId, date: { gte: startDate, lte: endDate } },
          orderBy: { date: 'desc' },
        });

        totalCA = salesMetrics.reduce((sum: number, s: any) => sum + (s.ca || 0), 0);
        totalDevisCreated = salesMetrics.reduce((sum: number, s: any) => sum + (s.devisCreated || 0), 0);
        totalDevisValidated = salesMetrics.reduce((sum: number, s: any) => sum + (s.devisValidated || 0), 0);
        totalDevisLost = salesMetrics.reduce((sum: number, s: any) => sum + (s.devisLost || 0), 0);
        avgBasket = salesMetrics.length > 0
          ? salesMetrics.reduce((sum: number, s: any) => sum + (s.avgBasket || 0), 0) / salesMetrics.length
          : 0;
      }

      // --- Objective (Used for CA score) ---
      const objective = await prisma.objective.findFirst({
        where: { userId, month: m, year: y, type: 'GLOBAL' },
      });
      const rawConservativeCA = objective?.conservativeCA ?? 0;
      const rawLikelyCA       = objective?.likelyCA       ?? 0;
      const rawExceedCA       = objective?.exceedCA        ?? 0;
      const conservativeCA = rawConservativeCA > 0 ? rawConservativeCA : 30000;
      const likelyCA       = rawLikelyCA       > 0 ? rawLikelyCA       : 50000;
      const exceedCA       = rawExceedCA        > 0 ? rawExceedCA        : 70000;

      // 1. CA Score (35 pts)
      let caPoints = 0;
      if (totalCA > 0) {
        if (totalCA >= exceedCA) {
          caPoints = 35;
        } else if (totalCA >= likelyCA) {
          caPoints = 32;
        } else if (totalCA >= conservativeCA) {
          const progress = (totalCA - conservativeCA) / (likelyCA - conservativeCA);
          caPoints = 21 + Math.floor(progress * 10);
        } else if (totalCA >= conservativeCA * 0.5) {
          caPoints = 10;
        }
      }

      // 2. Devis Score (15 pts)
      const convRate = totalDevisCreated > 0
        ? ((totalDevisValidated + totalDevisLost) / totalDevisCreated) * 100 : 0;
      let devisPoints = 0;
      if (convRate > 75)       devisPoints = 15;
      else if (convRate >= 50) devisPoints = 10;
      else if (convRate >= 35) devisPoints =  5;

      // 3. Panier Moyen Score (15 pts)
      let panierPoints = 0;
      if (avgBasket >= 20000)      panierPoints = 15;
      else if (avgBasket >= 15000) panierPoints = 10;
      else if (avgBasket >= 10000) panierPoints =  5;

      const cappedSalesScore = Math.min(caPoints + devisPoints + panierPoints, 65);

      // --- Comportement Score (30 pts) ---
      const avisPositifs = clientReviews.filter((r: any) => r.rating >= 4).length;
      const avisNegatifs = clientReviews.filter((r: any) => r.rating <= 2).length;
      let avisPoints = 4;
      if (avisNegatifs > 0) avisPoints = 0;
      else if (avisPositifs > 3) avisPoints = 10;
      else if (avisPositifs > 0) avisPoints = 8;

      const savTickets = evaluations.filter((e: any) => e.type === 'SAV').reduce((sum: number, e: any) => sum + (e.ticketsCount || 0), 0);
      const savPlaintes = evaluations.filter((e: any) => e.type === 'SAV').reduce((sum: number, e: any) => sum + (e.complaintsCount || 0), 0);
      let savPoints = 10;
      if (savPlaintes > 0) savPoints = 0;
      else if (savTickets > 4) savPoints = 4;
      else if (savTickets > 0) savPoints = 8;

      const warnings = evaluations.filter((e: any) => e.type === 'PROCESS').length;
      let processPoints = 10;
      if (warnings === 1) processPoints = 8;
      else if (warnings === 2) processPoints = 4;
      else if (warnings >= 3) processPoints = 0;

      const behaviorScore = avisPoints + savPoints + processPoints;

      // --- Presence Score (5 pts) ---
      const absences = presenceLogs.filter((l: any) => l.status === 'Absence').length;
      const retards = presenceLogs.filter((l: any) => l.status === 'Retard').length;
      const totalFaults = absences + retards;
      let presencePoints = 5;
      if (totalFaults >= 5) presencePoints = 0;
      else if (totalFaults >= 2) presencePoints = 1;
      else if (totalFaults >= 1) presencePoints = 3;

      // --- Bonus ---
      const bonusTotal = bonusHistory.reduce((sum: number, b: any) => sum + b.amount, 0);
      const cappedBonus = Math.min(bonusTotal, 5);

      const globalScore = Math.min(100, cappedSalesScore + behaviorScore + presencePoints + cappedBonus);

      return res.json({
        success: true,
        data: {
          globalScore,
          breakdown: {
            sales: cappedSalesScore,
            behavior: behaviorScore,
            presence: presencePoints,
            bonus: cappedBonus,
          },
          isSnapshot,
          frozenAt
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get evaluations for a user in a specific month
   */
  static async getMonthlyEvaluations(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      const { month, year } = req.params;
      const m = parseInt(month as string);
      const y = parseInt(year as string);

      if (isNaN(m) || isNaN(y)) {
        return res.status(400).json({ success: false, error: "Invalid month or year parameters" });
      }

      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59, 999);

      // --- SNAPSHOT CHECK ---
      const isClosed = MonthlySnapshotService.isClosedMonth(m, y);
      let snapshot = null;
      if (isClosed) {
        snapshot = await MonthlySnapshotService.getCommercialSnapshot(userId, m, y);
      }

      const evaluations = await prisma.processEvaluation.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: 'desc' },
      });

      const clientReviews = await prisma.clientReview.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: 'desc' },
      });

      // Format clientReviews to look like evaluations for frontend compatibility
      const formattedReviews = clientReviews.map(r => ({
        ...r,
        type: 'AVIS',
        plusAvis: r.rating >= 4 ? 1 : 0,
        minusAvis: r.rating <= 2 ? 1 : 0,
        notes: JSON.stringify({ name: r.name, rating: r.rating, comment: r.comment })
      }));

      const bonusHistory = await prisma.bonusHistory.findMany({
        where: {
          userId,
          month: m,
          year: y
        }
      });

      const bonusTotal = bonusHistory.reduce((sum, b) => sum + b.amount, 0);

      const dailyLogs = await prisma.dailyLog.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        include: {
          user: {
            select: { fullName: true }
          }
        },
        orderBy: { date: 'desc' },
      });

      return res.json({ 
        success: true, 
        data: [...evaluations, ...formattedReviews],
        dailyLogs,
        bonusTotal,
        bonuses: bonusHistory,
        snapshot // Include snapshot if it exists
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get aggregated evaluations for ALL commercials in a showroom for a specific month.
   * This powers the Magasin Comportement and Calendrier tabs.
   */
  static async getShowroomEvaluations(req: Request, res: Response) {
    try {
      const showroomId = req.params.showroomId as string;
      const { month, year } = req.params;
      const m = parseInt(month as string);
      const y = parseInt(year as string);

      if (isNaN(m) || isNaN(y)) {
        return res.status(400).json({ success: false, error: "Invalid month or year parameters" });
      }

      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59, 999);

      // --- SNAPSHOT CHECK ---
      const isClosed = MonthlySnapshotService.isClosedMonth(m, y);
      let snapshot = null;
      if (isClosed) {
        snapshot = await MonthlySnapshotService.getShowroomSnapshot(showroomId, m, y);
      }

      // 1. Get all users in this showroom
      const users = await prisma.user.findMany({
        where: { 
          showroomId,
          status: 'ACTIVE'
        },
        select: { id: true }
      });
      const userIds = users.map(u => u.id);

      if (userIds.length === 0) {
        return res.json({ success: true, data: [], dailyLogs: [], bonusTotal: 0 });
      }

      // 2a. SAV: from ALL commerciaux in the showroom (team aggregate)
      const savEvaluations = await prisma.processEvaluation.findMany({
        where: {
          userId: { in: userIds },
          type: EvaluationType.SAV,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: 'desc' },
      });

      // 2b. PROCESS (Magasin warnings): ONLY showroom-level records, never from individual commerciaux
      const processEvaluations = await prisma.processEvaluation.findMany({
        where: {
          showroomId: showroomId,
          userId: null,
          type: EvaluationType.PROCESS,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: 'desc' },
      });

      const evaluations = [...savEvaluations, ...processEvaluations];

      // 3. Avis: ONLY showroom-level ClientReviews (not from individual commerciaux)
      const clientReviews = await prisma.clientReview.findMany({
        where: {
          showroomId: showroomId,
          userId: null,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: 'desc' },
      });

      // Format clientReviews to look like evaluations for frontend compatibility
      const formattedReviews = clientReviews.map(r => ({
        ...r,
        type: 'AVIS',
        plusAvis: r.rating >= 4 ? 1 : 0,
        minusAvis: r.rating <= 2 ? 1 : 0,
        notes: JSON.stringify({ name: r.name, rating: r.rating, comment: r.comment })
      }));

      // 4. Fetch bonus history for all users (keep aggregation for bonus)
      const bonusHistory = await prisma.bonusHistory.findMany({
        where: {
          userId: { in: userIds },
          month: m,
          year: y
        }
      });
      const bonusTotal = bonusHistory.reduce((sum, b) => sum + b.amount, 0);

      // 5. Fetch daily logs (Presence/Notes aggregated from team only)
      const dailyLogs = await prisma.dailyLog.findMany({
        where: {
          OR: [
            { showroomId: showroomId },
            { userId: { in: userIds } }
          ],
          date: { gte: startDate, lte: endDate },
        },
        include: {
          user: {
            select: { fullName: true }
          }
        }
      });

      return res.json({ 
        success: true, 
        data: [...evaluations, ...formattedReviews],
        dailyLogs,
        bonusTotal,
        snapshot // Include snapshot if it exists
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

