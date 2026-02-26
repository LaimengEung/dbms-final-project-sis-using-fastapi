import { useState } from "react";

import { CircleCheckBig, CircleX, Eye } from "lucide-react";

const STATUS_TABS = ["Pending", "Approved", "Rejected", "All"];

const statusColors = {
  pending:  { bg: "#fef9c3", text: "#a16207" },
  approved: { bg: "#dcfce7", text: "#15803d" },
  rejected: { bg: "#fee2e2", text: "#b91c1c" },
};

const RequestTable = ({ requests = [], onApprove, onReject, onView }) => {
  const [activeTab, setActiveTab] = useState("Pending");

  const filteredRequests =
    activeTab === "All"
      ? requests
      : requests.filter((r) => r.status.toLowerCase() === activeTab.toLowerCase());

  const countByStatus = (status) =>
    requests.filter((r) => r.status.toLowerCase() === status.toLowerCase()).length;

  return (
    <>
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab;
            const count = tab !== "All" ? countByStatus(tab) : null;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  border: "none",
                  borderBottom: isActive ? "2px solid #3b5bff" : "2px solid transparent",
                  backgroundColor: isActive ? "#f0f4ff" : "#fff",
                  color: isActive ? "#3b5bff" : "#6b7280",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "14px",
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background-color 0.15s, color 0.15s",
                }}
              >
                {tab}
                {count !== null && count > 0 && (
                  <span
                    style={{
                      backgroundColor: isActive ? "#3b5bff" : "#e5e7eb",
                      color: isActive ? "#fff" : "#6b7280",
                      fontSize: "13px",
                      fontWeight: 700,
                      borderRadius: "999px",
                      padding: "1px 7px",
                      minWidth: "25px",
                      textAlign: "center",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              {["Request ID", "Student", "Type", "Date Submitted", "Status", "Actions"].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "12px 20px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#374151",
                    fontFamily: "'DM Sans', sans-serif",
                    borderBottom: "1px solid #e5e7eb",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "40px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CircleCheckBig />
                    </div>
                  </div>
                <span style={{ fontSize: "14px", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
                    No {activeTab.toLowerCase()} requests
                </span>
                </td>
              </tr>
            ) : (
              filteredRequests.map((req, idx) => (
                <tr
                  key={req.id}
                  style={{
                    borderBottom: idx < filteredRequests.length - 1 ? "1px solid #f0f2f5" : "none",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* Request ID */}
                  <td style={styles.td}>
                    <span style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>
                      {req.requestId}
                    </span>
                  </td>

                  {/* Student */}
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "#dbeafe",
                          backgroundImage: req.avatarUrl ? `url(${req.avatarUrl})` : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#3b5bff",
                        }}
                      >
                        {!req.avatarUrl && req.studentName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>
                          {req.studentName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#9ca3af" }}>{req.studentId}</div>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td style={styles.td}>
                    <span style={{ fontSize: "14px", color: "#374151" }}>{req.type}</span>
                  </td>

                  {/* Date Submitted */}
                  <td style={styles.td}>
                    <span style={{ fontSize: "14px", color: "#374151" }}>{req.dateSubmitted}</span>
                  </td>

                  {/* Status */}
                  <td style={styles.td}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 600,
                        backgroundColor: statusColors[req.status.toLowerCase()]?.bg ?? "#f3f4f6",
                        color: statusColors[req.status.toLowerCase()]?.text ?? "#374151",
                      }}
                    >
                      {req.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* Approve */}
                      <ActionButton
                        color="#16a34a"
                        hoverBg="#dcfce7"
                        title="Approve"
                        onClick={() => onApprove?.(req)}
                        icon={
                          <CircleCheckBig 
                            width="18" 
                            height="18"
                            color="#16a34a"
                          />
                        }
                      />
                      {/* Reject */}
                      <ActionButton
                        color="#dc2626"
                        hoverBg="#fee2e2"
                        title="Reject"
                        onClick={() => onReject?.(req)}
                        icon={
                          <CircleX 
                            width="18"
                            height="18"
                            color="#dc2626"
                          />
                        }
                      />
                      {/* View */}
                      <ActionButton
                        color="#3b5bff"
                        hoverBg="#eff2ff"
                        title="View"
                        onClick={() => onView?.(req)}
                        icon={
                          <Eye 
                            width="18"
                            height="18"
                            color="#3b5bff"
                          />
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

/* ── Small reusable icon button ─────────────────────────── */
const ActionButton = ({ icon, color, hoverBg, title, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color,
        backgroundColor: hovered ? hoverBg : "transparent",
        transition: "background-color 0.15s",
      }}
    >
      {icon}
    </button>
  );
};

const styles = {
  td: {
    padding: "14px 20px",
    fontSize: "13.5px",
    fontFamily: "'DM Sans', sans-serif",
    verticalAlign: "middle",
  },
};

export default RequestTable;