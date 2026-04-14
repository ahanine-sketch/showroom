import { Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';

export class UserController {
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
