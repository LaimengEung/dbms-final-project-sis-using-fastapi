import ClassEnrollCard from "./ClassEnrollCard";

const defaultCourses = [
  {
    id: 1,
    code: "CS 301",
    name: "Data Structures",
    section: "Section 01",
    schedule: "MWF 9:00-10:30 AM",
    room: "Engineering 201",
    enrolled: 28,
    capacity: 30,
  },
  {
    id: 2,
    code: "CS 450",
    name: "Advanced Algorithms",
    section: "Section 02",
    schedule: "TTh 2:00-3:30 PM",
    room: "Engineering 203",
    enrolled: 25,
    capacity: 30,
  },
  {
    id: 3,
    code: "CS 490",
    name: "Senior Capstone",
    section: "Section 01",
    schedule: "W 3:00-6:00 PM",
    room: "Engineering 210",
    enrolled: 15,
    capacity: 20,
  },
];

const ClassEnrollmentPanel = ({ courses = defaultCourses }) => {
  const handleViewStudents = (course) => alert(`Viewing students for ${course.code}`);
  const handleManageGrades = (course) => alert(`Managing grades for ${course.code}`);

  return (
    <>
      {/* <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style> */}
      <div 
        style={{ 
          fontFamily: "'DM Sans', sans-serif", 
          padding: "32px", 
          background: "#fff", 
          borderRadius: "14px", 
        }}
      >
        <div 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "24px" 
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#111827" }}>
            My Courses This Semester
          </h2>
          <a
            href="#"
            style={{ color: "#3b5bff", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
          >
            View All Courses
          </a>
        </div>

        <div 
          style={{ 
            display: "flex", 
            justifyContent: "space-between",
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "18px" 
          }}
        >
          {courses.map((course) => (
            <ClassEnrollCard
              key={course.id}
              course={course}
              onViewStudents={handleViewStudents}
              onManageGrades={handleManageGrades}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default ClassEnrollmentPanel;