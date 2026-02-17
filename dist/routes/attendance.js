"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongo_1 = require("../mongo");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { date, student_id } = req.query;
        const db = (0, mongo_1.getDb)();
        const attendance = db.collection('attendance');
        const filter = {};
        if (date)
            filter.date = date.toString();
        if (student_id)
            filter.student_id = student_id.toString();
        const data = await attendance.find(filter).toArray();
        res.json({ data });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal error' });
    }
});
router.post('/', async (req, res) => {
    try {
        const db = (0, mongo_1.getDb)();
        const attendance = db.collection('attendance');
        const records = req.body.records || req.body;
        await attendance.insertMany(records.map((r) => ({ ...r, created_at: new Date() })));
        res.json({ ok: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal error' });
    }
});
router.delete('/', async (req, res) => {
    try {
        const { date } = req.query;
        const db = (0, mongo_1.getDb)();
        const attendance = db.collection('attendance');
        if (!date)
            return res.status(400).json({ error: 'date required' });
        await attendance.deleteMany({ date: date.toString() });
        res.json({ ok: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal error' });
    }
});
exports.default = router;
