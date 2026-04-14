import { Request, Response } from 'express';
import prisma from '../config/prisma';

export class SettingsController {
    /**
     * Get all scoring configurations and global settings
     */
    static async getConfigs(req: Request, res: Response) {
        try {
            const configs = await prisma.scoringConfig.findMany();
            const globalSettings = await prisma.globalSettings.findMany();
            
            return res.json({ 
                success: true, 
                data: {
                    metrics: configs,
                    global: globalSettings.reduce((acc: any, curr) => {
                        acc[curr.key] = curr.value;
                        return acc;
                    }, {})
                } 
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Upsert a metric configuration (Commercial or Showroom)
     */
    static async updateMetricConfig(req: Request, res: Response) {
        try {
            const { metricName, weight, levels } = req.body;
            const config = await prisma.scoringConfig.upsert({
                where: { metricName },
                update: { weight, levels },
                create: { metricName, weight, levels }
            });
            return res.json({ success: true, data: config });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Update global settings (Bonus limits, etc.)
     */
    static async updateGlobalConfig(req: Request, res: Response) {
        try {
            const { key, value } = req.body;
            const setting = await prisma.globalSettings.upsert({
                where: { key },
                update: { value },
                create: { key, value }
            });
            return res.json({ success: true, data: setting });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}
