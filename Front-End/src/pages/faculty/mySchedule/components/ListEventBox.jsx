import { Clock, MapPin } from "lucide-react"

const ListEventBox = ({ type = "class", title, schedule, location, badge, extra }) => {
  const isClass = type === "class";

  const colors = isClass
    ? { bg: "#eff6ff", border: "#bfdbfe", accent: "#3b82f6", badgeBg: "#3b5bff", badgeText: "#fff", text: "#6b7280", title: "#111827" }
    : { bg: "#f0fdf4", border: "#bbf7d0", accent: "#10b981", badgeBg: "#10b981", badgeText: "#fff", text: "#6b7280", title: "#111827" };

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${colors.accent}`,
        borderRadius: "8px",
        padding: "14px 16px",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      {/* Title row + badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: colors.title }}>
          {title}
        </span>
        {badge && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              backgroundColor: colors.badgeBg,
              color: colors.badgeText,
              borderRadius: "6px",
              padding: "2px 10px",
              flexShrink: 0,
              marginLeft: "10px",
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Schedule + location row */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        {schedule && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            {/* Clock icon */}
            <Clock width="13" height="13" stroke={colors.text} />
            <span style={{ fontSize: "12.5px", color: colors.text }}>{schedule}</span>
          </div>
        )}
        {location && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <MapPin width="13" height="13" stroke={colors.text} />
            <span style={{ fontSize: "12.5px", color: colors.text }}>{location}</span>
          </div>
        )}
      </div>

      {/* Extra line (e.g. enrollment) */}
      {extra && (
        <div style={{ fontSize: "12.5px", color: colors.text, fontWeight: 500 }}>
          {extra}
        </div>
      )}
    </div>
  );
};

export default ListEventBox;