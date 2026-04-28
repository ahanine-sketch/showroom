"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
const PerformanceController_1 = require("./controllers/PerformanceController");
const SettingsController_1 = require("./controllers/SettingsController");
const BehaviorController_1 = require("./controllers/BehaviorController");
const CalendarController_1 = require("./controllers/CalendarController");
const ScorecardController_1 = require("./controllers/ScorecardController");
const AuthController_1 = require("./controllers/AuthController");
const ShowroomController_1 = require("./controllers/ShowroomController");
const UserController_1 = require("./controllers/UserController");
const auth_1 = require("./middleware/auth");
const MonthlyResetService_1 = require("./services/MonthlyResetService");
const MonthlySnapshotService_1 = require("./services/MonthlySnapshotService");
const prisma_1 = __importDefault(require("./config/prisma"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// --- ROUTES ---
// 1. Auth Routing
app.post('/api/auth/register', AuthController_1.AuthController.register);
app.post('/api/auth/login', AuthController_1.AuthController.login);
// 2. Performance Routing (Protected)
app.post('/api/performance/metric', auth_1.authenticate, PerformanceController_1.PerformanceController.addMetric);
app.get('/api/performance/daily/:userId/:date', auth_1.authenticate, PerformanceController_1.PerformanceController.getDailyPerformance);
// 3. Settings Routing (Admin/Owner Only)
app.get('/api/settings/configs', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), SettingsController_1.SettingsController.getConfigs);
app.post('/api/settings/metric', auth_1.authenticate, (0, auth_1.authorize)(['OWNER']), SettingsController_1.SettingsController.updateMetricConfig);
app.post('/api/settings/global', auth_1.authenticate, (0, auth_1.authorize)(['OWNER']), SettingsController_1.SettingsController.updateGlobalConfig);
// 4. Bonus Management
app.post('/api/performance/bonus', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), PerformanceController_1.PerformanceController.addBonus);
app.get('/api/performance/bonus-history/:userId', auth_1.authenticate, PerformanceController_1.PerformanceController.getBonusHistory);
// 5. Evaluation Management
app.post('/api/performance/evaluation', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), PerformanceController_1.PerformanceController.addEvaluation);
app.get('/api/performance/evaluations/showroom/:showroomId/:month/:year', auth_1.authenticate, PerformanceController_1.PerformanceController.getShowroomEvaluations);
app.get('/api/performance/evaluations/:userId/:month/:year', auth_1.authenticate, PerformanceController_1.PerformanceController.getMonthlyEvaluations);
app.get('/api/performance/global-score/:userId/:month/:year', auth_1.authenticate, PerformanceController_1.PerformanceController.getGlobalScore);
// 6. Showroom Management
app.get('/api/showrooms', auth_1.authenticate, ShowroomController_1.ShowroomController.getAll);
app.get('/api/showrooms/:id', auth_1.authenticate, ShowroomController_1.ShowroomController.getById);
app.post('/api/showrooms', auth_1.authenticate, (0, auth_1.authorize)(['OWNER']), ShowroomController_1.ShowroomController.create);
app.put('/api/showrooms/:id', auth_1.authenticate, (0, auth_1.authorize)(['OWNER']), ShowroomController_1.ShowroomController.update);
app.delete('/api/showrooms/:id', auth_1.authenticate, (0, auth_1.authorize)(['OWNER']), ShowroomController_1.ShowroomController.delete);
// 7. User Management
app.get('/api/users/profile', auth_1.authenticate, UserController_1.UserController.getProfile);
app.get('/api/users', auth_1.authenticate, (0, auth_1.authorize)(['OWNER']), UserController_1.UserController.getAll);
app.get('/api/users/my-team', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN']), UserController_1.UserController.getMyTeam);
app.get('/api/users/search', auth_1.authenticate, UserController_1.UserController.search);
app.get('/api/users/:id', auth_1.authenticate, UserController_1.UserController.getById);
app.post('/api/users', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), UserController_1.UserController.create);
app.put('/api/users/:id', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), UserController_1.UserController.update);
app.put('/api/users/:id/status', auth_1.authenticate, (0, auth_1.authorize)(['OWNER']), UserController_1.UserController.toggleStatus);
app.delete('/api/users/:id', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), UserController_1.UserController.delete);
// 8. Scorecard Routes (date-range based)
app.get('/api/scorecard/commercial', auth_1.authenticate, ScorecardController_1.ScorecardController.getCommercial);
app.get('/api/scorecard/showroom', auth_1.authenticate, ScorecardController_1.ScorecardController.getShowroom);
app.post('/api/admin/monthly-reset', auth_1.authenticate, (0, auth_1.authorize)(['OWNER']), ScorecardController_1.ScorecardController.triggerMonthlyReset);
app.post('/api/admin/sync-dolibarr', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), ScorecardController_1.ScorecardController.syncDolibarr);
// 9. Behavior Routes (Avis / SAV / Processus)
app.get('/api/behavior/:userId', auth_1.authenticate, BehaviorController_1.BehaviorController.get);
app.post('/api/behavior/avis', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), BehaviorController_1.BehaviorController.upsertAvis);
app.post('/api/behavior/review', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), BehaviorController_1.BehaviorController.addReview);
app.post('/api/behavior/sav', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), BehaviorController_1.BehaviorController.upsertSav);
app.post('/api/behavior/process', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), BehaviorController_1.BehaviorController.addProcessWarning);
app.delete('/api/behavior/process/:id', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), BehaviorController_1.BehaviorController.deleteProcessWarning);
app.delete('/api/behavior/review/:id', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), BehaviorController_1.BehaviorController.deleteReview);
// 10. Calendar Routes
app.get('/api/calendar/:userId', auth_1.authenticate, CalendarController_1.CalendarController.get);
app.post('/api/calendar/presence', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), CalendarController_1.CalendarController.addPresence);
app.post('/api/calendar/note', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), CalendarController_1.CalendarController.addNote);
app.delete('/api/calendar/:id', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), CalendarController_1.CalendarController.deleteLog);
// 11. Monthly Snapshot — read snapshots for closed months
app.get('/api/snapshot/commercial', auth_1.authenticate, async (req, res) => {
    const { userId, month, year } = req.query;
    if (!userId || !month || !year) {
        return res.status(400).json({ success: false, message: 'userId, month, year required' });
    }
    const snap = await MonthlySnapshotService_1.MonthlySnapshotService.getCommercialSnapshot(userId, parseInt(month), parseInt(year));
    return res.json({ success: true, data: snap });
});
app.get('/api/snapshot/showroom', auth_1.authenticate, async (req, res) => {
    const { showroomId, month, year } = req.query;
    if (!showroomId || !month || !year) {
        return res.status(400).json({ success: false, message: 'showroomId, month, year required' });
    }
    const snap = await MonthlySnapshotService_1.MonthlySnapshotService.getShowroomSnapshot(showroomId, parseInt(month), parseInt(year));
    return res.json({ success: true, data: snap });
});
// 12. Objective confirm endpoint (Phase 4 — manager sets targets)
app.patch('/api/objectives/:id/confirm', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), async (req, res) => {
    const id = req.params.id;
    const { conservativeCA, likelyCA, exceedCA } = req.body;
    try {
        const updated = await prisma_1.default.objective.update({
            where: { id },
            data: {
                ...(conservativeCA !== undefined && { conservativeCA: parseFloat(conservativeCA) }),
                ...(likelyCA !== undefined && { likelyCA: parseFloat(likelyCA) }),
                ...(exceedCA !== undefined && { exceedCA: parseFloat(exceedCA) }),
                status: 'CONFIRMED',
            },
        });
        return res.json({ success: true, data: updated });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});
