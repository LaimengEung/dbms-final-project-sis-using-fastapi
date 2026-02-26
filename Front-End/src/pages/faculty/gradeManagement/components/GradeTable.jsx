import { useState } from "react";
import GradeRow from "./GradeRow";
import { CircleCheckBig } from "lucide-react";

const COLUMNS = [
  { key: "student",       label: "Student",       align: "left"   },
  { key: "midterm",       label: "Midterm (30%)",  align: "center" },
  { key: "final",         label: "Final (40%)",    align: "center" },
  { key: "assignments",   label: "Assign. (20%)",  align: "center" },
  { key: "participation", label: "Partic. (10%)",  align: "center" },
  { key: "average",       label: "Average",        align: "center" },
  { key: "grade",         label: "Grade",          align: "center" },
  { key: "actions",       label: "Actions",        align: "center" },
];

const GradeTable = ({ students = [], onSave }) => {
  return (
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
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: "12px 16px",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  color: "#374151",
                  textAlign: col.align,
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: "40px", textAlign: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor: "#eff2ff",
                      border: "1px solid #c7d2fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircleCheckBig />
                  </div>
                  <span style={{ fontSize: "14px", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
                    No students found
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <GradeRow key={student.id} student={student} onSave={onSave} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GradeTable;