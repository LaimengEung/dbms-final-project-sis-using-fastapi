import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './context/ThemeContext';

import HomeDefault from './pages/HomeDefault';
import Dashboard from './pages/admin/dashboard/Dashboard';
import UserList from './pages/admin/users/UserList';
import UserCreate from './pages/admin/users/UserCreate';
import UserEdit from './pages/admin/users/UserEdit';
import StudentList from './pages/admin/students/StudentList';
import StudentCreate from './pages/admin/students/StudentCreate';
import StudentEdit from './pages/admin/students/StudentEdit';
import StudentView from './pages/admin/students/StudentView';
import EnrollmentList from './pages/admin/enrollments/EnrollmentList';
import EnrollmentCreate from './pages/admin/enrollments/EnrollmentCreate';
import EnrollmentEdit from './pages/admin/enrollments/EnrollmentEdit';
import EnrollmentView from './pages/admin/enrollments/EnrollmentView';
import FacultyList from './pages/admin/faculty/FacultyList';
import FacultyCreate from './pages/admin/faculty/FacultyCreate';
import FacultyEdit from './pages/admin/faculty/FacultyEdit';
import FacultyView from './pages/admin/faculty/FacultyView';
import SemesterList from './pages/admin/semesters/SemesterList'
import CourseList from './pages/admin/courses/CourseList'
import CourseCreate from './pages/admin/courses/CourseCreate'
import CourseEdit from './pages/admin/courses/CourseEdit'
import CourseView from './pages/admin/courses/CourseView'
import SectionList from './pages/admin/sections/SectionList'
import SectionCreate from './pages/admin/sections/SectionCreate'
import SectionEdit from './pages/admin/sections/SectionEdit'
import Reports from './pages/admin/reports/Reports'
import DepartmentList from './pages/admin/departments/DepartmentList'
import MajorList from './pages/admin/majors/MajorList'
import AdminGrades from './pages/admin/grades/AdminGrades'
import DashboardFaculty from './pages/faculty/dashboard/DashboardFaculty'
import MyCourses from './pages/faculty/myCourses/MyCourses';
import MySchedule from './pages/faculty/mySchedule/MySchedule';
import DashboardStudent from './pages/student/dashboard/DashboardStudent';
import MyEnrollments from './pages/student/enrollments/MyEnrollments';
import MyGrades from './pages/student/grades/MyGrades';
import CourseCatalog from './pages/student/courses/CourseCatalog';

import MyProfile from './pages/student/profile/MyProfile';
import RoleLogin from './pages/auth/RoleLogin';
import ChangePassword from './pages/auth/ChangePassword';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GradeManagement from './pages/faculty/gradeManagement/GradeManagement';
import StudentRequests from './pages/faculty/studentRequests/StudentRequests';


const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Root */}
          <Route path="/" element={<HomeDefault />} />
          <Route path="/login" element={<Navigate to="/login/student" replace />} />
          <Route path="/login/:role" element={<RoleLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute allowedRoles={['admin', 'registrar', 'teacher', 'faculty', 'student']}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />

          {/* Faculty */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'faculty']}>
                <DashboardFaculty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/myCourses"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'faculty']}>
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/mySchedule"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'faculty']}>
                <MySchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/gradeManagement"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'faculty']}>
                <GradeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/studentRequests"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'faculty']}>
                <StudentRequests />
              </ProtectedRoute>
            }
          />

          {/* Student */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardStudent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/enrollments"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyEnrollments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/grades"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyGrades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CourseCatalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar"
            element={
              <ProtectedRoute allowedRoles={['registrar']}>
                <Navigate to="/" replace />
              </ProtectedRoute>
            }
          />
          {/* User routes */}
          <Route path="/admin/users" element={<AdminRoute><UserList /></AdminRoute>} />
          <Route path="/admin/users/create" element={<AdminRoute><UserCreate /></AdminRoute>} />
          <Route path="/admin/users/edit/:id" element={<AdminRoute><UserEdit /></AdminRoute>} />

          {/* Admin Students */}
          <Route path="/admin/students" element={<AdminRoute><StudentList /></AdminRoute>} />
          <Route path="/admin/students/create" element={<AdminRoute><StudentCreate /></AdminRoute>} />
          <Route path="/admin/students/edit/:id" element={<AdminRoute><StudentEdit /></AdminRoute>} />
          <Route path="/admin/students/:id" element={<AdminRoute><StudentView /></AdminRoute>} />

          {/* Admin Enrollments */}
          <Route path="/admin/enrollments" element={<AdminRoute><EnrollmentList /></AdminRoute>} />
          <Route path="/admin/enrollments/create" element={<AdminRoute><EnrollmentCreate /></AdminRoute>} />
          <Route path="/admin/enrollments/edit/:id" element={<AdminRoute><EnrollmentEdit /></AdminRoute>} />
          <Route path="/admin/enrollments/:id" element={<AdminRoute><EnrollmentView /></AdminRoute>} />

          {/* Admin Faculty */}
          <Route path="/admin/faculty" element={<AdminRoute><FacultyList /></AdminRoute>} />
          <Route path="/admin/faculty/create" element={<AdminRoute><FacultyCreate /></AdminRoute>} />
          <Route path="/admin/faculty/edit/:id" element={<AdminRoute><FacultyEdit /></AdminRoute>} />
          <Route path="/admin/faculty/:id" element={<AdminRoute><FacultyView /></AdminRoute>} />

          {/* Admin Semesters */}
          <Route path="/admin/semesters" element={<AdminRoute><SemesterList /></AdminRoute>} />

          {/* Admin Courses */}
          <Route path="/admin/courses" element={<AdminRoute><CourseList /></AdminRoute>} />
          <Route path="/admin/courses/create" element={<AdminRoute><CourseCreate /></AdminRoute>} />
          <Route path="/admin/courses/edit/:id" element={<AdminRoute><CourseEdit /></AdminRoute>} />
          <Route path="/admin/courses/:id" element={<AdminRoute><CourseView /></AdminRoute>} />

          {/* Admin Sections */}
          <Route path="/admin/sections" element={<AdminRoute><SectionList /></AdminRoute>} />
          <Route path="/admin/sections/create" element={<AdminRoute><SectionCreate /></AdminRoute>} />
          <Route path="/admin/sections/edit/:id" element={<AdminRoute><SectionEdit /></AdminRoute>} />

          {/* Admin Departments & Majors */}
          <Route path="/admin/departments" element={<AdminRoute><DepartmentList /></AdminRoute>} />
          <Route path="/admin/majors" element={<AdminRoute><MajorList /></AdminRoute>} />

          {/* Admin Grades */}
          <Route path="/admin/grades" element={<AdminRoute><AdminGrades /></AdminRoute>} />

          {/* Admin Reports */}
          <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />

          {/* Optional legacy support */}
          <Route path="/enrollments" element={<Navigate to="/admin/enrollments" replace />} />
          <Route path="/admin/academics" element={<Navigate to="/admin/semesters" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
