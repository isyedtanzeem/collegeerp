import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute.js';
import { DashboardLayout } from '../layouts/DashboardLayout.js';
import { AuthLayout } from '../layouts/AuthLayout.js';

import { LoginPage } from '../pages/auth/LoginPage.js';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.js';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage.js';
import { DashboardPage } from '../pages/dashboard/DashboardPage.js';
import { UsersPage } from '../pages/users/UsersPage.js';
import { DepartmentsPage } from '../pages/departments/DepartmentsPage.js';
import { CoursesPage } from '../pages/courses/CoursesPage.js';
import { SubjectsPage } from '../pages/subjects/SubjectsPage.js';
import { StudentsPage } from '../pages/students/StudentsPage.js';
import { FacultyPage } from '../pages/faculty/FacultyPage.js';
import { AttendancePage } from '../pages/attendance/AttendancePage.js';
import { ExamsPage } from '../pages/exams/ExamsPage.js';
import { MarksPage } from '../pages/marks/MarksPage.js';
import { FeesPage } from '../pages/fees/FeesPage.js';
import { LibraryPage } from '../pages/library/LibraryPage.js';
import { AssignmentsPage } from '../pages/assignments/AssignmentsPage.js';
import { LeavePage } from '../pages/leaves/LeavePage.js';
import { TimetablePage } from '../pages/timetable/TimetablePage.js';
import { NoticesPage } from '../pages/notices/NoticesPage.js';
import { ReportsPage } from '../pages/reports/ReportsPage.js';
import { SettingsPage } from '../pages/settings/SettingsPage.js';
import { ProfilePage } from '../pages/profile/ProfilePage.js';
import { UnauthorizedPage } from '../pages/UnauthorizedPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* User Management restricted to Super Admin, Principal, and HOD */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PRINCIPAL', 'HOD']} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/faculty" element={<FacultyPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/marks" element={<MarksPage />} />
          <Route path="/fees" element={<FeesPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/leaves" element={<LeavePage />} />
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/notices" element={<NoticesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
};
