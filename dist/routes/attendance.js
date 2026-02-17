"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongo_1 = require("../mongo");
const mongodb_1 = require("mongodb");
const router = (0, express_1.Router)();
function computeStatus(periodsPresent, totalPeriods = 7) {
    if (periodsPresent >= 5)
        return "Present";
    if (periodsPresent === 4)
        return "Half Day";
    return "Absent";
}
// GET attendance by query (student_id, date range, month, year)
router.get("/", async (req, res) => {
    try {
        const db = (0, mongo_1.getDb)();
        const { student_id, date, month, year } = req.query;
        const query = {};
        if (student_id)
            query.student_id = new mongodb_1.ObjectId(String(student_id));
        if (date)
            query.date = String(date);
        if (month)
            query.month = Number(month);
        if (year)
            query.year = Number(year);
        const records = await db.collection("attendance").find(query).toArray();
        return res.json(records);
    }
    catch (error) {
        console.error("Error fetching attendance:", error);
        return res.status(500).json({ error: "Failed to fetch attendance" });
    }
});
// POST many attendance records at once
// body: { records: [{ student_id, date, periods_present, total_periods? (default 7) , marked_by }] }
router.post("/", async (req, res) => {
    try {
        const db = (0, mongo_1.getDb)();
        const { records } = req.body;
        if (!Array.isArray(records)) {
            return res.status(400).json({ error: "records array required" });
        }
        const results = { upsertedCount: 0, modifiedCount: 0 };
        for (const r of records) {
            const totalPeriods = r.total_periods ?? 7;
            const periodsPresent = Number(r.periods_present ?? 0);
            const status = computeStatus(periodsPresent, totalPeriods);
            const filter = { student_id: new mongodb_1.ObjectId(r.student_id), date: r.date };
            const update = {
                $set: {
                    total_periods: totalPeriods,
                    periods_present: periodsPresent,
                    status,
                    month: r.month ?? new Date(r.date).getMonth() + 1,
                    year: r.year ?? new Date(r.date).getFullYear(),
                    marked_by: r.marked_by ?? null,
                    updated_at: new Date(),
                },
                $setOnInsert: { created_at: new Date() },
            };
            const resUpsert = await db.collection("attendance").updateOne(filter, update, { upsert: true });
            if (resUpsert.upsertedCount)
                results.upsertedCount += resUpsert.upsertedCount;
            if (resUpsert.modifiedCount)
                results.modifiedCount += resUpsert.modifiedCount;
        }
        return res.json(results);
    }
    catch (error) {
        console.error("Error saving attendance:", error);
        return res.status(500).json({ error: "Failed to save attendance" });
    }
});
// DELETE attendance record by ID
router.delete("/:id", async (req, res) => {
    try {
        const db = (0, mongo_1.getDb)();
        const id = req.params.id;
        await db.collection("attendance").deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return res.json({ success: true });
    }
    catch (error) {
        console.error("Error deleting attendance:", error);
        return res.status(500).json({ error: "Failed to delete attendance" });
    }
});
exports.default = router;
