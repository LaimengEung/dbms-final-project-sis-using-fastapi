import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/admin/dashboard/Dashboard'
import Home from './pages/Home'

// User imports
import UserList from './pages/admin/users/UserList'
import UserCreate from './pages/admin/users/UserCreate'
import UserEdit from './pages/admin/users/UserEdit'

// Student imports
import StudentList from './pages/admin/students/StudentList'
import StudentCreate from './pages/admin/students/StudentCreate'
import StudentEdit from './pages/admin/students/StudentEdit'
import StudentView from './pages/admin/students/StudentView'

import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Debug route */}
        <Route path="/test" element={<h1>✅ Test Route Working!</h1>} />
        
        {/* Admin Dashboard */}
        <Route path="/admin" element={<Dashboard />} />
        
        {/* User routes */}
        <Route path="/admin/users/create" element={<UserCreate />} />
        <Route path="/admin/users/edit/:id" element={<UserEdit />} />
        <Route path="/admin/users" element={<UserList />} />
        
        {/* Student routes - CORRECT ORDER */}
        <Route path="/admin/students/create" element={<StudentCreate />} />
        <Route path="/admin/students/edit/:id" element={<StudentEdit />} />
        <Route path="/admin/students/:id" element={<StudentView />} />
        <Route path="/admin/students" element={<StudentList />} />
        
        {/* Default route
        <Route path="/" element={<Dashboard />} /> */}
        <Route path="/" element={<Home />} />

        
        {/* 404 route */}
        <Route path="*" element={
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>404 - Page Not Found</h1>
            <a href="/admin">Go to Dashboard</a>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App