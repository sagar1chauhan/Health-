import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { createServer } from 'http';

import connectDB from './config/database.js';
import { errorHandler } from './middleware/error.middleware.js';
import { initSocket } from './sockets/socket.js';
import { initCronJobs } from './jobs/cron.js';

// Routes
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import patientRoutes from './modules/patients/patients.routes.js';
import doctorRoutes from './modules/doctors/doctors.routes.js';
import appointmentRoutes from './modules/appointments/appointments.routes.js';
import recordRoutes from './modules/medical-records/medical-records.routes.js';
import predictionRoutes from './modules/disease-prediction/disease-prediction.routes.js';
import recommendationRoutes from './modules/recommendations/recommendations.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import aiAssistantRoutes from './modules/ai-assistant/ai-assistant.routes.js';

const app = express();
app.set('trust proxy', 1); // Trust reverse proxy for secure cookies
const server = createServer(app);

// Connect Database
connectDB();

// Init Socket.io
initSocket(server);

// Init Cron Jobs
initCronJobs();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL, 
    'http://localhost:5173', 
    'https://health-bay-rho.vercel.app'
  ].filter(Boolean),
  credentials: true
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', recordRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);
import telemedicineRoutes from './modules/telemedicine/telemedicine.routes.js';
import wearablesRoutes from './modules/wearables/wearables.routes.js';
app.use('/api/telemedicine', telemedicineRoutes);
app.use('/api/wearables', wearablesRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('HealthHub+ API is running...');
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});



