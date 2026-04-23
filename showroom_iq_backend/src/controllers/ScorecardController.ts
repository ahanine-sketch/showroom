import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { MonthlyResetService } from '../services/MonthlyResetService';

/**
 * Validates a date-range query pair.
 * Returns parsed Date objects or null if invalid.
 * Enforces a 366-day cap to protect DB performance.
 */
function parseDateRange(startStr: unknown, endStr: unknown): { start: Date; end: Date } | null {
  if (typeof startStr !== 'string' || typeof endStr !== 'string') return null;

  const start = new Date(startStr);
  const end = new Date(endStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  if (start > end) return null;

  const diffMs = end.getTime() - start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays > 366) return null;

  // normalize to full day boundaries
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export class ScorecardController {
  /**
   * GET /api/scorecard/commercial
   * Query: userId, startDate, endDate
   *
   * Returns aggregated data for the commercial scorecard:
   *   - objectives (conservative / likely / exceed CA)
   *   - behavior evaluations
   *   - daily logs (calendar)
   *   - max bonus in period
   *   - sales metrics (placeholder until Dolibarr is wired)
   */
  static async getCommercial(req: Request, res: Response) {
    try {
      const { userId, startDate, endDate } = req.query;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }

      const range = parseDateRange(startDate, endDate);
      if (!range) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required, must be valid ISO dates, and cannot span more than 366 days',
        });
      }

      const { start, end } = range;

      // All queries run in parallel for performance
      const [user, objectives, evaluations, dailyLogs, bonuses] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true, role: true, showroomId: true, status: true },
        }),

        prisma.objective.findMany({
          where: {
            userId,
            OR: [
              // date-range aware (new records)
              { dateStart: { lte: end }, dateEnd: { gte: start } },
              // legacy month/year fallback
              {
                dateStart: null,
                month: { gte: start.getMonth() + 1 },
                year: { gte: start.getFullYear() },
              },
            ],
          },
          orderBy: { createdAt: 'desc' },
        }),

        prisma.processEvaluation.findMany({
          where: {
            userId,
            date: { gte: start, lte: end },
          },
          orderBy: { date: 'desc' },
        }),

        prisma.dailyLog.findMany({
          where: {
            userId,
            date: { gte: start, lte: end },
          },
          orderBy: { date: 'asc' },
        }),

        prisma.bonusHistory.findMany({
          where: {
            userId,
            OR: [
              { dateStart: { lte: end }, dateEnd: { gte: start } },
              {
                dateStart: null,
                date: { gte: start, lte: end },
              },
            ],
          },
          orderBy: { date: 'desc' },
        }),
      ]);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Aggregate bonus total for the period
      const totalBonus = bonuses.reduce((sum, b) => sum + b.amount, 0);

      return res.json({
        success: true,
        data: {
          user,
          period: { startDate: start.toISOString(), endDate: end.toISOString() },
          objectives,
          evaluations,
          dailyLogs,
          bonuses,
          totalBonus,
          // Dolibarr sales: reserved for future integration
          salesMetrics: null,
        },
      });
    } catch (err) {
      console.error('[ScorecardController.getCommercial]', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/scorecard/showroom
   * Query: showroomId, startDate, endDate
   *
   * Returns aggregated team performance data for a showroom:
   *   - all active commercials in the showroom
   *   - per-commercial: evaluations + daily logs + objectives
   *   - showroom-level totals
   */
  static async getShowroom(req: Request, res: Response) {
    try {
      const { showroomId, startDate, endDate } = req.query;

      if (!showroomId || typeof showroomId !== 'string') {
        return res.status(400).json({ success: false, message: 'showroomId is required' });
      }

      const range = parseDateRange(startDate, endDate);
      if (!range) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required, valid ISO dates, max 366 days',
        });
      }

      const { start, end } = range;

      const [showroom, teamMembers] = await Promise.all([
        prisma.showroom.findUnique({
          where: { id: showroomId },
          select: { id: true, name: true, city: true },
        }),
        prisma.user.findMany({
          where: { showroomId, status: 'ACTIVE', role: 'COMMERCIAL' },
          select: { id: true, name: true, email: true, role: true },
        }),
      ]);

      if (!showroom) {
        return res.status(404).json({ success: false, message: 'Showroom not found' });
      }

      // Fetch each member's data in parallel
      const teamData = await Promise.all(
        teamMembers.map(async (member) => {
          const [evaluations, dailyLogs, objectives] = await Promise.all([
            prisma.processEvaluation.findMany({
              where: { userId: member.id, date: { gte: start, lte: end } },
              orderBy: { date: 'desc' },
            }),
            prisma.dailyLog.findMany({
              where: { userId: member.id, date: { gte: start, lte: end } },
              orderBy: { date: 'asc' },
            }),
            prisma.objective.findMany({
              where: {
                userId: member.id,
                OR: [
                  { dateStart: { lte: end }, dateEnd: { gte: start } },
                  {
                    dateStart: null,
                    month: { gte: start.getMonth() + 1 },
                    year: { gte: start.getFullYear() },
                  },
                ],
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            }),
          ]);

          return { ...member, evaluations, dailyLogs, objective: objectives[0] ?? null };
        })
      );

      return res.json({
        success: true,
        data: {
          showroom,
          period: { startDate: start.toISOString(), endDate: end.toISOString() },
          team: teamData,
        },
      });
    } catch (err) {
      console.error('[ScorecardController.getShowroom]', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/admin/monthly-reset
   * Body (optional): { month, year }
   *
   * Triggers the idempotent monthly reset.
   * If month/year are omitted it defaults to the current month.
   */
  static async triggerMonthlyReset(req: Request, res: Response) {
    try {
      const now = new Date();
      const month = Number(req.body?.month) || now.getMonth() + 1;
      const year = Number(req.body?.year) || now.getFullYear();

      if (month < 1 || month > 12 || year < 2020 || year > 2100) {
        return res.status(400).json({ success: false, message: 'Invalid month or year' });
      }

      const result = await MonthlyResetService.runForMonth(month, year);

      return res.json({ success: true, data: result });
    } catch (err) {
      console.error('[ScorecardController.triggerMonthlyReset]', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
