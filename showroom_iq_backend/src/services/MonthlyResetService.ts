import { PrismaClient } from '@prisma/client';
import { MonthlySnapshotService } from './MonthlySnapshotService';

const prisma = new PrismaClient();

/**
 * MonthlyResetService
 *
 * Full month-end lifecycle — runs on the 1st of each month.
 * Step order is critical:
 *   1. Freeze commercial snapshots (past month)
 *   2. Freeze showroom snapshots (past month) — must be AFTER commercial
 *   3. Seed commercial objectives (new month) — DRAFT status
 *   4. Seed showroom objectives (new month)   — DRAFT status
 *
 * All steps are idempotent — safe to re-run if interrupted.
 */
export class MonthlyResetService {
  private static monthRange(month: number, year: number): { start: Date; end: Date } {
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end   = new Date(year, month, 0, 23, 59, 59, 999);
    return { start, end };
  }

  // ── STEP 1 + 2: FREEZE SNAPSHOTS ──────────────────────────────────────────

  /**
   * Freezes the previous month's data for all commercials and all showrooms.
   * Called automatically from runForNextMonth().
   */
  static async freezePreviousMonth(month: number, year: number) {
    // Compute the month that just closed
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear  = month === 1 ? year - 1 : year;

    console.log(`[MonthlyReset] Freezing ${prevYear}-${String(prevMonth).padStart(2, '0')} snapshots...`);

    const [commercialResult, showroomResult] = await Promise.all([
      MonthlySnapshotService.freezeAllCommercials(prevMonth, prevYear),
      MonthlySnapshotService.freezeAllShowrooms(prevMonth, prevYear),
    ]);

    return { prevMonth, prevYear, commercialResult, showroomResult };
  }

  // ── STEP 3: SEED COMMERCIAL OBJECTIVES ────────────────────────────────────

  /**
   * Creates DRAFT Objective rows for every active commercial for the given month/year.
   * Carries forward previous month's values as suggested targets.
   * Skips users that already have an objective (manual entries are never overwritten).
   */
  static async seedObjectives(month: number, year: number): Promise<{ created: number; skipped: number }> {
    const { start, end } = this.monthRange(month, year);

    const users = await prisma.user.findMany({
      where: { role: 'COMMERCIAL', status: 'ACTIVE' },
      select: { id: true, showroomId: true },
    });

    let created = 0;
    let skipped = 0;

    for (const user of users) {
      const existing = await prisma.objective.findFirst({
        where: { userId: user.id, month, year },
      });

      if (existing) { skipped++; continue; }

      // Carry forward last month's objectives as suggested starting point
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear  = month === 1 ? year - 1 : year;
      const prev = await prisma.objective.findFirst({
        where: { userId: user.id, month: prevMonth, year: prevYear },
        orderBy: { createdAt: 'desc' },
      });

      await prisma.objective.create({
        data: {
          userId:         user.id,
          showroomId:     user.showroomId ?? undefined,
          month,
          year,
          dateStart:      start,
          dateEnd:        end,
          conservativeCA: prev?.conservativeCA ?? 0,
          likelyCA:       prev?.likelyCA       ?? 0,
          exceedCA:       prev?.exceedCA        ?? 0,
          type:           'GLOBAL',
          status:         'DRAFT',
        },
      });
      created++;
    }

    console.log(`[MonthlyReset] Commercial objectives ${year}-${month}: created=${created} skipped=${skipped}`);
    return { created, skipped };
  }

  // ── STEP 4: SEED SHOWROOM OBJECTIVES ──────────────────────────────────────

  /**
   * Creates DRAFT Objective rows for every showroom for the given month/year.
   * Same carry-forward logic as commercial objectives.
   */
  static async seedShowroomObjectives(month: number, year: number): Promise<{ created: number; skipped: number }> {
    const { start, end } = this.monthRange(month, year);

    const showrooms = await prisma.showroom.findMany({
      select: { id: true },
    });

    let created = 0;
    let skipped = 0;

    for (const showroom of showrooms) {
      const existing = await prisma.objective.findFirst({
        where: { showroomId: showroom.id, month, year, type: 'SHOWROOM' },
      });

      if (existing) { skipped++; continue; }

      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear  = month === 1 ? year - 1 : year;
      const prev = await prisma.objective.findFirst({
        where: { showroomId: showroom.id, month: prevMonth, year: prevYear, type: 'SHOWROOM' },
        orderBy: { createdAt: 'desc' },
      });

      await prisma.objective.create({
        data: {
          showroomId:     showroom.id,
          month,
          year,
          dateStart:      start,
          dateEnd:        end,
          conservativeCA: prev?.conservativeCA ?? 0,
          likelyCA:       prev?.likelyCA       ?? 0,
          exceedCA:       prev?.exceedCA        ?? 0,
          type:           'SHOWROOM',
          status:         'DRAFT',
        },
      });
      created++;
    }

    console.log(`[MonthlyReset] Showroom objectives ${year}-${month}: created=${created} skipped=${skipped}`);
    return { created, skipped };
  }

  // ── MAIN ENTRY POINTS ─────────────────────────────────────────────────────

  /**
   * Full month-end lifecycle.
   * Designed to be called by the cron job on the 1st of each month at 00:01.
   *
   * Execution order:
   *   1. Freeze previous month (commercial + showroom)
   *   2. Seed new month objectives (commercial + showroom)
   */
  static async runForNextMonth() {
    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    console.log(`[MonthlyReset] Starting full lifecycle for ${year}-${String(month).padStart(2, '0')}`);

    // Step 1+2: Freeze last month
    const freezeResult = await this.freezePreviousMonth(month, year);

    // Step 3+4: Seed new month objectives (run in parallel — independent)
    const [commResult, showroomResult] = await Promise.all([
      this.seedObjectives(month, year),
      this.seedShowroomObjectives(month, year),
    ]);

    return {
      month,
      year,
      freeze:     freezeResult,
      objectives: { commercial: commResult, showroom: showroomResult },
    };
  }

  /**
   * Admin-triggered run for an explicit month/year (seeds only, no freeze).
   * Used by the manual reset endpoint.
   */
  static async runForMonth(month: number, year: number) {
    const [commResult, showroomResult] = await Promise.all([
      this.seedObjectives(month, year),
      this.seedShowroomObjectives(month, year),
    ]);
    return { month, year, objectivesCreated: commResult.created, objectivesSkipped: commResult.skipped, showroomResult };
  }
}
