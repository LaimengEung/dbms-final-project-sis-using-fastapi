import React from "react";
import ScheduleBar from "./ScheduleBar";

import { Calendar, MoveRight } from "lucide-react"

const TodaySchedulePanel = ({ schedules, onViewFull}) => {
    const defaultSchedules = [
        { courseCode: "CS 301",   timeRange: "9:00 AM - 10:30 AM",  location: "Engineering 201" },
        { courseCode: "MATH 215", timeRange: "1:00 PM - 2:30 PM",   location: "Math Building 105" },
        { courseCode: "CS 315",   timeRange: "3:00 PM - 4:30 PM",   location: "Engineering 203" },
    ];
    
    const items = schedules ?? defaultSchedules;
    return (
      <>
        {/* Google Font import — drop this link into your <head> if you prefer */}
        {/* <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style> */}

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

            {/* Footer link */}
            <div style={styles.footer}>
            <button style={styles.viewLink} onClick={onViewFull}>
                View Full Schedule →
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
    maxWidth: "480px",
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
    marginTop: "16px",
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