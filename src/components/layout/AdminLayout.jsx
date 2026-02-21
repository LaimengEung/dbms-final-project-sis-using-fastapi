import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { LayoutDashboard, Users, User, BookCheck, LayoutGrid, Clipboard, FileText, DollarSign, ChartNoAxesColumn, Settings } from "lucide-react";

const adminMenu = [
  { icon: <LayoutDashboard />, label: 'Dashboard', path: '/admin' },
  { icon: <Users />, label: 'Users', path: '/admin/users', badge: '3' },
  { icon: <User />, label: 'Students', path: '/admin/students', badge: '12' },
  { icon: <BookCheck />, label: 'Faculty', path: '/admin/faculty' },
  { icon: <LayoutGrid />, label: 'Academics', path: '/admin/academics' },
  { icon: <Clipboard />, label: 'Enrollments', path: '/admin/enrollments' },
  { icon: <FileText />, label: 'Grades', path: '/admin/grades' },
  { icon: <DollarSign />, label: 'Finance', path: '/admin/finance' },
  { icon: <ChartNoAxesColumn />, label: 'Reports', path: '/admin/reports' },
  { icon: <Settings />, label: 'Settings', path: '/admin/settings' },
];

const adminUser = {
  name: "Admin User",
  email: "admin@school.edu",
  initials: "A",
};

const adminNotifications = [
  { id: 1, title: 'New student registration', time: '5 min ago',  unread: true },
  { id: 2, title: 'Payment received',         time: '1 hour ago', unread: true },
  { id: 3, title: 'System update completed',  time: 'Yesterday',  unread: false },
];

const adminProfileLinks = [
  { label: 'My Profile', path: '/admin/profile',  icon: <User size={16} /> },
  { label: 'Settings',   path: '/admin/settings', icon: <Settings size={16} /> },
];

const AdminLayout = ({ children, title = "Dashboard" }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        menuItems={adminMenu}
        user={adminUser}
        logo={{ icon: <Settings />, label: "SchoolAdmin" }}
        onLogout={() => console.log("logout")}
      />
      <div className="md:pl-64">
        <Header
          user={adminUser}
          logo={{ icon: <Settings />, label: "SchoolAdmin" }}
          notifications={adminNotifications}
          profileLinks={adminProfileLinks}
          searchPlaceholder="Search students, courses, faculty..."
          onLogout={() => console.log("logout")}
        />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;