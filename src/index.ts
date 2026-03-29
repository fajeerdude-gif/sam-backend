import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectToDb } from "./mongo";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();
const FRONTEND_URL = process.env.CORS_ORIGIN || "*";

// ✅ CORS middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Preflight
app.options("*", (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", FRONTEND_URL);
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK" });
});

// Connect to DB and start server
async function startServer() {
  await connectToDb();

  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("❌ Server failed to start:", err);
});

export default app;