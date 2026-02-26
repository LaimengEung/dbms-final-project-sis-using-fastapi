import React from "react";
import { useNavigate } from "react-router-dom";

import { CircleAlert, CircleCheckBig } from "lucide-react"

const PendingApprovalPanel = ({ requests, onViewRequests }) => {
  const defaultRequests = [
    { type: "Grade Appeal",          studentName: "James Wilson" },
    { type: "Recommendation Letter", studentName: "Lisa Park" },
    { type: "Course Withdrawal",     studentName: "David Kumar" },
  ];

  const navigate = useNavigate();
  const items = requests ?? defaultRequests;
  const hasPending = items.length > 0;

  return (
    <>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          {/* Circle check icon */}
          <CircleCheckBig />
          <h2 style={styles.title}>Pending Approvals</h2>
        </div>

        {/* Count */}
        <div style={styles.countRow}>
          <span style={styles.count}>{items.length}</span>
        </div>
        <p style={styles.subtitle}>Student requests awaiting your approval</p>

        {/* Request rows */}
        <div style={styles.list}>
          {items.map((item, idx) => (
            <div key={idx} style={styles.row}>
              {/* Icon badge */}
              <div style={styles.iconBadge}>
                <CircleAlert color="#3b6ee8" />
              </div>

              {/* Text */}
              <div style={styles.rowText}>
                <span style={styles.requestType}>{item.type}</span>
                <span style={styles.studentName}>{item.studentName}</span>
              </div>
            </div>
          ))}
        </div>

        
        <div style={{ marginTop: "auto" }}>
            <button style={styles.viewButton} onClick={() => navigate(onViewRequests)}>
                View All Requests
            </button>
        </div>
      </div>
    </>
  );
};

const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    fontFamily: "'DM Sans', sans-serif",
    minWidth: "320px",
    boxSizing: "border-box",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
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
    color: "#1a1a2e",
    lineHeight: 1,
  },
  subtitle: {
    margin: "0 0 20px 0",
    fontSize: "14px",
    fontWeight: "400",
    color: "#6b7280",
  },
  list: {
    display: "flex",
    flexDirection: "column",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 0",
    borderBottom: "1px solid #f0f2f5",
  },
  iconBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#eef2fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowText: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  requestType: {
    fontSize: "15px",
    fontWeight: "400",
    color: "#1a1a2e",
  },
  studentName: {
    fontSize: "13px",
    fontWeight: "400",
    color: "#6b7280",
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
  },
};

export default PendingApprovalPanel;