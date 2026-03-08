import express, { Request, Response } from 'express';
// cors typings sometimes missing in build environments, keep the ambient declaration file or ignore.
// import cors using require so TS doesn't try to resolve types during build
const cors = require('cors');
import dotenv from 'dotenv';
import { connectToDb } from "./mongo";
import authRoutes from './routes/auth';
import profilesRoutes from './routes/profiles';
import studentsRoutes from './routes/students';
import attendanceRoutes from './routes/attendance';
import subjectsRoutes from './routes/subjects';
import statsRoutes from './routes/stats';
import marksRoutes from './routes/marks';
import schemesRoutes from './routes/schemes';
import linksRoutes from './routes/links';
import notificationsRoutes from './routes/notifications';

dotenv.config();

const app = express();

// CORS configuration - allow requests from deployed frontend
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Set CORS_ORIGIN in production
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

// Connect to DB
async function startServer() {
  await connectToDb();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();


// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});


