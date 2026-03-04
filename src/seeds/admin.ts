import { getDb, connectToDb, closeDb } from "../mongo";
import bcrypt from "bcrypt";

async function seedAdmin() {
  try {
    await connectToDb();
    const db = getDb();

    // Check if admin already exists
    const existingAdmin = await db.collection("profiles").findOne({
      email: "admin@smgs.com",
      role: "admin",
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists with email: admin@smgs.com");
      await closeDb();
      return;
    }

    // Create super admin with hardcoded credentials
    const adminEmail = "admin@smgs.com";
    const adminPassword = "Admin@123456"; // Change this to a secure password!
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const result = await db.collection("profiles").insertOne({
      email: adminEmail,
      password: hashedPassword,
      full_name: "System Administrator",
      role: "admin",
      created_at: new Date(),
    });

    console.log("✅ Super admin created successfully!");
    console.log("📧 Email: admin@smgs.com");
    console.log("🔑 Password: Admin@123456");
    console.log("⚠️  IMPORTANT: Change this password immediately in production!");
    console.log("Admin ID:", result.insertedId.toString());

    await closeDb();
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
