import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

import { LayoutDashboard, BookOpen, Award, ClipboardList, Calendar, Users, Settings } from "lucide-react";

const facultyMenu = [
  { icon: <LayoutDashboard />, label: 'Dashboard', path: '/faculty' },
  { icon: <BookOpen />, label: 'My Courses', path: '/faculty/myCourses', badge: '3' },
  { icon: <Calendar />, label: 'My Schedule', path: '/faculty/mySchedule' },
  { icon: <Award />, label: 'Grade Management', path: '/faculty/gradeManagement', badge: '12' },
  { icon: <ClipboardList />, label: 'Student Requests', path: '/faculty/studentRequests' },
];

const facultyUser = {
  name: "Faculty User",
  email: "faculty@school.edu",
  initials: "F",
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
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        menuItems={facultyMenu}
        user={facultyUser}
        logo={{ icon: <Users />, label: "SchoolFaculty" }}
        onLogout={() => console.log("logout")}
      />
      <div className="md:pl-64">
        <Header 
          user={facultyUser}
          logo={{ icon: <Users />, label: "SchoolFaculty" }}
          notifications={facultyNotifications}
          profileLinks={facultyProfileLinks}
          searchPlaceholder="Search students, courses, faculty..."
          onLogout={() => console.log("logout")} />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout