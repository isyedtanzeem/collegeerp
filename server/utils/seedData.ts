import User, { UserRole } from '../models/User.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Book from '../models/Book.js';
import Notice from '../models/Notice.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Attendance from '../models/Attendance.js';
import Exam from '../models/Exam.js';
import ExamHall from '../models/ExamHall.js';
import ExamMark from '../models/ExamMark.js';
import FeeRecord from '../models/FeeRecord.js';
import FeePayment from '../models/FeePayment.js';
import BookCategory from '../models/BookCategory.js';
import BookIssue from '../models/BookIssue.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Leave from '../models/Leave.js';
import TimetableSlot from '../models/Timetable.js';

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
          course: 'B.Tech Computer Science & Engineering',
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
          course: 'B.Tech Computer Science & Engineering',
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
          course: 'B.Tech Computer Science & Engineering',
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
          course: 'B.Tech Electrical Engineering',
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
          course: 'B.Tech Mechanical Engineering',
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
          course: 'B.Tech Computer Science & Engineering',
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

    // 8. Seed Attendance if empty
    const attendanceCount = await Attendance.countDocuments();
    if (attendanceCount === 0) {
      const studentsList = await Student.find({ status: 'ACTIVE' }).limit(10);
      if (studentsList.length > 0) {
        const sampleDates = [
          '2026-08-01',
          '2026-08-02',
          '2026-08-03',
          '2026-07-28',
          '2026-07-29',
          '2026-07-30',
          '2026-07-31',
        ];
        const sampleSubjects = [
          'Data Structures & Algorithms',
          'Database Management Systems',
          'Web Engineering',
        ];
        const statuses: ('PRESENT' | 'ABSENT' | 'LATE' | 'HOLIDAY')[] = [
          'PRESENT',
          'PRESENT',
          'PRESENT',
          'ABSENT',
          'LATE',
          'PRESENT',
        ];

        const attendanceSeeds = [];

        for (const dateStr of sampleDates) {
          const isHolidayDate = dateStr === '2026-08-02'; // Sunday / Holiday
          for (const sub of sampleSubjects) {
            for (let i = 0; i < studentsList.length; i++) {
              const std = studentsList[i];
              let statusChoice: 'PRESENT' | 'ABSENT' | 'LATE' | 'HOLIDAY' = isHolidayDate
                ? 'HOLIDAY'
                : statuses[(i + dateStr.length) % statuses.length];

              attendanceSeeds.push({
                studentId: std._id.toString(),
                studentRollNo: std.studentId || std.admissionNumber,
                studentName: std.name,
                department: std.department,
                course: std.course,
                semester: std.semester,
                section: std.section || 'A',
                subject: sub,
                date: dateStr,
                status: statusChoice,
                remarks: statusChoice === 'LATE' ? 'Arrived 15 mins late' : '',
                markedBy: 'Dr. Sarah Connor',
                markedByRole: 'FACULTY',
              });
            }
          }
        }

        await Attendance.insertMany(attendanceSeeds);
        console.log('[Seed] Default attendance records seeded successfully.');
      }
    }

    // 9. Seed Exam Halls if empty
    const hallCount = await ExamHall.countDocuments();
    if (hallCount === 0) {
      await ExamHall.insertMany([
        {
          name: 'Main Exam Hall A',
          block: 'Science Block',
          capacity: 120,
          rows: 10,
          columns: 12,
          facilities: ['CCTV Monitoring', 'Central AC', 'Biometric Check'],
          status: 'AVAILABLE',
        },
        {
          name: 'Auditorium Hall B',
          block: 'Central Admin Block',
          capacity: 250,
          rows: 15,
          columns: 18,
          facilities: ['CCTV Monitoring', 'PA System', 'AC'],
          status: 'AVAILABLE',
        },
        {
          name: 'Lab 3 Practical Hall',
          block: 'IT Department',
          capacity: 45,
          rows: 5,
          columns: 9,
          facilities: ['High Speed Workstations', 'LAN', 'UPS Backup'],
          status: 'AVAILABLE',
        },
      ]);
      console.log('[Seed] Default exam halls seeded successfully.');
    }

    // 10. Seed Exam Schedules & Marks if empty
    const examCount = await Exam.countDocuments();
    if (examCount === 0) {
      const sampleExams = [
        {
          title: 'Mid-Semester Internal Assessment 1',
          examType: 'INTERNAL',
          department: 'Computer Science & Engineering',
          course: 'B.Tech Computer Science',
          semester: 3,
          academicYear: '2025-2026',
          subject: 'Data Structures & Algorithms',
          subjectCode: 'CS301',
          examDate: '2026-08-15',
          startTime: '09:30 AM',
          endTime: '11:30 AM',
          totalMarks: 50,
          passMarks: 20,
          weightagePercentage: 20,
          hall: 'Main Exam Hall A',
          invigilator: 'Dr. Sarah Connor',
          status: 'SCHEDULED',
          instructions: 'No electronic gadgets allowed. Bring university ID card.',
        },
        {
          title: 'Practical Lab Examination 2026',
          examType: 'PRACTICAL',
          department: 'Computer Science & Engineering',
          course: 'B.Tech Computer Science',
          semester: 3,
          academicYear: '2025-2026',
          subject: 'Database Management Systems Lab',
          subjectCode: 'CS302L',
          examDate: '2026-08-18',
          startTime: '02:00 PM',
          endTime: '05:00 PM',
          totalMarks: 50,
          passMarks: 25,
          weightagePercentage: 15,
          hall: 'Lab 3 Practical Hall',
          invigilator: 'Prof. Alan Turing',
          status: 'SCHEDULED',
          instructions: 'Submit lab record files prior to entering the laboratory.',
        },
        {
          title: 'End-Semester Theory Examination 2026',
          examType: 'SEMESTER',
          department: 'Computer Science & Engineering',
          course: 'B.Tech Computer Science',
          semester: 3,
          academicYear: '2025-2026',
          subject: 'Web Engineering',
          subjectCode: 'CS303',
          examDate: '2026-07-10',
          startTime: '09:30 AM',
          endTime: '12:30 PM',
          totalMarks: 100,
          passMarks: 40,
          weightagePercentage: 50,
          hall: 'Auditorium Hall B',
          invigilator: 'Dr. Sarah Connor',
          status: 'RESULTS_PUBLISHED',
          instructions: 'Seating plan posted on notice board.',
        },
        {
          title: 'Continuous Evaluation Assignment 1',
          examType: 'ASSIGNMENT',
          department: 'Computer Science & Engineering',
          course: 'B.Tech Computer Science',
          semester: 3,
          academicYear: '2025-2026',
          subject: 'Data Structures & Algorithms',
          subjectCode: 'CS301',
          examDate: '2026-07-05',
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          totalMarks: 25,
          passMarks: 10,
          weightagePercentage: 15,
          hall: 'Online Submission Portal',
          invigilator: 'Prof. Alan Turing',
          status: 'RESULTS_PUBLISHED',
          instructions: 'Submit PDF report with execution screenshots.',
        },
      ];

      const insertedExams = await Exam.insertMany(sampleExams);
      console.log('[Seed] Default exam schedules seeded successfully.');

      // Seed Marks for published exam
      const publishedExam = insertedExams.find((e) => e.status === 'RESULTS_PUBLISHED');
      if (publishedExam) {
        const studentsList = await Student.find({ department: publishedExam.department });
        const marksSeeds = studentsList.map((std, idx) => {
          const marksObtained = 45 + ((idx * 13) % 52); // Marks between 45 and 97
          const percentage = Math.round((marksObtained / publishedExam.totalMarks) * 100);
          let grade = 'F';
          let isPassed = false;
          if (percentage >= 90) { grade = 'A+'; isPassed = true; }
          else if (percentage >= 80) { grade = 'A'; isPassed = true; }
          else if (percentage >= 70) { grade = 'B'; isPassed = true; }
          else if (percentage >= 60) { grade = 'C'; isPassed = true; }
          else if (percentage >= 40) { grade = 'D'; isPassed = true; }

          return {
            examId: publishedExam._id.toString(),
            studentId: std._id.toString(),
            studentRollNo: std.studentId || std.admissionNumber || 'N/A',
            studentName: std.name,
            subject: publishedExam.subject,
            marksObtained,
            totalMarks: publishedExam.totalMarks,
            percentage,
            grade,
            isPassed,
            remarks: isPassed ? 'Good performance' : 'Requires improvement',
            evaluatedBy: publishedExam.invigilator,
          };
        });

        await ExamMark.insertMany(marksSeeds);
        console.log('[Seed] Default exam marks seeded successfully.');
      }
    }

    // Seed Fee Records & Fee Payments if empty
    const feeCount = await FeeRecord.countDocuments();
    if (feeCount === 0) {
      const allStudents = await Student.find({ status: 'ACTIVE' });

      for (let i = 0; i < allStudents.length; i++) {
        const std = allStudents[i];
        
        // 1. Tuition Fee (Paid or Partial)
        const tuitionBase = 2500;
        const scholarship = i % 2 === 0 ? 500 : 0;
        const totalPayableTuition = tuitionBase - scholarship;
        const isPaid = i % 2 === 0;
        const paidTuition = isPaid ? totalPayableTuition : 1500;
        const pendingTuition = totalPayableTuition - paidTuition;

        const tuitionRecord = new FeeRecord({
          studentId: std._id,
          studentRollNo: std.studentId || std.admissionNumber || 'N/A',
          studentName: std.name,
          department: std.department,
          course: std.course,
          semester: std.semester,
          category: 'Tuition Fee',
          title: `Semester ${std.semester} Academic Tuition Fee`,
          dueDate: '2026-08-15',
          baseAmount: tuitionBase,
          fineAmount: 0,
          scholarshipAmount: scholarship,
          totalPayable: totalPayableTuition,
          paidAmount: paidTuition,
          pendingAmount: pendingTuition,
          status: pendingTuition === 0 ? 'PAID' : 'PARTIAL',
          remarks: scholarship > 0 ? 'Merit Scholarship Waiver Applied' : 'Regular Tuition Fee',
        });
        await tuitionRecord.save();

        // Payment receipt for tuition
        const payment1 = new FeePayment({
          receiptNo: `REC-2026-${100000 + i * 2}`,
          feeRecordId: tuitionRecord._id,
          studentId: std._id,
          studentName: std.name,
          studentRollNo: std.studentId || std.admissionNumber || 'N/A',
          department: std.department,
          course: std.course,
          feeCategory: 'Tuition Fee',
          amountPaid: paidTuition,
          paymentMode: i % 3 === 0 ? 'UPI' : i % 3 === 1 ? 'ONLINE' : 'BANK_TRANSFER',
          transactionRef: `TXN-TUITION-${880000 + i}`,
          paymentDate: '2026-07-20',
          status: 'SUCCESS',
          receivedBy: 'Chief Accounts Officer',
          remarks: 'Tuition fee instalment received with digital receipt',
        });
        await payment1.save();

        // 2. Exam Fee / Hostel Fee (Pending / Overdue)
        const isHostel = i % 2 === 1;
        const category = isHostel ? 'Hostel Fee' : 'Exam Fee';
        const baseAmount = isHostel ? 1200 : 250;
        const fineAmount = i % 3 === 0 ? 50 : 0;
        const totalPayable2 = baseAmount + fineAmount;

        const record2 = new FeeRecord({
          studentId: std._id,
          studentRollNo: std.studentId || std.admissionNumber || 'N/A',
          studentName: std.name,
          department: std.department,
          course: std.course,
          semester: std.semester,
          category,
          title: `Semester ${std.semester} ${category}`,
          dueDate: '2026-07-01',
          baseAmount,
          fineAmount,
          scholarshipAmount: 0,
          totalPayable: totalPayable2,
          paidAmount: 0,
          pendingAmount: totalPayable2,
          status: 'OVERDUE',
          remarks: fineAmount > 0 ? 'Late payment fine added' : 'Pending fee clearance',
        });
        await record2.save();
      }
      console.log('[Seed] Default Fee records and Payment receipts seeded successfully.');
    }

    // Seed Library Categories if empty
    const categoryCount = await BookCategory.countDocuments();
    if (categoryCount === 0) {
      await BookCategory.create([
        {
          name: 'Computer Science & Software',
          code: 'CS',
          description: 'Core algorithms, programming languages, system architecture, and AI books.',
          locationSection: 'Wing A - 1st Floor',
          maxIssueDays: 14,
          finePerDay: 2,
        },
        {
          name: 'Electronics & Electrical',
          code: 'EE',
          description: 'Circuit analysis, signal processing, VLSI design, and microcontrollers.',
          locationSection: 'Wing B - 1st Floor',
          maxIssueDays: 14,
          finePerDay: 2,
        },
        {
          name: 'Mechanical Engineering',
          code: 'ME',
          description: 'Thermodynamics, fluid mechanics, CAD/CAM, and material science.',
          locationSection: 'Wing C - 2nd Floor',
          maxIssueDays: 14,
          finePerDay: 2,
        },
        {
          name: 'Mathematics & Statistics',
          code: 'MATH',
          description: 'Linear algebra, calculus, probability, and discrete mathematics.',
          locationSection: 'Main Hall - Shelf 4',
          maxIssueDays: 21,
          finePerDay: 1,
        },
        {
          name: 'Management & Business',
          code: 'MBA',
          description: 'Organizational behavior, corporate finance, marketing, and leadership.',
          locationSection: 'Wing D - 2nd Floor',
          maxIssueDays: 14,
          finePerDay: 3,
        },
      ]);
      console.log('[Seed] Default Book Categories seeded successfully.');
    }

    // Seed Books if empty
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      await Book.create([
        {
          title: 'Introduction to Algorithms (CLRS)',
          author: 'Thomas H. Cormen, Charles E. Leiserson',
          isbn: '978-0262033848',
          category: 'Computer Science & Software',
          publisher: 'MIT Press',
          edition: '4th Edition',
          totalCopies: 10,
          availableCopies: 7,
          locationRack: 'Rack CS-01',
          price: 85.0,
          callNumber: 'CS-ALGO-01',
          status: 'AVAILABLE',
        },
        {
          title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
          author: 'Robert C. Martin',
          isbn: '978-0132350884',
          category: 'Computer Science & Software',
          publisher: 'Prentice Hall',
          edition: '1st Edition',
          totalCopies: 6,
          availableCopies: 4,
          locationRack: 'Rack CS-02',
          price: 45.0,
          callNumber: 'CS-CC-02',
          status: 'AVAILABLE',
        },
        {
          title: 'Database System Concepts',
          author: 'Abraham Silberschatz, Henry F. Korth',
          isbn: '978-0073523323',
          category: 'Computer Science & Software',
          publisher: 'McGraw-Hill Education',
          edition: '7th Edition',
          totalCopies: 8,
          availableCopies: 5,
          locationRack: 'Rack CS-03',
          price: 70.0,
          callNumber: 'CS-DB-03',
          status: 'AVAILABLE',
        },
        {
          title: 'Microelectronic Circuits',
          author: 'Adel S. Sedra, Kenneth C. Smith',
          isbn: '978-0190853464',
          category: 'Electronics & Electrical',
          publisher: 'Oxford University Press',
          edition: '8th Edition',
          totalCopies: 5,
          availableCopies: 2,
          locationRack: 'Rack EE-01',
          price: 90.0,
          callNumber: 'EE-CIRC-01',
          status: 'AVAILABLE',
        },
        {
          title: 'Engineering Mechanics: Statics & Dynamics',
          author: 'Russell C. Hibbeler',
          isbn: '978-0133915426',
          category: 'Mechanical Engineering',
          publisher: 'Pearson',
          edition: '14th Edition',
          totalCopies: 4,
          availableCopies: 3,
          locationRack: 'Rack ME-01',
          price: 78.0,
          callNumber: 'ME-MECH-01',
          status: 'AVAILABLE',
        },
        {
          title: 'Advanced Engineering Mathematics',
          author: 'Erwin Kreyszig',
          isbn: '978-0470458365',
          category: 'Mathematics & Statistics',
          publisher: 'Wiley',
          edition: '10th Edition',
          totalCopies: 12,
          availableCopies: 9,
          locationRack: 'Rack MATH-01',
          price: 95.0,
          callNumber: 'MATH-ADV-01',
          status: 'AVAILABLE',
        },
      ]);
      console.log('[Seed] Default Books seeded successfully.');
    }

    // Seed Book Issues if empty
    const issueCount = await BookIssue.countDocuments();
    if (issueCount === 0) {
      const students = await Student.find().limit(3);
      const books = await Book.find().limit(3);

      if (students.length > 0 && books.length > 0) {
        // Active Issue
        await BookIssue.create({
          issueSlipNo: 'SLIP-2026-100201',
          bookId: books[0]._id,
          bookTitle: books[0].title,
          bookIsbn: books[0].isbn,
          bookCategory: books[0].category,
          borrowerType: 'STUDENT',
          studentId: students[0]._id,
          studentRollNo: students[0].studentId || students[0].admissionNumber || 'STU-1001',
          borrowerName: students[0].name,
          department: students[0].department,
          issueDate: '2026-07-25',
          dueDate: '2026-08-08',
          status: 'ISSUED',
          fineAmount: 0,
          fineStatus: 'NONE',
          issuedBy: 'Chief Librarian',
          remarks: 'Regular academic loan',
        });

        // Overdue Issue with pending fine
        if (students.length > 1 && books.length > 1) {
          await BookIssue.create({
            issueSlipNo: 'SLIP-2026-100202',
            bookId: books[1]._id,
            bookTitle: books[1].title,
            bookIsbn: books[1].isbn,
            bookCategory: books[1].category,
            borrowerType: 'STUDENT',
            studentId: students[1]._id,
            studentRollNo: students[1].studentId || students[1].admissionNumber || 'STU-1002',
            borrowerName: students[1].name,
            department: students[1].department,
            issueDate: '2026-07-01',
            dueDate: '2026-07-15',
            returnDate: '2026-07-20',
            status: 'RETURNED',
            fineAmount: 10,
            fineStatus: 'PENDING',
            issuedBy: 'Assistant Librarian',
            remarks: 'Returned 5 days late',
          });
        }

        // Returned Issue with paid fine
        if (students.length > 2 && books.length > 2) {
          await BookIssue.create({
            issueSlipNo: 'SLIP-2026-100203',
            bookId: books[2]._id,
            bookTitle: books[2].title,
            bookIsbn: books[2].isbn,
            bookCategory: books[2].category,
            borrowerType: 'STUDENT',
            studentId: students[2]._id,
            studentRollNo: students[2].studentId || students[2].admissionNumber || 'STU-1003',
            borrowerName: students[2].name,
            department: students[2].department,
            issueDate: '2026-06-10',
            dueDate: '2026-06-24',
            returnDate: '2026-06-24',
            status: 'RETURNED',
            fineAmount: 0,
            fineStatus: 'NONE',
            issuedBy: 'Chief Librarian',
            remarks: 'Returned on time in pristine condition',
          });
        }
      }
      console.log('[Seed] Default Book Issues seeded successfully.');
    }

    // Seed Assignments & Submissions
    const assignmentCount = await Assignment.countDocuments();
    if (assignmentCount === 0) {
      const a1 = await Assignment.create({
        title: 'Data Structures Implementation & Complexity Analysis',
        description: 'Implement AVL Tree, Red-Black Tree, and B-Tree in C++/Java. Provide time & space complexity benchmarks with empirical runtime graphs.',
        department: 'Computer Science & Engineering',
        course: 'B.Tech CS',
        subject: 'Data Structures & Algorithms',
        semester: 3,
        section: 'A',
        facultyName: 'Dr. Alan Turing',
        totalMarks: 100,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        attachmentUrl: '',
        attachmentName: 'Assignment_1_Instructions.pdf',
        status: 'PUBLISHED',
      });

      const a2 = await Assignment.create({
        title: 'Relational Database Schema Design & Normalization Project',
        description: 'Design an E-Commerce ER diagram, translate into 3NF normalized relational schema, and write complex SQL JOINs, views, and stored procedures.',
        department: 'Computer Science & Engineering',
        course: 'B.Tech CS',
        subject: 'Database Management Systems',
        semester: 4,
        section: 'A',
        facultyName: 'Dr. Alan Turing',
        totalMarks: 50,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (Past due)
        attachmentUrl: '',
        attachmentName: 'DBMS_Lab_Assignment_Specification.pdf',
        status: 'PUBLISHED',
      });

      const a3 = await Assignment.create({
        title: 'Circuit Analysis & Kirchhoff Laws Simulation',
        description: 'Simulate parallel and series RLC circuits using LTSpice or MATLAB Simulink. Calculate frequency response and power factors.',
        department: 'Electrical Engineering',
        course: 'B.Tech EE',
        subject: 'Digital Logic & Circuit Design',
        semester: 1,
        section: 'B',
        facultyName: 'Dr. Nikola Tesla',
        totalMarks: 100,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        attachmentUrl: '',
        attachmentName: 'Circuit_Assignment_ProblemSet.pdf',
        status: 'PUBLISHED',
      });

      // Sample Submissions
      const studentsList = await Student.find();
      const st1 = studentsList[0];
      const st2 = studentsList[1];

      if (st1) {
        await Submission.create({
          assignmentId: a1._id,
          studentId: st1._id.toString(),
          studentName: st1.name,
          studentRollNo: st1.studentId || st1.admissionNumber || 'STU-1001',
          department: st1.department,
          submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          fileUrl: '',
          fileName: 'DataStructures_AVL_Trees_Report.pdf',
          comments: 'Implemented all required tree structures with unit tests and runtime plots attached.',
          obtainedMarks: 94,
          feedback: 'Excellent implementation and thorough mathematical proof of O(log N) balance bounds!',
          status: 'GRADED',
          gradedBy: 'Dr. Alan Turing',
          gradedAt: new Date(),
        });

        await Submission.create({
          assignmentId: a2._id,
          studentId: st1._id.toString(),
          studentName: st1.name,
          studentRollNo: st1.studentId || st1.admissionNumber || 'STU-1001',
          department: st1.department,
          submissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          fileUrl: '',
          fileName: 'DBMS_Normalized_Schema_Solution.docx',
          comments: 'Here is my complete SQL schema script and ER Diagram PDF.',
          status: 'SUBMITTED',
        });
      }

      if (st2) {
        await Submission.create({
          assignmentId: a1._id,
          studentId: st2._id.toString(),
          studentName: st2.name,
          studentRollNo: st2.studentId || st2.admissionNumber || 'STU-1002',
          department: st2.department,
          submissionDate: new Date(),
          fileUrl: '',
          fileName: 'DSA_Tree_Assignment_Submission.pdf',
          comments: 'Completed Red-Black and AVL trees in C++.',
          status: 'SUBMITTED',
        });
      }

      console.log('[Seed] Default Assignments & Submissions seeded successfully.');
    }

    // Seed Leave Applications
    const leaveCount = await Leave.countDocuments();
    if (leaveCount === 0) {
      const studentsList = await Student.find();
      const facultyList = await Faculty.find();

      const st1 = studentsList[0];
      const st2 = studentsList[1];
      const fc1 = facultyList[0];
      const fc2 = facultyList[1];

      // Student Leave 1 - Approved
      if (st1) {
        await Leave.create({
          applicantType: 'STUDENT',
          applicantId: st1._id.toString(),
          applicantName: st1.name,
          applicantRollNoOrCode: st1.studentId || st1.admissionNumber || 'STU-1001',
          department: st1.department || 'Computer Science & Engineering',
          leaveType: 'MEDICAL',
          reason: 'Severe fever and viral flu prescribed 3 days complete bed rest by campus doctor.',
          startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          totalDays: 3,
          attachmentUrl: '',
          attachmentName: 'Medical_Certificate_Doctor.pdf',
          status: 'APPROVED',
          approverId: 'APP-101',
          approverName: 'Dr. Alan Turing',
          approverRole: 'HOD',
          approverComments: 'Medical certificate verified and leave granted.',
          actionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        });
      }

      // Student Leave 2 - Pending
      if (st2) {
        await Leave.create({
          applicantType: 'STUDENT',
          applicantId: st2._id.toString(),
          applicantName: st2.name,
          applicantRollNoOrCode: st2.studentId || st2.admissionNumber || 'STU-1002',
          department: st2.department || 'Computer Science & Engineering',
          leaveType: 'DUTY_LEAVE',
          reason: 'Attending National Inter-College Robotics Hackathon competition at IIT Bombay as team lead.',
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          totalDays: 4,
          attachmentUrl: '',
          attachmentName: 'Hackathon_Invitation_Letter.pdf',
          status: 'PENDING',
        });
      }

      // Faculty Leave 1 - Approved
      if (fc1) {
        await Leave.create({
          applicantType: 'FACULTY',
          applicantId: fc1._id.toString(),
          applicantName: fc1.name,
          applicantRollNoOrCode: fc1.employeeId || 'FAC-1001',
          department: fc1.department || 'Computer Science & Engineering',
          leaveType: 'CASUAL',
          reason: 'Personal family emergency and attendance at IEEE International Conference paper presentation.',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
          totalDays: 3,
          attachmentUrl: '',
          attachmentName: 'IEEE_Conference_Acceptance.pdf',
          status: 'PENDING',
        });
      }

      // Faculty Leave 2 - Rejected with comment
      if (fc2) {
        await Leave.create({
          applicantType: 'FACULTY',
          applicantId: fc2._id.toString(),
          applicantName: fc2.name,
          applicantRollNoOrCode: fc2.employeeId || 'FAC-1002',
          department: fc2.department || 'Electrical Engineering',
          leaveType: 'CASUAL',
          reason: 'Urgent personal work in hometown.',
          startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          totalDays: 3,
          status: 'REJECTED',
          approverId: 'APP-102',
          approverName: 'Prof. Principal Office',
          approverRole: 'Principal',
          approverComments: 'Mid-term examinations scheduled on requested dates. Substitute faculty arrangement required first.',
          actionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        });
      }

      console.log('[Seed] Default Leave Applications seeded successfully.');
    }

    // Seed Timetable Slots
    const timetableCount = await TimetableSlot.countDocuments();
    if (timetableCount === 0) {
      const facultyList = await Faculty.find();
      const f1Name = facultyList[0]?.name || 'Dr. Alan Turing';
      const f1Id = facultyList[0]?._id.toString() || 'FAC-1001';
      const f2Name = facultyList[1]?.name || 'Dr. Ada Lovelace';
      const f2Id = facultyList[1]?._id.toString() || 'FAC-1002';
      const f3Name = facultyList[2]?.name || 'Prof. Claude Shannon';
      const f3Id = facultyList[2]?._id.toString() || 'FAC-1003';

      const defaultSlots = [
        // MONDAY
        {
          dayOfWeek: 'MONDAY',
          startTime: '09:00',
          endTime: '10:00',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CS',
          subject: 'Data Structures & Algorithms',
          subjectCode: 'CS-301',
          semester: 3,
          section: 'A',
          facultyId: f1Id,
          facultyName: f1Name,
          roomNumber: 'LH-101',
          building: 'Main Academic Block',
          slotType: 'LECTURE',
        },
        {
          dayOfWeek: 'MONDAY',
          startTime: '10:00',
          endTime: '11:00',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CS',
          subject: 'Operating Systems',
          subjectCode: 'CS-302',
          semester: 3,
          section: 'A',
          facultyId: f2Id,
          facultyName: f2Name,
          roomNumber: 'LH-101',
          building: 'Main Academic Block',
          slotType: 'LECTURE',
        },
        {
          dayOfWeek: 'MONDAY',
          startTime: '11:15',
          endTime: '13:15',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CS',
          subject: 'Database Systems Lab',
          subjectCode: 'CS-303L',
          semester: 3,
          section: 'A',
          facultyId: f3Id,
          facultyName: f3Name,
          roomNumber: 'LAB-202',
          building: 'IT Tower',
          slotType: 'LAB',
        },
        {
          dayOfWeek: 'MONDAY',
          startTime: '14:00',
          endTime: '15:00',
          department: 'Electronics & Communication',
          course: 'B.Tech ECE',
          subject: 'Digital Signal Processing',
          subjectCode: 'EC-401',
          semester: 5,
          section: 'B',
          facultyId: f1Id,
          facultyName: f1Name,
          roomNumber: 'LH-104',
          building: 'Engineering Block B',
          slotType: 'LECTURE',
        },

        // TUESDAY
        {
          dayOfWeek: 'TUESDAY',
          startTime: '09:00',
          endTime: '10:00',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CS',
          subject: 'Computer Networks',
          subjectCode: 'CS-304',
          semester: 3,
          section: 'A',
          facultyId: f2Id,
          facultyName: f2Name,
          roomNumber: 'LH-101',
          building: 'Main Academic Block',
          slotType: 'LECTURE',
        },
        {
          dayOfWeek: 'TUESDAY',
          startTime: '10:00',
          endTime: '11:00',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CS',
          subject: 'Data Structures & Algorithms',
          subjectCode: 'CS-301',
          semester: 3,
          section: 'A',
          facultyId: f1Id,
          facultyName: f1Name,
          roomNumber: 'LH-101',
          building: 'Main Academic Block',
          slotType: 'LECTURE',
        },
        {
          dayOfWeek: 'TUESDAY',
          startTime: '11:15',
          endTime: '12:15',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CS',
          subject: 'Theory of Computation',
          subjectCode: 'CS-305',
          semester: 3,
          section: 'A',
          facultyId: f3Id,
          facultyName: f3Name,
          roomNumber: 'LH-102',
          building: 'Main Academic Block',
          slotType: 'TUTORIAL',
        },

        // WEDNESDAY
        {
          dayOfWeek: 'WEDNESDAY',
          startTime: '09:00',
          endTime: '11:00',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CS',
          subject: 'Algorithms Design Lab',
          subjectCode: 'CS-301L',
          semester: 3,
          section: 'A',
          facultyId: f1Id,
          facultyName: f1Name,
          roomNumber: 'LAB-201',
          building: 'IT Tower',
          slotType: 'LAB',
        },
        {
          dayOfWeek: 'WEDNESDAY',
          startTime: '11:15',
          endTime: '12:15',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CS',
          subject: 'Software Engineering',
          subjectCode: 'CS-306',
          semester: 3,
          section: 'A',
          facultyId: f2Id,
          facultyName: f2Name,
          roomNumber: 'LH-101',
          building: 'Main Academic Block',
          slotType: 'LECTURE',
        },

        // THURSDAY
        {
          dayOfWeek: 'THURSDAY',
          startTime: '10:00',
          endTime: '11:00',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CS',
          subject: 'Operating Systems',
          subjectCode: 'CS-302',
          semester: 3,
          section: 'A',
          facultyId: f2Id,
          facultyName: f2Name,
          roomNumber: 'LH-101',
          building: 'Main Academic Block',
          slotType: 'LECTURE',
        },
        {
          dayOfWeek: 'THURSDAY',
          startTime: '14:00',
          endTime: '16:00',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CS',
          subject: 'Artificial Intelligence Seminar',
          subjectCode: 'CS-307S',
          semester: 3,
          section: 'A',
          facultyId: f3Id,
          facultyName: f3Name,
          roomNumber: 'AUD-1',
          building: 'Central Auditorium',
          slotType: 'SEMINAR',
        },

        // FRIDAY
        {
          dayOfWeek: 'FRIDAY',
          startTime: '09:00',
          endTime: '10:00',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CS',
          subject: 'Software Engineering',
          subjectCode: 'CS-306',
          semester: 3,
          section: 'A',
          facultyId: f2Id,
          facultyName: f2Name,
          roomNumber: 'LH-101',
          building: 'Main Academic Block',
          slotType: 'LECTURE',
        },
        {
          dayOfWeek: 'FRIDAY',
          startTime: '10:00',
          endTime: '11:00',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CS',
          subject: 'Computer Networks',
          subjectCode: 'CS-304',
          semester: 3,
          section: 'A',
          facultyId: f1Id,
          facultyName: f1Name,
          roomNumber: 'LH-101',
          building: 'Main Academic Block',
          slotType: 'LECTURE',
        },
      ];

      await TimetableSlot.insertMany(defaultSlots);
      console.log('[Seed] Default Timetable Slots seeded successfully.');
    }

    // Seed Notices
    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      const defaultNotices = [
        {
          title: 'End Semester Examinations Schedule & Mandatory Fee Clearance Notice',
          content: 'All B.Tech, M.Tech, and Diploma students are hereby notified that the End Semester Examinations for Academic Year 2026 will commence from May 18, 2026. Admit Cards will be issued starting May 10, 2026. All outstanding tuition, hostel, and library dues must be cleared prior to May 08, 2026 to avoid hall ticket blockage.',
          category: 'EXAM',
          postType: 'ADMIN_POST',
          priority: 'URGENT',
          targetRole: 'ALL',
          department: 'ALL',
          semester: 0,
          section: 'ALL',
          postedBy: 'Dr. Eleanor Vance',
          postedByRole: 'PRINCIPAL',
          isImportant: true,
          pinned: true,
          viewsCount: 142,
          attachments: [
            {
              name: 'End_Semester_Exam_TimeTable_2026.pdf',
              url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileType: 'pdf',
              size: '2.4 MB',
            },
          ],
        },
        {
          title: 'NAAC Peer Team Accreditation Inspection & Campus Guidelines',
          content: 'The National Assessment and Accreditation Council (NAAC) Peer Team will be visiting our campus for accreditation evaluation from May 25th to May 27th, 2026. All department heads, faculty members, and student coordinators are requested to ensure all lab manuals, course files, and research registers are up to date.',
          category: 'ADMIN',
          postType: 'ADMIN_POST',
          priority: 'HIGH',
          targetRole: 'ALL',
          department: 'ALL',
          semester: 0,
          section: 'ALL',
          postedBy: 'Dr. Arthur Pendelton',
          postedByRole: 'SUPER_ADMIN',
          isImportant: true,
          pinned: true,
          viewsCount: 98,
          attachments: [
            {
              name: 'NAAC_Inspection_Schedule_Guideline.pdf',
              url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileType: 'pdf',
              size: '1.8 MB',
            },
          ],
        },
        {
          title: 'Curriculum Revision & AI-Integrated Syllabus Workshop',
          content: 'A mandatory workshop for all faculty members on "Integrating Generative AI & Machine Learning Modules into Engineering Curricula" is scheduled for Friday, May 15, 2026 at Seminar Hall 2. Attendance is compulsory for all HODs and Associate Professors.',
          category: 'ACADEMIC',
          postType: 'FACULTY_POST',
          priority: 'HIGH',
          targetRole: 'FACULTY',
          department: 'Computer Science & Engineering',
          semester: 0,
          section: 'ALL',
          postedBy: 'Prof. Robert Langdon',
          postedByRole: 'HOD',
          isImportant: true,
          pinned: false,
          viewsCount: 56,
          attachments: [
            {
              name: 'AI_Syllabus_Revision_Agenda.pdf',
              url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileType: 'pdf',
              size: '1.1 MB',
            },
          ],
        },
        {
          title: 'Internal Assessment Marks Upload Deadline - Semester 3 & 5',
          content: 'All course instructors are requested to submit and lock the mid-semester internal evaluation marks on the ERP Portal on or before May 12, 2026. Late submissions will require written approval from the Academic Director.',
          category: 'ACADEMIC',
          postType: 'FACULTY_POST',
          priority: 'MEDIUM',
          targetRole: 'FACULTY',
          department: 'ALL',
          semester: 0,
          section: 'ALL',
          postedBy: 'Academic Affairs Cell',
          postedByRole: 'SUPER_ADMIN',
          isImportant: false,
          pinned: false,
          viewsCount: 44,
          attachments: [],
        },
        {
          title: 'Mega Campus Placement Drive by TechCorp Global Systems',
          content: 'Training & Placement Cell is proud to announce an On-Campus Placement Drive by TechCorp Global Systems for B.Tech CS, IT & ECE 2026 passing batch. Position: Software Development Engineer (SDE-1). CTC Package: ₹12,00,000 / annum. Eligible CPI: 7.0 and above with no active backlogs. Interested candidates must register before May 10, 2026.',
          category: 'PLACEMENT',
          postType: 'STUDENT_NOTICE',
          priority: 'URGENT',
          targetRole: 'STUDENT',
          department: 'Computer Science & Engineering',
          semester: 7,
          section: 'ALL',
          postedBy: 'Placement Cell',
          postedByRole: 'SUPER_ADMIN',
          isImportant: true,
          pinned: true,
          viewsCount: 320,
          attachments: [
            {
              name: 'TechCorp_Job_Description_SDE.pdf',
              url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileType: 'pdf',
              size: '3.1 MB',
            },
          ],
        },
        {
          title: 'Annual Cultural & Tech Fest "SPARK 2026" - Registrations Open',
          content: 'The Annual College Festival "SPARK 2026" will be held from June 1st to June 3rd, 2026. Events include Hackathons, Code Golf, Cultural Dance, Music Battle, and Robotics Sumo. Register your team on the student portal before May 20.',
          category: 'EVENT',
          postType: 'STUDENT_NOTICE',
          priority: 'MEDIUM',
          targetRole: 'STUDENT',
          department: 'ALL',
          semester: 0,
          section: 'ALL',
          postedBy: 'Student Affairs Council',
          postedByRole: 'FACULTY',
          isImportant: false,
          pinned: false,
          viewsCount: 215,
          attachments: [
            {
              name: 'SPARK_2026_Event_Catalog.pdf',
              url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileType: 'pdf',
              size: '4.5 MB',
            },
          ],
        },
        {
          title: 'Data Structures & Algorithms (CS-301) Lab Assignment Submission',
          content: 'All Semester 3 CSE Section A & B students must submit their complete lab record notebooks and GitHub code repository links for CS-301 Data Structures Lab before May 14, 2026, 5:00 PM.',
          category: 'ACADEMIC',
          postType: 'STUDENT_NOTICE',
          priority: 'HIGH',
          targetRole: 'STUDENT',
          department: 'Computer Science & Engineering',
          semester: 3,
          section: 'A',
          postedBy: 'Dr. Alan Turing',
          postedByRole: 'FACULTY',
          isImportant: true,
          pinned: false,
          viewsCount: 88,
          attachments: [
            {
              name: 'DS_Lab_Record_Submission_Format.pdf',
              url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileType: 'pdf',
              size: '850 KB',
            },
          ],
        },
      ];

      await Notice.insertMany(defaultNotices);
      console.log('[Seed] Default Notices seeded successfully.');
    }

    console.log('[Seed] Demo data seeding completed successfully!');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
  }
};
