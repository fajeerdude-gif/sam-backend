import { Router, Request, Response } from "express";
import { getDb } from "../mongo";
import { ObjectId } from "mongodb";

const router = Router();

function computeStatus(periodsPresent: number, totalPeriods = 7) {
  if (periodsPresent >= 5) return "Present";
  if (periodsPresent === 4) return "Half Day";
  return "Absent";
}

// GET attendance by query (student_id, date range, month, year)
router.get("/", async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { student_id, date, month, year } = req.query;
    const query: any = {};

    if (student_id) query.student_id = new ObjectId(String(student_id));
    if (date) query.date = String(date);
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    const records = await db.collection("attendance").find(query).toArray();
    return res.json(records);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

// POST many attendance records at once
// body: { records: [{ student_id, date, periods_present, total_periods? (default 7) , marked_by }] }
router.post("/", async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { records } = req.body;

    if (!Array.isArray(records)) {
      return res.status(400).json({ error: "records array required" });
    }

    const results: { upsertedCount: number; modifiedCount: number } = { upsertedCount: 0, modifiedCount: 0 };

    for (const r of records) {
      const totalPeriods = r.total_periods ?? 7;
      const periodsPresent = Number(r.periods_present ?? 0);
      const status = computeStatus(periodsPresent, totalPeriods);

      const filter = { student_id: new ObjectId(r.student_id), date: r.date };
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
      if (resUpsert.upsertedCount) results.upsertedCount += resUpsert.upsertedCount as number;
      if (resUpsert.modifiedCount) results.modifiedCount += resUpsert.modifiedCount as number;
    }

    return res.json(results);
  } catch (error) {
    console.error("Error saving attendance:", error);
    return res.status(500).json({ error: "Failed to save attendance" });
  }
});

// DELETE attendance record by ID
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const db = getDb();
    await db.collection("attendance").deleteOne({ _id: new ObjectId(req.params.id) });
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return res.status(500).json({ error: "Failed to delete attendance" });
  }
});

export default router;
