import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PerformanceController } from './controllers/PerformanceController';
import { SettingsController } from './controllers/SettingsController';

import { AuthController } from './controllers/AuthController';
import { ShowroomController } from './controllers/ShowroomController';
import { UserController } from './controllers/UserController';
import { authenticate, authorize } from './middleware/auth';
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
app.post('/api/performance/bonus', authenticate, authorize(['OWNER']), PerformanceController.addBonus);
app.get('/api/performance/bonus-history/:userId', authenticate, PerformanceController.getBonusHistory);

// 5. Evaluation Management
app.post('/api/performance/evaluation', authenticate, authorize(['OWNER', 'ADMIN']), PerformanceController.addEvaluation);
app.get('/api/performance/evaluations/:userId/:month/:year', authenticate, PerformanceController.getMonthlyEvaluations);
app.get('/api/performance/global-score/:userId/:month/:year', authenticate, PerformanceController.getGlobalScore);


// 6. Showroom Management
app.get('/api/showrooms', authenticate, ShowroomController.getAll);
app.get('/api/showrooms/:id', authenticate, ShowroomController.getById);
app.post('/api/showrooms', authenticate, authorize(['OWNER']), ShowroomController.create);
app.put('/api/showrooms/:id', authenticate, authorize(['OWNER']), ShowroomController.update);
app.delete('/api/showrooms/:id', authenticate, authorize(['OWNER']), ShowroomController.delete);

// 6. User Management
app.get('/api/users/profile', authenticate, UserController.getProfile);
app.get('/api/users/my-team', authenticate, authorize(['ADMIN']), UserController.getMyTeam);
app.get('/api/users/search', authenticate, UserController.search);
app.get('/api/users/:id', authenticate, UserController.getById);

app.post('/api/users', authenticate, authorize(['OWNER']), UserController.create);
app.put('/api/users/:id', authenticate, authorize(['OWNER']), UserController.update);
app.delete('/api/users/:id', authenticate, authorize(['OWNER']), UserController.delete);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Showroom IQ Backend is running with Auth. 🔐' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Showroom IQ Backend running on http://localhost:${PORT}`);
});
