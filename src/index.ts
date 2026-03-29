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

// ✅ SIMPLE & WORKING CORS (VERY IMPORTANT)
app.use(
  cors({
    origin: "https://gptdmm170.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Handle preflight
app.options("*", cors());

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

// Start server
async function startServer() {
  await connectToDb();

  const PORT = Number(process.env.PORT) || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK" });
});