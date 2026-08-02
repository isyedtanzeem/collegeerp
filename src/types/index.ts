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

export interface Notice {
  _id: string;
  title: string;
  content: string;
  category: 'ACADEMIC' | 'EXAM' | 'EVENT' | 'FEE' | 'GENERAL';
  targetRole: 'ALL' | 'FACULTY' | 'STUDENT' | 'HOD';
  postedBy: string;
  isImportant: boolean;
  createdAt: string;
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
