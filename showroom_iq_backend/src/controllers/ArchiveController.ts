import { Request, Response } from 'express';
import prisma from '../config/prisma';

export class ArchiveController {
  /**
   * Archive all current bonuses to HistoryBonus and clear the active Bonus table.
   * This is typically called at the end of a performance period (e.g., end of month).
   */
  static async archiveBonuses(req: Request, res: Response) {
    try {
      // 1. Get all current bonuses
      const currentBonuses = await prisma.bonus.findMany();

      if (currentBonuses.length === 0) {
        return res.json({ 
          success: true, 
          message: 'No bonuses found to archive.' 
        });
      }

      // 2. Perform archiving in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create entries in HistoryBonus
        const archived = await tx.historyBonus.createMany({
          data: currentBonuses.map(b => ({
            userId: b.userId,
            amount: b.amount,
            description: b.description,
            date: b.date,
            archivedAt: new Date()
          }))
        });

        // Clear the active Bonus table
        await tx.bonus.deleteMany();

        return archived;
      });

      return res.json({ 
        success: true, 
        message: `Successfully archived ${result.count} bonuses.`,
        count: result.count
      });
    } catch (error: any) {
      console.error('Error archiving bonuses:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}
