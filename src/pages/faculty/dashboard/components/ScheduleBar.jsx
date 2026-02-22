import React from "react";

const ScheduleBar = ({ courseCode, timeRange, location }) => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.accent} />
      <div style={styles.content}>
        <span style={styles.courseCode}>{courseCode}</span>
        <span style={styles.timeRange}>{timeRange}</span>
        <span style={styles.location}>{location}</span>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "stretch",
    backgroundColor: "#eef2fb",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "12px",
  },
  accent: {
    width: "4px",
    backgroundColor: "#3b6ee8",
    flexShrink: 0,
    borderRadius: "0",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    padding: "12px 16px",
    gap: "3px",
  },
  courseCode: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "500",
    fontSize: "15px",
    color: "#3b6ee8",
    letterSpacing: "0.01em",
  },
  timeRange: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    color: "#3b6ee8",
    fontWeight: "500",
  },
  location: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    color: "#3b6ee8",
    fontWeight: "400",
  },
};

export default ScheduleBar;