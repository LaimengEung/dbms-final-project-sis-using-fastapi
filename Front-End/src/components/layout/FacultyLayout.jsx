import React from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

import { LayoutDashboard, BookOpen, Award, ClipboardList, Calendar, Users, Settings } from "lucide-react";

const facultyMenu = [
  { icon: <LayoutDashboard />, label: 'Dashboard', path: '/faculty' },
  { icon: <BookOpen />, label: 'My Courses', path: '/faculty/myCourses' },
  { icon: <Calendar />, label: 'My Schedule', path: '/faculty/mySchedule' },
  { icon: <Award />, label: 'Grade Management', path: '/faculty/gradeManagement' },
  { icon: <ClipboardList />, label: 'Student Requests', path: '/faculty/studentRequests' },
];

const getFacultyUser = () => {
  try {
    const current = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const firstName = String(current.first_name || '').trim();
    const lastName = String(current.last_name || '').trim();
    const name = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Faculty User';
    const initials = `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`.toUpperCase() || 'F';
    return {
      name,
      email: current.email || 'faculty@school.edu',
      initials,
    };
  } catch {
    return {
      name: 'Faculty User',
      email: 'faculty@school.edu',
      initials: 'F',
    };
  }
};

const facultyNotifications = [
  { id: 1, title: 'Student submitted assignment', time: '5 min ago',  unread: true },
  { id: 2, title: 'Grade review requested',       time: '1 hour ago', unread: true },
  { id: 3, title: 'New student request',          time: 'Yesterday',  unread: false },
];

const facultyProfileLinks = [
  { label: 'My Profile', path: '/faculty',  icon: <Users size={16} /> },
  { label: 'Settings',   path: '/faculty', icon: <Settings size={16} /> },
];

const FacultyLayout = ({ children, title = "Dashboard" }) => {
  const navigate = useNavigate()
  const facultyUser = getFacultyUser()
  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('accessToken')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        menuItems={facultyMenu}
        user={facultyUser}
        logo={{ icon: <Users />, label: "SchoolFaculty" }}
        onLogout={handleLogout}
      />
      <div className="md:pl-64">
        <Header 
          user={facultyUser}
          logo={{ icon: <Users />, label: "SchoolFaculty" }}
          notifications={facultyNotifications}
          profileLinks={facultyProfileLinks}
          searchPlaceholder="Search students, courses, faculty..."
          onLogout={handleLogout} />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout
