"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class SettingsController {
    /**
     * Get all scoring configurations and global settings
     */
    static async getConfigs(req, res) {
        try {
            const configs = await prisma_1.default.scoringConfig.findMany();
            const globalSettings = await prisma_1.default.globalSettings.findMany();
            return res.json({
                success: true,
                data: {
                    metrics: configs,
                    global: globalSettings.reduce((acc, curr) => {
                        acc[curr.key] = curr.value;
                        return acc;
                    }, {})
                }
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Upsert a metric configuration (Commercial or Showroom)
     */
    static async updateMetricConfig(req, res) {
        try {
            const { metricName, weight, levels } = req.body;
            const config = await prisma_1.default.scoringConfig.upsert({
                where: { metricName },
                update: { weight, levels },
                create: { metricName, weight, levels }
            });
            return res.json({ success: true, data: config });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Update global settings (Bonus limits, etc.)
     */
    static async updateGlobalConfig(req, res) {
        try {
            const { key, value } = req.body;
            const setting = await prisma_1.default.globalSettings.upsert({
                where: { key },
                update: { value },
                create: { key, value }
            });
            return res.json({ success: true, data: setting });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}
exports.SettingsController = SettingsController;
