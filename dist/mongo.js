"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDb = connectToDb;
exports.getDb = getDb;
const mongodb_1 = require("mongodb");
let client;
let db;
async function connectToDb() {
    const uri = process.env.MONGODB_URI;
    if (!uri)
        throw new Error('MONGODB_URI not set');
    client = new mongodb_1.MongoClient(uri);
    await client.connect();
    db = client.db(process.env.MONGODB_DB || 'smgs');
    console.log('Connected to MongoDB');
    return db;
}
function getDb() {
    if (!db)
        throw new Error('DB not initialized');
    return db;
}
