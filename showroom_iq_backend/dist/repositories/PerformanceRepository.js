"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class PerformanceRepository {
    /**
     * Simple repository example to get aggregated stats.
     */
    static async getMonthlyPerformance(userId, month, year) {
        const dailyScores = await prisma_1.default.dailyScore.findMany({
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
    static async getShowroomMonthlyPerformance(showroomId, month, year) {
        const dailyScores = await prisma_1.default.dailyScore.findMany({
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
exports.PerformanceRepository = PerformanceRepository;
