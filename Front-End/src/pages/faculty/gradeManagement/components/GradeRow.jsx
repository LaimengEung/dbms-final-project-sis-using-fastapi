import { useState } from "react";

/**
 * GradeRow
 * Props:
 *  - student   {object}  { id, name, studentId, avatarUrl, grades: { midterm, final, assignments, participation } }
 *  - onSave    {function(studentId, updatedGrades)}
 */

const getLetterGrade = (score) => {
  if (score >= 90) return { letter: "A", color: "#15803d", bg: "#dcfce7" };
  if (score >= 80) return { letter: "B", color: "#1d4ed8", bg: "#dbeafe" };
  if (score >= 70) return { letter: "C", color: "#a16207", bg: "#fef9c3" };
  if (score >= 60) return { letter: "D", color: "#c2410c", bg: "#ffedd5" };
  return { letter: "F", color: "#b91c1c", bg: "#fee2e2" };
};

const calcAverage = (grades) => {
  const { midterm, final, assignments, participation } = grades;
  return Math.round(midterm * 0.3 + final * 0.4 + assignments * 0.2 + participation * 0.1);
};

const GradeRow = ({ student, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [grades, setGrades] = useState({ ...student.grades });
  const [hovered, setHovered] = useState(false);

  const average = calcAverage(grades);
  const { letter, color, bg } = getLetterGrade(average);

  const handleChange = (field, val) => {
    const num = Math.min(100, Math.max(0, Number(val)));
    setGrades((prev) => ({ ...prev, [field]: num }));
  };

  const handleSave = () => {
    onSave?.(student.id, grades);
    setEditing(false);
  };

  const handleCancel = () => {
    setGrades({ ...student.grades });
    setEditing(false);
  };

  const tdStyle = {
    padding: "14px 16px",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    verticalAlign: "middle",
    color: "#374151",
  };

  const inputStyle = {
    width: "56px",
    padding: "5px 8px",
    border: "1px solid #93c5fd",
    borderRadius: "6px",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#1d4ed8",
    fontWeight: 600,
    outline: "none",
    textAlign: "center",
    backgroundColor: "#eff6ff",
  };

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? "#f9fafb" : "transparent",
        transition: "background-color 0.15s",
        borderBottom: "1px solid #f0f2f5",
      }}
    >
      {/* Student */}
      <td style={tdStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: "#dbeafe",
              backgroundImage: student.avatarUrl ? `url(${student.avatarUrl})` : "none",
              backgroundSize: "cover",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 700,
              color: "#3b5bff",
              flexShrink: 0,
            }}
          >
            {!student.avatarUrl && student.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: "#111827", fontSize: "14px" }}>{student.name}</div>
            <div style={{ fontSize: "11.5px", color: "#9ca3af" }}>{student.studentId}</div>
          </div>
        </div>
      </td>

      {/* Grade fields */}
      {["midterm", "final", "assignments", "participation"].map((field) => (
        <td key={field} style={{ ...tdStyle, textAlign: "center" }}>
          {editing ? (
            <input
              type="number"
              min={0}
              max={100}
              value={grades[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              style={inputStyle}
            />
          ) : (
            <span style={{ fontWeight: 500 }}>{grades[field]}%</span>
          )}
        </td>
      ))}

      {/* Average */}
      <td style={{ ...tdStyle, textAlign: "center" }}>
        <span style={{ fontWeight: 700, color: "#111827" }}>{average}%</span>
      </td>

      {/* Letter Grade */}
      <td style={{ ...tdStyle, textAlign: "center" }}>
        <span
          style={{
            display: "inline-block",
            padding: "3px 12px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 700,
            backgroundColor: bg,
            color,
          }}
        >
          {letter}
        </span>
      </td>

      {/* Actions */}
      <td style={{ ...tdStyle, textAlign: "center" }}>
        {editing ? (
          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
            <button
              onClick={handleSave}
              style={{
                padding: "5px 14px",
                backgroundColor: "#3b5bff",
                color: "#fff",
                border: "none",
                borderRadius: "7px",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: "5px 12px",
                backgroundColor: "#fff",
                color: "#6b7280",
                border: "1px solid #d1d5db",
                borderRadius: "7px",
                fontSize: "12.5px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: "5px 14px",
              backgroundColor: "transparent",
              color: "#3b5bff",
              border: "1px solid #c7d2fe",
              borderRadius: "7px",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eff2ff")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  );
};

export default GradeRow;