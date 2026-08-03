# 🎓 Apex Institute College ERP System

A production-ready, full-stack **Higher Education Institution Enterprise Resource Planning (ERP)** web platform built with React, TypeScript, Material-UI, Tailwind CSS, Express.js, and MongoDB.

---

## 🌟 Key Features & ERP Modules

1. **Role-Based Access Control (RBAC)**:
   - Supports 7 distinct institutional personas: `Super Admin`, `Principal`, `Head of Department (HOD)`, `Faculty`, `Student`, `Accountant`, and `Librarian`.
   - Granular permission matrix per role for Create, Read, Update, Delete, and Export operations across all modules.

2. **Student & Faculty Lifecycle Management**:
   - Comprehensive student registry (admission numbers, guardian details, department, course, section, status).
   - Faculty staff records (employee ID, designation, qualification, experience, salary, assigned subjects).

3. **Academic Management & Timetable**:
   - Departments, Degree Courses, Semester Curriculums, and Subject allocations.
   - Interactive weekly Class Timetable matrix with room assignments.

4. **Attendance Tracking**:
   - Daily class-wise attendance marking with instant percentage calculations and defaulter detection (<75%).

5. **Exams, Marks Entry & Report Cards**:
   - Examination schedules, seating plan hall allocations, marks entry, automated GPA grade calculations, and printable student marksheets.

6. **Financial Fee Ledger & Online Receipts**:
   - Tuition, Hostel, and Examination fee generation with scholarship waivers and fine calculations.
   - Payment history tracking with downloadable receipts.

7. **Central Library System**:
   - Book cataloging, rack location tracking, book issuing, return workflow, and automated overdue fine calculations.

8. **Assignments & Online Submissions**:
   - Faculty homework posting, student PDF submission portal, grading, and feedback annotation.

9. **Leave Application Workflow**:
   - Student and Faculty leave requests (Medical, Duty Leave, Casual) with HOD/Principal multi-tier approval.

10. **Institutional Notices & Announcements**:
    - High-priority circular broadcasting targeted by role (`ALL`, `STUDENT`, `FACULTY`).

11. **Institutional Reports & Settings**:
    - Comprehensive analytics dashboards with PDF/Excel export capabilities.
    - System configuration, theme mode customization, profile management, and password reset.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Material UI (MUI v9), Tailwind CSS, Lucide Icons, Recharts, Framer Motion.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), MongoDB In-Memory Server (fallback for zero-setup local dev), JWT Authentication, Multer file upload.
- **DevOps**: Docker, Docker Compose, Esbuild, Vite.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Docker & Docker Compose (optional)

### Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/apex-institute/college-erp.git
   cd college-erp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The ERP platform will start at `http://localhost:3000`. Database automatically seeds all 7 demo role accounts and sample data.

---

## 🐳 Running with Docker

You can launch the entire stack (Node.js App + MongoDB) using Docker Compose:

```bash
docker-compose up --build
```

---

## 🔑 Demo Login Credentials

All demo accounts use default password: `password123`

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@college.edu` | Full System Control, Settings, Role Matrix |
| **Principal** | `principal@college.edu` | Institutional Oversight, Approvals, Reports |
| **HOD (CS)** | `hod.cs@college.edu` | Department Curriculum, Faculty & Leave Control |
| **Faculty** | `faculty@college.edu` | Attendance, Marks Entry, Assignments |
| **Student** | `student@college.edu` | View Marks, Attendance, Pay Fees, Submit Assignments |
| **Accountant** | `accountant@college.edu` | Fee Receipts, Financial Ledgers, Pending Dues |
| **Librarian** | `librarian@college.edu` | Issue & Return Books, Catalog, Overdue Fines |

---

## 🧪 Testing & Audit Checklist

1. **Authentication**: Test login with all 7 roles; verify unauthorized page redirection when accessing restricted routes.
2. **Student Registry**: Create a new student, search by roll number, edit profile details.
3. **Attendance**: Mark bulk attendance for a subject; verify attendance percentage updates in student profile.
4. **Fees**: Pay a pending tuition fee using UPI/Online mode and verify instant receipt generation.
5. **Exams & Marks**: Schedule an exam, enter student marks, check student report card.
6. **Library**: Issue a book to a student and process return with fine calculation.
7. **Assignments**: Post an assignment as Faculty, log in as Student to submit solution, and grade as Faculty.
8. **Settings**: Switch theme accent color and verify role permissions toggle.
