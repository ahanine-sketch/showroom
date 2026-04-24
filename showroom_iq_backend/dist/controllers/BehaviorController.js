"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BehaviorController = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const ScoringService_1 = require("../services/ScoringService");
class BehaviorController {
    /**
     * Get behavior data (avis, sav, processus) for a user in a given month/year
     */
    static async get(req, res) {
        try {
            const userId = req.params.userId;
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59, 999);
            const allAvisEvals = await prisma_1.default.processEvaluation.findMany({
                where: { userId, type: 'AVIS', date: { gte: start, lte: end } },
                orderBy: { date: 'desc' }
            });
            // Aggregate record = the one without customer notes
            const avisAggregate = allAvisEvals.find(e => e.notes === null || e.notes === '');
            // Review records = those with JSON customer notes
            const reviews = [];
            for (const e of allAvisEvals) {
                if (e.notes) {
                    try {
                        const parsed = JSON.parse(e.notes);
                        if (parsed && typeof parsed === 'object' && parsed.customerName) {
                            reviews.push({ ...parsed, id: e.id, date: e.date });
                        }
                    }
                    catch { /* skip malformed */ }
                }
            }
            const savEval = await prisma_1.default.processEvaluation.findFirst({
                where: { userId, type: 'SAV', date: { gte: start, lte: end } },
                orderBy: { date: 'desc' }
            });
            const processEvals = await prisma_1.default.processEvaluation.findMany({
                where: { userId, type: 'PROCESS', date: { gte: start, lte: end } },
                orderBy: { date: 'asc' }
            });
            return res.json({
                success: true,
                data: {
                    avis: {
                        plusAvis: avisAggregate?.plusAvis ?? 0,
                        minusAvis: avisAggregate?.minusAvis ?? 0,
                        reviews
                    },
                    sav: {
                        ticketsCount: savEval?.ticketsCount ?? 0,
                        complaintsCount: savEval?.complaintsCount ?? 0
                    },
                    processus: processEvals.map(e => ({
                        id: e.id,
                        warningLevel: e.warningLevel ?? 1,
                        notes: e.notes ?? '',
                        date: e.date
                    }))
                }
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Upsert avis aggregate counts for a user+month
     */
    static async upsertAvis(req, res) {
        try {
            const { userId, plusAvis, minusAvis, month, year } = req.body;
            const m = parseInt(month) || new Date().getMonth() + 1;
            const y = parseInt(year) || new Date().getFullYear();
            const start = new Date(y, m - 1, 1);
            const end = new Date(y, m, 0, 23, 59, 59, 999);
            // Find the aggregate record (null or empty notes = not a review)
            const existing = await prisma_1.default.processEvaluation.findFirst({
                where: {
                    userId,
                    type: 'AVIS',
                    date: { gte: start, lte: end },
                    notes: null
                }
            });
            let record;
            if (existing) {
                record = await prisma_1.default.processEvaluation.update({
                    where: { id: existing.id },
                    data: {
                        plusAvis: parseInt(plusAvis) ?? 0,
                        minusAvis: parseInt(minusAvis) ?? 0
                    }
                });
            }
            else {
                record = await prisma_1.default.processEvaluation.create({
                    data: {
                        userId,
                        type: 'AVIS',
                        date: new Date(y, m - 1, 15),
                        plusAvis: parseInt(plusAvis) ?? 0,
                        minusAvis: parseInt(minusAvis) ?? 0
                    }
                });
            }
            return res.json({ success: true, data: record });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Add a customer review
     */
    static async addReview(req, res) {
        try {
            const { userId, customerName, stars, text, date } = req.body;
            const reviewDate = date ? new Date(date) : new Date();
            const noteData = JSON.stringify({ customerName, stars: parseInt(stars) || 5, text });
            const record = await prisma_1.default.processEvaluation.create({
                data: {
                    userId,
                    type: 'AVIS',
                    date: reviewDate,
                    notes: noteData
                }
            });
            return res.json({
                success: true,
                data: {
                    id: record.id,
                    customerName,
                    stars: parseInt(stars) || 5,
                    text,
                    date: record.date
                }
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Upsert SAV data for a user+month
     */
    static async upsertSav(req, res) {
        try {
            const { userId, ticketsCount, complaintsCount, month, year } = req.body;
            const m = parseInt(month) || new Date().getMonth() + 1;
            const y = parseInt(year) || new Date().getFullYear();
            const start = new Date(y, m - 1, 1);
            const end = new Date(y, m, 0, 23, 59, 59, 999);
            const existing = await prisma_1.default.processEvaluation.findFirst({
                where: { userId, type: 'SAV', date: { gte: start, lte: end } }
            });
            let record;
            if (existing) {
                record = await prisma_1.default.processEvaluation.update({
                    where: { id: existing.id },
                    data: {
                        ticketsCount: parseInt(ticketsCount) ?? 0,
                        complaintsCount: parseInt(complaintsCount) ?? 0
                    }
                });
            }
            else {
                record = await prisma_1.default.processEvaluation.create({
                    data: {
                        userId,
                        type: 'SAV',
                        date: new Date(y, m - 1, 15),
                        ticketsCount: parseInt(ticketsCount) ?? 0,
                        complaintsCount: parseInt(complaintsCount) ?? 0
                    }
                });
            }
            return res.json({ success: true, data: record });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Add a process warning for a user
     */
    static async addProcessWarning(req, res) {
        try {
            const { userId, warningLevel, notes, month, year } = req.body;
            const m = parseInt(month) || new Date().getMonth() + 1;
            const y = parseInt(year) || new Date().getFullYear();
            const record = await prisma_1.default.processEvaluation.create({
                data: {
                    userId,
                    type: 'PROCESS',
                    date: new Date(y, m - 1, 15),
                    warningLevel: parseInt(warningLevel) || 1,
                    notes: notes || ''
                }
            });
            return res.json({
                success: true,
                data: {
                    id: record.id,
                    warningLevel: record.warningLevel,
                    notes: record.notes,
                    date: record.date
                }
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Delete a process warning by ID
     */
    static async deleteProcessWarning(req, res) {
        try {
            const id = req.params.id;
            await prisma_1.default.processEvaluation.delete({ where: { id } });
            return res.json({ success: true });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Delete a review by ID
     */
    static async deleteReview(req, res) {
        try {
            const id = req.params.id;
            const existing = await prisma_1.default.processEvaluation.findUnique({ where: { id } });
            // Safety check: ensure we are only deleting AVIS types which have JSON notes
            if (existing && existing.type === 'AVIS' && existing.notes) {
                await prisma_1.default.processEvaluation.delete({ where: { id } });
                if (existing.userId) {
                    await ScoringService_1.ScoringService.updateDailyScore(existing.userId, existing.date);
                }
            }
            return res.json({ success: true });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}
exports.BehaviorController = BehaviorController;
