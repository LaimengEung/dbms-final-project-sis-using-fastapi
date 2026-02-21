import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Home / entry
import HomeDefault from './pages/HomeDefault';

// Admin dashboard
import Dashboard from './pages/admin/dashboard/Dashboard';

// Admin users
import UserList from './pages/admin/users/UserList';
import UserCreate from './pages/admin/users/UserCreate';
import UserEdit from './pages/admin/users/UserEdit';

// Admin students
import StudentList from './pages/admin/students/StudentList';
import StudentCreate from './pages/admin/students/StudentCreate';
import StudentEdit from './pages/admin/students/StudentEdit';
import StudentView from './pages/admin/students/StudentView';

// Admin enrollments
import EnrollmentList from './pages/admin/enrollments/EnrollmentList';
import EnrollmentCreate from './pages/admin/enrollments/EnrollmentCreate';
import EnrollmentEdit from './pages/admin/enrollments/EnrollmentEdit';
import EnrollmentView from './pages/admin/enrollments/EnrollmentView';

function App() {
  return (
    <Router>
      <Routes>
        {/* Root */}
        <Route path="/" element={<HomeDefault />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<Dashboard />} />

        {/* Admin Users */}
        <Route path="/admin/users" element={<UserList />} />
        <Route path="/admin/users/create" element={<UserCreate />} />
        <Route path="/admin/users/edit/:id" element={<UserEdit />} />

        {/* Admin Students */}
        <Route path="/admin/students" element={<StudentList />} />
        <Route path="/admin/students/create" element={<StudentCreate />} />
        <Route path="/admin/students/edit/:id" element={<StudentEdit />} />
        <Route path="/admin/students/:id" element={<StudentView />} />

        {/* Admin Enrollments */}
        <Route path="/admin/enrollments" element={<EnrollmentList />} />
        <Route path="/admin/enrollments/create" element={<EnrollmentCreate />} />
        <Route path="/admin/enrollments/edit/:id" element={<EnrollmentEdit />} />
        <Route path="/admin/enrollments/:id" element={<EnrollmentView />} />

        {/* Optional legacy support */}
        <Route path="/enrollments" element={<Navigate to="/admin/enrollments" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
