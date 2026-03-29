import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDb } from "./mongo";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();

// ✅ CORS configuration
const allowedOrigin = process.env.CORS_ORIGIN || "*";

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle OPTIONS preflight globally
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "OK" });
});

// ✅ Connect to MongoDB
connectToDb()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ For local dev: start server
if (process.env.NODE_ENV !== "production") {
  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// ✅ Export for Vercel serverless
export default app;