const GradeStatsCard = ({ average = "—", median = "—", graded = 0, total = 0 }) => (
  <>
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px 24px",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "100%",
        boxSizing: "border-box",
        flex: 1,
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Grade Statistics</div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <StatItem label="Average Grade" value={average} valueSize="22px" />
        <StatItem label="Median Grade"  value={String(median)} valueSize="22px" />
        <StatItem label="Graded Students" value={`${graded} / ${total}`} valueSize="22px" />
      </div>
    </div>
  </>
);

const StatItem = ({ label, value, valueSize }) => (
  <div>
    <div style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "1px" }}>{label}</div>
    <div style={{ fontSize: valueSize, fontWeight: 500, color: "#111827", lineHeight: 1.15 }}>{value}</div>
  </div>
);

export default GradeStatsCard;