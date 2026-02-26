import { useState } from "react";
import { ChevronDown } from "lucide-react";

const SemesterDropdown = ({
  value,
  onChange,
  semesters = ["Spring 2025", "Fall 2024", "Summer 2024", "Spring 2024", "Fall 2023"],
  placeholder = "Spring 2025",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (sem) => {
    onChange?.(sem);
    setIsOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          background: "#fff",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 500,
          color: value ? "#374151" : "#9ca3af",
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#9ca3af")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
      >
        {value || placeholder}
        <ChevronDown
          size={15}
          color="#6b7280"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close on outside click */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 6px)",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
              zIndex: 20,
              minWidth: "160px",
              overflow: "hidden",
            }}
          >
            {semesters.map((sem) => {
              const isSelected = sem === value;
              return (
                <button
                  key={sem}
                  onClick={() => handleSelect(sem)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 16px",
                    textAlign: "left",
                    background: isSelected ? "#eff2ff" : "#fff",
                    color: isSelected ? "#3b5bff" : "#374151",
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f9fafb"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "#fff"; }}
                >
                  {sem}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SemesterDropdown;