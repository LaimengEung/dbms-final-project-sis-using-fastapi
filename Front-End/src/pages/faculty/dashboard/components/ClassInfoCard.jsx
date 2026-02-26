const ClassInfoCard = ({ course }) => {
  return (
    <>
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "18px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Left: course info */}
        <div>
          <div style={{ fontSize: "15px", fontWeight: 500, color: "#111827", marginBottom: "6px" }}>
            {course.code} – {course.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280" }}>
            <span>{course.section}</span>
            <span style={{ color: "#d1d5db" }}>•</span>
            <span>{course.schedule}</span>
            <span style={{ color: "#d1d5db" }}>•</span>
            <span>{course.room}</span>
          </div>
        </div>

        {/* Right: enrollment count */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11.5px", color: "#9ca3af", marginBottom: "2px" }}>Total Enrolled</div>
          <div style={{ fontSize: "32px", fontWeight: 500, color: "#111827", lineHeight: 1 }}>
            {course.enrolled}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClassInfoCard;