import { Request, Response } from 'express';
import prisma from '../config/prisma';

export class ShowroomController {
  /**
   * Get all showrooms with manager details and performance
   */
  static async getAll(req: Request, res: Response) {
    try {
      const showrooms = await prisma.showroom.findMany({
        include: {
          manager: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true
            }
          },
          users: {
            where: {
              role: 'COMMERCIAL'
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
                  month: new Date().getMonth() + 1,
                  year: new Date().getFullYear()
                },
                take: 1
              }
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

      // Calculate performance placeholder or basic stats
      const formatted = showrooms.map(s => ({
        id: s.id,
        name: s.name,
        location: s.location,
        city: s.city,
        manager: s.manager ? {
          id: s.manager.id,
          name: s.manager.fullName,
          email: s.manager.email,
          phone: s.manager.phone,
          avatar: s.manager.avatarUrl
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
        performance: 0, // Placeholder for now (0/100 cus no data yet)
        score: 0,      // Placeholder for now
        status: 'Ouvert',
        targets: s.objectives.length > 0 ? {
          conservative: s.objectives[0].conservativeCA,
          likely: s.objectives[0].likelyCA,
          exceed: s.objectives[0].exceedCA
        } : null
      }));

      return res.json({ success: true, data: formatted });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get a specific showroom by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const s = await prisma.showroom.findUnique({
        where: { id },
        include: {
          manager: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true
            }
          },
          users: {
            where: {
              role: 'COMMERCIAL'
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
                  month: new Date().getMonth() + 1,
                  year: new Date().getFullYear()
                },
                take: 1
              }
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

      if (!s) {
        return res.status(404).json({ success: false, message: 'Magasin introuvable' });
      }

      const formatted = {
        id: s.id,
        name: s.name,
        location: s.location,
        city: s.city,
        manager: s.manager ? {
          id: s.manager.id,
          name: s.manager.fullName,
          email: s.manager.email,
          phone: s.manager.phone,
          avatar: s.manager.avatarUrl
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
        performance: 0,
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

