"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongo_1 = require("../mongo");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { profile_id } = req.query;
        const db = (0, mongo_1.getDb)();
        const students = db.collection('students');
        if (profile_id) {
            const student = await students.findOne({ profile_id: profile_id.toString() });
            return res.json({ data: student });
        }
        const all = await students.find().toArray();
        res.json({ data: all });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal error' });
    }
});
router.post('/', async (req, res) => {
    try {
        const db = (0, mongo_1.getDb)();
        const students = db.collection('students');
        const result = await students.insertOne({ ...req.body, created_at: new Date() });
        res.json({ data: { id: result.insertedId, ...req.body } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal error' });
    }
});
exports.default = router;
