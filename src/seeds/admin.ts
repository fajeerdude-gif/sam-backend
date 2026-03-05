import dotenv from "dotenv";
import { getDb, connectToDb, closeDb } from "../mongo";
import bcrypt from "bcrypt";

// Load .env for standalone seed script (ensures MONGODB_URI is available)
dotenv.config();

async function seedAdmin() {
  try {
    await connectToDb();
    const db = getDb();

    // Delete existing admin if present (to re-seed with correct password)
    await db.collection("profiles").deleteOne({
      email: "admin@smgs.com",
      role: "admin",
    });

    // Create super admin with hardcoded credentials
    const adminEmail = "admin@smgs.com";
    const adminPassword = "Admin@123456";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const result = await db.collection("profiles").insertOne({
      email: adminEmail,
      password: hashedPassword,
      full_name: "System Administrator",
      role: "admin",
      created_at: new Date(),
    });


    await closeDb();
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
