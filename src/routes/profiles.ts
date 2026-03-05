import { Router } from 'express';
import { getDb } from '../mongo';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;
    const db = getDb();
    const profiles = db.collection('profiles');
    if (user_id) {
      const profile = await profiles.findOne({ user_id: user_id.toString() });
      return res.json({ data: profile });
    }
    const all = await profiles.find().toArray();
    res.json({ data: all });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Get all faculty
router.get('/faculty/list', async (req, res) => {
  try {
    const db = getDb();
    const faculties = await db.collection('profiles')
      .find({ role: 'faculty' })
      .project({
        _id: 1,
        email: 1,
        full_name: 1,
        created_at: 1,
        assigned_subjects: 1,
      })
      .toArray();
    
    res.json(faculties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch faculty list' });
  }
});

export default router;
