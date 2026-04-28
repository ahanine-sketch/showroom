"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowroomController = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const ShowroomScoringService_1 = require("../services/ShowroomScoringService");
class ShowroomController {
    /**
     * Get all showrooms with manager details and performance
     */
    static async getAll(req, res) {
        try {
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            const showrooms = await prisma_1.default.showroom.findMany({
                include: {
                    manager: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true,
                            avatarUrl: true,
                            seniority: true,
                            status: true
                        }
                    },
                    users: {
                        where: {
                            role: 'COMMERCIAL',
                            status: 'ACTIVE'
                        },
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true,
                            avatarUrl: true,
                            role: true,
                            objectives: {
                                where: {
                                    month: currentMonth,
                                    year: currentYear
                                },
                                take: 1
                            }
                        }
                    },
                    objectives: {
                        where: {
                            month: currentMonth,
                            year: currentYear
                        },
                        take: 1
                    }
                }
            });
            // Calculate performance for each showroom
            const formatted = await Promise.all(showrooms.map(async (s) => {
                try {
                    const perf = await ShowroomScoringService_1.ShowroomScoringService.calculatePerformance(s.id, currentMonth, currentYear);
                    return {
                        id: s.id,
                        name: s.name,
                        location: s.location,
                        city: s.city,
                        manager: s.manager && s.manager.status === 'ACTIVE' ? {
                            id: s.manager.id,
                            name: s.manager.fullName,
                            email: s.manager.email,
                            phone: s.manager.phone,
                            avatar: s.manager.avatarUrl,
                            seniority: s.manager.seniority || ''
                        } : null,
                        commercials: s.users.map(u => ({
                            id: u.id,
                            fullName: u.fullName,
                            email: u.email,
                            phone: u.phone,
                            avatarUrl: u.avatarUrl,
                            role: u.role,
                            targets: u.objectives && u.objectives.length > 0 ? {
                                conservative: u.objectives[0].conservativeCA,
                                likely: u.objectives[0].likelyCA,
                                exceed: u.objectives[0].exceedCA
                            } : null
                        })),
                        performance: perf,
                        score: Math.round(perf.score),
                        status: 'Ouvert',
                        targets: s.objectives.length > 0 ? {
                            conservative: s.objectives[0].conservativeCA,
                            likely: s.objectives[0].likelyCA,
                            exceed: s.objectives[0].exceedCA
                        } : null
                    };
                }
                catch (calcError) {
                    console.error(`Error calculating performance for showroom ${s.id} (${s.name}):`, calcError);
                    throw calcError;
                }
            }));
            return res.json({ success: true, data: formatted });
        }
        catch (error) {
            console.error('GetAll Showrooms Error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Get a specific showroom by ID
     */
    static async getById(req, res) {
        try {
            const id = req.params.id;
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
            const s = await prisma_1.default.showroom.findUnique({
                where: { id },
                include: {
                    manager: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true,
                            avatarUrl: true,
                            seniority: true,
                            status: true
                        }
                    },
                    users: {
                        where: {
                            role: 'COMMERCIAL',
                            status: 'ACTIVE'
                        },
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true,
                            avatarUrl: true,
                            role: true,
                            objectives: {
                                where: { month, year },
                                take: 1
                            }
                        }
                    },
                    objectives: {
                        where: { month, year },
                        take: 1
                    }
                }
            });
            if (!s) {
                return res.status(404).json({ success: false, message: 'Magasin introuvable' });
            }
            // Compute period-specific score using the rich object from the scoring service
            const perf = await ShowroomScoringService_1.ShowroomScoringService.calculatePerformance(id, month, year);
            const formatted = {
                id: s.id,
                name: s.name,
                location: s.location,
                city: s.city,
                manager: s.manager && s.manager.status === 'ACTIVE' ? {
                    id: s.manager.id,
                    name: s.manager.fullName,
                    email: s.manager.email,
                    phone: s.manager.phone,
                    avatar: s.manager.avatarUrl,
                    seniority: s.manager.seniority || ''
                } : null,
                commercials: s.users.map(u => ({
                    id: u.id,
                    fullName: u.fullName,
                    email: u.email,
                    phone: u.phone,
                    role: u.role,
                    avatarUrl: u.avatarUrl,
                    targets: u.objectives && u.objectives.length > 0 ? {
                        conservative: u.objectives[0].conservativeCA,
                        likely: u.objectives[0].likelyCA,
                        exceed: u.objectives[0].exceedCA
                    } : null
                })),
                // Ventes data — sourced from the rich perf object (already aggregated)
                caAmount: perf.totalCA,
                devisCreated: perf.totalDevisCreated,
                devisValidated: perf.totalDevisValidated,
                devisLost: perf.totalDevisLost,
                devisOpened: perf.totalDevisOpened,
                avgBasket: perf.avgBasket,
                // Comportement
                avisPositifs: perf.avisPositifs,
                avisNegatifs: perf.avisNegatifs,
                savTickets: perf.savTickets,
                savPlaintes: perf.savPlaintes,
                processWarnings: perf.processWarnings,
                // Calendrier
                absences: perf.absences,
                retards: perf.retards,
                // Score
                performance: perf,
                score: Math.round(perf.score),
                targets: s.objectives && s.objectives.length > 0 ? {
                    conservative: s.objectives[0].conservativeCA,
                    likely: s.objectives[0].likelyCA,
                    exceed: s.objectives[0].exceedCA
                } : null
            };
            return res.json({ success: true, data: formatted });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Create a new showroom
     */
    static async create(req, res) {
        try {
            const { name, city, location, managerId, commercialIds, targets } = req.body;
            const result = await prisma_1.default.$transaction(async (tx) => {
                // 1. Create Showroom
                const showroom = await tx.showroom.create({
                    data: {
                        name,
                        city,
                        location,
                        managerId: managerId || null
                    }
                });
                // 2. Link Commercials
                if (commercialIds && commercialIds.length > 0) {
                    await tx.user.updateMany({
                        where: { id: { in: commercialIds } },
                        data: { showroomId: showroom.id }
                    });
                }
                // 3. Create Objective
                if (targets) {
                    await tx.objective.create({
                        data: {
                            showroomId: showroom.id,
                            month: new Date().getMonth() + 1,
                            year: new Date().getFullYear(),
                            conservativeCA: parseFloat(targets.conservative) || 0,
                            likelyCA: parseFloat(targets.likely) || 0,
                            exceedCA: parseFloat(targets.exceed) || 0,
                            type: 'SHOWROOM'
                        }
                    });
                }
                return showroom;
            });
            return res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Delete a showroom
     */
    static async delete(req, res) {
        try {
            const id = req.params.id;
            // We might need to handle resetting users assigned to this showroom
            await prisma_1.default.$transaction(async (tx) => {
                // Reset users associated with this showroom
                await tx.user.updateMany({
                    where: { showroomId: id },
                    data: { showroomId: null }
                });
                // Objectives might be cascaded or we delete them
                await tx.objective.deleteMany({
                    where: { showroomId: id }
                });
                // Finally delete the showroom
                await tx.showroom.delete({
                    where: { id }
                });
            });
            return res.json({ success: true, message: 'Showroom deleted successfully' });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Update a showroom
     */
    static async update(req, res) {
        try {
            const id = req.params.id;
            const { name, city, location, managerId, commercialIds, targets } = req.body;
            const result = await prisma_1.default.$transaction(async (tx) => {
                // 1. Update Showroom
                const showroom = await tx.showroom.update({
                    where: { id },
                    data: {
                        name,
                        city,
                        location,
                        managerId: managerId || null
                    }
                });
                // 2. Update Commercials
                await tx.user.updateMany({
                    where: { showroomId: id },
                    data: { showroomId: null }
                });
                if (commercialIds && commercialIds.length > 0) {
                    await tx.user.updateMany({
                        where: { id: { in: commercialIds } },
                        data: { showroomId: id }
                    });
                }
                // 3. Update or Create Objective
                if (targets) {
                    const currentMonth = new Date().getMonth() + 1;
                    const currentYear = new Date().getFullYear();
                    const existingObjective = await tx.objective.findFirst({
                        where: {
                            showroomId: id,
                            month: currentMonth,
                            year: currentYear
                        }
                    });
                    if (existingObjective) {
                        await tx.objective.update({
                            where: { id: existingObjective.id },
                            data: {
                                conservativeCA: parseFloat(targets.conservative) || 0,
                                likelyCA: parseFloat(targets.likely) || 0,
                                exceedCA: parseFloat(targets.exceed) || 0,
                            }
                        });
                    }
                    else {
                        await tx.objective.create({
                            data: {
                                showroomId: id,
                                month: currentMonth,
                                year: currentYear,
                                conservativeCA: parseFloat(targets.conservative) || 0,
                                likelyCA: parseFloat(targets.likely) || 0,
                                exceedCA: parseFloat(targets.exceed) || 0,
                                type: 'SHOWROOM'
                            }
                        });
                    }
                }
                return showroom;
            });
            return res.json({ success: true, data: result });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}
exports.ShowroomController = ShowroomController;
