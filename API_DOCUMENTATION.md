# College ERP System - API Documentation

Welcome to the comprehensive API documentation for the **Apex Institute College ERP System**. This backend RESTful API provides endpoints for all institutional management modules, including User Auth, Role Permissions, Student Lifecycle, Faculty, Academic Departments, Courses & Subjects, Attendance, Exams & Marks, Fee Management, Central Library, Assignments, Leave Workflow, Timetable, Notices, and System Settings.

---

## Base URL & Headers

- **Base URL**: `http://localhost:3000/api/v1`
- **Content-Type**: `application/json`
- **Authorization**: `Bearer <JWT_TOKEN>` (for protected routes)

*Note: For frictionless preview/testing, requests without a Bearer token automatically fall back to the Super Admin demo session.*

---

## 1. Authentication (`/api/v1/auth`)

### `POST /auth/login`
Authenticates a user and returns a signed JWT token with user credentials.

**Request Body:**
```json
{
  "email": "student@college.edu",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "_id": "64d2f8b...",
    "name": "John Doe",
    "email": "student@college.edu",
    "role": "STUDENT",
    "department": "Computer Science & Engineering",
    "enrollmentNo": "CS2026-042"
  }
}
```

### `GET /auth/me`
Fetches current authenticated user details.

---

## 2. Student Management (`/api/v1/students`)

### `GET /students`
Retrieves paginated list of students with filter parameters.

**Query Parameters:**
- `department`: Filter by department (e.g. `Computer Science & Engineering`)
- `semester`: Filter by semester number (e.g. `4`)
- `search`: Search by name or Roll No / Admission No

**Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "students": [
    {
      "_id": "64d2f8c...",
      "admissionNumber": "ADM2026001",
      "studentId": "STU2026001",
      "name": "Aarav Sharma",
      "email": "aarav.sharma@student.edu",
      "department": "Computer Science & Engineering",
      "course": "B.Tech Computer Science & Engineering",
      "semester": 4,
      "section": "A",
      "status": "ACTIVE"
    }
  ]
}
```

### `POST /students`
Enrolls a new student into the ERP database.

---

## 3. Faculty Management (`/api/v1/faculty`)

### `GET /faculty`
Lists all academic faculty members.

### `POST /faculty`
Registers a new faculty member with designation, subjects, and salary.

---

## 4. Attendance Tracking (`/api/v1/attendance`)

### `GET /attendance`
Fetches attendance logs filtered by `date`, `subject`, `department`, or `studentId`.

### `POST /attendance/mark-bulk`
Marks attendance in bulk for a class section.

**Request Body:**
```json
{
  "subject": "Data Structures & Algorithms",
  "date": "2026-08-03",
  "department": "Computer Science & Engineering",
  "course": "B.Tech CS",
  "semester": 4,
  "section": "A",
  "attendanceData": [
    {
      "studentId": "64d2f8c...",
      "studentRollNo": "STU2026001",
      "studentName": "Aarav Sharma",
      "status": "PRESENT",
      "remarks": ""
    }
  ]
}
```

---

## 5. Fees & Payments (`/api/v1/fees`)

### `GET /fees/records`
Fetches student tuition & hostel fee ledgers with status (`PAID`, `PARTIAL`, `OVERDUE`).

### `POST /fees/pay`
Processes fee payments and issues an instant receipt.

**Request Body:**
```json
{
  "feeRecordId": "64d2f9d...",
  "amountPaid": 500,
  "paymentMode": "UPI",
  "transactionRef": "UPI-TXN-998877"
}
```

---

## 6. Examinations & Marks (`/api/v1/exams` & `/api/v1/marks`)

### `GET /exams`
Fetches scheduled exam timetables and hall assignments.

### `POST /marks/entry`
Enters marks for students for an exam.

---

## 7. Central Library (`/api/v1/library`)

### `GET /library/books`
Lists cataloged library books and current availability.

### `POST /library/issue`
Issues a book slip to a student/faculty.

### `POST /library/return`
Processes book returns and calculates late fine fees.

---

## 8. Assignments & Submissions (`/api/v1/assignments`)

### `GET /assignments`
Fetches active academic assignments with attached instructions.

### `POST /assignments/:id/submit`
Submits student assignment solution with file attachments and notes.

---

## 9. Leaves & Approvals (`/api/v1/leaves`)

### `GET /leaves`
Fetches leave applications for students and faculty.

### `PUT /leaves/:id/action`
Approves or rejects a leave application with approver remarks.

---

## 10. System Settings & Role Permissions (`/api/v1/settings`)

### `GET /settings/system`
Retrieves institutional configuration, current academic year, and system toggles.

### `GET /settings/permissions`
Retrieves the 7-Role Granular Permission Matrix (`SUPER_ADMIN`, `PRINCIPAL`, `HOD`, `FACULTY`, `STUDENT`, `ACCOUNTANT`, `LIBRARIAN`).

---

## Health Check Endpoint

### `GET /api/health`
Returns database connectivity status and collection document counts.
