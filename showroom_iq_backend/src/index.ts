import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { PerformanceController } from './controllers/PerformanceController';
import { SettingsController } from './controllers/SettingsController';
import { BehaviorController } from './controllers/BehaviorController';
import { CalendarController } from './controllers/CalendarController';
import { ScorecardController } from './controllers/ScorecardController';
import { AuthController } from './controllers/AuthController';
import { ShowroomController } from './controllers/ShowroomController';
import { UserController } from './controllers/UserController';
import { authenticate, authorize } from './middleware/auth';
import { MonthlyResetService } from './services/MonthlyResetService';
import { MonthlySnapshotService } from './services/MonthlySnapshotService';
import prisma from './config/prisma';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. Auth Routing
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);

// 2. Performance Routing (Protected)
app.post('/api/performance/metric', authenticate, PerformanceController.addMetric);
app.get('/api/performance/daily/:userId/:date', authenticate, PerformanceController.getDailyPerformance);

// 3. Settings Routing (Admin/Owner Only)
app.get('/api/settings/configs', authenticate, authorize(['OWNER', 'ADMIN']), SettingsController.getConfigs);
app.post('/api/settings/metric', authenticate, authorize(['OWNER']), SettingsController.updateMetricConfig);
app.post('/api/settings/global', authenticate, authorize(['OWNER']), SettingsController.updateGlobalConfig);

// 4. Bonus Management
app.post('/api/performance/bonus', authenticate, authorize(['OWNER', 'ADMIN']), PerformanceController.addBonus);
app.get('/api/performance/bonus-history/:userId', authenticate, PerformanceController.getBonusHistory);

// 5. Evaluation Management
app.post('/api/performance/evaluation', authenticate, authorize(['OWNER', 'ADMIN']), PerformanceController.addEvaluation);
app.get('/api/performance/evaluations/showroom/:showroomId/:month/:year', authenticate, PerformanceController.getShowroomEvaluations);
app.get('/api/performance/evaluations/:userId/:month/:year', authenticate, PerformanceController.getMonthlyEvaluations);
app.get('/api/performance/global-score/:userId/:month/:year', authenticate, PerformanceController.getGlobalScore);

// 6. Showroom Management
app.get('/api/showrooms', authenticate, ShowroomController.getAll);
app.get('/api/showrooms/:id', authenticate, ShowroomController.getById);
app.post('/api/showrooms', authenticate, authorize(['OWNER']), ShowroomController.create);
app.put('/api/showrooms/:id', authenticate, authorize(['OWNER']), ShowroomController.update);
app.delete('/api/showrooms/:id', authenticate, authorize(['OWNER']), ShowroomController.delete);

// 7. User Management
app.get('/api/users/profile', authenticate, UserController.getProfile);
app.get('/api/users', authenticate, authorize(['OWNER']), UserController.getAll);
app.get('/api/users/my-team', authenticate, authorize(['ADMIN']), UserController.getMyTeam);
app.get('/api/users/search', authenticate, UserController.search);
app.get('/api/users/:id', authenticate, UserController.getById);
app.post('/api/users', authenticate, authorize(['OWNER', 'ADMIN']), UserController.create);
app.put('/api/users/:id', authenticate, authorize(['OWNER', 'ADMIN']), UserController.update);
app.put('/api/users/:id/status', authenticate, authorize(['OWNER']), UserController.toggleStatus);
app.delete('/api/users/:id', authenticate, authorize(['OWNER', 'ADMIN']), UserController.delete);

// 8. Scorecard Routes (date-range based)
app.get('/api/scorecard/commercial', authenticate, ScorecardController.getCommercial);
app.get('/api/scorecard/showroom', authenticate, ScorecardController.getShowroom);
app.post('/api/admin/monthly-reset', authenticate, authorize(['OWNER']), ScorecardController.triggerMonthlyReset);
app.post('/api/admin/sync-dolibarr', authenticate, authorize(['OWNER', 'ADMIN']), ScorecardController.syncDolibarr);

