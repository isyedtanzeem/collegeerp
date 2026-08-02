import User, { UserRole } from '../models/User.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Book from '../models/Book.js';
import Notice from '../models/Notice.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';

export const seedDatabase = async (): Promise<void> => {
  try {
    // 6. Seed Subjects if empty regardless of user count
    const subjectCount = await Subject.countDocuments();
    if (subjectCount === 0) {
      await Subject.create([
        {
          name: 'Data Structures & Algorithms',
          code: 'CS201',
          credits: 4,
          semester: 3,
          department: 'Computer Science & Engineering',
          facultyName: 'Dr. Alan Turing',
          type: 'THEORY',
          status: 'ACTIVE',
        },
        {
          name: 'Database Management Systems',
          code: 'CS302',
          credits: 4,
          semester: 4,
          department: 'Computer Science & Engineering',
          facultyName: 'Dr. Alan Turing',
          type: 'THEORY',
          status: 'ACTIVE',
        },
        {
          name: 'Computer Networks Lab',
          code: 'CS303L',
          credits: 2,
          semester: 5,
          department: 'Computer Science & Engineering',
          facultyName: 'Prof. Robert Langdon',
          type: 'PRACTICAL',
          status: 'ACTIVE',
        },
        {
          name: 'Digital Logic & Circuit Design',
          code: 'EE101',
          credits: 4,
          semester: 1,
          department: 'Electrical Engineering',
          facultyName: 'Dr. Nikola Tesla',
          type: 'THEORY',
          status: 'ACTIVE',
        },
        {
          name: 'Thermodynamics & Heat Transfer',
          code: 'ME202',
          credits: 3,
          semester: 3,
          department: 'Mechanical Engineering',
          facultyName: 'Dr. James Watt',
          type: 'THEORY',
          status: 'ACTIVE',
        },
        {
          name: 'Machine Learning & AI',
          code: 'CS405',
          credits: 4,
          semester: 7,
          department: 'Computer Science & Engineering',
          facultyName: 'Unassigned',
          type: 'ELECTIVE',
          status: 'ACTIVE',
        },
      ]);
      console.log('[Seed] Default subjects seeded successfully.');
    }

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seed] User records exist. Skipping initial user seeding.');
      return;
    }

    console.log('[Seed] Seeding default demo data across all 7 ERP roles...');

    // 1. Seed Demo Users for all 7 Roles
    const defaultPassword = 'password123';

    const usersToSeed: {
      name: string;
      email: string;
      role: UserRole;
      department?: string;
      designation?: string;
      enrollmentNo?: string;
      employeeId?: string;
      phone?: string;
    }[] = [
      {
        name: 'Dr. Arthur Pendelton',
        email: 'superadmin@college.edu',
        role: 'SUPER_ADMIN',
        department: 'Administration',
        designation: 'System Administrator',
        employeeId: 'EMP-SA-001',
        phone: '+1 555-0100',
      },
      {
        name: 'Dr. Eleanor Vance',
        email: 'principal@college.edu',
        role: 'PRINCIPAL',
        department: 'Executive Office',
        designation: 'College Principal',
        employeeId: 'EMP-PR-001',
        phone: '+1 555-0101',
      },
      {
        name: 'Prof. Robert Langdon',
        email: 'hod.cs@college.edu',
        role: 'HOD',
        department: 'Computer Science',
        designation: 'Head of Department - CS',
        employeeId: 'EMP-HOD-010',
        phone: '+1 555-0102',
      },
      {
        name: 'Dr. Alan Turing',
        email: 'faculty@college.edu',
        role: 'FACULTY',
        department: 'Computer Science',
        designation: 'Associate Professor',
        employeeId: 'EMP-FAC-102',
        phone: '+1 555-0103',
      },
      {
        name: 'John Doe',
        email: 'student@college.edu',
        role: 'STUDENT',
        department: 'Computer Science',
        designation: 'Undergraduate',
        enrollmentNo: 'CS2026-042',
        phone: '+1 555-0104',
      },
      {
        name: 'Sarah Connor',
        email: 'accountant@college.edu',
        role: 'ACCOUNTANT',
        department: 'Finance & Accounts',
        designation: 'Senior Accountant',
        employeeId: 'EMP-ACC-005',
        phone: '+1 555-0105',
      },
      {
        name: 'Giles Rupert',
        email: 'librarian@college.edu',
        role: 'LIBRARIAN',
        department: 'Central Library',
        designation: 'Chief Librarian',
        employeeId: 'EMP-LIB-002',
        phone: '+1 555-0106',
      },
    ];

    for (const u of usersToSeed) {
      await User.create({
        ...u,
        password: defaultPassword,
      });
    }

    // 2. Seed Departments
    await Department.create([
      {
        name: 'Computer Science & Engineering',
        code: 'CSE',
        hodName: 'Prof. Robert Langdon',
        description: 'Focuses on software engineering, AI, networking, and algorithms.',
        totalFaculties: 18,
        totalStudents: 320,
      },
      {
        name: 'Electrical Engineering',
        code: 'EEE',
        hodName: 'Dr. Nikola Tesla',
        description: 'Covers power electronics, circuit design, and telecommunications.',
        totalFaculties: 14,
        totalStudents: 240,
      },
      {
        name: 'Mechanical Engineering',
        code: 'MECH',
        hodName: 'Dr. James Watt',
        description: 'Focuses on robotics, thermodynamics, and manufacturing systems.',
        totalFaculties: 12,
        totalStudents: 210,
      },
      {
        name: 'Business Administration',
        code: 'MBA',
        hodName: 'Prof. Warren Buffett',
        description: 'Covers financial management, marketing strategies, and operations.',
        totalFaculties: 10,
        totalStudents: 180,
      },
    ]);

    // 3. Seed Courses
    await Course.create([
      {
        title: 'Data Structures & Algorithms',
        code: 'CS201',
        department: 'Computer Science',
        semester: 3,
        credits: 4,
        facultyName: 'Dr. Alan Turing',
        description: 'Arrays, Trees, Graphs, Sorting algorithms, and Time complexity.',
      },
      {
        title: 'Database Management Systems',
        code: 'CS302',
        department: 'Computer Science',
        semester: 4,
        credits: 4,
        facultyName: 'Dr. Alan Turing',
        description: 'Relational databases, SQL, Indexing, and MongoDB document modeling.',
      },
      {
        title: 'Operating Systems & Architecture',
        code: 'CS304',
        department: 'Computer Science',
        semester: 4,
        credits: 3,
        facultyName: 'Prof. Robert Langdon',
        description: 'Process scheduling, memory virtualization, and file systems.',
      },
    ]);

    // 4. Seed Books
    await Book.create([
      {
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Cormen, Leiserson, Rivest, Stein',
        isbn: '978-0262033848',
        category: 'Computer Science',
        totalCopies: 15,
        availableCopies: 11,
        locationRack: 'Rack CS-01',
      },
      {
        title: 'Database System Concepts',
        author: 'Silberschatz, Korth, Sudarshan',
        isbn: '978-0073523323',
        category: 'Computer Science',
        totalCopies: 10,
        availableCopies: 8,
        locationRack: 'Rack CS-03',
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        category: 'Software Engineering',
        totalCopies: 8,
        availableCopies: 5,
        locationRack: 'Rack SE-02',
      },
    ]);

    // 5. Seed Notices
    await Notice.create([
      {
        title: 'Mid-Semester Examination Schedule Released',
        content: 'The mid-term examination timetable for Semester 4 and 6 has been published on the student portal.',
        category: 'EXAM',
        targetRole: 'ALL',
        postedBy: 'Academic Cell',
        isImportant: true,
      },
      {
        title: 'Annual TechFest 2026 Registration Open',
        content: 'Registration for hackathons, robotics competitions, and paper presentations is now open for all departments.',
        category: 'EVENT',
        targetRole: 'ALL',
        postedBy: 'Student Affairs',
        isImportant: false,
      },
      {
        title: 'Departmental Faculty Meeting',
        content: 'All CS Department faculty members are requested to assemble in Conference Room B at 3:00 PM on Friday.',
        category: 'ACADEMIC',
        targetRole: 'FACULTY',
        postedBy: 'Prof. Robert Langdon (HOD)',
        isImportant: true,
      },
    ]);

    // 6. Seed Students if empty
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      await Student.create([
        {
          admissionNumber: 'ADM2026001',
          studentId: 'STU2026001',
          name: 'Aarav Sharma',
          email: 'aarav.sharma@student.edu',
          phone: '+91 98765 43210',
          dob: '2004-05-14',
          gender: 'MALE',
          bloodGroup: 'B+',
          department: 'Computer Science & Engineering',
          course: 'B.Tech Computer Science & Engineering',
          semester: 4,
          section: 'A',
          guardian: {
            name: 'Rajesh Sharma',
            phone: '+91 98111 22334',
            relation: 'Father',
          },
          address: '42 MG Road, Sector 14, New Delhi',
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          status: 'ACTIVE',
        },
        {
          admissionNumber: 'ADM2026002',
          studentId: 'STU2026002',
          name: 'Ananya Verma',
          email: 'ananya.v@student.edu',
          phone: '+91 98765 43211',
          dob: '2004-09-20',
          gender: 'FEMALE',
          bloodGroup: 'O+',
          department: 'Computer Science & Engineering',
          course: 'B.Tech Computer Science & Engineering',
          semester: 4,
          section: 'B',
          guardian: {
            name: 'Sunita Verma',
            phone: '+91 98222 33445',
            relation: 'Mother',
          },
          address: '108 Park Street, Block C, Kolkata',
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
          status: 'ACTIVE',
        },
        {
          admissionNumber: 'ADM2026003',
          studentId: 'STU2026003',
          name: 'Rohan Gupta',
          email: 'rohan.gupta@student.edu',
          phone: '+91 98765 43212',
          dob: '2003-11-08',
          gender: 'MALE',
          bloodGroup: 'A+',
          department: 'Electrical Engineering',
          course: 'B.Tech Electrical Engineering',
          semester: 6,
          section: 'A',
          guardian: {
            name: 'Sanjay Gupta',
            phone: '+91 98333 44556',
            relation: 'Father',
          },
          address: '15 Brigade Road, Bengaluru',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
          status: 'ACTIVE',
        },
        {
          admissionNumber: 'ADM2026004',
          studentId: 'STU2026004',
          name: 'Priya Iyer',
          email: 'priya.iyer@student.edu',
          phone: '+91 98765 43213',
          dob: '2005-02-18',
          gender: 'FEMALE',
          bloodGroup: 'AB+',
          department: 'Mechanical Engineering',
          course: 'B.Tech Mechanical Engineering',
          semester: 2,
          section: 'A',
          guardian: {
            name: 'Venkatesh Iyer',
            phone: '+91 98444 55667',
            relation: 'Father',
          },
          address: '77 Anna Salai, T. Nagar, Chennai',
          photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
          status: 'ACTIVE',
        },
        {
          admissionNumber: 'ADM2026005',
          studentId: 'STU2026005',
          name: 'Vikram Singh',
          email: 'vikram.s@student.edu',
          phone: '+91 98765 43214',
          dob: '2003-07-12',
          gender: 'MALE',
          bloodGroup: 'O-',
          department: 'Civil Engineering',
          course: 'B.Tech Civil Engineering',
          semester: 8,
          section: 'A',
          guardian: {
            name: 'Mahipal Singh',
            phone: '+91 98555 66778',
            relation: 'Father',
          },
          address: '23 Civil Lines, Jaipur',
          photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
          status: 'GRADUATED',
        },
      ]);
      console.log('[Seed] Default students seeded successfully.');
    }

    // 7. Seed Faculty if empty
    const facultyCount = await Faculty.countDocuments();
    if (facultyCount === 0) {
      await Faculty.create([
        {
          employeeId: 'FAC2026001',
          name: 'Dr. Sarah Connor',
          email: 'sarah.connor@university.edu',
          phone: '+91 98111 55667',
          designation: 'Professor & HOD',
          qualification: 'Ph.D. in Computer Science (MIT)',
          experienceYears: 14,
          department: 'Computer Science & Engineering',
          subjects: ['Data Structures & Algorithms', 'Machine Learning'],
          salary: 125000,
          joiningDate: '2012-08-15',
          photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
          status: 'ACTIVE',
        },
        {
          employeeId: 'FAC2026002',
          name: 'Prof. Alan Turing',
          email: 'alan.turing@university.edu',
          phone: '+91 98222 66778',
          designation: 'Associate Professor',
          qualification: 'Ph.D. in Mathematical Logic (Cambridge)',
          experienceYears: 10,
          department: 'Computer Science & Engineering',
          subjects: ['Database Management Systems', 'Theory of Computation'],
          salary: 95000,
          joiningDate: '2016-01-10',
          photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250',
          status: 'ACTIVE',
        },
        {
          employeeId: 'FAC2026003',
          name: 'Dr. Nikola Tesla',
          email: 'nikola.tesla@university.edu',
          phone: '+91 98333 77889',
          designation: 'Professor',
          qualification: 'Ph.D. in Electrical Engineering (Graz)',
          experienceYears: 18,
          department: 'Electrical Engineering',
          subjects: ['Circuit Analysis', 'Electromagnetic Theory'],
          salary: 115000,
          joiningDate: '2008-07-01',
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          status: 'ACTIVE',
        },
        {
          employeeId: 'FAC2026004',
          name: 'Prof. Marie Curie',
          email: 'marie.curie@university.edu',
          phone: '+91 98444 88990',
          designation: 'Assistant Professor',
          qualification: 'Ph.D. in Applied Physics (Sorbonne)',
          experienceYears: 6,
          department: 'Mechanical Engineering',
          subjects: ['Thermodynamics', 'Fluid Mechanics'],
          salary: 75000,
          joiningDate: '2020-09-01',
          photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
          status: 'ACTIVE',
        },
      ]);
      console.log('[Seed] Default faculty members seeded successfully.');
    }

    console.log('[Seed] Demo data seeding completed successfully!');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
  }
};
