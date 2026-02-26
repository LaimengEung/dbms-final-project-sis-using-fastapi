import { MapPin } from "lucide-react"

const CalendarEventBox = ({ type = "class", title, subtitle, location }) => {
  const isClass = type === "class";

  const colors = isClass
    ? { bg: "#dbeafe", border: "#93c5fd", accent: "#3b82f6", title: "#1d4ed8", text: "#3b82f6", dot: "#3b82f6" }
    : { bg: "#d1fae5", border: "#6ee7b7", accent: "#10b981", title: "#065f46", text: "#059669", dot: "#10b981" };

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${colors.accent}`,
        borderRadius: "7px",
        padding: "7px 9px",
        fontFamily: "'DM Sans', sans-serif",
        width: "100%",
        boxSizing: "border-box",
        cursor: "default",
      }}
    >
      <div style={{ fontSize: "12.5px", fontWeight: 600, color: colors.title, marginBottom: "2px" }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: "11px", color: colors.text, marginBottom: "3px" }}>
          {subtitle}
        </div>
      )}
      {location && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <MapPin width="13" height="13" stroke={colors.text} />
          <span style={{ fontSize: "10.5px", color: colors.text }}>
            {location}
          </span>
        </div>
      )}
    </div>
  );
};

export default CalendarEventBox;