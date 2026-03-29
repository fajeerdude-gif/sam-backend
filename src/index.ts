import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDb } from "./mongo";

import authRoutes from "./routes/auth";
import profilesRoutes from "./routes/profiles";
import studentsRoutes from "./routes/students";
import attendanceRoutes from "./routes/attendance";
import subjectsRoutes from "./routes/subjects";
import statsRoutes from "./routes/stats";
import marksRoutes from "./routes/marks";
import schemesRoutes from "./routes/schemes";
import linksRoutes from "./routes/links";
import notificationsRoutes from "./routes/notifications";

dotenv.config();

const app = express();

// ✅ CORS (allow your frontend)
app.use(
  cors({
    origin: "https://gptdmm170.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ✅ Preflight fix (IMPORTANT)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://gptdmm170.vercel.app");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profilesRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/schemes", schemesRoutes);
app.use("/api/links", linksRoutes);
app.use("/api/notifications", notificationsRoutes);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK" });
});

// ❌ REMOVE app.listen()
// ❌ REMOVE startServer()

// ✅ CONNECT DB ON EACH REQUEST (for serverless)
connectToDb();

export default app;