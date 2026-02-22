import React from "react";

import { CircleAlert, CircleCheckBig } from "lucide-react"

const GradeSubmissionPanel = ({ reminders, onPostGrades }) => {
  const defaultReminders = [
    { course: "CS 301", label: "Final Grades",   dueIn: 3 },
    { course: "CS 450", label: "Midterm Grades",  dueIn: 5 },
    { course: "CS 490", label: "Project Grades",  dueIn: 7 },
  ];

  const items = reminders ?? defaultReminders;
  const hasPending = items.length > 0;

  // ── Theme tokens — switch between orange (pending) and neutral (clear) ──
  const theme = hasPending
    ? {
        cardBg:        "#fffbf0",
        cardBorder:    "1px solid #fde8bb",
        iconStroke:    "#d97706",
        countColor:    "#1a1a2e",
        subtitleColor: "#d97706",
        subtitleText:  "Courses need grade submission",
        dueTagColor:   "#d97706",
        buttonBg:      "#d97706",
        buttonColor:   "#ffffff",
      }
    : {
        cardBg:        "#ffffff",
        cardBorder:    "1px solid #e8eaf0",
        iconStroke:    "#9ca3af",
        countColor:    "#9ca3af",
        subtitleColor: "#9ca3af",
        subtitleText:  "All grades submitted — nothing pending",
        dueTagColor:   "#9ca3af",
        buttonBg:      "#e5e7eb",
        buttonColor:   "#9ca3af",
      };

  return (
    <>
      {/* <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style> */}

      <div
        style={{
          backgroundColor: theme.cardBg,
          border: theme.cardBorder,
          borderRadius: "14px",
          padding: "24px",
          fontFamily: "'DM Sans', sans-serif",
          minWidth: "320px",
          maxWidth: "520px",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Header */}
        <div style={styles.header}>
          {hasPending ? (
            /* Alert circle — shown only when there are pending submissions */
            <CircleAlert color="#d97706" />
          ) : (
            /* Check circle — shown when all grades are submitted */
            <CircleCheckBig />
          )}
          <h2 style={styles.title}>Grade Submission Reminders</h2>
        </div>

        {/* Count */}
        <div style={styles.countRow}>
          <span style={{ ...styles.count, color: theme.countColor }}>
            {items.length}
          </span>
        </div>

        <p style={{ ...styles.subtitle, color: theme.subtitleColor }}>
          {theme.subtitleText}
        </p>

        {/* Pending state — reminder rows + button */}
        {hasPending && (
          <>
            <div style={styles.list}>
              {items.map((item, idx) => (
                <div key={idx} style={styles.reminderRow}>
                  <span style={styles.reminderLabel}>
                    {item.course} – {item.label}
                  </span>
                  <span style={{ ...styles.dueTag, color: theme.dueTagColor }}>
                    Due in {item.dueIn} days
                  </span>
                </div>
              ))}
            </div>

            <button
              style={{
                ...styles.postButton,
                backgroundColor: theme.buttonBg,
                color: theme.buttonColor,
              }}
              onClick={onPostGrades}
            >
              Post Grades
            </button>
          </>
        )}

        {/* Empty state */}
        {!hasPending && (
          <div style={styles.emptyState}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p style={styles.emptyText}>You're all caught up!</p>
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "500",
    color: "#1a1a2e",
    letterSpacing: "-0.01em",
  },
  countRow: {
    marginBottom: "2px",
  },
  count: {
    fontSize: "30px",
    fontWeight: "500",
    lineHeight: 1,
    transition: "color 0.3s ease",
  },
  subtitle: {
    margin: "0 0 20px 0",
    fontSize: "14px",
    fontWeight: "500",
    transition: "color 0.3s ease",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "24px",
  },
  reminderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reminderLabel: {
    fontSize: "14px",
    fontWeight: "400",
    color: "#1a1a2e",
  },
  dueTag: {
    fontSize: "13px",
    fontWeight: "500",
    transition: "color 0.3s ease",
  },
  postButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    letterSpacing: "0.01em",
    transition: "background-color 0.3s ease, color 0.3s ease",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    padding: "16px 0 4px",
  },
  emptyText: {
    margin: 0,
    fontSize: "14px",
    color: "#9ca3af",
    fontWeight: "500",
  },
};

export default GradeSubmissionPanel;