import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { BookOpen, ClipboardList, GraduationCap, LayoutDashboard, Settings, Star, User, BookMarked } from 'lucide-react';

const studentMenu = [
  { icon: <LayoutDashboard />, label: 'Dashboard', path: '/student' },
  { icon: <ClipboardList />, label: 'My Enrollments', path: '/student/enrollments' },
  { icon: <Star />, label: 'My Grades', path: '/student/grades' },
  { icon: <BookOpen />, label: 'Course Catalog', path: '/student/courses' },
  { icon: <BookMarked />, label: 'Pre-Registration', path: '/student/pre-registration' },
  { icon: <User />, label: 'My Profile', path: '/student/profile' },
];

const getStudentUser = () => {
  try {
    const current = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const firstName = String(current.first_name || '').trim();
    const lastName = String(current.last_name || '').trim();
    const name = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Student User';
    const initials = `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`.toUpperCase() || 'S';
    return {
      name,
      email: current.email || 'student@school.edu',
      initials,
      role: 'Student',
    };
  } catch {
    return {
      name: 'Student User',
      email: 'student@school.edu',
      initials: 'S',
      role: 'Student',
    };
  }
};

const studentNotifications = [
  { id: 1, title: 'Enrollment status updated', time: '10 min ago', unread: true },
  { id: 2, title: 'New grade posted', time: '1 day ago', unread: false },
];

const studentProfileLinks = [
  { label: 'My Profile', path: '/student/profile', icon: <User size={16} /> },
  { label: 'Settings', path: '/student/profile', icon: <Settings size={16} /> },
];

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();
  const studentUser = getStudentUser();

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        menuItems={studentMenu}
        user={studentUser}
        logo={{ icon: <GraduationCap />, label: 'SchoolStudent' }}
        onLogout={handleLogout}
      />
      <div className="md:pl-64">
        <Header
          user={studentUser}
          logo={{ icon: <BookOpen size={20} className="text-white" />, label: 'SchoolStudent' }}
          notifications={studentNotifications}
          profileLinks={studentProfileLinks}
          searchPlaceholder="Search courses, sections..."
          onLogout={handleLogout}
        />
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

export default StudentLayout;
