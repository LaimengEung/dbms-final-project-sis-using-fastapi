import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/admin/dashboard/Dashboard'
import Home from './pages/HomeDefault'

// Home / entry
import HomeDefault from './pages/HomeDefault';

// Admin dashboard
import Dashboard from './pages/admin/dashboard/Dashboard';

import './App.css'
import DashboardFaculty from './pages/faculty/dashboard/DashboardFaculty'

function App() {
  return (
    <Router>
      <Routes>
        {/* Root */}
        <Route path="/" element={<HomeDefault />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<Dashboard />} />

        {/* Admin Dashboard */}
        <Route path="/faculty" element={<DashboardFaculty />} />
        
        {/* User routes */}
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
