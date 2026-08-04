export type UserRole =
  | 'SUPER_ADMIN'
  | 'PRINCIPAL'
  | 'HOD'
  | 'FACULTY'
  | 'STUDENT'
  | 'ACCOUNTANT'
  | 'LIBRARIAN';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  department?: string;
  designation?: string;
  enrollmentNo?: string;
  rollNo?: string;
  studentId?: string;
  course?: string;
  address?: string;
  emergencyContact?: string;
  guardianName?: string;
  guardianPhone?: string;
  employeeId?: string;
  semester?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt?: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  hodName?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  totalFaculties: number;
  totalStudents: number;
}

export interface Course {
  _id: string;
  title: string;
  code: string;
  duration?: string;
  credits: number;
  department: string;
  semester: number;
  eligibility?: string;
  facultyName?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  credits: number;
  semester: number;
  department: string;
  facultyName?: string;
  facultyId?: string;
  type?: 'THEORY' | 'PRACTICAL' | 'ELECTIVE';
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface GuardianInfo {
  name?: string;
  phone?: string;
  relation?: string;
}

export interface Student {
  _id: string;
  admissionNumber: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  dob?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  department: string;
  course: string;
  semester: number;
  section: string;
  guardian?: GuardianInfo;
  address?: string;
  photo?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED';
  createdAt?: string;
  updatedAt?: string;
}

export interface Faculty {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  qualification: string;
  experienceYears: number;
  department: string;
  subjects: string[];
  salary: number;
  joiningDate: string;
  photo?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'RETIRED';
  createdAt?: string;
  updatedAt?: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HOLIDAY';

export interface AttendanceRecord {
  _id: string;
  studentId: string;
  studentRollNo: string;
  studentName: string;
  department: string;
  course: string;
  semester: number;
  section: string;
  subject: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  markedBy: string;
  markedByRole?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentAttendanceSubjectBreakdown {
  subject: string;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  holiday: number;
  workingDays: number;
  attended: number;
  percentage: number;
}

export interface StudentAttendanceStatsResponse {
  success: boolean;
  student: {
    id: string;
    name: string;
    rollNo: string;
    department: string;
    course: string;
    semester: number;
    section: string;
  };
  summary: {
    totalRecords: number;
    workingDays: number;
    present: number;
    absent: number;
    late: number;
    holiday: number;
    overallPercentage: number;
  };
  subjectBreakdown: StudentAttendanceSubjectBreakdown[];
  recentHistory: AttendanceRecord[];
}

export interface MonthlyReportRow {
  studentId: string;
  rollNo: string;
  name: string;
  dailyStatus: Record<string, string>;
  totalConducted: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  holidayCount: number;
  workingDays: number;
  attended: number;
  percentage: number;
}

export type NoticeCategory =
  | 'ACADEMIC'
  | 'EXAM'
  | 'EVENT'
  | 'FEE'
  | 'GENERAL'
  | 'ADMIN'
  | 'PLACEMENT'
  | 'SPORTS';

export type NoticePostType = 'ADMIN_POST' | 'FACULTY_POST' | 'STUDENT_NOTICE';
export type NoticePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface NoticeAttachment {
  name: string;
  url: string;
  fileType: string;
  size?: string;
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  postType: NoticePostType;
  priority: NoticePriority;
  targetRole: 'ALL' | 'FACULTY' | 'STUDENT' | 'HOD';
  department?: string;
  semester?: number;
  section?: string;
  postedBy: string;
  postedByRole?: string;
  postedById?: string;
  isImportant: boolean;
  pinned: boolean;
  attachments: NoticeAttachment[];
  viewsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MetricCard {
  label: string;
  value: string | number;
  change?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export interface ActivityItem {
  title: string;
  time: string;
  user: string;
  category: string;
}

export interface StatItem {
  label: string;
  value: string | number;
}

export interface QuickActionItem {
  label: string;
  route: string;
  icon: string;
}

export interface DashboardData {
  role: UserRole;
  user: { name: string; department?: string; designation?: string };
  stats: {
    cards: MetricCard[];
    charts?: {
      departmentEnrollment?: any[];
      userGrowthTrend?: any[];
      roleDistribution?: any[];
    };
    statistics?: StatItem[];
    recentActivities?: ActivityItem[];
    quickActions?: QuickActionItem[];
    overview?: Record<string, any>;
    metrics?: Record<string, any>;
    deptName?: string;
    studentDetails?: Record<string, any>;
  };
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: User;
  message?: string;
  resetToken?: string;
}

export type ExamType = 'INTERNAL' | 'SEMESTER' | 'PRACTICAL' | 'ASSIGNMENT';
export type ExamStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'RESULTS_PUBLISHED';

export interface Exam {
  _id: string;
  title: string;
  examType: ExamType;
  department: string;
  course: string;
  semester: number;
  academicYear: string;
  subject: string;
  subjectCode: string;
  examDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  totalMarks: number;
  passMarks: number;
  weightagePercentage?: number;
  hall: string;
  invigilator: string;
  status: ExamStatus;
  instructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamHall {
  _id: string;
  name: string;
  block: string;
  capacity: number;
  rows: number;
  columns: number;
  facilities: string[];
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamMark {
  _id?: string;
  examId: string;
  studentId: string;
  studentRollNo: string;
  studentName: string;
  photo?: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  isPassed: boolean;
  remarks?: string;
  evaluatedBy?: string;
  createdAt?: string;
}

export interface StudentReportCardResponse {
  success: boolean;
  student: {
    id: string;
    name: string;
    rollNo: string;
    department: string;
    course: string;
    semester: number;
    photo?: string;
  };
  summary: {
    totalExamsTaken: number;
    passedExamsCount: number;
    totalMarksObtained: number;
    totalMaxMarks: number;
    overallPercentage: number;
    overallGrade: string;
  };
  marksList: {
    markId: string;
    examId: string;
    subject: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    isPassed: boolean;
    remarks?: string;
    evaluatedBy?: string;
  }[];
}

export interface StudentResultResponse {
  success: boolean;
  student: {
    id: string;
    name: string;
    rollNo: string;
    department: string;
    course: string;
    semester: number;
    academicYear: string;
    photo?: string;
    email?: string;
  };
  resultSummary: {
    totalExams: number;
    passedCount: number;
    failedCount: number;
    totalObtained: number;
    totalMax: number;
    overallPercentage: number;
    cgpa: number;
    overallGrade: string;
    overallPerformance: string;
    resultStatus: string;
  };
  marks: {
    markId: string;
    examId: string;
    subject: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    gradePoint: number;
    performance: string;
    isPassed: boolean;
    remarks?: string;
    evaluatedBy?: string;
  }[];
}

export interface AcademicTranscriptResponse {
  success: boolean;
  transcriptHeader: {
    institution: string;
    affiliation: string;
    accreditation: string;
    issueDate: string;
    transcriptNo: string;
    verificationHash: string;
  };
  student: {
    id: string;
    name: string;
    rollNo: string;
    department: string;
    course: string;
    semester: number;
    admissionYear: string;
    photo?: string;
  };
  transcriptSummary: {
    totalSubjects: number;
    totalEarnedCredits: number;
    cumulativeObtained: number;
    cumulativeMax: number;
    cumulativePercentage: number;
    cgpa: number;
    finalGrade: string;
    division: string;
  };
  subjects: {
    subject: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    gradePoint: number;
    credits: number;
    status: string;
  }[];
}

export interface FeeRecord {
  _id: string;
  studentId: string;
  studentRollNo: string;
  studentName: string;
  department: string;
  course: string;
  semester: number;
  academicYear: string;
  category: 'Tuition Fee' | 'Hostel Fee' | 'Exam Fee' | 'Transport Fee' | 'Library Fee' | 'Admission Fee' | 'Other';
  title: string;
  dueDate: string;
  baseAmount: number;
  fineAmount: number;
  scholarshipAmount: number;
  totalPayable: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeePayment {
  _id: string;
  receiptNo: string;
  feeRecordId: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  department: string;
  course: string;
  feeCategory: string;
  amountPaid: number;
  paymentMode: 'ONLINE' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE';
  transactionRef: string;
  paymentDate: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  receivedBy: string;
  remarks?: string;
  createdAt: string;
}

export interface FeeStats {
  totalCollectable: number;
  totalCollected: number;
  totalPending: number;
  totalScholarships: number;
  totalFines: number;
  totalRecords: number;
  statusCounts: {
    PAID: number;
    PARTIAL: number;
    PENDING: number;
    OVERDUE: number;
  };
  recentTransactionsCount: number;
}

export interface ReceiptDetailsResponse {
  success: boolean;
  receipt: {
    receiptNo: string;
    date: string;
    transactionRef: string;
    paymentMode: string;
    receivedBy: string;
    amountPaid: number;
    status: string;
  };
  student: {
    name: string;
    rollNo: string;
    department: string;
    course: string;
    email: string;
    phone: string;
  };
  feeBreakdown: {
    category: string;
    title: string;
    baseAmount: number;
    fineAmount: number;
    scholarshipAmount: number;
    totalPayable: number;
    paidToDate: number;
    remainingBalance: number;
  };
  institution: {
    name: string;
    address: string;
    contact: string;
  };
}

export interface BookCategory {
  _id: string;
  name: string;
  code: string;
  description?: string;
  locationSection: string;
  maxIssueDays: number;
  finePerDay: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  edition?: string;
  totalCopies: number;
  availableCopies: number;
  locationRack?: string;
  price?: number;
  callNumber?: string;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'MAINTENANCE';
  createdAt?: string;
  updatedAt?: string;
}

export interface BookIssue {
  _id: string;
  issueSlipNo: string;
  bookId: string;
  bookTitle: string;
  bookIsbn: string;
  bookCategory: string;
  borrowerType: 'STUDENT' | 'FACULTY';
  studentId?: string;
  studentRollNo?: string;
  borrowerName: string;
  department: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE' | 'LOST';
  fineAmount: number;
  fineStatus: 'NONE' | 'PENDING' | 'PAID' | 'WAIVED';
  issuedBy: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LibraryStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
  totalCategories: number;
  activeIssuesCount: number;
  overdueCount: number;
  totalFinesPending: number;
  totalFinesCollected: number;
  totalIssuesRecorded: number;
}

export interface Assignment {
  _id: string;
  title: string;
  description?: string;
  department: string;
  course?: string;
  subject: string;
  semester?: number;
  section?: string;
  facultyId?: string;
  facultyName: string;
  totalMarks: number;
  dueDate: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED';
  totalSubmissions?: number;
  gradedSubmissions?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Submission {
  _id: string;
  assignmentId: string | Assignment;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  department?: string;
  submissionDate: string;
  fileUrl?: string;
  fileName?: string;
  comments?: string;
  obtainedMarks?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'LATE' | 'GRADED' | 'RESUBMISSION_REQUESTED';
  gradedBy?: string;
  gradedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentStats {
  totalAssignments: number;
  activeAssignments: number;
  totalSubmissions: number;
  pendingGrading: number;
  totalGraded: number;
}

export interface LeaveRequest {
  _id: string;
  applicantType: 'STUDENT' | 'FACULTY';
  applicantId: string;
  applicantName: string;
  applicantRollNoOrCode: string;
  department: string;
  leaveType: 'CASUAL' | 'MEDICAL' | 'DUTY_LEAVE' | 'MATERNITY_PATERNITY' | 'EARNED' | 'OTHER';
  reason: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approverId?: string;
  approverName?: string;
  approverRole?: string;
  approverComments?: string;
  actionDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveStats {
  totalLeaves: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  studentLeaves: number;
  facultyLeaves: number;
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export interface TimetableSlot {
  _id: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  department: string;
  course?: string;
  subject: string;
  subjectCode?: string;
  semester: number;
  section: string;
  facultyId?: string;
  facultyName: string;
  roomNumber: string;
  building?: string;
  slotType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'SEMINAR';
  academicYear?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimetableConflict {
  type: 'ROOM' | 'FACULTY' | 'SECTION';
  message: string;
  conflictingSlot: TimetableSlot;
}

export interface CheckConflictResponse {
  success: boolean;
  hasConflict: boolean;
  conflictCount: number;
  conflicts: TimetableConflict[];
}

export interface RoomOccupancy {
  roomNumber: string;
  totalSlots: number;
  slots: TimetableSlot[];
}





