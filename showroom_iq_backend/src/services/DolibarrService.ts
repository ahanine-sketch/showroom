import axios from 'axios';
import prisma from '../config/prisma';

/**
 * DolibarrService
 * 
 * Handles synchronization of sales data from Dolibarr ERP.
 * Fetches:
 *  - CA (Invoices)
 *  - Devis (Proposals)
 *  - Average Basket
 */
export class DolibarrService {
  private static get apiConfig() {
    return {
      url: process.env.DOLIBARR_API_URL || 'https://mock-dolibarr.sketch.ma/api/index.php',
      key: process.env.DOLIBARR_API_KEY || 'MOCK_KEY',
    };
  }

  /**
   * Syncs all commercials in a showroom for a specific month.
   */
  static async syncShowroomData(showroomId: string, month: number, year: number) {
    console.log(`[Dolibarr] Syncing showroom ${showroomId} for ${year}-${month}`);
    
    // 1. Get all users in showroom
    const users = await prisma.user.findMany({
      where: { showroomId, role: 'COMMERCIAL', status: 'ACTIVE' },
      select: { id: true, fullName: true, email: true }
    });

    if (users.length === 0) return { success: true, records: 0, message: 'No active commercials' };

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 2. Mock or Fetch from API
    // In a real scenario, we'd query Dolibarr's /proposals and /invoices endpoints
    // filtering by date and user (linked by email or a custom attribute)
    
    const results = await Promise.all(users.map(async (user) => {
      // Simulate fetching data per user
      const data = await this.fetchUserMetrics(user.email || user.fullName, startDate, endDate);
      
      // Upsert into SalesMetric
      return prisma.salesMetric.upsert({
        where: { 
          // We need a unique constraint to avoid duplicates on sync
          // I'll check if schema has one. If not, I'll use findFirst/update or create.
          id: await this.findMetricId(user.id, startDate) || 'NEW_ID'
        },
        update: {
          ca: data.ca,
          devisCreated: data.devisCreated,
          devisValidated: data.devisValidated,
          devisLost: data.devisLost,
          devisOpened: data.devisOpened,
          avgBasket: data.avgBasket,
          syncedAt: new Date(),
          source: 'DOLIBARR'
        },
        create: {
          userId: user.id,
          date: startDate, // We store one record representing the month for simplicity, or daily if needed
          ca: data.ca,
          devisCreated: data.devisCreated,
          devisValidated: data.devisValidated,
          devisLost: data.devisLost,
          devisOpened: data.devisOpened,
          avgBasket: data.avgBasket,
          syncedAt: new Date(),
          source: 'DOLIBARR'
        }
      });
    }));

    // Log the sync attempt
    await prisma.dolibarrSync.create({
      data: {
        showroomId,
        month,
        year,
        status: 'SUCCESS',
        recordsFetched: results.length,
        lastSyncAt: new Date(),
      }
    });

    return { success: true, records: results.length };
  }

  private static async findMetricId(userId: string, date: Date) {
    const m = await prisma.salesMetric.findFirst({
      where: { userId, date: { gte: date, lte: new Date(date.getTime() + 86400000) } }
    });
    return m?.id;
  }

  /**
   * Mock implementation of Dolibarr API call.
   * In production, replace with real AXIOS calls.
   */
  private static async fetchUserMetrics(identifier: string, start: Date, end: Date) {
    // This is where the real logic goes. 
    // Example: GET /proposals?sqlfilters=(t.datep:>=:${start}) AND (t.datep:<=:${end})
    
    // For now, returning realistic random data for the "Example" requested by user
    const isJan = start.getMonth() === 0;
    
    return {
      ca: isJan ? 45000 + Math.random() * 10000 : 0,
      devisCreated: isJan ? 25 + Math.floor(Math.random() * 10) : 0,
      devisValidated: isJan ? 15 + Math.floor(Math.random() * 5) : 0,
      devisLost: isJan ? 5 : 0,
      devisOpened: isJan ? 5 : 0,
      avgBasket: isJan ? 12000 + Math.random() * 5000 : 0
    };
  }
}
