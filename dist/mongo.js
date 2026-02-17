"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDb = connectToDb;
exports.getDb = getDb;
exports.closeDb = closeDb;
const mongodb_1 = require("mongodb");
let db;
let client;
async function connectToDb() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI not set in .env');
        }
        console.log('🔗 Connecting to MongoDB...');
        client = new mongodb_1.MongoClient(uri, {
            tlsAllowInvalidCertificates: process.env.NODE_ENV !== 'production', // Dev fix for Atlas SSL
            retryWrites: true,
            w: 'majority',
        });
        await client.connect();
        db = client.db();
        console.log('✅ Connected to MongoDB');
        return db;
    }
    catch (error) {
        console.error('❌ Failed to connect to DB:', error);
        throw error;
    }
}
function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call connectToDb() first');
    }
    return db;
}
async function closeDb() {
    if (client) {
        await client.close();
        console.log('✅ MongoDB connection closed');
    }
}
