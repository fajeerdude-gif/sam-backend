import { Router } from 'express';
import { getDb } from '../mongo';
import { ObjectId } from 'mongodb';

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

// Update faculty details (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, assigned_subjects } = req.body;
    const db = getDb();

    // Validate faculty exists
    const faculty = await db.collection('profiles').findOne({ _id: new ObjectId(id), role: 'faculty' });
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    // Update faculty
    const updateData: any = {};
    if (full_name) updateData.full_name = full_name;
    if (assigned_subjects !== undefined) updateData.assigned_subjects = assigned_subjects;

    const result = await db.collection('profiles').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: 'Failed to update faculty' });
    }

    res.json({ success: true, message: 'Faculty updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update faculty' });
  }
});

export default router;
