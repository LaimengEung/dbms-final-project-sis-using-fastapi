const GradeStatCard = ({ label, value, icon, color = "#3b5bff" }) => (
  <div
    style={{
      flex: 1,
      backgroundColor: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "18px 20px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      fontFamily: "'DM Sans', sans-serif",
      minWidth: 0,
    }}
  >
    <div
      style={{
        width: "42px",
        height: "42px",
        borderRadius: "10px",
        backgroundColor: color + "18",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: "22px", fontWeight: 500, color: "#111827", lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: "12.5px", color: "#6b7280", marginTop: "3px" }}>{label}</div>
    </div>
  </div>
);

export default GradeStatCard;