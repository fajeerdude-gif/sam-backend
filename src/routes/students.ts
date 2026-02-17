import { Router, Request, Response } from 'express';
import { getDb } from '../mongo';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { profile_id, year_of_study, branch_code } = req.query;

    let query: any = {};
    if (profile_id) query.profile_id = profile_id;
    if (year_of_study) query.year_of_study = Number(year_of_study);
    if (branch_code) query.branch_code = branch_code;

    // Use aggregation to join profile data so frontend can display student full name
    const pipeline: any[] = [];
    if (Object.keys(query).length) pipeline.push({ $match: query });
    // sort by created_at desc (most recent first)
    pipeline.push({ $sort: { created_at: -1 } });
    // lookup profile by converting stored profile_id (string) to ObjectId
    pipeline.push({
      $addFields: { profileObjId: { $cond: [{ $ifNull: ['$profile_id', false] }, { $toObjectId: '$profile_id' }, null] } },
    });
    pipeline.push({
      $lookup: {
        from: 'profiles',
        localField: 'profileObjId',
        foreignField: '_id',
        as: 'profile',
      },
    });
    pipeline.push({ $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } });
    pipeline.push({
      $project: {
        roll_number: 1,
        year_of_study: 1,
        gender: 1,
        phone_number: 1,
        branch_code: 1,
        created_at: 1,
        profile_id: 1,
        full_name: '$profile.full_name',
        email: '$profile.email',
      },
    });

    const students = await db.collection('students').aggregate(pipeline).toArray();
    return res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ error: 'Failed to fetch students' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { roll_number, full_name, password, year_of_study, gender, phone_number, branch_code } = req.body;

    if (!roll_number || !year_of_study || !branch_code || !full_name) {
      return res.status(400).json({ error: 'Roll number, name, year, and branch are required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = getDb();

    // Check if student already exists
    const existingStudent = await db.collection('students').findOne({ roll_number });
    if (existingStudent) {
      return res.status(409).json({ error: 'Student with this roll number already exists' });
    }

    // Create profile for student with email as roll_number@student.local
    const email = `${roll_number}@student.local`;
    const existingProfile = await db.collection('profiles').findOne({ email });
    
    if (existingProfile) {
      return res.status(409).json({ error: 'Profile already exists for this student' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileResult = await db.collection('profiles').insertOne({
      email,
      password: hashedPassword,
      full_name,
      role: 'student',
      created_at: new Date(),
    });

    // Create student record
    const studentResult = await db.collection('students').insertOne({
      roll_number,
      year_of_study: Number(year_of_study),
      gender: gender || null,
      phone_number: phone_number || null,
      branch_code,
      profile_id: profileResult.insertedId.toString(),
      created_at: new Date(),
    });

    return res.status(201).json({ 
      success: true,
      student: {
        _id: studentResult.insertedId,
        roll_number,
        full_name,
        year_of_study,
        gender,
        phone_number,
        branch_code,
        profile_id: profileResult.insertedId.toString(),
      },
      message: `Student created. Login with roll number: ${roll_number}`,
    });
  } catch (error) {
    console.error('Error creating student:', error);
    return res.status(500).json({ error: 'Failed to create student' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const db = getDb();
    const result = await db.collection('students').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updated_at: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    return res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({ error: 'Failed to update student' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const db = getDb();

    // Find student to get linked profile_id
    const student = await db.collection('students').findOne({ _id: new ObjectId(id) });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete the student record
    const deleteStudent = await db.collection('students').deleteOne({ _id: new ObjectId(id) });

    // Delete all attendance records for this student
    let attendanceDeleted = 0;
    try {
      const delAttendance = await db.collection('attendance').deleteMany({ student_id: new ObjectId(id) });
      attendanceDeleted = delAttendance.deletedCount ?? 0;
    } catch (err) {
      console.error('Error deleting attendance for student', id, err);
    }

    // Delete all marks records for this student
    let marksDeleted = 0;
    try {
      const delMarks = await db.collection('marks').deleteMany({ student_id: new ObjectId(id) });
      marksDeleted = delMarks.deletedCount ?? 0;
    } catch (err) {
      console.error('Error deleting marks for student', id, err);
    }

    // Attempt to delete linked profile if present
    let profileDeleted = 0;
    try {
      if (student.profile_id) {
        // profile_id stored as string; ensure it's a valid ObjectId
        if (ObjectId.isValid(student.profile_id)) {
          const del = await db.collection('profiles').deleteOne({ _id: new ObjectId(student.profile_id) });
          profileDeleted = del.deletedCount ?? 0;
        } else {
          // fallback: try deleting by email if profile_id isn't an ObjectId
          const del = await db.collection('profiles').deleteOne({ _id: student.profile_id as any });
          profileDeleted = del.deletedCount ?? 0;
        }
      }
    } catch (err) {
      console.error('Error deleting linked profile for student', id, err);
    }

    return res.json({ success: true, studentDeleted: deleteStudent.deletedCount, attendanceDeleted, marksDeleted, profileDeleted });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({ error: 'Failed to delete student' });
  }
});

export default router;
