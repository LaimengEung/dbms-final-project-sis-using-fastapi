import React from "react";
import FacultyLayout from "../../../components/layout/FacultyLayout";

// Import UI Components
import ClassEnrollmentPanel from "./components/ClassEnrollmentPanel";
import TodaySchedulePanel from "./components/TodaySchedulePanel";
import GradeSubmissionPanel from "./components/GradeSubmissionPanel";

const DashboardFaculty = () => {
  return (
    <FacultyLayout>
      <div className="Welcome-Section" style={{ marginBottom: 20 }}>
        <h1
          className="Welcome-User"
          style={{ fontSize: "20px", fontWeight: "500" }}
        >
          Welcome back
        </h1>
        <p classname="Welcome-Subtitle">
          Here's what's happening with your courses and students
        </p>
      </div>
      <ClassEnrollmentPanel />
      <TodaySchedulePanel />
      <GradeSubmissionPanel />
    </FacultyLayout>
  );
};

export default DashboardFaculty;