// 9. Behavior Routes (Avis / SAV / Processus)
app.get('/api/behavior/:userId', authenticate, BehaviorController.get);
app.post('/api/behavior/avis', authenticate, authorize(['OWNER', 'ADMIN']), BehaviorController.upsertAvis);
app.post('/api/behavior/review', authenticate, authorize(['OWNER', 'ADMIN']), BehaviorController.addReview);
app.post('/api/behavior/sav', authenticate, authorize(['OWNER', 'ADMIN']), BehaviorController.upsertSav);
app.post('/api/behavior/process', authenticate, authorize(['OWNER', 'ADMIN']), BehaviorController.addProcessWarning);
app.delete('/api/behavior/process/:id', authenticate, authorize(['OWNER', 'ADMIN']), BehaviorController.deleteProcessWarning);
app.delete('/api/behavior/review/:id', authenticate, authorize(['OWNER', 'ADMIN']), BehaviorController.deleteReview);

// 10. Calendar Routes
app.get('/api/calendar/:userId', authenticate, CalendarController.get);
app.post('/api/calendar/presence', authenticate, authorize(['OWNER', 'ADMIN']), CalendarController.addPresence);
app.post('/api/calendar/note', authenticate, authorize(['OWNER', 'ADMIN']), CalendarController.addNote);
app.delete('/api/calendar/:id', authenticate, authorize(['OWNER', 'ADMIN']), CalendarController.deleteLog);

// 11. Monthly Snapshot — read snapshots for closed months
app.get('/api/snapshot/commercial', authenticate, async (req, res) => {
  const { userId, month, year } = req.query;
  if (!userId || !month || !year) {
    return res.status(400).json({ success: false, message: 'userId, month, year required' });
  }
  const snap = await MonthlySnapshotService.getCommercialSnapshot(
    userId as string, parseInt(month as string), parseInt(year as string)
  );
  return res.json({ success: true, data: snap });
});

app.get('/api/snapshot/showroom', authenticate, async (req, res) => {
  const { showroomId, month, year } = req.query;
  if (!showroomId || !month || !year) {
    return res.status(400).json({ success: false, message: 'showroomId, month, year required' });
  }
  const snap = await MonthlySnapshotService.getShowroomSnapshot(
    showroomId as string, parseInt(month as string), parseInt(year as string)
  );
  return res.json({ success: true, data: snap });
});

// 12. Objective confirm endpoint (Phase 4 — manager sets targets)
app.patch('/api/objectives/:id/confirm', authenticate, authorize(['OWNER', 'ADMIN']), async (req, res) => {
  const id = req.params.id as string;
  const { conservativeCA, likelyCA, exceedCA } = req.body;
  try {
    const updated = await prisma.objective.update({
      where: { id },
      data: {
        ...(conservativeCA !== undefined && { conservativeCA: parseFloat(conservativeCA) }),
        ...(likelyCA !== undefined && { likelyCA: parseFloat(likelyCA) }),
        ...(exceedCA !== undefined && { exceedCA: parseFloat(exceedCA) }),
        status: 'CONFIRMED',
      },
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Manual freeze endpoint (admin can trigger snapshot for any month)
app.post('/api/admin/freeze', authenticate, authorize(['OWNER']), async (req, res) => {
  const { month, year } = req.body;
  const m = parseInt(month) || new Date().getMonth();
  const y = parseInt(year)  || new Date().getFullYear();
  try {
    const [commResult, showroomResult] = await Promise.all([
      MonthlySnapshotService.freezeAllCommercials(m, y),
      MonthlySnapshotService.freezeAllShowrooms(m, y),
    ]);
    return res.json({ success: true, data: { month: m, year: y, commercial: commResult, showroom: showroomResult } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Showroom IQ Backend is running with Auth. 🔐' });
});

// --- CRON: Month-end lifecycle on 1st of each month at 00:01 ---
// Format: minute hour day-of-month month day-of-week
cron.schedule('1 0 1 * *', async () => {
  console.log('[CRON] Monthly lifecycle triggered at', new Date().toISOString());
  try {
    const result = await MonthlyResetService.runForNextMonth();
    console.log('[CRON] Monthly lifecycle complete:', JSON.stringify(result));
  } catch (err) {
    console.error('[CRON] Monthly lifecycle FAILED:', err);
  }
}, {
  timezone: 'Africa/Casablanca'
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Showroom IQ Backend running on http://localhost:${PORT}`);
});
