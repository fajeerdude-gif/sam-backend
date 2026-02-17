import { Router, Request, Response } from 'express';
import { getDb } from '../mongo';
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { year } = req.query; // Optional: filter by student year (1, 2, or 3)

    // Build student query (if year is provided)
    let studentQuery: any = {};
    if (year) {
      studentQuery.year_of_study = Number(year);
    }

    // Get students in scope
    const studentsCount = await db.collection('students').countDocuments(studentQuery);
    
    // Get all students in scope to find their IDs for attendance lookup
    const studentIds = await db.collection('students').find(studentQuery).project({ _id: 1 }).toArray();
    const studentIdSet = new Set(studentIds.map((s: any) => s._id.toString()));

    const totalSubjects = await db.collection('subjects').countDocuments();

    // Today's date string (assumes attendance.date stored as ISO string YYYY-MM-DD)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    // Count attendance today for students in scope
    let attendanceQuery: any = { date: todayStr, status: 'Present' };
    if (studentIdSet.size > 0) {
      const studentIdArray = Array.from(studentIdSet).map(id => new ObjectId(id));
      attendanceQuery.student_id = { $in: studentIdArray };
    }
    const attendanceToday = await db.collection('attendance').countDocuments(attendanceQuery);

    // Average attendance for current month: average of (periods_present / total_periods) * 100
    const month = today.getMonth() + 1;
    const calendarYear = today.getFullYear();

    let attendanceMatch: any = { month: month, year: calendarYear };
    if (studentIdSet.size > 0) {
      const studentIdArray = Array.from(studentIdSet).map(id => new ObjectId(id));
      attendanceMatch.student_id = { $in: studentIdArray };
    }

    const agg = await db.collection('attendance').aggregate([
      { $match: attendanceMatch },
      { $project: { pct: { $multiply: [{ $divide: ['$periods_present', '$total_periods'] }, 100] } } },
      { $group: { _id: null, avgPct: { $avg: '$pct' } } },
    ]).toArray();

    const avgAttendance = agg[0]?.avgPct ? Math.round(agg[0].avgPct * 10) / 10 : 0; // one decimal

    res.json({
      totalStudents: studentsCount,
      attendanceToday,
      avgAttendance,
      totalSubjects,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;