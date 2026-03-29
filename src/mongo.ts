import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("❌ Please define MONGODB_URI in environment variables");
}

// 🔥 GLOBAL CACHE (VERY IMPORTANT FOR VERCEL)
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDb(): Promise<Db> {
  try {
    // ✅ Reuse existing connection
    if (cachedClient && cachedDb) {
      return cachedDb;
    }

    const client = new MongoClient(uri);

    await client.connect();

    const db = client.db(process.env.MONGODB_DB || "test");

    cachedClient = client;
    cachedDb = db;

    console.log("✅ MongoDB Connected");

    return db;

  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

export function getDb(): Db {
  if (!cachedDb) {
    throw new Error("❌ DB not connected. Call connectToDb first");
  }
  return cachedDb;
}