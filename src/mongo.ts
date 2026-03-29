import { MongoClient, Db } from 'mongodb';

let db: Db;
let client: MongoClient;
let memServer: any = null;

export async function connectToDb() {
  const uri = process.env.MONGODB_URI;

  // Try connecting to provided URI first
  if (uri) {
    try {
      client = new MongoClient(uri, {
        tlsAllowInvalidCertificates: process.env.NODE_ENV !== 'production',
        retryWrites: true,
        w: 'majority',
      });

      await client.connect();
      db = client.db(process.env.MONGODB_DB || undefined);
      console.log('Connected to MongoDB');
      return db;
    } catch (error) {
      console.error('Failed to connect to DB using MONGODB_URI:', error);
      // fall through to attempt in-memory server in dev
    }
  }

  // If running in development, start an in-memory MongoDB for convenience
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memServer = await MongoMemoryServer.create();
      const memUri = memServer.getUri();
      client = new MongoClient(memUri, { retryWrites: true, w: 'majority' });
      await client.connect();
      db = client.db(process.env.MONGODB_DB || 'smgs_dev');
      console.log('Started in-memory MongoDB for development');
      return db;
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB:', memErr);
      throw memErr;
    }
  }

  throw new Error('Could not connect to any MongoDB instance. Set MONGODB_URI or run a local MongoDB');
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDb() first');
  }
  return db;
}

export async function closeDb() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  if (memServer) {
    await memServer.stop();
    console.log('In-memory MongoDB stopped');
  }
}