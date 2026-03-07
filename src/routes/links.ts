import { Router, Request, Response } from 'express';
import { getDb } from '../mongo';
import { ObjectId } from 'mongodb';

const router = Router();

// Get all links/updates
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const links = await db.collection('links')
      .find()
      .sort({ created_at: -1 })
      .toArray();
    res.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// Create new link/update
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, url, file_url, file_name, created_by, created_by_role } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const db = getDb();
    const result = await db.collection('links').insertOne({
      title,
      description,
      url,
      file_url,
      file_name,
      created_by,
      created_by_role,
      created_at: new Date(),
    });

    res.status(201).json({
      success: true,
      link: {
        _id: result.insertedId,
        title,
        description,
        url,
        file_url,
        file_name,
        created_by,
        created_by_role,
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ error: 'Failed to create link' });
  }
});

// Delete link/update
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const result = await db.collection('links').deleteOne({ _id: new ObjectId(id as string) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json({ success: true, message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

export default router;