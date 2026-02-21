import { useState } from 'react';

import EnrollmentBar from './EnrollmentBar';

import { Calendar, BookOpen } from "lucide-react"

const ClassEnrollCard = ({ course, onViewStudents, onManageGrades }) => {
  const [hovered, setHovered] = useState(false);
    return (
      <div 
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#fff",
          borderRadius: "14px",
          border: "1px solid #e5e7eb",
          padding: "22px 22px 20px",
          width: "100%",
          boxSizing: "border-box",
          boxShadow: hovered
          ? "0 8px 30px rgba(59,91,255,0.10), 0 2px 8px rgba(0,0,0,0.06)"
          : "0 1px 4px rgba(0,0,0,0.05)",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          transition: "box-shadow 0.22s ease, transform 0.22s ease",
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}
      >

        {/* Course ID and Section No. */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>
            {course.code}
            </span>
            <span
            style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#3b5bff",
                background: "#eff2ff",
                borderRadius: "999px",
                padding: "3px 11px",
                fontFamily: "'DM Sans', sans-serif",
            }}
            >
            {course.section}
            </span>
        </div>

        {/* Course Name */}  
        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px", fontFamily: "'DM Sans', sans-serif" }}>
            {course.name}
        </div> 

        {/* Meta info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#374151", fontSize: "13.5px", fontFamily: "'DM Sans', sans-serif" }}>
            <Calendar />
            {course.schedule}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#374151", fontSize: "13.5px", fontFamily: "'DM Sans', sans-serif" }}>
            <BookOpen />
            {course.room}
          </div>
        </div>

        {/* Enrollment Bar Section */}
        <EnrollmentBar enrolled={course.enrolled} capacity={course.capacity} />

        {/* Action Buttons (View Students and Manage Grades) */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => onViewStudents?.(course)}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "#3b5bff",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "13.5px",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.target.style.background = "#2a46e0")}
            onMouseLeave={e => (e.target.style.background = "#3b5bff")}
          >
            View Students
          </button>
          <button
            onClick={() => onManageGrades?.(course)}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "#fff",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontWeight: 500,
              fontSize: "13.5px",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => { e.target.style.background = "#f9fafb"; e.target.style.borderColor = "#9ca3af"; }}
            onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.borderColor = "#d1d5db"; }}
          >
            Manage Grades
          </button>
        </div>
      </div>
    );
}

export default ClassEnrollCard;