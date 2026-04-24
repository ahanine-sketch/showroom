"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const PerformanceController_1 = require("./controllers/PerformanceController");
const SettingsController_1 = require("./controllers/SettingsController");
const AuthController_1 = require("./controllers/AuthController");
const ShowroomController_1 = require("./controllers/ShowroomController");
const UserController_1 = require("./controllers/UserController");
const auth_1 = require("./middleware/auth");
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
// 6. User Management
app.get('/api/users/profile', auth_1.authenticate, UserController_1.UserController.getProfile);
app.get('/api/users', auth_1.authenticate, (0, auth_1.authorize)(['OWNER']), UserController_1.UserController.getAll);
app.get('/api/users/my-team', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN']), UserController_1.UserController.getMyTeam);
app.get('/api/users/search', auth_1.authenticate, UserController_1.UserController.search);
app.get('/api/users/:id', auth_1.authenticate, UserController_1.UserController.getById);
app.post('/api/users', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), UserController_1.UserController.create);
app.put('/api/users/:id', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), UserController_1.UserController.update);
app.put('/api/users/:id/status', auth_1.authenticate, (0, auth_1.authorize)(['OWNER']), UserController_1.UserController.toggleStatus);
app.delete('/api/users/:id', auth_1.authenticate, (0, auth_1.authorize)(['OWNER', 'ADMIN']), UserController_1.UserController.delete);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Showroom IQ Backend is running with Auth. 🔐' });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Showroom IQ Backend running on http://localhost:${PORT}`);
});
