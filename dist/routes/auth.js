"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongo_1 = require("../mongo");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_in_env';
router.post('/signup', async (req, res) => {
    try {
        const { email, password, fullName, role } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Missing credentials' });
        const db = (0, mongo_1.getDb)();
        const users = db.collection('users');
        const profiles = db.collection('profiles');
        const existing = await users.findOne({ email });
        if (existing)
            return res.status(409).json({ error: 'User already exists' });
        const hashed = await bcrypt_1.default.hash(password, 10);
        const result = await users.insertOne({ email, password: hashed, createdAt: new Date() });
        const userId = result.insertedId;
        await profiles.insertOne({ user_id: userId?.toString?.() ?? String(userId), email, full_name: fullName || '', role: role || 'student', created_at: new Date() });
        const token = jsonwebtoken_1.default.sign({ sub: userId.toString(), email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: userId.toString(), email } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal error' });
    }
});
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Missing credentials' });
        const db = (0, mongo_1.getDb)();
        const users = db.collection('users');
        const user = await users.findOne({ email });
        if (!user)
            return res.status(401).json({ error: 'Invalid credentials' });
        const ok = await bcrypt_1.default.compare(password, user.password);
        if (!ok)
            return res.status(401).json({ error: 'Invalid credentials' });
        const idStr = user._id?.toString ? user._id.toString() : String(user._id ?? user.id);
        const token = jsonwebtoken_1.default.sign({ sub: idStr, email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: idStr, email } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal error' });
    }
});
router.get('/session', async (req, res) => {
    const auth = req.headers.authorization?.split(' ')[1];
    if (!auth)
        return res.json({ session: null });
    try {
        const payload = jsonwebtoken_1.default.verify(auth, JWT_SECRET);
        res.json({ session: { user: { id: payload.sub, email: payload.email } } });
    }
    catch (err) {
        return res.json({ session: null });
    }
});
exports.default = router;
