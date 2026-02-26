const StudentSearchBar = ({
  value,
  onChange,
  onEmailAll,
  onExport,
  placeholder = "Search students by name, ID, or email...",
}) => {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "'DM Sans', sans-serif" }}>
        {/* Search input */}
        <div style={{ flex: 1, position: "relative" }}>
          <div
            style={{
              position: "absolute", left: "12px", top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              paddingLeft: "38px",
              paddingRight: "14px",
              paddingTop: "10px",
              paddingBottom: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "13.5px",
              fontFamily: "'DM Sans', sans-serif",
              color: "#374151",
              backgroundColor: "#f9fafb",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s, background-color 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#93c5fd";
              e.currentTarget.style.backgroundColor = "#fff";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.backgroundColor = "#f9fafb";
            }}
          />
        </div>

        {/* Email All Students */}
        <button
          onClick={onEmailAll}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "10px 16px",
            backgroundColor: "#3b5bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "13.5px",
            fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a46e0")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b5bff")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          Email All Students
        </button>

        {/* Export List */}
        <button
          onClick={onExport}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "10px 16px",
            backgroundColor: "#fff",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "13.5px",
            fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export List
        </button>
      </div>
    </>
  );
};

export default StudentSearchBar;