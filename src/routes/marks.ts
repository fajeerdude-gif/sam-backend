import { Router, Request, Response } from 'express';
import { getDb } from '../mongo';
import { ObjectId } from 'mongodb';

const marks = Router();

marks.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { student_id, semester, exam_type } = req.query;

    let query: any = {};
    if (student_id) query.student_id = new ObjectId(String(student_id));
    if (semester) query.semester = Number(semester);
    if (exam_type) query.exam_type = exam_type;

    const marks = await db.collection('marks')
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'students',
            localField: 'student_id',
            foreignField: '_id',
            as: 'student_data'
          }
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subject_id',
            foreignField: '_id',
            as: 'subject_data'
          }
        },
        {
          $project: {
            _id: 1,
            student_id: 1,
            subject_id: 1,
            semester: 1,
            exam_type: 1,
            marks_obtained: 1,
            total_marks: 1,
            student_roll: { $arrayElemAt: ['$student_data.roll_number', 0] },
            subject_name: { $arrayElemAt: ['$subject_data.name', 0] },
            subject_code: { $arrayElemAt: ['$subject_data.code', 0] }
          }
        }
      ])
      .toArray();

    res.json(marks);
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ error: 'Failed to fetch marks' });
  }
});

marks.post('/', async (req: Request, res: Response) => {
  try {
    const {
      student_id,
      subject_id,
      semester,
      exam_type,
      marks_obtained,
      total_marks,
      entered_by,
    } = req.body;

    const db = getDb();
    const result = await db.collection('marks').insertOne({
      student_id: new ObjectId(student_id),
      subject_id: new ObjectId(subject_id),
      semester,
      exam_type,
      marks_obtained,
      total_marks,
      entered_by,
      created_at: new Date(),
    });

    res.json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    console.error('Error creating marks:', error);
    res.status(500).json({ error: 'Failed to create marks' });
  }
});

marks.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();

    await db.collection('marks').deleteOne({ _id: new ObjectId(id) });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting marks:', error);
    res.status(500).json({ error: 'Failed to delete marks' });
  }
});

export default marks;