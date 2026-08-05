import User, { IUser } from '../models/User.js';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';

/**
 * Synchronize a User document to either Faculty or Student collection based on user.role
 */
export async function syncUserToEntity(user: IUser | any): Promise<void> {
  if (!user || !user.email) return;

  const emailLower = user.email.toLowerCase().trim();
  const role = user.role;

  if (role === 'STUDENT') {
    // Sync to Student collection
    const studentIdVal = user.enrollmentNo || `STU-${user._id ? user._id.toString().slice(-6).toUpperCase() : Math.floor(100000 + Math.random() * 900000)}`;
    const admNoVal = user.enrollmentNo || `ADM-${user._id ? user._id.toString().slice(-6).toUpperCase() : Math.floor(100000 + Math.random() * 900000)}`;

    const existingStudent = await Student.findOne({ email: emailLower });

    if (existingStudent) {
      existingStudent.name = user.name || existingStudent.name;
      existingStudent.phone = user.phone || existingStudent.phone || '9876543210';
      existingStudent.department = user.department || existingStudent.department;
      if (user.semester) existingStudent.semester = user.semester;
      if (user.enrollmentNo) {
        existingStudent.studentId = user.enrollmentNo;
        existingStudent.admissionNumber = user.enrollmentNo;
      }
      if (user.avatar) existingStudent.photo = user.avatar;
      existingStudent.status = user.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
      await existingStudent.save();
    } else {
      await Student.create({
        admissionNumber: admNoVal,
        studentId: studentIdVal,
        name: user.name,
        email: emailLower,
        phone: user.phone || '9876543210',
        department: user.department || 'Computer Science & Engineering',
        course: 'B.Tech',
        semester: user.semester || 1,
        section: 'A',
        photo: user.avatar || '',
        status: user.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      });
    }
  } else if (['FACULTY', 'HOD', 'PRINCIPAL', 'LIBRARIAN', 'ACCOUNTANT'].includes(role)) {
    // Sync to Faculty collection
    const empIdVal = user.employeeId || `FAC-${user._id ? user._id.toString().slice(-6).toUpperCase() : Math.floor(100000 + Math.random() * 900000)}`;
    let desig = user.designation;
    if (!desig) {
      if (role === 'HOD') desig = 'Head of Department';
      else if (role === 'PRINCIPAL') desig = 'Principal';
      else if (role === 'LIBRARIAN') desig = 'Chief Librarian';
      else if (role === 'ACCOUNTANT') desig = 'Senior Accountant';
      else desig = 'Assistant Professor';
    }

    const existingFaculty = await Faculty.findOne({ email: emailLower });

    if (existingFaculty) {
      existingFaculty.name = user.name || existingFaculty.name;
      existingFaculty.phone = user.phone || existingFaculty.phone || '9876543210';
      existingFaculty.department = user.department || existingFaculty.department;
      existingFaculty.designation = desig || existingFaculty.designation;
      if (user.employeeId) existingFaculty.employeeId = user.employeeId;
      if (user.avatar) existingFaculty.photo = user.avatar;
      existingFaculty.status = user.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
      await existingFaculty.save();
    } else {
      await Faculty.create({
        employeeId: empIdVal,
        name: user.name,
        email: emailLower,
        phone: user.phone || '9876543210',
        designation: desig,
        qualification: 'Master / Ph.D',
        experienceYears: 5,
        department: user.department || 'Computer Science & Engineering',
        subjects: [],
        salary: role === 'PRINCIPAL' ? 150000 : role === 'HOD' ? 110000 : role === 'LIBRARIAN' ? 70000 : role === 'ACCOUNTANT' ? 65000 : 60000,
        joiningDate: new Date().toISOString().split('T')[0],
        photo: user.avatar || '',
        status: user.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      });
    }
  }
}

/**
 * Synchronize a Faculty document to User collection
 */
export async function syncFacultyToUser(faculty: any): Promise<void> {
  if (!faculty || !faculty.email) return;

  const emailLower = faculty.email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: emailLower });

  // Determine user role based on designation
  const desigLower = (faculty.designation || '').toLowerCase();
  let role: any = 'FACULTY';
  if (desigLower.includes('hod') || desigLower.includes('head')) role = 'HOD';
  else if (desigLower.includes('principal')) role = 'PRINCIPAL';
  else if (desigLower.includes('librarian')) role = 'LIBRARIAN';
  else if (desigLower.includes('account') || desigLower.includes('finance')) role = 'ACCOUNTANT';

  if (existingUser) {
    existingUser.name = faculty.name || existingUser.name;
    existingUser.phone = faculty.phone || existingUser.phone;
    existingUser.department = faculty.department || existingUser.department;
    existingUser.designation = faculty.designation || existingUser.designation;
    existingUser.employeeId = faculty.employeeId || existingUser.employeeId;
    if (faculty.photo) existingUser.avatar = faculty.photo;
    existingUser.status = faculty.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    existingUser.role = role;
    await existingUser.save();
  } else {
    await User.create({
      name: faculty.name,
      email: emailLower,
      password: 'password123',
      role,
      department: faculty.department || 'Computer Science',
      designation: faculty.designation || 'Assistant Professor',
      employeeId: faculty.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: faculty.phone || '',
      avatar: faculty.photo || '',
      status: faculty.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
    });
  }
}

/**
 * Synchronize a Student document to User collection
 */
export async function syncStudentToUser(student: any): Promise<void> {
  if (!student || !student.email) return;

  const emailLower = student.email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: emailLower });

  if (existingUser) {
    existingUser.name = student.name || existingUser.name;
    existingUser.phone = student.phone || existingUser.phone;
    existingUser.department = student.department || existingUser.department;
    existingUser.enrollmentNo = student.studentId || student.admissionNumber || existingUser.enrollmentNo;
    if (student.semester) existingUser.semester = student.semester;
    if (student.photo) existingUser.avatar = student.photo;
    existingUser.status = student.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    existingUser.role = 'STUDENT';
    await existingUser.save();
  } else {
    await User.create({
      name: student.name,
      email: emailLower,
      password: 'password123',
      role: 'STUDENT',
      department: student.department || 'Computer Science',
      enrollmentNo: student.studentId || student.admissionNumber || `STU-${Math.floor(10000 + Math.random() * 90000)}`,
      semester: student.semester || 1,
      phone: student.phone || '',
      avatar: student.photo || '',
      status: student.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
    });
  }
}

/**
 * Deletes corresponding entity when a user is deleted
 */
export async function syncUserDeletion(email: string): Promise<void> {
  if (!email) return;
  const emailLower = email.toLowerCase().trim();
  await Faculty.deleteMany({ email: emailLower });
  await Student.deleteMany({ email: emailLower });
}

/**
 * Deletes corresponding user when a faculty or student is deleted
 */
export async function syncEntityDeletion(email: string): Promise<void> {
  if (!email) return;
  const emailLower = email.toLowerCase().trim();
  await User.deleteMany({ email: emailLower });
}

/**
 * Perform a full batch sync across all Users, Faculty, and Students in database
 */
export async function syncAllUsersAndEntities(): Promise<void> {
  try {
    const allUsers = await User.find();
    for (const u of allUsers) {
      await syncUserToEntity(u);
    }

    const allFaculty = await Faculty.find();
    for (const f of allFaculty) {
      await syncFacultyToUser(f);
    }

    const allStudents = await Student.find();
    for (const s of allStudents) {
      await syncStudentToUser(s);
    }

    console.log('[SyncService] Successfully synchronized all Users, Faculty, and Students.');
  } catch (err) {
    console.error('[SyncService] Error during batch synchronization:', err);
  }
}
