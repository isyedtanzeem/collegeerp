import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer as createViteServer } from 'vite';

import { connectDB } from './server/config/db.js';
import { seedDatabase } from './server/utils/seedData.js';
import User from './server/models/User.js';
import Department from './server/models/Department.js';
import Course from './server/models/Course.js';
import Notice from './server/models/Notice.js';
import Subject from './server/models/Subject.js';
import Student from './server/models/Student.js';
import Faculty from './server/models/Faculty.js';

import authRoutes from './server/routes/authRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import departmentRoutes from './server/routes/departmentRoutes.js';
import courseRoutes from './server/routes/courseRoutes.js';
import noticeRoutes from './server/routes/noticeRoutes.js';
import subjectRoutes from './server/routes/subjectRoutes.js';
import studentRoutes from './server/routes/studentRoutes.js';
import facultyRoutes from './server/routes/facultyRoutes.js';
import attendanceRoutes from './server/routes/attendanceRoutes.js';
import examRoutes from './server/routes/examRoutes.js';
import marksRoutes from './server/routes/marksRoutes.js';
import feesRoutes from './server/routes/feesRoutes.js';
import libraryRoutes from './server/routes/libraryRoutes.js';
import assignmentRoutes from './server/routes/assignmentRoutes.js';
import leaveRoutes from './server/routes/leaveRoutes.js';
import timetableRoutes from './server/routes/timetableRoutes.js';
import statsRoutes from './server/routes/statsRoutes.js';
import reportRoutes from './server/routes/reportRoutes.js';
import settingRoutes from './server/routes/settingRoutes.js';

import { notFound, errorHandler } from './server/middleware/errorMiddleware.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Connect Database & Seed Data
  await connectDB();
  await seedDatabase();

  // Middleware
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads directory
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Backend API Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/departments', departmentRoutes);
  app.use('/api/v1/courses', courseRoutes);
  app.use('/api/v1/subjects', subjectRoutes);
  app.use('/api/v1/students', studentRoutes);
  app.use('/api/v1/faculty', facultyRoutes);
  app.use('/api/v1/attendance', attendanceRoutes);
  app.use('/api/v1/exams', examRoutes);
  app.use('/api/v1/marks', marksRoutes);
  app.use('/api/v1/fees', feesRoutes);
  app.use('/api/v1/library', libraryRoutes);
  app.use('/api/v1/assignments', assignmentRoutes);
  app.use('/api/v1/leaves', leaveRoutes);
  app.use('/api/v1/timetable', timetableRoutes);
  app.use('/api/v1/notices', noticeRoutes);
  app.use('/api/v1/stats', statsRoutes);
  app.use('/api/v1/reports', reportRoutes);
  app.use('/api/v1/settings', settingRoutes);

  // Health check endpoint with Database connectivity status
  app.get('/api/health', async (_req, res) => {
    const dbStateMap: Record<number, string> = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };
    const dbState = mongoose.connection.readyState;
    const dbStatusStr = dbStateMap[dbState] || 'Unknown';

    let counts = { users: 0, departments: 0, courses: 0, subjects: 0, students: 0, faculty: 0, notices: 0 };
    if (dbState === 1) {
      try {
        const [users, departments, courses, subjects, students, faculty, notices] = await Promise.all([
          User.countDocuments(),
          Department.countDocuments(),
          Course.countDocuments(),
          Subject.countDocuments(),
          Student.countDocuments(),
          Faculty.countDocuments(),
          Notice.countDocuments(),
        ]);
        counts = { users, departments, courses, subjects, students, faculty, notices };
      } catch (e) {
        console.error('Error fetching count in health check:', e);
      }
    }

    res.json({
      status: 'ok',
      service: 'College ERP System API',
      database: {
        state: dbStatusStr,
        readyStateCode: dbState,
        host: mongoose.connection.host || 'local',
        name: mongoose.connection.name || 'college_erp',
        counts,
      },
      timestamp: new Date(),
    });
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error Handlers
  app.use(notFound);
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[College ERP Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Error]', err);
});
