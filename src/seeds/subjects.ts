import { connectToDb, getDb } from '../mongo';

async function seedSubjects() {
  await connectToDb();
  const db = getDb();

  const subjects = [
    // Year 1 - Semester 1
    { code: 'CM101', name: 'English', semester: 1, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM102', name: 'Mathematics – I', semester: 1, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM103', name: 'Physics', semester: 1, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM104', name: 'Chemistry', semester: 1, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM105', name: 'BCE', semester: 1, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM106', name: 'Programming in C', semester: 1, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM107', name: 'Engineering Drawing', semester: 1, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'CM108', name: 'C Lab', semester: 1, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'CM109', name: 'Physics Lab', semester: 1, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'CM110', name: 'Chemistry Lab', semester: 1, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'CM111', name: 'Computer Fundamentals Lab', semester: 1, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },

    // Year 1 - Semester 2 (add your semester 2 subjects here)
    { code: 'CM201', name: 'Mathematics – II', semester: 2, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    // ... add more semester 2 subjects

    // Polytechnic AP - Year 1 Semester 1
    { code: 'AP101', name: 'English', semester: 1, branch_code: 'AP', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'AP102', name: 'Mathematics – I', semester: 1, branch_code: 'AP', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'AP103', name: 'Applied Physics', semester: 1, branch_code: 'AP', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'AP104', name: 'Workshop Practice', semester: 1, branch_code: 'AP', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'AP105', name: 'Engineering Graphics', semester: 1, branch_code: 'AP', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'AP106', name: 'Basic Electrical', semester: 1, branch_code: 'AP', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'AP107', name: 'Computer Fundamentals Lab', semester: 1, branch_code: 'AP', type: 'lab', marks: { sessional: 40, external: 60 } },

    // Polytechnic AP - Year 1 Semester 2
    { code: 'AP201', name: 'Mathematics – II', semester: 2, branch_code: 'AP', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'AP202', name: 'Applied Chemistry', semester: 2, branch_code: 'AP', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'AP203', name: 'Basic Electronics', semester: 2, branch_code: 'AP', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'AP204', name: 'Environmental Studies', semester: 2, branch_code: 'AP', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'AP205', name: 'Communication Skills', semester: 2, branch_code: 'AP', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'AP206', name: 'Workshop Lab', semester: 2, branch_code: 'AP', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'AP207', name: 'Electronics Lab', semester: 2, branch_code: 'AP', type: 'lab', marks: { sessional: 40, external: 60 } },

    // Year 2 - Semester 3
    { code: 'CM301', name: 'Mathematics – II', semester: 3, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM302', name: 'Digital Electronics', semester: 3, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM303', name: 'Operating System', semester: 3, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM304', name: 'DSC', semester: 3, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM305', name: 'DBMS', semester: 3, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM306', name: 'DE Lab', semester: 3, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'CM307', name: 'DSC Lab', semester: 3, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'CM308', name: 'DBMS Lab', semester: 3, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'CM309', name: 'Multimedia Lab', semester: 3, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },

    // Year 2 - Semester 4
    { code: 'CM401', name: 'Software Engineering', semester: 4, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM402', name: 'Web Technologies', semester: 4, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM403', name: 'Computer Organization & Microprocessor', semester: 4, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM404', name: 'Java Programming', semester: 4, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM405', name: 'Computer Networks & Cyber Security', semester: 4, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM406', name: 'WT Lab', semester: 4, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'CM407', name: 'Java Lab', semester: 4, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'CM408', name: 'Communication Skills Lab', semester: 4, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'CM409', name: 'CN & CS Lab', semester: 4, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },

    // Year 3 - Semester 5
    { code: 'CM501', name: 'IME', semester: 5, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM502', name: 'Big Data & Cloud Computing', semester: 5, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM503', name: 'Android Programming', semester: 5, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM504', name: 'IOT', semester: 5, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM505', name: 'Python Programming', semester: 5, branch_code: 'DCME', type: 'theory', marks: { ut: 20, external: 80 } },
    { code: 'CM506', name: 'Android Programming Lab', semester: 5, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'CM507', name: 'Python Lab', semester: 5, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'CM508', name: 'Life Skills Lab', semester: 5, branch_code: 'DCME', type: 'lab', marks: { sessional: 40, external: 60 } },
    { code: 'CM509', name: 'Project Work', semester: 5, branch_code: 'DCME', type: 'project', marks: { sessional: 40, external: 60 } },

    // Year 3 - Semester 6
    { code: 'CM601', name: 'Industrial Training', semester: 6, branch_code: 'DCME', type: 'training', marks: { sessional: 240, external: 60 } },
  ];

  await db.collection('subjects').deleteMany({}); // Clear existing
  const result = await db.collection('subjects').insertMany(subjects);
  console.log(`✅ Seeded ${result.insertedCount} subjects`);
  process.exit(0);
}

seedSubjects().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});