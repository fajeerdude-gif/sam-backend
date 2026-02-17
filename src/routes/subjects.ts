import { Router, Request, Response } from 'express';
import { getDb } from '../mongo';
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { semester, branch_code } = req.query;

    let query: any = {};
    if (semester) query.semester = Number(semester);
    if (branch_code) query.branch_code = String(branch_code);

    const subjects = await db.collection('subjects').find(query).toArray();
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { code, name, semester, branch_code, type, marks } = req.body;

    const db = getDb();
    const result = await db.collection('subjects').insertOne({
      code,
      name,
      semester,
      branch_code,
      type, // 'theory' or 'lab'
      marks, // { ut: 20, external: 80 } or { sessional: 40, external: 60 }
      created_at: new Date(),
    });

    res.json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();

    await db.collection('subjects').deleteOne({ _id: new ObjectId(_id) });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export default router;