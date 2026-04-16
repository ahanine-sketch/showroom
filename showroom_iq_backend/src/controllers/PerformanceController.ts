import { Request, Response } from 'express';
import { ScoringService } from '../services/ScoringService';
import prisma from '../config/prisma';

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
        const { userId, date } = req.params;
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

      // Simplified: Allow multiple entries in BonusHistory, we sum them in the evaluations view.


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
      const { userId } = req.params;
      const history = await prisma.bonusHistory.findMany({
        where: { userId },
        orderBy: { date: 'desc' }
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
      const { userId, type, plusAvis, minusAvis, ticketsCount, complaintsCount, warningLevel, notes, date } = req.body;

      if (!userId || !type) {
        return res.status(400).json({ success: false, error: "UserID and Type are required" });
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
            userId,
            name: parsed.name,
            rating: parsed.rating,
            comment: parsed.comment,
            date: evalDate
          }
        });

        await ScoringService.updateDailyScore(userId, evalDate);
        return res.status(201).json({ success: true, data: review });
      }

      if (type === 'DAILY_NOTE') {
        const { noteType, content } = req.body;
        const log = await prisma.dailyLog.create({
          data: {
            userId,
            date: evalDate,
            activity: 'DAILY_NOTE',
            status: noteType || 'positive',
            notes: content || notes
          }
        });
        await ScoringService.updateDailyScore(userId, evalDate);
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
          userId,
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

      // TRIGGER AUTOMATED SCORING
      await ScoringService.updateDailyScore(userId, evalDate);

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
   * Get evaluations for a user in a specific month
   */
  static async getMonthlyEvaluations(req: Request, res: Response) {
    try {
      const { userId, month, year } = req.params;
      const m = parseInt(month);
      const y = parseInt(year);

      if (isNaN(m) || isNaN(y)) {
        return res.status(400).json({ success: false, error: "Invalid month or year parameters" });
      }

      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59, 999);

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
        orderBy: { date: 'desc' },
      });

      return res.json({ 
        success: true, 
        data: [...evaluations, ...formattedReviews],
        dailyLogs,
        bonusTotal
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

