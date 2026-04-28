import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { MonthlyResetService } from '../services/MonthlyResetService';
import { MonthlySnapshotService } from '../services/MonthlySnapshotService';
import { DolibarrService } from '../services/DolibarrService';

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
      const [user, objectives, evaluations, dailyLogs, bonuses, clientReviews, salesMetrics] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, fullName: true, email: true, role: true, showroomId: true, status: true },
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

        // Avis from ClientReview (source of truth — not ProcessEvaluation)
        prisma.clientReview.findMany({
          where: { userId, date: { gte: start, lte: end } },
          orderBy: { date: 'desc' },
        }),

        // Sales metrics for the period
        prisma.salesMetric.findMany({
          where: { userId, date: { gte: start, lte: end } },
          orderBy: { date: 'asc' },
        }),
      ]);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // --- SNAPSHOT INTEGRATION ---
      const isFullMonth = start.getDate() === 1 && end.getDate() === new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
      const m = start.getMonth() + 1;
      const y = start.getFullYear();
      
      let snapshot = null;
      if (isFullMonth && MonthlySnapshotService.isClosedMonth(m, y)) {
        snapshot = await MonthlySnapshotService.getCommercialSnapshot(userId, m, y);
      }

      // If snapshot exists, we can optionally override the live aggregates
      // But for now, we'll return both so the frontend can decide or show a "FROZEN" badge.
      
      // --- LIVE AGGREGATIONS (Behavior & Calendar) ---
      // These are ALWAYS live from DB tables even if a snapshot exists for Ventes
      const totalBonus = bonuses.reduce((sum, b) => sum + b.amount, 0);
      
      // Behavior Aggregation
      const avisPositifs = clientReviews.filter(r => r.rating >= 4).length;
      const avisNegatifs = clientReviews.filter(r => r.rating <= 2).length;
      
      const savTickets = evaluations
        .filter(e => e.type === 'SAV')
        .reduce((sum, e) => sum + (e.ticketsCount || 0), 0);
      const savPlaintes = evaluations
        .filter(e => e.type === 'SAV')
        .reduce((sum, e) => sum + (e.complaintsCount || 0), 0);
      
      const processWarnings = evaluations.filter(e => e.type === 'PROCESS').length;

      // Calendar Aggregation
      const calendarStats = {
        absences: dailyLogs.filter(l => l.status === 'Absence').length,
        retards: dailyLogs.filter(l => l.status === 'Retard').length,
        conges: dailyLogs.filter(l => l.status === 'Congé').length,
        notesPositives: dailyLogs.filter(l => l.status === 'NotePositive').length,
        notesNegatives: dailyLogs.filter(l => l.status === 'NoteNegative').length,
      };

      // Ventes Aggregation (Fallback if no snapshot)
      const totalCA = salesMetrics.reduce((sum, s) => sum + (s.ca || 0), 0);
      const totalDevisCreated = salesMetrics.reduce((sum, s) => sum + (s.devisCreated || 0), 0);
      const totalDevisValidated = salesMetrics.reduce((sum, s) => sum + (s.devisValidated || 0), 0);
      const totalDevisLost = salesMetrics.reduce((sum, s) => sum + (s.devisLost || 0), 0);
      const totalDevisOpened = salesMetrics.reduce((sum, s) => sum + (s.devisOpened || 0), 0);
      const avgBasket = salesMetrics.length > 0
        ? salesMetrics.reduce((sum, s) => sum + (s.avgBasket || 0), 0) / salesMetrics.length
        : 0;

      return res.json({
        success: true,
        data: {
          user,
          period: { startDate: start.toISOString(), endDate: end.toISOString() },
          objectives,
          evaluations,
          dailyLogs,
          calendarStats, // Aggregated for the "Calendrier" tab
          bonuses,
          totalBonus,
          clientReviews,
          behaviorStats: {
            avisPositifs,
            avisNegatifs,
            savTickets,
            savPlaintes,
            processWarnings,
          },
          salesMetrics,
          snapshot, // Metadata for the UI (contains frozen Ventes)
          totals: {
            // Use snapshot for Ventes if it exists, otherwise live
            ca: snapshot ? snapshot.totalCA : totalCA,
            devisCreated: snapshot ? snapshot.totalDevisCreated : totalDevisCreated,
            devisValidated: snapshot ? snapshot.totalDevisValidated : totalDevisValidated,
            devisLost: snapshot ? snapshot.totalDevisLost : totalDevisLost,
            devisOpened: snapshot ? snapshot.totalDevisOpened : totalDevisOpened,
            avgBasket: snapshot ? snapshot.avgBasket : avgBasket,
            caAchievedPct: snapshot ? snapshot.caAchievedPct : (objectives[0]?.conservativeCA ? Math.min(200, (totalCA / objectives[0].conservativeCA) * 100) : 0),
          },
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
          select: { id: true, fullName: true, email: true, role: true },
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

      // --- SNAPSHOT INTEGRATION ---
      const isFullMonth = start.getDate() === 1 && end.getDate() === new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
      const m = start.getMonth() + 1;
      const y = start.getFullYear();
      
      let snapshot = null;
      if (isFullMonth && MonthlySnapshotService.isClosedMonth(m, y)) {
        snapshot = await MonthlySnapshotService.getShowroomSnapshot(showroomId, m, y);
      }

      return res.json({
        success: true,
        data: {
          showroom,
          period: { startDate: start.toISOString(), endDate: end.toISOString() },
          team: teamData,
          snapshot,
          totals: snapshot ? {
            ca: snapshot.totalCA,
            devisCreated: snapshot.totalDevisCreated,
            devisValidated: snapshot.totalDevisValidated,
            devisLost: snapshot.totalDevisLost,
            devisOpened: snapshot.totalDevisOpened,
            avgBasket: snapshot.avgBasket
          } : null
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

  /**
   * POST /api/admin/sync-dolibarr
   * Body: { showroomId, month, year }
   */
  static async syncDolibarr(req: Request, res: Response) {
    try {
      const { showroomId, month, year } = req.body;
      const now = new Date();
      const m = month || now.getMonth() + 1;
      const y = year || now.getFullYear();

      if (!showroomId) {
        return res.status(400).json({ success: false, message: 'showroomId is required' });
      }

      const result = await DolibarrService.syncShowroomData(showroomId, m, y);
      return res.json({ success: true, data: result });
    } catch (err) {
      console.error('[ScorecardController.syncDolibarr]', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
