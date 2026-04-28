import prisma from '../config/prisma';
import { ShowroomScoringService } from './ShowroomScoringService';
import { ScoringService } from './ScoringService';

/**
 * MonthlySnapshotService
 *
 * Freezes the state of a closed month for both commercials and showrooms.
 * Snapshots are immutable — navigating to past months reads from here,
 * never recomputing from raw data.
 *
 * FREEZE ORDER (must be followed by the cron):
 *   1. freezeAllCommercials(month, year)  ← aggregates raw tables
 *   2. freezeAllShowrooms(month, year)    ← aggregates same raw tables
 */
export class MonthlySnapshotService {
  private static monthRange(month: number, year: number) {
    return {
      start: new Date(year, month - 1, 1, 0, 0, 0, 0),
      end:   new Date(year, month, 0, 23, 59, 59, 999),
    };
  }

  // ---------------------------------------------------------------------------
  // COMMERCIAL SNAPSHOT
  // ---------------------------------------------------------------------------

  /**
   * Freezes one commercial's data for the given month/year.
   * Idempotent: if a snapshot already exists it is skipped (use force=true to overwrite).
   */
  static async freezeCommercial(
    userId: string,
    month: number,
    year: number,
    force = false
  ): Promise<{ action: 'created' | 'skipped' | 'updated' }> {
    const { start, end } = this.monthRange(month, year);

    // Idempotency guard
    const existing = await prisma.monthlySnapshot.findFirst({
      where: { userId, month, year, type: 'COMMERCIAL' },
    });
    if (existing && !force) return { action: 'skipped' };

    // ── Ventes ──────────────────────────────────────────────────────────────
    const salesMetrics = await prisma.salesMetric.findMany({
      where: { userId, date: { gte: start, lte: end } },
    });
    const totalCA             = salesMetrics.reduce((s, m) => s + m.ca, 0);
    const totalDevisCreated   = salesMetrics.reduce((s, m) => s + m.devisCreated, 0);
    const totalDevisValidated = salesMetrics.reduce((s, m) => s + m.devisValidated, 0);
    const totalDevisLost      = salesMetrics.reduce((s, m) => s + m.devisLost, 0);
    const totalDevisOpened    = salesMetrics.reduce((s, m) => s + m.devisOpened, 0);
    const avgBasket           = salesMetrics.length > 0
      ? salesMetrics.reduce((s, m) => s + m.avgBasket, 0) / salesMetrics.length
      : 0;

    // ── Objectif ────────────────────────────────────────────────────────────
    const objective = await prisma.objective.findFirst({
      where: { userId, month, year, type: 'GLOBAL' },
    });
    const conservativeCA = objective?.conservativeCA ?? 0;
    const likelyCA       = objective?.likelyCA ?? 0;
    const exceedCA       = objective?.exceedCA ?? 0;
    const caAchievedPct  = conservativeCA > 0
      ? Math.min(200, (totalCA / conservativeCA) * 100)
      : 0;

    const payload = {
      userId,
      type: 'COMMERCIAL',
      month,
      year,
      totalCA, totalDevisCreated, totalDevisValidated, totalDevisLost, totalDevisOpened,
      avgBasket,
      conservativeCA, likelyCA, exceedCA, caAchievedPct,
      frozenAt: new Date(),
      status: 'FROZEN',
    };

    if (existing && force) {
      await prisma.monthlySnapshot.update({ where: { id: existing.id }, data: payload });
      return { action: 'updated' };
    }

    await prisma.monthlySnapshot.create({ data: payload });
    return { action: 'created' };
  }

  /**
   * Freezes all active commercials for the given month.
   */
  static async freezeAllCommercials(month: number, year: number) {
    const users = await prisma.user.findMany({
      where: { role: 'COMMERCIAL', status: 'ACTIVE' },
      select: { id: true },
    });

    const results = await Promise.allSettled(
      users.map(u => this.freezeCommercial(u.id, month, year))
    );

    const created  = results.filter(r => r.status === 'fulfilled' && r.value.action === 'created').length;
    const skipped  = results.filter(r => r.status === 'fulfilled' && r.value.action === 'skipped').length;
    const failed   = results.filter(r => r.status === 'rejected').length;

    console.log(`[Snapshot] Commercial freeze ${year}-${month}: created=${created} skipped=${skipped} failed=${failed}`);
    return { created, skipped, failed };
  }

  // ---------------------------------------------------------------------------
  // SHOWROOM SNAPSHOT
  // ---------------------------------------------------------------------------

