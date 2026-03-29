import { Router, Request, Response } from "express";
import { getDb } from "../mongo";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

const router = Router();

// ✅ SIGNUP
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const db = getDb();
    const existing = await db.collection("profiles").findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.collection("profiles").insertOne({
      email,
      password: hashed,
      full_name,
      role: "student",
      created_at: new Date(),
    });

    res.status(201).json({
      success: true,
      user: {
        id: result.insertedId.toString(),
        email,
        full_name,
        role: "student",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ✅ SIGNIN
router.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email & password required" });

    const db = getDb();
    const user = await db.collection("profiles").findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signin failed" });
  }
});

export default router;