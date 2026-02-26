import CalendarEventBox from "./CalendarEventBox";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

const formatHour = (h) => {
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h;
  return `${display}:00 ${suffix}`;
};

const CalendarScheduleView = ({ events = [] }) => {
  // Build a lookup: day -> hour -> event
  const cellMap = {};
  DAYS.forEach((d) => { cellMap[d] = {}; });

  events.forEach((ev) => {
    ev.days.forEach((day) => {
      const startHour = Math.floor(ev.startHour);
      cellMap[day][startHour] = ev;
    });
  });

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
            {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "80px repeat(5, 1fr)", borderBottom: "1px solid #e5e7eb" }}>
            <div style={styles.headerCell} />
            {DAYS.map((day) => (
              <div key={day} style={styles.headerCell}>{day}</div>
            ))}
          </div>

          {/* Time rows */}
          {HOURS.map((hour, rowIdx) => (
            <div
                key={hour}
                style={{
                display: "grid",
                gridTemplateColumns: "80px repeat(5, 1fr)",
                borderBottom: rowIdx < HOURS.length - 1 ? "1px solid #f0f2f5" : "none",
                minHeight: "64px",
                }}
            >
              {/* Time label */}
              <div style={styles.timeCell}>{formatHour(hour)}</div>

              {/* Day cells */}
              {DAYS.map((day) => {
                const ev = cellMap[day][hour];
                return (
                  <div key={day} style={styles.dayCell}>
                    {ev && (
                      <CalendarEventBox
                        type={ev.type}
                        title={ev.title}
                        subtitle={ev.subtitle}
                        location={ev.location}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div 
          style={{ 
            padding: "16px 20px",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            backgroundColor: "#fff", 
          }}
        >
          <h3 style={styles.sectionTitle}>Legend</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ width: "14px", height: "14px", borderRadius: "3px", backgroundColor: "#3b82f6", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: "#374151" }}>Teaching Classes</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ width: "14px", height: "14px", borderRadius: "3px", backgroundColor: "#10b981", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: "#374151" }}>Office Hours</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  headerCell: {
    padding: "10px 12px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#6b7280",
    textAlign: "center",
    fontFamily: "'DM Sans', sans-serif",
    backgroundColor: "#f9fafb",
  },
  timeCell: {
    padding: "10px 10px 10px 12px",
    fontSize: "12px",
    color: "#9ca3af",
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    backgroundColor: "#f9fafb",
    borderRight: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  dayCell: {
    padding: "6px 8px",
    borderRight: "1px solid #f0f2f5",
  },
};

export default CalendarScheduleView;