  /**
   * Freezes one showroom's data for the given month/year.
   * Uses ShowroomScoringService for consistency with live scoring.
   */
  static async freezeShowroom(
    showroomId: string,
    month: number,
    year: number,
    force = false
  ): Promise<{ action: 'created' | 'skipped' | 'updated' }> {
    const existing = await prisma.monthlySnapshot.findFirst({
      where: { showroomId, month, year, type: 'SHOWROOM' },
    });
    if (existing && !force) return { action: 'skipped' };

    // Use the scoring service — it already aggregates everything correctly
    const perf = await ShowroomScoringService.calculatePerformance(showroomId, month, year);

    // Bonus: sum all bonuses of team members this month
    const teamUsers = await prisma.user.findMany({
      where: { showroomId, status: 'ACTIVE' },
      select: { id: true },
    });
    const teamUserIds = teamUsers.map(u => u.id);
    const bonuses = await prisma.bonusHistory.findMany({
      where: { userId: { in: teamUserIds }, month, year },
    });
    const totalBonus = bonuses.reduce((s, b) => s + b.amount, 0);

    // Showroom-level average daily scores
    const { start, end } = this.monthRange(month, year);
    const dailyScores = await prisma.dailyScore.findMany({
      where: { userId: { in: teamUserIds }, date: { gte: start, lte: end } },
    });
    const count = dailyScores.length || 1;
    const salesScore    = dailyScores.reduce((s, d) => s + d.salesScore,    0) / count;
    const behaviorScore = dailyScores.reduce((s, d) => s + d.behaviorScore, 0) / count;
    const presenceScore = dailyScores.reduce((s, d) => s + d.presenceScore, 0) / count;
    const bonusScore    = dailyScores.reduce((s, d) => s + d.bonusScore,    0) / count;

    const payload = {
      showroomId,
      type: 'SHOWROOM',
      month,
      year,
      totalCA:             perf.totalCA,
      totalDevisCreated:   perf.totalDevisCreated,
      totalDevisValidated: perf.totalDevisValidated,
      totalDevisLost:      perf.totalDevisLost,
      totalDevisOpened:    perf.totalDevisOpened,
      avgBasket:           perf.avgBasket,
      conservativeCA:      perf.conservativeCA,
      likelyCA:            perf.likelyCA,
      exceedCA:            perf.exceedCA,
      caAchievedPct:       perf.caAchievedPct,
      frozenAt:            new Date(),
      status:              'FROZEN',
    };

    if (existing && force) {
      await prisma.monthlySnapshot.update({ where: { id: existing.id }, data: payload });
      return { action: 'updated' };
    }

    await prisma.monthlySnapshot.create({ data: payload });
    return { action: 'created' };
  }

  /**
   * Freezes all showrooms for the given month.
   * Always call AFTER freezeAllCommercials.
   */
  static async freezeAllShowrooms(month: number, year: number) {
    const showrooms = await prisma.showroom.findMany({ select: { id: true } });

    const results = await Promise.allSettled(
      showrooms.map(s => this.freezeShowroom(s.id, month, year))
    );

    const created = results.filter(r => r.status === 'fulfilled' && r.value.action === 'created').length;
    const skipped = results.filter(r => r.status === 'fulfilled' && r.value.action === 'skipped').length;
    const failed  = results.filter(r => r.status === 'rejected').length;

    console.log(`[Snapshot] Showroom freeze ${year}-${month}: created=${created} skipped=${skipped} failed=${failed}`);
    return { created, skipped, failed };
  }

  // ---------------------------------------------------------------------------
  // READ HELPERS (used by controllers for closed-month navigation)
  // ---------------------------------------------------------------------------

  static async getCommercialSnapshot(userId: string, month: number, year: number) {
    const snap = await prisma.monthlySnapshot.findFirst({
      where: { userId, month, year, type: 'COMMERCIAL' },
    });

    if (snap) {
      // MERGE LIVE BONUS DATA
      // Since the user wants to see the "real" bonus even if the month is frozen
      // and we might not have captured it correctly in old snapshots.
      const bonusHistory = await prisma.bonusHistory.findMany({
        where: { userId, month, year },
      });
      const totalBonus = bonusHistory.reduce((sum, b) => sum + b.amount, 0);
      
      return {
        ...snap,
        totalBonus: totalBonus || 0
      };
    }

    return null;
  }

  static async getShowroomSnapshot(showroomId: string, month: number, year: number) {
    return prisma.monthlySnapshot.findFirst({
      where: { showroomId, month, year, type: 'SHOWROOM' },
    });
  }

  /**
   * Returns true if the given month/year is already closed
   * (i.e., strictly before the current calendar month).
   */
  static isClosedMonth(month: number, year: number): boolean {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear  = now.getFullYear();
    return year < currentYear || (year === currentYear && month < currentMonth);
  }
}

