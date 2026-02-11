import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

const FacultyLayout = ({ children, title = "Dashboard" }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:pl-64">
        <Header title={title} />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default FacultyLayout