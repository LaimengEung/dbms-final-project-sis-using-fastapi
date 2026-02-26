import { useState } from "react";

const gradeColors = {
  "A":  { color: "#15803d", bg: "#dcfce7" },
  "A-": { color: "#15803d", bg: "#dcfce7" },
  "B+": { color: "#1d4ed8", bg: "#dbeafe" },
  "B":  { color: "#1d4ed8", bg: "#dbeafe" },
  "B-": { color: "#1d4ed8", bg: "#dbeafe" },
  "C+": { color: "#a16207", bg: "#fef9c3" },
  "C":  { color: "#a16207", bg: "#fef9c3" },
  "C-": { color: "#a16207", bg: "#fef9c3" },
  "D":  { color: "#c2410c", bg: "#ffedd5" },
  "F":  { color: "#b91c1c", bg: "#fee2e2" },
};

const ActionBtn = ({ icon, color, hoverBg, title, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "32px", height: "32px",
        borderRadius: "50%", border: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color,
        backgroundColor: hovered ? hoverBg : "transparent",
        transition: "background-color 0.15s",
      }}
    >
      {icon}
    </button>
  );
};

const StudentListTable = ({ students = [], onViewProfile, onEmail }) => {
  return (
    <>
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Student ID", "Student Name", "Email", "Major", "Current Grade", "Actions"].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "12px 20px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#374151",
                    fontFamily: "'DM Sans', sans-serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "40px", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "44px", height: "44px", borderRadius: "50%",
                        backgroundColor: "#eff2ff", border: "1px solid #c7d2fe",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b5bff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span style={{ fontSize: "14px", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
                      No students found
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student, idx) => (
                <tr
                  key={student.id}
                  style={{
                    borderBottom: idx < students.length - 1 ? "1px solid #f0f2f5" : "none",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* Student ID */}
                  <td style={styles.td}>
                    <span style={{ fontSize: "13px", color: "#3b5bff", fontWeight: 500, cursor: "pointer" }}
                      onClick={() => onViewProfile?.(student)}>
                      {student.studentId}
                    </span>
                  </td>

                  {/* Student Name */}
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "34px", height: "34px", borderRadius: "50%",
                          backgroundColor: "#dbeafe",
                          backgroundImage: student.avatarUrl ? `url(${student.avatarUrl})` : "none",
                          backgroundSize: "cover", backgroundPosition: "center",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "13px", fontWeight: 500, color: "#3b5bff", flexShrink: 0,
                        }}
                      >
                        {!student.avatarUrl && student.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 500, color: "#111827", fontSize: "13.5px" }}>
                        {student.name}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={styles.td}>
                    <span style={{ fontSize: "13px", color: "#6b7280" }}>{student.email}</span>
                  </td>

                  {/* Major */}
                  <td style={styles.td}>
                    <span style={{ fontSize: "13px", color: "#374151" }}>{student.major}</span>
                  </td>

                  {/* Grade */}
                  <td style={styles.td}>
                    {student.grade ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 11px",
                          borderRadius: "999px",
                          fontSize: "12.5px",
                          fontWeight: 500,
                          backgroundColor: gradeColors[student.grade]?.bg ?? "#f3f4f6",
                          color: gradeColors[student.grade]?.color ?? "#374151",
                        }}
                      >
                        {student.grade}
                      </span>
                    ) : (
                      <span style={{ fontSize: "12.5px", color: "#9ca3af", fontStyle: "italic" }}>
                        Not Posted
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <ActionBtn
                        title="View Profile"
                        color="#6b7280"
                        hoverBg="#f3f4f6"
                        onClick={() => onViewProfile?.(student)}
                        icon={
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        }
                      />
                      <ActionBtn
                        title="Send Email"
                        color="#16a34a"
                        hoverBg="#dcfce7"
                        onClick={() => onEmail?.(student)}
                        icon={
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

const styles = {
  td: {
    padding: "13px 20px",
    verticalAlign: "middle",
    fontFamily: "'DM Sans', sans-serif",
  },
};

export default StudentListTable;