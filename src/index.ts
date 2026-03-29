// src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDb } from "./mongo";

import authRoutes from "./routes/auth";

dotenv.config();

const app = express();

// ---------------- CORS ----------------
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Preflight handler
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

// ---------------- DB Connect & Start ----------------
async function startServer() {
  await connectToDb();

  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);

export default app;