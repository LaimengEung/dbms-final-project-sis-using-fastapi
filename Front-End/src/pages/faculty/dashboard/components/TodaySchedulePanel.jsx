import React from "react";
import { useNavigate } from "react-router-dom";
import ScheduleBar from "./ScheduleBar";

import { Calendar, MoveRight } from "lucide-react"

const TodaySchedulePanel = ({ schedules, onViewSchedule }) => {
    const defaultSchedules = [
        { courseCode: "CS 301",   timeRange: "9:00 AM - 10:30 AM",  location: "Engineering 201" },
        { courseCode: "MATH 215", timeRange: "1:00 PM - 2:30 PM",   location: "Math Building 105" },
        { courseCode: "CS 315",   timeRange: "3:00 PM - 4:30 PM",   location: "Engineering 203" },
    ];

    const navigate = useNavigate();
    const items = schedules ?? defaultSchedules;
    return (
      <>
        <div style={styles.panel}>
          {/* Header */}
            <div style={styles.header}>
            <Calendar color="#3b6ee8"/>
            
            <h2 style={styles.title}>Today's Schedule</h2>
            </div>

            {/* Schedule items */}
            <div style={styles.list}>
            {items.map((item, idx) => (
                <ScheduleBar
                key={idx}
                courseCode={item.courseCode}
                timeRange={item.timeRange}
                location={item.location}
                />
            ))}
            </div>

            {/* View Full Schedule button */}
            <div style={styles.footer}>
            <button style={styles.viewButton} onClick={() => navigate(onViewSchedule)}>
              View Full Schedule
            </button>
            </div>
        </div>
        </>
    );
};

const styles = {
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    fontFamily: "'DM Sans', sans-serif",
    minWidth: "320px",
    height: "100%",
    boxSizing: "border-box",
    display: "flex",         
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "500",
    color: "#1a1a2e",
    letterSpacing: "-0.01em",
  },
  list: {
    display: "flex",
    flexDirection: "column",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "auto",
  },
  viewButton: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#3b6ee8",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "500",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    letterSpacing: "0.01em",
    transition: "background-color 0.3s ease, color 0.3s ease",
  },
  viewLink: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#3b6ee8",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "'DM Sans', sans-serif",
    padding: 0,
    textDecoration: "none",
  },
};

export default TodaySchedulePanel;