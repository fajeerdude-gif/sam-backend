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

// CORS configuration - allow requests from deployed frontend and local dev
const rawCors = process.env.CORS_ORIGIN || '';
// support comma-separated list in env, and always allow localhost during development
const whitelist = rawCors
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
if (process.env.NODE_ENV !== 'production') {
  // add local dev origins used by client
  whitelist.push('http://localhost:3002');
  whitelist.push('http://localhost:3000');
}

const corsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    // allow non-browser tools like curl or same-origin requests
    if (!origin) return callback(null, true);
    if (whitelist.length === 0) return callback(null, true);
    if (whitelist.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
// enable pre-flight for all routes
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Explicit CORS headers middleware to ensure preflight responses include necessary headers
app.use((req: any, res: any, next: any) => {
  const allowed = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
  const originHeader = req.headers.origin as string | undefined;

  // If a specific origin is configured and matches the request origin, echo it back.
  if (allowed.length > 0 && originHeader && allowed.includes(originHeader)) {
    res.setHeader('Access-Control-Allow-Origin', originHeader);
  } else if (allowed.length === 0) {
    // No whitelist configured: allow all origins (useful for quick debugging)
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    // Not allowed origin - still set wildcard to avoid hard CORS failures for non-browser tools
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Register routes (register before starting the server)
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

// Connect to DB and start server with port fallback on EADDRINUSE
async function startServer() {
  await connectToDb();

  const basePort = Number(process.env.PORT) || 5000;
  const maxAttempts = 5;

  for (let i = 0; i < maxAttempts; i++) {
    const tryPort = basePort + i;
    try {
      await new Promise<void>((resolve, reject) => {
        const server = app.listen(tryPort)
          .once('listening', () => {
            console.log(`Server running on http://localhost:${tryPort}`);
            resolve();
          })
          .once('error', (err: any) => {
            reject(err);
          });
      });
      // started successfully
      return;
    } catch (err: any) {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${tryPort} in use, trying next port...`);
        continue;
      }
      console.error('Failed to start server:', err);
      throw err;
    }
  }

  throw new Error(`All ports ${basePort}-${basePort + maxAttempts - 1} are in use`);
}

startServer().catch((err) => {
  console.error('startServer error:', err);
  process.exit(1);
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});



