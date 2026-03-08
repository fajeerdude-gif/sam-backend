import { Router, Request, Response } from 'express';
import { getDb } from '../mongo';
import { ObjectId } from 'mongodb';

const router = Router();

// Get all notifications
router.get('/', async (req: Request, res: Response) => {
  try {
    const { target_year } = req.query;
    const db = getDb();

    let query: any = {};
    if (target_year) {
      query.target_year = Number(target_year);
    }

    const notifications = await db.collection('notifications')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Create new notification
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('=== NOTIFICATION POST REQUEST ===');
    console.log('Received body:', JSON.stringify(req.body, null, 2));
    console.log('Content-Type:', req.headers['content-type']);
    
    const { title, content, type, target_year, created_by, created_by_role } = req.body;

    console.log('Extracted fields:', { title, content, type, target_year, created_by, created_by_role });

    if (!title || !content || !type) {
      console.log('Validation failed:', { title: !!title, content: !!content, type: !!type });
      return res.status(400).json({ error: 'Title, content, and type are required' });
    }

    const db = getDb();
    const result = await db.collection('notifications').insertOne({
      title,
      content,
      type, // 'notification', 'assignment', 'update'
      target_year: target_year ? Number(target_year) : null, // null means all years
      created_by,
      created_by_role,
      created_at: new Date(),
    });

    res.status(201).json({
      success: true,
      notification: {
        _id: result.insertedId,
        title,
        content,
        type,
        target_year,
        created_by,
        created_by_role,
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Delete notification
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const result = await db.collection('notifications').deleteOne({ _id: new ObjectId(id as string) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;