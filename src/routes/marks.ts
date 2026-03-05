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

    if (!entered_by) {
      return res.status(400).json({ error: 'Faculty ID (entered_by) is required' });
    }

    const db = getDb();

    // Validate that faculty has this subject assigned
    const facultyProfile = await db.collection('profiles').findOne({
      _id: new ObjectId(entered_by),
      role: 'faculty',
    });

    if (!facultyProfile) {
      return res.status(403).json({ error: 'Faculty not found' });
    }

    if (!facultyProfile.assigned_subjects || !facultyProfile.assigned_subjects.includes(subject_id)) {
      return res.status(403).json({ error: 'You are not assigned to this subject' });
    }

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

marks.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      marks_obtained,
      total_marks,
      exam_type,
      entered_by,
    } = req.body;

    if (!entered_by) {
      return res.status(400).json({ error: 'Faculty ID (entered_by) is required' });
    }

    const db = getDb();

    // Get the existing mark to check faculty assignment
    const existingMark = await db.collection('marks').findOne({ _id: new ObjectId(id as string) });
    if (!existingMark) {
      return res.status(404).json({ error: 'Mark not found' });
    }

    // Validate that faculty has this subject assigned
    const facultyProfile = await db.collection('profiles').findOne({
      _id: new ObjectId(entered_by),
      role: 'faculty',
    });

    if (!facultyProfile) {
      return res.status(403).json({ error: 'Faculty not found' });
    }

    const subjectId = existingMark.subject_id.toString();
    if (!facultyProfile.assigned_subjects || !facultyProfile.assigned_subjects.includes(subjectId)) {
      return res.status(403).json({ error: 'You are not assigned to this subject' });
    }

    // Update the mark
    const updateData: any = {};
    if (marks_obtained !== undefined) updateData.marks_obtained = marks_obtained;
    if (total_marks !== undefined) updateData.total_marks = total_marks;
    if (exam_type !== undefined) updateData.exam_type = exam_type;
    updateData.updated_at = new Date();

    await db.collection('marks').updateOne(
      { _id: new ObjectId(id as string) },
      { $set: updateData }
    );

    res.json({ success: true, message: 'Mark updated successfully' });
  } catch (error) {
    console.error('Error updating marks:', error);
    res.status(500).json({ error: 'Failed to update marks' });
  }
});

marks.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const db = getDb();

    await db.collection('marks').deleteOne({ _id: new ObjectId(id) });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting marks:', error);
    res.status(500).json({ error: 'Failed to delete marks' });
  }
});

export default marks;