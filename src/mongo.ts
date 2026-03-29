// src/mongo.ts
import { MongoClient, Db } from "mongodb";

let db: Db;
let client: MongoClient;

export async function connectToDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("❌ Please define MONGODB_URI in environment variables");

  client = new MongoClient(uri, {
    retryWrites: true,
    w: "majority",
  });

  await client.connect();
  db = client.db(process.env.MONGODB_DB || undefined);

  console.log(`✅ Connected to MongoDB: ${db.databaseName}`);
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error("Database not initialized. Call connectToDb() first");
  return db;
}

export async function closeDb() {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
  }
}