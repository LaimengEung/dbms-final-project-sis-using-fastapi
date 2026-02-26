import { useState } from "react";
import EnrollmentBar from "./EnrollmentBar";
import { Calendar, BookOpen } from "lucide-react";

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
      }}
    >
      {/* Course Code – Name combined */}
      <div style={{ fontSize: "18px", fontWeight: 700, color: "#111827", fontFamily: "'DM Sans', sans-serif", marginBottom: "8px" }}>
        {course.code} – {course.name}
      </div>

      {/* Section badge + Semester */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <span style={{ fontSize: "12px", fontWeight: 500, color: "#3b5bff", background: "#eff2ff", borderRadius: "999px", padding: "3px 11px", fontFamily: "'DM Sans', sans-serif" }}>
          {course.section}
        </span>
        <span style={{ fontSize: "13px", color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
          {course.semester ?? "Spring 2025"}
        </span>
      </div>

      {/* Meta info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#374151", fontSize: "13.5px", fontFamily: "'DM Sans', sans-serif" }}>
          <Calendar size={16} />
          {course.schedule}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#374151", fontSize: "13.5px", fontFamily: "'DM Sans', sans-serif" }}>
          <BookOpen size={16} />
          {course.room}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#374151", fontSize: "13.5px", fontFamily: "'DM Sans', sans-serif" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {course.enrolled} students enrolled
        </div>
      </div>

      {/* Enrollment Bar */}
      <EnrollmentBar enrolled={course.enrolled} capacity={course.capacity} />

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => onViewStudents?.(course)}
          style={{ flex: 1, padding: "10px 0", background: "#3b5bff", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 500, fontSize: "13.5px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s" }}
          onMouseEnter={(e) => (e.target.style.background = "#2a46e0")}
          onMouseLeave={(e) => (e.target.style.background = "#3b5bff")}
        >
          View Students
        </button>
        <button
          onClick={() => onManageGrades?.(course)}
          style={{ flex: 1, padding: "10px 0", background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: "8px", fontWeight: 500, fontSize: "13.5px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s, border-color 0.15s" }}
          onMouseEnter={(e) => { e.target.style.background = "#f9fafb"; e.target.style.borderColor = "#9ca3af"; }}
          onMouseLeave={(e) => { e.target.style.background = "#fff"; e.target.style.borderColor = "#d1d5db"; }}
        >
          Manage Grades
        </button>
      </div>
    </div>
  );
};

export default ClassEnrollCard;