import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut, BookOpen } from "lucide-react";
import { NavLink } from 'react-router-dom';

const Sidebar = ({
  menuItems = [],
  user = { name: "User", email: "user@school.edu", initials: "U" },
  logo = { icon: <BookOpen />, label: "SchoolAdmin" },
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white">{logo.icon}</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{logo.label}</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white">{logo.icon}</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)] scrollbar-hide">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg transition-colors relative ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="ml-3 flex-1">{item.label}</span>
                {item.badge && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {collapsed && item.badge && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className={`absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4 ${collapsed ? 'px-2' : 'px-4'}`}>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-semibold">{user.initials}</span>
          </div>
          {!collapsed && (
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
          <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <LogOut className="text-gray-600" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;