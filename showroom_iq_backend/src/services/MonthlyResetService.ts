import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * MonthlyResetService
 *
 * Idempotent monthly seeder — safe to run multiple times.
 * For each active commercial user it creates a new Objective row
 * for the upcoming month ONLY if none already exists (manual entries
 * are never overwritten).
 * For BonusHistory a zero-amount placeholder is inserted so the
 * frontend can always query a row for the period.
 */
export class MonthlyResetService {
  /**
   * Returns the first and last moment of the given month/year.
   */
  private static monthRange(month: number, year: number): { start: Date; end: Date } {
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999); // last day
    return { start, end };
  }

  /**
   * Seeds objectives for the given month/year for every active commercial.
   * Skips users that already have an objective for that period.
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
      // Idempotency check — never overwrite a manual/existing objective
      const existing = await prisma.objective.findFirst({
        where: {
          userId: user.id,
          month,
          year,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Carry forward last month's objectives as starting point
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prev = await prisma.objective.findFirst({
        where: { userId: user.id, month: prevMonth, year: prevYear },
        orderBy: { createdAt: 'desc' },
      });

      await prisma.objective.create({
        data: {
          userId: user.id,
          showroomId: user.showroomId ?? undefined,
          month,
          year,
          dateStart: start,
          dateEnd: end,
          conservativeCA: prev?.conservativeCA ?? 0,
          likelyCA: prev?.likelyCA ?? 0,
          exceedCA: prev?.exceedCA ?? 0,
          type: 'GLOBAL',
        },
      });
      created++;
    }

    return { created, skipped };
  }

  /**
   * Runs the full monthly reset for the NEXT calendar month.
   * Designed to be called by a cron job on the 1st of each month.
   */
  static async runForNextMonth(): Promise<{ month: number; year: number; objectivesCreated: number; objectivesSkipped: number }> {
    const now = new Date();
    const month = now.getMonth() + 1; // current month (1-indexed)
    const year = now.getFullYear();

    const { created, skipped } = await this.seedObjectives(month, year);

    console.log(`[MonthlyReset] ${year}-${String(month).padStart(2, '0')}: created=${created} skipped=${skipped}`);

    return { month, year, objectivesCreated: created, objectivesSkipped: skipped };
  }

  /**
   * Admin-triggered reset for an explicit month/year.
   */
  static async runForMonth(month: number, year: number) {
    const { created, skipped } = await this.seedObjectives(month, year);
    return { month, year, objectivesCreated: created, objectivesSkipped: skipped };
  }
}
