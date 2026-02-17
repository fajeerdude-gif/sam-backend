import { Router, Request, Response } from "express";
import { getDb } from "../mongo";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role } = req.body;

    // ✅ Role is optional, defaults to 'student'
    if (!email || typeof email !== "string")
      return res.status(400).json({ error: "Valid email required" });
    if (!password || password.length < 6)
      return res.status(400).json({ error: "Password min 6 chars" });
    if (!full_name || typeof full_name !== "string")
      return res.status(400).json({ error: "Full name required" });

    const userRole =
      role && ["student", "faculty", "admin"].includes(role)
        ? role
        : "student"; // ✅ Default to student

    const db = getDb();
    const existing = await db.collection("profiles").findOne({ email });

    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection("profiles").insertOne({
      email,
      password: hashedPassword,
      full_name,
      role: userRole,
      created_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      user: {
        id: result.insertedId.toString(),
        email,
        full_name,
        role: userRole,
      },
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    return res.status(500).json({ error: "Failed to sign up" });
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email, password, roll_number, role } = req.body;
    console.log("📝 Sign-in attempt:", { roll_number, role, email: email ? "***" : "none" });

    const db = getDb();
    let user;

    // For students, allow login with roll_number
    if (role === "student" && roll_number) {
      if (!roll_number || !password) {
        return res.status(400).json({ error: "Roll number and password required" });
      }
      
      const student = await db.collection("students").findOne({ roll_number });
      console.log("🔍 Student lookup:", { roll_number, found: !!student, profile_id: student?.profile_id });
      
      if (!student) {
        console.log("❌ Student not found:", roll_number);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      user = await db.collection("profiles").findOne({ _id: new ObjectId(student.profile_id) });
      console.log("🔍 Profile lookup:", { found: !!user, email: user?.email });
      
      if (!user) {
        console.log("❌ Profile not found for student:", roll_number);
        return res.status(401).json({ error: "Invalid credentials" });
      }
    } else {
      // Faculty and others use email
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      user = await db.collection("profiles").findOne({ email });
      if (!user) {
        console.log("❌ User not found:", email);
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }

    const match = await bcrypt.compare(password, user.password);
    console.log("🔐 Password match:", match);
    
    if (!match) {
      console.log("❌ Password mismatch for user:", user.email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("✅ Sign-in successful:", user.email);
    return res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Signin error:", error);
    return res.status(500).json({ error: "Failed to sign in" });
  }
});

router.get("/session", (req: Request, res: Response) => {
  try {
    return res.json({ success: true, user: null });
  } catch (error) {
    console.error("❌ Session error:", error);
    return res.status(500).json({ error: "Failed to get session" });
  }
});

// Debug endpoint - check if student exists
router.get("/debug/student/:rollNumber", async (req: Request, res: Response) => {
  try {
    const { rollNumber } = req.params;
    const db = getDb();
    
    const student = await db.collection("students").findOne({ roll_number: rollNumber });
    const profile = student 
      ? await db.collection("profiles").findOne({ _id: new ObjectId(student.profile_id) })
      : null;

    return res.json({
      student: student ? { roll_number: student.roll_number, profile_id: student.profile_id } : null,
      profile: profile ? { email: profile.email, full_name: profile.full_name } : null,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return res.status(500).json({ error: "Debug error" });
  }
});

export default router;
