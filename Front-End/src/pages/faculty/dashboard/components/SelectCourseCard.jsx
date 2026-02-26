import { useState } from "react";
import { ChevronDown } from "lucide-react";

const SelectCourseCard = ({ courses = [], selectedCourse, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (course) => {
    onChange?.(course);
    setIsOpen(false);
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px 24px",
          fontFamily: "'DM Sans', sans-serif",
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
        }}
      >
        {/* Left: Dropdown */}
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "12px", fontWeight: 600, color: "#9ca3af", display: "block", marginBottom: "8px", letterSpacing: "0.04em" }}>
            Select Course
          </label>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                backgroundColor: "#f9fafb",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#111827",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                textAlign: "left",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#93c5fd")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = isOpen ? "#3b5bff" : "#d1d5db")}
            >
              {selectedCourse
                ? `${selectedCourse.code} – ${selectedCourse.name} (${selectedCourse.section})`
                : "Select a course..."}
              <ChevronDown
                size={16}
                color="#6b7280"
                style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
              />
            </button>

            {isOpen && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setIsOpen(false)} />
                <div
                  style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                    backgroundColor: "#fff", border: "1px solid #e5e7eb",
                    borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                    zIndex: 20, overflow: "hidden",
                  }}
                >
                  {courses.map((course) => {
                    const isSelected = selectedCourse?.id === course.id;
                    return (
                      <button
                        key={course.id}
                        onClick={() => handleSelect(course)}
                        style={{
                          display: "block", width: "100%", padding: "11px 16px",
                          textAlign: "left", border: "none", cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px",
                          backgroundColor: isSelected ? "#eff2ff" : "#fff",
                          color: isSelected ? "#3b5bff" : "#374151",
                          fontWeight: isSelected ? 600 : 400,
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "#f9fafb"; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "#fff"; }}
                      >
                        <span style={{ fontWeight: 600 }}>{course.code}</span> – {course.name}
                        <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "8px" }}>({course.section})</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Course info preview */}
        {selectedCourse && (
          <div
            style={{
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "10px",
              padding: "12px 18px",
              minWidth: "260px",
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1d4ed8", marginBottom: "5px" }}>
              <span style={{ color: "#1d4ed8" }}>{selectedCourse.code}</span>
              <span style={{ fontWeight: 500, color: "#374151" }}> – {selectedCourse.name}</span>
            </div>
            <div style={{ fontSize: "12.5px", color: "#6b7280", display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <span>{selectedCourse.schedule}</span>
              <span style={{ color: "#d1d5db" }}>•</span>
              <span>{selectedCourse.room}</span>
              <span style={{ color: "#d1d5db" }}>•</span>
              <span>{selectedCourse.enrolled} students</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SelectCourseCard;