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

      // Check if user already has a bonus this month
      const existingBonus = await prisma.bonusHistory.findFirst({
        where: { userId, month, year }
      });

      if (existingBonus) {
        return res.status(400).json({ 
          success: false, 
          error: `Un bonus a déjà été attribué à cet utilisateur pour le mois de ${bonusDate.toLocaleString('fr-FR', { month: 'long' })} ${year}` 
        });
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
}

