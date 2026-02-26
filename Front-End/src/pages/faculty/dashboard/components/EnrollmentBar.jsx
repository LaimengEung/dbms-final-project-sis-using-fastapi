const EnrollmentBar = ({ enrolled, capacity }) => {
  const percent = Math.round((enrolled / capacity) * 100);
  const color = percent >= 90 ? "#ef4444" : percent >= 70 ? "#3b5bff" : "#3b5bff";

  return (
    <div style={{ marginBottom: "18px" }}>
      {/* Title and Capacity */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "13px", color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>Enrollment</span>
        <span style={{ fontSize: "13px", color: "#111827", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
          {enrolled}/{capacity}
        </span>
      </div>
      {/* Enrollment Bar */}
      <div style={{ height: "6px", background: "#e5e7eb", borderRadius: "999px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: color,
            borderRadius: "999px",
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}

export default EnrollmentBar;