import { MongoClient, Db } from "mongodb";

let cachedDb: Db | null = null;
let cachedClient: MongoClient | null = null;

export async function connectToDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb; // Return cached instance if available
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    throw new Error("❌ Please define MONGODB_URI in environment variables");
  }

  const client = new MongoClient(uri, { retryWrites: true, w: "majority" });
  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  console.log("✅ Connected to MongoDB:", dbName);
  return db;
}

export function getDb(): Db {
  if (!cachedDb) throw new Error("❌ Database not initialized. Call connectToDb() first");
  return cachedDb;
}

export async function closeDb() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log("✅ MongoDB connection closed");
  }
}