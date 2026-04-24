"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserController {
    /**
     * Get the admin's team (commercials in their showroom) with real performance scores.
     */
    static async getMyTeam(req, res) {
        try {
            const { id: adminId } = req.user;
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            // Find the showroom this admin belongs to OR manages
            const admin = await prisma_1.default.user.findUnique({
                where: { id: adminId },
                select: {
                    showroomId: true,
                    showroom: { select: { id: true, name: true } },
                    managedShowrooms: { select: { id: true, name: true } }
                }
            });
            if (!admin) {
                return res.status(404).json({ success: false, message: 'Admin not found' });
            }
            // Collect all showroom IDs (the one they belong to + the ones they manage)
            const showroomIds = [
                admin.showroomId,
                ...admin.managedShowrooms.map(s => s.id)
            ].filter(Boolean);
            if (showroomIds.length === 0) {
                return res.json({ success: true, data: [], showroom: null });
            }
            // Get all COMMERCIAL users in those showrooms
            const commercials = await prisma_1.default.user.findMany({
                where: {
                    showroomId: { in: showroomIds },
                    role: 'COMMERCIAL',
                    status: 'ACTIVE'
                },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    role: true,
                    seniority: true,
                    avatarUrl: true,
                    showroom: { select: { id: true, name: true } }
                }
            });
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);
            // For each commercial, compute the real global score breakdown
            const teamWithScores = await Promise.all(commercials.map(async (c) => {
                // Fetch data in parallel
                const [evaluations, clientReviews, bonusHistory, presenceLogs, salesMetrics, objective] = await Promise.all([
                    prisma_1.default.processEvaluation.findMany({ where: { userId: c.id, date: { gte: startDate, lte: endDate } } }),
                    prisma_1.default.clientReview.findMany({ where: { userId: c.id, date: { gte: startDate, lte: endDate } } }),
                    prisma_1.default.bonusHistory.findMany({ where: { userId: c.id, month, year } }),
                    prisma_1.default.dailyLog.findMany({ where: { userId: c.id, activity: 'PRESENCE', date: { gte: startDate, lte: endDate } } }),
                    prisma_1.default.salesMetric.findMany({ where: { userId: c.id, date: { gte: startDate, lte: endDate } } }),
                    prisma_1.default.objective.findFirst({ where: { userId: c.id, month, year, type: 'GLOBAL' } }),
                ]);
                // --- Ventes (65 pts) ---
                const totalCA = salesMetrics.reduce((s, m) => s + (m.ca || 0), 0);
                const devisCreated = salesMetrics.reduce((s, m) => s + (m.devisCreated || 0), 0);
                const devisValidated = salesMetrics.reduce((s, m) => s + (m.devisValidated || 0), 0);
                const devisLost = salesMetrics.reduce((s, m) => s + (m.devisLost || 0), 0);
                const avgBasket = salesMetrics.length > 0
                    ? salesMetrics.reduce((s, m) => s + (m.avgBasket || 0), 0) / salesMetrics.length : 0;
                // Use objective targets or meaningful defaults. If all are 0, use fallback defaults.
                const rawConservativeCA = objective?.conservativeCA ?? 0;
                const rawLikelyCA = objective?.likelyCA ?? 0;
                const rawExceedCA = objective?.exceedCA ?? 0;
                const conservativeCA = rawConservativeCA > 0 ? rawConservativeCA : 30000;
                const likelyCA = rawLikelyCA > 0 ? rawLikelyCA : 50000;
                const exceedCA = rawExceedCA > 0 ? rawExceedCA : 70000;
                // CRITICAL: Only award CA points if the commercial has real sales data (totalCA > 0)
                let caPoints = 0;
                if (totalCA > 0) {
                    if (totalCA >= exceedCA) {
                        caPoints = 35;
                    }
                    else if (totalCA >= likelyCA) {
                        caPoints = 32;
                    }
                    else if (totalCA >= conservativeCA) {
                        const progress = likelyCA > conservativeCA
                            ? (totalCA - conservativeCA) / (likelyCA - conservativeCA) : 0;
                        caPoints = 21 + Math.floor(progress * 10);
                    }
                    else if (totalCA >= conservativeCA * 0.5) {
                        caPoints = 10;
                    }
                }
                const convRate = devisCreated > 0 ? ((devisValidated + devisLost) / devisCreated) * 100 : 0;
                // Only award devis points if there is actual devis activity
                const devisPoints = devisCreated > 0 ? (convRate > 75 ? 15 : convRate >= 50 ? 10 : convRate >= 35 ? 5 : 0) : 0;
                // Only award panier points if real basket data exists
                const panierPoints = (salesMetrics.length > 0 && avgBasket > 0)
                    ? (avgBasket >= 20000 ? 15 : avgBasket >= 15000 ? 10 : avgBasket >= 10000 ? 5 : 0) : 0;
                const ventesScore = Math.min(caPoints + devisPoints + panierPoints, 65);
                // --- Comportement (30 pts) ---
                const avisPositifs = clientReviews.filter((r) => r.rating >= 4).length;
                const avisNegatifs = clientReviews.filter((r) => r.rating <= 2).length;
                let avisPoints = avisNegatifs > 0 ? 0 : avisPositifs > 3 ? 10 : avisPositifs > 0 ? 8 : 4;
                const savTickets = evaluations.filter((e) => e.type === 'SAV').reduce((s, e) => s + (e.ticketsCount || 0), 0);
                const savPlaintes = evaluations.filter((e) => e.type === 'SAV').reduce((s, e) => s + (e.complaintsCount || 0), 0);
                const savPoints = savPlaintes > 0 ? 0 : savTickets > 4 ? 4 : savTickets > 0 ? 8 : 10;
                const warnings = evaluations.filter((e) => e.type === 'PROCESS').length;
                const processPoints = warnings >= 3 ? 0 : warnings === 2 ? 4 : warnings === 1 ? 8 : 10;
                const comportementScore = avisPoints + savPoints + processPoints;
                // --- Présence (5 pts) ---
                const absences = presenceLogs.filter((l) => l.status === 'Absence').length;
                const retards = presenceLogs.filter((l) => l.status === 'Retard').length;
                const totalFaults = absences + retards;
                const presenceScore = totalFaults >= 5 ? 0 : totalFaults >= 2 ? 1 : totalFaults >= 1 ? 3 : 5;
                // --- Bonus (capped 5) ---
                const bonusScore = Math.min(bonusHistory.reduce((s, b) => s + b.amount, 0), 5);
                const globalScore = Math.min(100, ventesScore + comportementScore + presenceScore + bonusScore);
                return {
                    id: c.id,
                    fullName: c.fullName,
                    email: c.email,
                    phone: c.phone,
                    role: c.role,
                    seniority: c.seniority,
                    avatarUrl: c.avatarUrl,
                    showroom: c.showroom,
                    scores: {
                        global: globalScore,
                        ventes: ventesScore,
                        comportement: comportementScore,
                        presence: presenceScore,
                        bonus: bonusScore,
                    },
                    objectives: objective ? {
                        conservative: objective.conservativeCA,
                        likely: objective.likelyCA,
                        exceed: objective.exceedCA
                    } : null
                };
            }));
            return res.json({
                success: true,
                data: teamWithScores,
                showroom: admin.showroom,
                managedShowrooms: admin.managedShowrooms
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Get all users with optional filtering for Owner management
     */
    static async getAll(req, res) {
        try {
            const { role, q, showroomId, status } = req.query;
            const where = {
                fullName: q ? { contains: q, mode: 'insensitive' } : undefined,
                role: role ? role : undefined,
                showroomId: showroomId ? showroomId : undefined,
            };
            if (status && status !== 'ALL') {
                where.status = status;
            }
            else if (!status) {
                where.status = 'ACTIVE';
            }
            // If status is 'ALL', no status filter is applied, returning all users.
            const users = await prisma_1.default.user.findMany({
                where,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    avatarUrl: true,
                    showroom: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    objectives: {
                        where: {
                            month: new Date().getMonth() + 1,
                            year: new Date().getFullYear()
                        },
                        take: 1
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return res.json({ success: true, data: users });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Search users by name and optionally filter by role
     */
    static async search(req, res) {
        try {
            const { q, role, status } = req.query;
            const where = {
                fullName: {
                    contains: q,
                    mode: 'insensitive'
                },
                ...(role ? { role: role } : {}),
            };
            if (status && status !== 'ALL') {
                where.status = status;
            }
            else if (!status) {
                where.status = 'ACTIVE';
            }
            const users = await prisma_1.default.user.findMany({
                where,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    status: true,
                    avatarUrl: true
                },
                take: 10
            });
            return res.json({ success: true, data: users });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Get a specific user by ID with showroom data
     */
    static async getById(req, res) {
        try {
            const id = req.params.id;
            const user = await prisma_1.default.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    role: true,
                    seniority: true,
                    avatarUrl: true,
                    status: true,
                    showroom: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    objectives: {
                        where: {
                            month: new Date().getMonth() + 1,
                            year: new Date().getFullYear()
                        },
                        take: 1
                    }
                }
            });
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            return res.json({ success: true, data: user });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Create a new user (and potentially set objectives)
     */
    static async create(req, res) {
        try {
            const { fullName, email, phone, role, showroomId, targets } = req.body;
            // Default password since it is created by admin
            const passwordHash = await bcryptjs_1.default.hash("P123456@@", 10);
            const newUser = await prisma_1.default.user.create({
                data: {
                    fullName,
                    email: email || null,
                    phone: phone || null,
                    role: role || 'COMMERCIAL',
                    showroomId: showroomId || null,
                    status: req.body.status || 'ACTIVE',
                    passwordHash,
                    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`
                }
            });
            // Handle objectives if provided
            if (targets && Object.keys(targets).length > 0) {
                const conservativeCA = parseFloat(targets.conservative) || 0;
                const likelyCA = parseFloat(targets.likely) || 0;
                const exceedCA = parseFloat(targets.exceed) || 0;
                await prisma_1.default.objective.create({
                    data: {
                        userId: newUser.id,
                        month: new Date().getMonth() + 1,
                        year: new Date().getFullYear(),
                        conservativeCA,
                        likelyCA,
                        exceedCA,
                        type: 'GLOBAL'
                    }
                });
            }
            // If user is set as MANAGER and assigned a showroom, update the showroom's manager
            if (role === 'MANAGER' && showroomId) {
                await prisma_1.default.showroom.update({
                    where: { id: showroomId },
                    data: { managerId: newUser.id }
                });
            }
            return res.json({ success: true, data: newUser });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Update an existing user
     */
    static async update(req, res) {
        try {
            const id = req.params.id;
            const { fullName, email, phone, role, showroomId, targets } = req.body;
            const user = await prisma_1.default.user.update({
                where: { id },
                data: {
                    fullName,
                    email: email || null,
                    phone: phone || null,
                    role,
                    showroomId: showroomId || null,
                    status: req.body.status || undefined
                }
            });
            // Handle objectives if provided
            if (targets) {
                const conservativeCA = parseFloat(targets.conservative) || 0;
                const likelyCA = parseFloat(targets.likely) || 0;
                const exceedCA = parseFloat(targets.exceed) || 0;
                const month = new Date().getMonth() + 1;
                const year = new Date().getFullYear();
                const existingObj = await prisma_1.default.objective.findFirst({
                    where: { userId: id, month, year }
                });
                if (existingObj) {
                    await prisma_1.default.objective.update({
                        where: { id: existingObj.id },
                        data: { conservativeCA, likelyCA, exceedCA }
                    });
                }
                else {
                    await prisma_1.default.objective.create({
                        data: {
                            userId: id,
                            month,
                            year,
                            conservativeCA,
                            likelyCA,
                            exceedCA,
                            type: 'GLOBAL'
                        }
                    });
                }
            }
            // Handle Manager relationship logic
            if (role === 'MANAGER' && showroomId) {
                await prisma_1.default.showroom.update({
                    where: { id: showroomId },
                    data: { managerId: id }
                });
            }
            return res.json({ success: true, data: user });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Delete an existing user
     */
    static async delete(req, res) {
        try {
            const id = req.params.id;
            // Unset manager from any showroom they manage
            await prisma_1.default.showroom.updateMany({
                where: { managerId: id },
                data: { managerId: null }
            });
            // Delete objectives
            await prisma_1.default.objective.deleteMany({
                where: { userId: id }
            });
            // Optional: Handle deletion of other relations (scores, logs) if needed or let Cascade handle it.
            // Wait, let's just delete the user.
            await prisma_1.default.user.delete({
                where: { id }
            });
            return res.json({ success: true, message: 'User deleted successfully' });
        }
        catch (error) {
            // If cascade is an issue we catch it here and return
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Get the current user's profile
     */
    static async getProfile(req, res) {
        try {
            const { id } = req.user;
            const user = await prisma_1.default.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    avatarUrl: true,
                    showroomId: true
                }
            });
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            return res.json({ success: true, data: user });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Toggle user status (Active/Blocked)
     */
    static async toggleStatus(req, res) {
        try {
            const id = req.params.id;
            const { status } = req.body;
            if (!['ACTIVE', 'BLOCKED'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }
            const user = await prisma_1.default.user.update({
                where: { id },
                data: { status }
            });
            return res.json({ success: true, data: user });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}
exports.UserController = UserController;
