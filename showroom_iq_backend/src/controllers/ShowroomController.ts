import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { ShowroomScoringService } from '../services/ShowroomScoringService';

export class ShowroomController {
  /**
   * Get all showrooms with manager details and performance
   */
  static async getAll(req: Request, res: Response) {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const showrooms = await prisma.showroom.findMany({
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
          const performance = await ShowroomScoringService.calculatePerformance(s.id, currentMonth, currentYear);
          
          return {
            id: s.id,
            name: s.name,
            location: s.location,
            city: s.city,
            manager: s.manager && (s.manager as any).status === 'ACTIVE' ? {
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
            performance: performance,
            score: Math.round(performance),
            status: 'Ouvert',
            targets: s.objectives.length > 0 ? {
              conservative: s.objectives[0].conservativeCA,
              likely: s.objectives[0].likelyCA,
              exceed: s.objectives[0].exceedCA
            } : null
          };
        } catch (calcError: any) {
          console.error(`Error calculating performance for showroom ${s.id} (${s.name}):`, calcError);
          throw calcError;
        }
      }));

      return res.json({ success: true, data: formatted });
    } catch (error: any) {
      console.error('GetAll Showrooms Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get a specific showroom by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

      const s = await prisma.showroom.findUnique({
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

      // Compute period-specific score using the SAME engine as getAll
      const score = await ShowroomScoringService.calculatePerformance(id, month, year);

      // Fetch real sales metrics for this period so the frontend dashboard is accurate
      const userIds = s.users.map(u => u.id);
      let caAmount = 0, devisCreated = 0, devisValidated = 0;
      let devisLost = 0, devisOpened = 0, avgBasket = 0;

      if (userIds.length > 0) {
        const salesMetrics = await prisma.salesMetric.findMany({
          where: {
            userId: { in: userIds },
            date: { gte: startOfMonth, lte: endOfMonth }
          }
        });

        caAmount = salesMetrics.reduce((sum, m) => sum + m.ca, 0);
        devisCreated = salesMetrics.reduce((sum, m) => sum + m.devisCreated, 0);
        devisValidated = salesMetrics.reduce((sum, m) => sum + m.devisValidated, 0);
        devisLost = salesMetrics.reduce((sum, m) => sum + m.devisLost, 0);
        devisOpened = salesMetrics.reduce((sum, m) => sum + ((m as any).devisOpened || 0), 0);
        avgBasket = salesMetrics.length > 0
          ? salesMetrics.reduce((sum, m) => sum + m.avgBasket, 0) / salesMetrics.length
          : 0;
      }

      const formatted = {
        id: s.id,
        name: s.name,
        location: s.location,
        city: s.city,
        manager: s.manager && (s.manager as any).status === 'ACTIVE' ? {
          id: s.manager.id,
          name: (s.manager as any).fullName,
          email: s.manager.email,
          phone: s.manager.phone,
          avatar: s.manager.avatarUrl,
          seniority: (s.manager as any).seniority || ''
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
        // Period-specific metrics (used by ScorecardWrapper dashboard)
        caAmount,
        devisCreated,
        devisValidated,
        devisLost,
        devisOpened,
        avgBasket,
        // Backend-computed score — identical to list page
        performance: score,
        score: Math.round(score),
        targets: s.objectives && s.objectives.length > 0 ? {
          conservative: s.objectives[0].conservativeCA,
          likely: s.objectives[0].likelyCA,
          exceed: s.objectives[0].exceedCA
        } : null
      };

      return res.json({ success: true, data: formatted });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }


  /**
   * Create a new showroom
   */
  static async create(req: Request, res: Response) {
    try {
      const { name, city, location, managerId, commercialIds, targets } = req.body;

      const result = await prisma.$transaction(async (tx) => {
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
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Delete a showroom
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // We might need to handle resetting users assigned to this showroom
      await prisma.$transaction(async (tx) => {
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
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Update a showroom
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, city, location, managerId, commercialIds, targets } = req.body;

      const result = await prisma.$transaction(async (tx) => {
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
          } else {
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
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

