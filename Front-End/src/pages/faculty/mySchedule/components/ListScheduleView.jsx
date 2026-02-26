import ListEventBox from "./ListEventBox";

const ListScheduleView = ({ courses = [], officeHours = [] }) => {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Teaching Schedule */}
        <div style={styles.panel}>
          <h3 style={styles.sectionTitle}>Teaching Schedule</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {courses.map((course) => (
              <ListEventBox
                key={course.id}
                type="class"
                title={`${course.code} - ${course.name}`}
                schedule={course.schedule}
                location={course.room}
                badge={course.section}
                extra={`Enrollment: ${course.enrolled}/${course.capacity} students`}
              />
            ))}
          </div>
        </div>

        {/* Office Hours */}
        <div style={styles.panel}>
          <h3 style={styles.sectionTitle}>Office Hours</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {officeHours.map((oh) => (
              <ListEventBox
                key={oh.id}
                type="office"
                title={oh.title}
                schedule={`${oh.days}  ·  ${oh.time}`}
                location={oh.location}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={styles.panel}>
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
  panel: {
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
  },
  sectionTitle: {
    margin: "0 0 14px 0",
    fontSize: "15px",
    fontWeight: 500,
    color: "#111827",
    fontFamily: "'DM Sans', sans-serif",
  },
};

export default ListScheduleView;