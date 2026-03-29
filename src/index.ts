// src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDb } from "./mongo";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();

// ✅ CORS setup
const FRONTEND_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ✅ Preflight handler
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK" });
});

// ✅ Connect to MongoDB (serverless safe)
connectToDb()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(console.error);

// ❌ Do NOT use app.listen() in serverless
export default app;