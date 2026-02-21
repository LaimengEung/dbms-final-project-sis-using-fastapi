import React from 'react'
import FacultyLayout from '../../../components/layout/FacultyLayout'

// Import UI Components
import EnrollmentBar from '../../../components/ui/EnrollmentBar'
import ClassEnrollCard from '../../../components/ui/ClassEnrollCard'
import ClassEnrollmentPanel from '../../../components/ui/ClassEnrollmentPanel'

const DashboardFaculty = () => {
  return (
    <FacultyLayout>
      <div style={{ marginBottom: 20}}>
        <h1 style={{ fontSize:"20px", fontWeight: "500" }}>Welcome back</h1>
        <p>Here's what's happening with your courses and students</p>
      </div>
      <ClassEnrollmentPanel/>
    </FacultyLayout>
  )
}

export default DashboardFaculty;    