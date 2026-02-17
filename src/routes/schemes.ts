import { Router, Request, Response } from "express";
import { getDb } from "../mongo";
import { ObjectId } from "mongodb";

const router = Router();

// CRUD for schemes/batches/years/semesters/branches/subjects
router.get("/", async (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const schemes = await db.collection("schemes").find({}).toArray();
    res.json(schemes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schemes" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const payload = req.body; // full hierarchical object
    const result = await db.collection("schemes").insertOne({ ...payload, created_at: new Date() });
    res.json({ _id: result.insertedId, ...payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create scheme" });
  }
});

export default router;