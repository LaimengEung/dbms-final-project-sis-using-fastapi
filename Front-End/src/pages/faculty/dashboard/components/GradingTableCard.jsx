import { useState } from "react";

const LETTER_GRADES = ["Select", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"];

const gradePoints = {
  "A": 4.0, "A-": 4.0, "B+": 3.0, "B": 3.0, "B-": 3.0,
  "C+": 2.0, "C": 2.0, "C-": 2.0, "D+": 1.0, "D": 1.0, "F": 0.0,
};

const statusStyle = {
  posted: { bg: "#dcfce7", color: "#15803d" },
  draft:  { bg: "#fef9c3", color: "#a16207" },
};

const GradingTableCard = ({ students = [], onSaveDraft, onSubmitAll }) => {
  const [rows, setRows] = useState(
    students.map((s) => ({
      ...s,
      letterGrade: s.letterGrade ?? "Select",
      numericGrade: s.numericGrade ?? "",
      comment: s.comment ?? "",
      status: s.status ?? (s.letterGrade ? "posted" : "draft"),
    }))
  );

  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        // Auto-set status to draft on any edit
        updated.status = "draft";
        return updated;
      })
    );
  };

  const handleSaveDraft = () => onSaveDraft?.(rows) ?? alert("Saved as draft");
  const handleSubmitAll = () => onSubmitAll?.(rows) ?? alert("All grades submitted");

  const tdStyle = {
    padding: "11px 16px",
    verticalAlign: "middle",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    color: "#374151",
    borderBottom: "1px solid #f0f2f5",
  };

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
        {/* Info banner */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 20px",
            backgroundColor: "#eff6ff",
            borderBottom: "1px solid #bfdbfe",
            fontSize: "12.5px", color: "#1d4ed8",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Remember to save your work frequently. Click "Submit All Grades" when ready to post to students.
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              {["Student ID", "Student Name", "Letter Grade", "Numeric Grade", "Grade Points", "Comments", "Status"].map((col) => (
                <th key={col} style={{
                  padding: "12px 16px", textAlign: "left", fontSize: "12.5px",
                  fontWeight: 700, color: "#374151", fontFamily: "'DM Sans', sans-serif",
                  borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap",
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                style={{ transition: "background-color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {/* Student ID */}
                <td style={tdStyle}>
                  <span style={{ color: "#6b7280", fontSize: "12.5px" }}>{row.studentId}</span>
                </td>

                {/* Student Name */}
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      backgroundColor: "#dbeafe", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 700, color: "#3b5bff",
                      backgroundImage: row.avatarUrl ? `url(${row.avatarUrl})` : "none",
                      backgroundSize: "cover",
                    }}>
                      {!row.avatarUrl && row.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 500, color: "#111827" }}>{row.name}</span>
                  </div>
                </td>

                {/* Letter Grade dropdown */}
                <td style={tdStyle}>
                  <select
                    className="grade-select"
                    value={row.letterGrade}
                    onChange={(e) => updateRow(row.id, "letterGrade", e.target.value)}
                    style={{
                      padding: "6px 28px 6px 10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "7px",
                      fontSize: "13px",
                      fontFamily: "'DM Sans', sans-serif",
                      color: row.letterGrade === "Select" ? "#9ca3af" : "#111827",
                      fontWeight: row.letterGrade === "Select" ? 400 : 600,
                      backgroundColor: "#f9fafb",
                      cursor: "pointer",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 8px center",
                    }}
                  >
                    {LETTER_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </td>

                {/* Numeric Grade */}
                <td style={tdStyle}>
                  <input
                    className="grade-input"
                    type="number"
                    min={0}
                    max={100}
                    value={row.numericGrade}
                    placeholder="0-100"
                    onChange={(e) => updateRow(row.id, "numericGrade", e.target.value)}
                    style={{
                      width: "68px", padding: "6px 10px",
                      border: "1px solid #d1d5db", borderRadius: "7px",
                      fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
                      color: "#111827", backgroundColor: "#f9fafb",
                      transition: "border-color 0.15s, background-color 0.15s",
                    }}
                  />
                </td>

                {/* Grade Points */}
                <td style={{ ...tdStyle, fontWeight: 600, color: "#374151" }}>
                  {row.letterGrade !== "Select"
                    ? (gradePoints[row.letterGrade] ?? "—").toFixed(1)
                    : <span style={{ color: "#d1d5db" }}>—</span>}
                </td>

                {/* Comments */}
                <td style={tdStyle}>
                  <input
                    className="grade-input comment-input"
                    type="text"
                    value={row.comment}
                    placeholder="Add comments..."
                    onChange={(e) => updateRow(row.id, "comment", e.target.value)}
                    style={{
                      width: "160px", padding: "6px 10px",
                      border: "1px solid #d1d5db", borderRadius: "7px",
                      fontSize: "12.5px", fontFamily: "'DM Sans', sans-serif",
                      color: "#374151", backgroundColor: "#f9fafb",
                      transition: "border-color 0.15s, background-color 0.15s",
                    }}
                  />
                </td>

                {/* Status */}
                <td style={tdStyle}>
                  <span style={{
                    display: "inline-block", padding: "3px 11px",
                    borderRadius: "999px", fontSize: "12px", fontWeight: 600,
                    backgroundColor: statusStyle[row.status]?.bg ?? "#f3f4f6",
                    color: statusStyle[row.status]?.color ?? "#6b7280",
                    textTransform: "capitalize",
                  }}>
                    {row.status === "posted" ? "Posted" : "Draft"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer actions */}
        <div
          style={{
            display: "flex", justifyContent: "flex-end", gap: "10px",
            padding: "16px 20px", borderTop: "1px solid #e5e7eb",
          }}
        >
          <button
            onClick={handleSaveDraft}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "9px 18px", backgroundColor: "#fff",
              border: "1px solid #d1d5db", borderRadius: "8px",
              fontSize: "13.5px", fontWeight: 500, color: "#374151",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            Save All as Draft
          </button>

          <button
            onClick={handleSubmitAll}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "9px 18px", backgroundColor: "#3b5bff",
              border: "none", borderRadius: "8px",
              fontSize: "13.5px", fontWeight: 600, color: "#fff",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a46e0")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b5bff")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Submit All Grades
          </button>
        </div>
      </div>
    </>
  );
};

export default GradingTableCard;