// 13. Manual freeze endpoint (admin can trigger snapshot for any month)
app.post('/api/admin/freeze', auth_1.authenticate, (0, auth_1.authorize)(['OWNER']), async (req, res) => {
    const { month, year } = req.body;
    const m = parseInt(month) || new Date().getMonth();
    const y = parseInt(year) || new Date().getFullYear();
    try {
        const [commResult, showroomResult] = await Promise.all([
            MonthlySnapshotService_1.MonthlySnapshotService.freezeAllCommercials(m, y),
            MonthlySnapshotService_1.MonthlySnapshotService.freezeAllShowrooms(m, y),
        ]);
        return res.json({ success: true, data: { month: m, year: y, commercial: commResult, showroom: showroomResult } });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Showroom IQ Backend is running with Auth. 🔐' });
});
// --- CRON: Month-end lifecycle on 1st of each month at 00:01 ---
// Format: minute hour day-of-month month day-of-week
node_cron_1.default.schedule('1 0 1 * *', async () => {
    console.log('[CRON] Monthly lifecycle triggered at', new Date().toISOString());
    try {
        const result = await MonthlyResetService_1.MonthlyResetService.runForNextMonth();
        console.log('[CRON] Monthly lifecycle complete:', JSON.stringify(result));
    }
    catch (err) {
        console.error('[CRON] Monthly lifecycle FAILED:', err);
    }
}, {
    timezone: 'Africa/Casablanca'
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Showroom IQ Backend running on http://localhost:${PORT}`);
});
