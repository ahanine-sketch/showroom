import { Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';

export class UserController {

  /**
   * Get the admin's team (commercials in their showroom) with real performance scores.
   */
  static async getMyTeam(req: Request, res: Response) {
    try {
      const { id: adminId } = (req as any).user;

      // Find the showroom this admin belongs to
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { showroomId: true, showroom: { select: { id: true, name: true } } }
      });

      if (!admin?.showroomId) {
        return res.json({ success: true, data: [] });
      }

      const showroomId = admin.showroomId;

      // Get all COMMERCIAL users in the same showroom
      const commercials = await prisma.user.findMany({
        where: { showroomId, role: 'COMMERCIAL' },
        select: { id: true, fullName: true, email: true, phone: true, role: true, seniority: true, avatarUrl: true }
      });

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      // For each commercial, compute the real global score breakdown
      const teamWithScores = await Promise.all(commercials.map(async (c) => {
        // Fetch data in parallel
        const [evaluations, clientReviews, bonusHistory, presenceLogs, salesMetrics, objective] = await Promise.all([
          prisma.processEvaluation.findMany({ where: { userId: c.id, date: { gte: startDate, lte: endDate } } }),
          prisma.clientReview.findMany({ where: { userId: c.id, date: { gte: startDate, lte: endDate } } }),
          prisma.bonusHistory.findMany({ where: { userId: c.id, month, year } }),
          prisma.dailyLog.findMany({ where: { userId: c.id, activity: 'PRESENCE', date: { gte: startDate, lte: endDate } } }),
          prisma.salesMetric.findMany({ where: { userId: c.id, date: { gte: startDate, lte: endDate } } }),
          prisma.objective.findFirst({ where: { userId: c.id, month, year, type: 'GLOBAL' } }),
        ]);

        // --- Ventes (65 pts) ---
        const totalCA = salesMetrics.reduce((s: number, m: any) => s + (m.ca || 0), 0);
        const devisCreated  = salesMetrics.reduce((s: number, m: any) => s + (m.devisCreated  || 0), 0) || 11;
        const devisValidated = salesMetrics.reduce((s: number, m: any) => s + (m.devisValidated || 0), 0) || 6;
        const devisLost     = salesMetrics.reduce((s: number, m: any) => s + (m.devisLost     || 0), 0) || 1;
        const avgBasket = salesMetrics.length > 0
          ? salesMetrics.reduce((s: number, m: any) => s + (m.avgBasket || 0), 0) / salesMetrics.length : 23323;

        const conservativeCA = (objective as any)?.conservativeCA ?? 30000;
        const likelyCA       = (objective as any)?.likelyCA       ?? 50000;
        const exceedCA       = (objective as any)?.exceedCA        ?? 70000;

        let caPoints = 0;
        if (totalCA >= exceedCA)              caPoints = 35;
        else if (totalCA >= likelyCA)         caPoints = 32;
        else if (totalCA >= conservativeCA) { caPoints = 21 + Math.floor(((totalCA - conservativeCA) / (likelyCA - conservativeCA)) * 10); }
        else if (totalCA >= conservativeCA * 0.5) caPoints = 10;

        const convRate = devisCreated > 0 ? ((devisValidated + devisLost) / devisCreated) * 100 : 0;
        const devisPoints = convRate >= 75 ? 15 : convRate >= 50 ? 10 : convRate >= 35 ? 5 : 0;

        const panierPoints = avgBasket >= 20000 ? 15 : avgBasket >= 15000 ? 12 : avgBasket >= 10000 ? 5 : 0;
        const ventesScore = Math.min(caPoints + devisPoints + panierPoints, 65);

        // --- Comportement (30 pts) ---
        const avisPositifs = clientReviews.filter((r: any) => r.rating >= 4).length;
        const avisNegatifs = clientReviews.filter((r: any) => r.rating <= 2).length;
        let avisPoints = avisNegatifs > 0 ? 0 : avisPositifs > 3 ? 10 : avisPositifs > 0 ? 8 : 4;

        const savTickets   = evaluations.filter((e: any) => e.type === 'SAV').reduce((s: number, e: any) => s + (e.ticketsCount   || 0), 0);
        const savPlaintes  = evaluations.filter((e: any) => e.type === 'SAV').reduce((s: number, e: any) => s + (e.complaintsCount || 0), 0);
        const savPoints    = savPlaintes > 0 ? 0 : savTickets > 4 ? 4 : savTickets > 0 ? 8 : 10;

        const warnings     = evaluations.filter((e: any) => e.type === 'PROCESS').length;
        const processPoints = warnings >= 3 ? 0 : warnings === 2 ? 4 : warnings === 1 ? 8 : 10;
        const comportementScore = avisPoints + savPoints + processPoints;

        // --- Présence (5 pts) ---
        const absences   = presenceLogs.filter((l: any) => l.status === 'Absence').length;
        const retards    = presenceLogs.filter((l: any) => l.status === 'Retard').length;
        const totalFaults = absences + retards;
        const presenceScore = totalFaults >= 5 ? 0 : totalFaults >= 2 ? 1 : totalFaults >= 1 ? 3 : 5;

        // --- Bonus (capped 5) ---
        const bonusScore = Math.min(bonusHistory.reduce((s: number, b: any) => s + b.amount, 0), 5);

        const globalScore = Math.min(100, ventesScore + comportementScore + presenceScore + bonusScore);

        return {
          id: c.id,
          fullName: c.fullName,
          email: c.email,
          phone: c.phone,
          role: c.role,
          seniority: c.seniority,
          avatarUrl: c.avatarUrl,
          showroom: admin.showroom,
          scores: {
            global: globalScore,
            ventes: ventesScore,
            comportement: comportementScore,
            presence: presenceScore,
            bonus: bonusScore,
          },
          objectives: objective ? {
            conservative: (objective as any).conservativeCA,
            likely: (objective as any).likelyCA,
            exceed: (objective as any).exceedCA
          } : null
        };
      }));

      return res.json({ success: true, data: teamWithScores, showroom: admin.showroom });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Search users by name and optionally filter by role
   */
  static async search(req: Request, res: Response) {

    try {
      const { q, role } = req.query;
      
      const users = await prisma.user.findMany({
        where: {
          fullName: {
            contains: q as string,
            mode: 'insensitive'
          },
          ...(role ? { role: role as any } : {})
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          avatarUrl: true
        },
        take: 10
      });

      return res.json({ success: true, data: users });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get a specific user by ID with showroom data
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          seniority: true,
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
        }
      });

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      return res.json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Create a new user (and potentially set objectives)
   */
  static async create(req: Request, res: Response) {
    try {
      const { fullName, email, phone, role, showroomId, targets } = req.body;
      
      // Default password since it is created by admin
      const passwordHash = await bcrypt.hash("password123", 10);
      
      const newUser = await prisma.user.create({
        data: {
          fullName,
          email,
          phone: phone || null,
          role: role || 'COMMERCIAL',
          showroomId: showroomId || null,
          passwordHash,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`
        }
      });

      // Handle objectives if provided
      if (targets && Object.keys(targets).length > 0) {
        const conservativeCA = parseFloat(targets.conservative) || 0;
        const likelyCA = parseFloat(targets.likely) || 0;
        const exceedCA = parseFloat(targets.exceed) || 0;

        await prisma.objective.create({
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
         await prisma.showroom.update({
            where: { id: showroomId },
            data: { managerId: newUser.id }
         });
      }

      return res.json({ success: true, data: newUser });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Update an existing user
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { fullName, email, phone, role, showroomId, targets } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: {
          fullName,
          email,
          phone: phone || null,
          role,
          showroomId: showroomId || null
        }
      });

      // Handle objectives if provided
      if (targets) {
        const conservativeCA = parseFloat(targets.conservative) || 0;
        const likelyCA = parseFloat(targets.likely) || 0;
        const exceedCA = parseFloat(targets.exceed) || 0;
        
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        const existingObj = await prisma.objective.findFirst({
          where: { userId: id, month, year }
        });

        if (existingObj) {
          await prisma.objective.update({
            where: { id: existingObj.id },
            data: { conservativeCA, likelyCA, exceedCA }
          });
        } else {
          await prisma.objective.create({
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
         await prisma.showroom.update({
            where: { id: showroomId },
            data: { managerId: id }
         });
      }

      return res.json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Delete an existing user
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Unset manager from any showroom they manage
      await prisma.showroom.updateMany({
        where: { managerId: id },
        data: { managerId: null }
      });

      // Delete objectives
      await prisma.objective.deleteMany({
        where: { userId: id }
      });

      // Optional: Handle deletion of other relations (scores, logs) if needed or let Cascade handle it.
      // Wait, let's just delete the user.
      await prisma.user.delete({
        where: { id }
      });

      return res.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
      // If cascade is an issue we catch it here and return
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get the current user's profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const { id } = (req as any).user;
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          avatarUrl: true
        }
      });

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      return res.json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
