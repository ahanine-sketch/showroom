import { Request, Response } from 'express';
import prisma from '../config/prisma';

const PRESENCE_STATUSES = ['Retard', 'Absence', 'Congé'];

export class CalendarController {
  /**
   * Get calendar data (presence logs + notes) for a user in a given month/year
   */
  static async get(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);

      const logs = await prisma.dailyLog.findMany({
        where: { userId, date: { gte: start, lte: end } },
        orderBy: { date: 'asc' }
      });

      const presenceLogs = logs
        .filter(l => PRESENCE_STATUSES.includes(l.status))
        .map(l => ({
          id: l.id,
          date: l.date.toISOString().split('T')[0],
          status: l.status,
          motif: l.activity
        }));

      const notesList = logs
        .filter(l => l.status === 'NotePositive' || l.status === 'NoteNegative')
        .map(l => ({
          id: l.id,
          date: l.date.toISOString().split('T')[0],
          type: l.status === 'NotePositive' ? 'positive' : 'negative',
          text: l.activity
        }));

      return res.json({ success: true, data: { presenceLogs, notesList } });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Add or update a presence log for a specific day
   */
  static async addPresence(req: Request, res: Response) {
    try {
      const { userId, date, status, motif } = req.body;

      const logDate = new Date(date);
      logDate.setHours(12, 0, 0, 0);

      const dayStart = new Date(logDate); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(logDate); dayEnd.setHours(23, 59, 59, 999);

      // Upsert: replace existing presence log for the same day
      const existing = await prisma.dailyLog.findFirst({
        where: {
          userId,
          date: { gte: dayStart, lte: dayEnd },
          status: { in: PRESENCE_STATUSES }
        }
      });

      let record;
      if (existing) {
        record = await prisma.dailyLog.update({
          where: { id: existing.id },
          data: { status, activity: motif || '' }
        });
      } else {
        record = await prisma.dailyLog.create({
          data: { userId, date: logDate, status, activity: motif || '' }
        });
      }

      return res.json({
        success: true,
        data: {
          id: record.id,
          date: record.date.toISOString().split('T')[0],
          status: record.status,
          motif: record.activity
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Add a daily note (positive or negative)
   */
  static async addNote(req: Request, res: Response) {
    try {
      const { userId, date, type, text } = req.body;

      const logDate = new Date(date);
      logDate.setHours(12, 0, 0, 0);

      const status = type === 'positive' ? 'NotePositive' : 'NoteNegative';

      const record = await prisma.dailyLog.create({
        data: { userId, date: logDate, status, activity: text || '' }
      });

      return res.json({
        success: true,
        data: {
          id: record.id,
          date: record.date.toISOString().split('T')[0],
          type,
          text: record.activity
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Delete a calendar log (presence or note) by ID
   */
  static async deleteLog(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await prisma.dailyLog.delete({ where: { id } });
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
