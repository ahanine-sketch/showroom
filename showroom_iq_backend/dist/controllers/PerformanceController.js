"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceController = void 0;
const ScoringService_1 = require("../services/ScoringService");
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
class PerformanceController {
    /**
     * Add a sales metric and update the daily score.
     */
    static async addMetric(req, res) {
        try {
            const { userId, ca, devisCount, devisAmount, savCount, date } = req.body;
            const metricDate = date ? new Date(date) : new Date();
            // Basic creation
            const metric = await prisma_1.default.salesMetric.create({
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
            await ScoringService_1.ScoringService.updateDailyScore(userId, metricDate);
            return res.status(201).json({
                success: true,
                data: metric,
                message: 'Metric added and daily score updated.',
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Get Daily performance for a user.
     */
    static async getDailyPerformance(req, res) {
        try {
            const userId = req.params.userId;
            const date = req.params.date;
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            const performance = await prisma_1.default.dailyScore.findUnique({
                where: {
                    userId_date: { userId: userId, date: targetDate }
                }
            });
            return res.json({ success: true, data: performance });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Add a manual bonus and update total points.
     */
    static async addBonus(req, res) {
        try {
            const { userId, amount, description, date } = req.body;
            if (!userId || isNaN(parseFloat(amount))) {
                return res.status(400).json({ success: false, error: "Données invalides (ID utilisateur ou montant manquant)" });
            }
            const bonusDate = date ? new Date(date) : new Date();
            bonusDate.setHours(0, 0, 0, 0);
            // Verify user exists first to avoid confusing Prisma errors
            const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({ success: false, error: "Utilisateur non trouvé dans la base de données" });
            }
            const month = bonusDate.getMonth() + 1;
            const year = bonusDate.getFullYear();
            // Simplified: Allow multiple entries in BonusHistory, we sum them in the evaluations view.
            // 1. Create Bonus History Entry
            const bonus = await prisma_1.default.bonusHistory.create({
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
            let dailyScore = await prisma_1.default.dailyScore.findUnique({
                where: { userId_date: { userId, date: bonusDate } }
            });
            // 3. Update Bonus Score (Additive or Override?)
            // User said "manual bonus entries", usually additive for history, but we keep the current sum on the day.
            // We will sum all historical bonuses for this day.
            const dayBonuses = await prisma_1.default.bonusHistory.aggregate({
                where: { userId, date: bonusDate },
                _sum: { amount: true }
            });
            const totalBonusForDay = dayBonuses._sum.amount || 0;
            if (!dailyScore) {
                // If no daily score yet, create one with 0 for other metrics
                dailyScore = await prisma_1.default.dailyScore.create({
                    data: {
                        userId,
                        date: bonusDate,
                        bonusScore: totalBonusForDay,
                        totalScore: totalBonusForDay
                    }
                });
            }
            else {
                // Recalculate total score
                const newTotal = dailyScore.salesScore + dailyScore.behaviorScore + dailyScore.presenceScore + totalBonusForDay;
                dailyScore = await prisma_1.default.dailyScore.update({
                    where: { id: dailyScore.id },
                    data: {
                        bonusScore: totalBonusForDay,
                        totalScore: newTotal
                    }
                });
            }
            return res.json({ success: true, data: bonus, dailyScore });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Get Bonus History for a user.
     */
    static async getBonusHistory(req, res) {
        try {
            const userId = req.params.userId;
            const history = await prisma_1.default.bonusHistory.findMany({
                where: { userId },
                orderBy: { date: 'desc' }
            });
            return res.json({ success: true, data: history });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Add a process evaluation (Avis, SAV, Process, Presence)
     */
    static async addEvaluation(req, res) {
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
                    }
                    else if (notes && typeof notes === 'string') {
                        parsed.comment = notes;
                    }
                }
                catch (e) { }
                const review = await prisma_1.default.clientReview.create({
                    data: {
                        userId: userId || null,
                        showroomId: showroomId || null,
                        name: parsed.name,
                        rating: parsed.rating,
                        comment: parsed.comment,
                        date: evalDate
                    }
                });
                if (userId)
                    await ScoringService_1.ScoringService.updateDailyScore(userId, evalDate);
                return res.status(201).json({ success: true, data: review });
            }
            if (type === 'DAILY_NOTE') {
                const { noteType, content } = req.body;
                const log = await prisma_1.default.dailyLog.create({
                    data: {
                        userId: userId || null,
                        showroomId: showroomId || null,
                        date: evalDate,
                        activity: 'DAILY_NOTE',
                        status: noteType || 'positive',
                        notes: content || notes
                    }
                });
                if (userId)
                    await ScoringService_1.ScoringService.updateDailyScore(userId, evalDate);
                return res.status(201).json({ success: true, data: log });
            }
            if (type === 'PRESENCE') {
                const { presenceStatus, motif } = req.body;
                // 1. Create the detailed DailyLog
                const log = await prisma_1.default.dailyLog.create({
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
                    const existingEval = await prisma_1.default.processEvaluation.findFirst({
                        where: {
                            userId,
                            type: 'PRESENCE',
                            date: {
                                gte: new Date(evalDate.setHours(0, 0, 0, 0)),
                                lte: new Date(evalDate.setHours(23, 59, 59, 999))
                            }
                        }
                    });
                    if (existingEval) {
                        await prisma_1.default.processEvaluation.update({
                            where: { id: existingEval.id },
                            data: {
                                retardsCount: presenceStatus === 'Retard' ? (existingEval.retardsCount || 0) + 1 : existingEval.retardsCount,
                                absencesCount: presenceStatus === 'Absence' ? (existingEval.absencesCount || 0) + 1 : existingEval.absencesCount,
                            }
                        });
                    }
                    else {
                        await prisma_1.default.processEvaluation.create({
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
                await ScoringService_1.ScoringService.updateDailyScore(userId, evalDate);
                return res.status(201).json({ success: true, data: log });
            }
            const evaluation = await prisma_1.default.processEvaluation.create({
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
            if (userId)
                await ScoringService_1.ScoringService.updateDailyScore(userId, evalDate);
            return res.status(201).json({
                success: true,
                data: evaluation,
                message: 'Evaluation added and daily score updated.',
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Get the computed global score for a user for a specific month/year.
     * Uses the same scoring logic as the frontend ScorecardWrapper.
     */
    static async getGlobalScore(req, res) {
        try {
            const userId = req.params.userId;
            const { month, year } = req.params;
            const m = parseInt(month);
            const y = parseInt(year);
            // Verify user is active
            const user = await prisma_1.default.user.findUnique({
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
            // Fetch all evaluations for the month
            const evaluations = await prisma_1.default.processEvaluation.findMany({
                where: { userId, date: { gte: startDate, lte: endDate } },
            });
            const clientReviews = await prisma_1.default.clientReview.findMany({
                where: { userId, date: { gte: startDate, lte: endDate } },
            });
            const bonusHistory = await prisma_1.default.bonusHistory.findMany({
                where: { userId, month: m, year: y },
            });
            const presenceLogs = await prisma_1.default.dailyLog.findMany({
                where: { userId, activity: 'PRESENCE', date: { gte: startDate, lte: endDate } },
            });
            // --- Ventes Score (65 pts) ---
            // Mirror exact frontend ScorecardWrapper logic: fetch sales metrics, use same fallbacks
            const salesMetrics = await prisma_1.default.salesMetric.findMany({
                where: { userId, date: { gte: startDate, lte: endDate } },
                orderBy: { date: 'desc' },
            });
            // Aggregate for the month
            const totalCA = salesMetrics.reduce((sum, s) => sum + (s.ca || 0), 0);
            const totalDevisCreated = salesMetrics.reduce((sum, s) => sum + (s.devisCreated || 0), 0);
            const totalDevisValidated = salesMetrics.reduce((sum, s) => sum + (s.devisValidated || 0), 0);
            const totalDevisLost = salesMetrics.reduce((sum, s) => sum + (s.devisLost || 0), 0);
            const avgBasket = salesMetrics.length > 0
                ? salesMetrics.reduce((sum, s) => sum + (s.avgBasket || 0), 0) / salesMetrics.length
                : 0;
            // User objectives for CA scoring
            const objective = await prisma_1.default.objective.findFirst({
                where: { userId, month: m, year: y, type: 'GLOBAL' },
            });
            const rawConservativeCA = objective?.conservativeCA ?? 0;
            const rawLikelyCA = objective?.likelyCA ?? 0;
            const rawExceedCA = objective?.exceedCA ?? 0;
            const conservativeCA = rawConservativeCA > 0 ? rawConservativeCA : 30000;
            const likelyCA = rawLikelyCA > 0 ? rawLikelyCA : 50000;
            const exceedCA = rawExceedCA > 0 ? rawExceedCA : 70000;
            // 1. CA Score (35 pts)
            let caPoints = 0;
            if (totalCA > 0) {
                if (totalCA >= exceedCA) {
                    caPoints = 35;
                }
                else if (totalCA >= likelyCA) {
                    caPoints = 32;
                }
                else if (totalCA >= conservativeCA) {
                    const progress = (totalCA - conservativeCA) / (likelyCA - conservativeCA);
                    caPoints = 21 + Math.floor(progress * 10);
                }
                else if (totalCA >= conservativeCA * 0.5) {
                    caPoints = 10;
                }
            }
            // 2. Devis Score (15 pts) - aligned with ScoringService (rate > 75)
            const convRate = totalDevisCreated > 0
                ? ((totalDevisValidated + totalDevisLost) / totalDevisCreated) * 100 : 0;
            let devisPoints = 0;
            if (convRate > 75)
                devisPoints = 15;
            else if (convRate >= 50)
                devisPoints = 10;
            else if (convRate >= 35)
                devisPoints = 5;
            // 3. Panier Moyen Score (15 pts) - aligned with ScoringService (20k / 15k / 10k)
            let panierPoints = 0;
            if (avgBasket >= 20000)
                panierPoints = 15;
            else if (avgBasket >= 15000)
                panierPoints = 10;
            else if (avgBasket >= 10000)
                panierPoints = 5;
            const cappedSalesScore = Math.min(caPoints + devisPoints + panierPoints, 65);
            // --- Comportement Score (30 pts) ---
            // Avis
            const avisPositifs = clientReviews.filter((r) => r.rating >= 4).length;
            const avisNegatifs = clientReviews.filter((r) => r.rating <= 2).length;
            let avisPoints = 4;
            if (avisNegatifs > 0)
                avisPoints = 0;
            else if (avisPositifs > 3)
                avisPoints = 10;
            else if (avisPositifs > 0)
                avisPoints = 8;
            // SAV
            const savTickets = evaluations.filter((e) => e.type === 'SAV').reduce((sum, e) => sum + (e.ticketsCount || 0), 0);
            const savPlaintes = evaluations.filter((e) => e.type === 'SAV').reduce((sum, e) => sum + (e.complaintsCount || 0), 0);
            let savPoints = 10;
            if (savPlaintes > 0)
                savPoints = 0;
            else if (savTickets > 4)
                savPoints = 4;
            else if (savTickets > 0)
                savPoints = 8;
            // Processus
            const warnings = evaluations.filter((e) => e.type === 'PROCESS').length;
            let processPoints = 10;
            if (warnings === 1)
                processPoints = 8;
            else if (warnings === 2)
                processPoints = 4;
            else if (warnings >= 3)
                processPoints = 0;
            const behaviorScore = avisPoints + savPoints + processPoints;
            // --- Presence Score (5 pts) ---
            const absences = presenceLogs.filter((l) => l.status === 'Absence').length;
            const retards = presenceLogs.filter((l) => l.status === 'Retard').length;
            const totalFaults = absences + retards;
            let presenceScore = 5;
            if (totalFaults >= 5)
                presenceScore = 0;
            else if (totalFaults >= 2)
                presenceScore = 1;
            else if (totalFaults >= 1)
                presenceScore = 3;
            // --- Bonus ---
            const bonusTotal = bonusHistory.reduce((sum, b) => sum + b.amount, 0);
            const cappedBonus = Math.min(bonusTotal, 5);
            const globalScore = Math.min(100, cappedSalesScore + behaviorScore + presenceScore + cappedBonus);
            return res.json({
                success: true,
                data: {
                    globalScore,
                    breakdown: {
                        sales: cappedSalesScore,
                        behavior: behaviorScore,
                        presence: presenceScore,
                        bonus: cappedBonus,
                    },
                },
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Get evaluations for a user in a specific month
     */
    static async getMonthlyEvaluations(req, res) {
        try {
            const userId = req.params.userId;
            const { month, year } = req.params;
            const m = parseInt(month);
            const y = parseInt(year);
            if (isNaN(m) || isNaN(y)) {
                return res.status(400).json({ success: false, error: "Invalid month or year parameters" });
            }
            const startDate = new Date(y, m - 1, 1);
            const endDate = new Date(y, m, 0, 23, 59, 59, 999);
            const evaluations = await prisma_1.default.processEvaluation.findMany({
                where: {
                    userId,
                    date: { gte: startDate, lte: endDate },
                },
                orderBy: { date: 'desc' },
            });
            const clientReviews = await prisma_1.default.clientReview.findMany({
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
            const bonusHistory = await prisma_1.default.bonusHistory.findMany({
                where: {
                    userId,
                    month: m,
                    year: y
                }
            });
            const bonusTotal = bonusHistory.reduce((sum, b) => sum + b.amount, 0);
            const dailyLogs = await prisma_1.default.dailyLog.findMany({
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
                bonusTotal
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Get aggregated evaluations for ALL commercials in a showroom for a specific month.
     * This powers the Magasin Comportement and Calendrier tabs.
     */
    static async getShowroomEvaluations(req, res) {
        try {
            const showroomId = req.params.showroomId;
            const { month, year } = req.params;
            const m = parseInt(month);
            const y = parseInt(year);
            if (isNaN(m) || isNaN(y)) {
                return res.status(400).json({ success: false, error: "Invalid month or year parameters" });
            }
            const startDate = new Date(y, m - 1, 1);
            const endDate = new Date(y, m, 0, 23, 59, 59, 999);
            // 1. Get all users in this showroom
            const users = await prisma_1.default.user.findMany({
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
            // 2. Fetch evaluations (Selective: PROCESS = Magasin only, SAV = Team aggregation)
            const evaluations = await prisma_1.default.processEvaluation.findMany({
                where: {
                    OR: [
                        { showroomId: showroomId },
                        { userId: { in: userIds } }
                    ],
                    type: { in: [client_1.EvaluationType.PROCESS, client_1.EvaluationType.SAV] },
                    date: { gte: startDate, lte: endDate },
                },
                orderBy: { date: 'desc' },
            });
            // 3. Fetch client reviews (Strictly Magasin only per user request)
            const clientReviews = await prisma_1.default.clientReview.findMany({
                where: {
                    OR: [
                        { showroomId: showroomId },
                        { userId: { in: userIds } }
                    ],
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
            const bonusHistory = await prisma_1.default.bonusHistory.findMany({
                where: {
                    userId: { in: userIds },
                    month: m,
                    year: y
                }
            });
            const bonusTotal = bonusHistory.reduce((sum, b) => sum + b.amount, 0);
            // 5. Fetch daily logs (Presence/Notes aggregated from team only)
            const dailyLogs = await prisma_1.default.dailyLog.findMany({
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
                bonusTotal
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}
exports.PerformanceController = PerformanceController;
