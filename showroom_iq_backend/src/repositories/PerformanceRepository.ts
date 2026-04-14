import prisma from '../config/prisma';

export class PerformanceRepository {
  /**
   * Simple repository example to get aggregated stats.
   */
  static async getMonthlyPerformance(userId: string, month: number, year: number) {
    const dailyScores = await prisma.dailyScore.findMany({
      where: {
        userId,
        date: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
      },
    });

    const totalScore = dailyScores.reduce((sum, s) => sum + s.totalScore, 0);

    return {
      userId,
      month,
      year,
      totalScore,
      dayCount: dailyScores.length,
      averageScore: dailyScores.length > 0 ? totalScore / dailyScores.length : 0,
    };
  }

  /**
   * Get performance for a showroom (Aggregated from all its commercials).
   */
  static async getShowroomMonthlyPerformance(showroomId: string, month: number, year: number) {
    const dailyScores = await prisma.dailyScore.findMany({
      where: {
        user: { showroomId },
        date: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
      },
    });

    const totalScore = dailyScores.reduce((sum, s) => sum + s.totalScore, 0);

    return {
      showroomId,
      month,
      year,
      totalScore,
      dayCount: dailyScores.length,
      averageScore: dailyScores.length > 0 ? totalScore / dailyScores.length : 0,
    };
  }
}
