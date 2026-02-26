import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClassInfoCard from "./ClassInfoCard";
import StudentSearchBar from "./StudentSearchBar";
import StudentListTable from "./StudentListTable";
import FacultyLayout from "../../../../components/layout/FacultyLayout";

const defaultCourse = {
  code: "CS 301",
  name: "Data Structures",
  section: "Section 01",
  schedule: "MWF 9:00–10:30 AM",
  room: "Engineering 201",
  enrolled: 28,
};

const defaultStudents = [
  { id: 1, studentId: "STU2024001", name: "Sarah Johnson",     email: "sarah.johnson@university.edu",   major: "Computer Science", grade: "A",  avatarUrl: null },
  { id: 2, studentId: "STU2024002", name: "Michael Rodriguez", email: "m.rodriguez@university.edu",     major: "Computer Science", grade: "B+", avatarUrl: null },
  { id: 3, studentId: "STU2024003", name: "Emily Chen",        email: "a.chen@university.edu",          major: "Computer Science", grade: "A-", avatarUrl: null },
  { id: 4, studentId: "STU2024004", name: "James Wilson",      email: "j.wilson@university.edu",        major: "Computer Science", grade: null, avatarUrl: null },
  { id: 5, studentId: "STU2024015", name: "Jessica Brown",     email: "j.brown@university.edu",         major: "Computer Science", grade: "B",  avatarUrl: null },
  { id: 6, studentId: "STU2024016", name: "Daniel Lee",        email: "d.lee@university.edu",           major: "Computer Science", grade: "A",  avatarUrl: null },
  { id: 7, studentId: "STU2024017", name: "Amanda White",      email: "a.white@university.edu",         major: "Computer Science", grade: "C+", avatarUrl: null },
  { id: 8, studentId: "STU2024018", name: "Christopher Davis", email: "c.davis@university.edu",         major: "Computer Science", grade: "B-", avatarUrl: null },
];

const ViewStudentsPanel = ({
  course = defaultCourse,
  students = defaultStudents,
  onBack,
}) => {
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() =>
    students.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    ), [students, search]);

  const handleEmailAll  = () => alert(`Emailing all ${students.length} students in ${course.code}`);
  const handleExport    = () => alert(`Exporting student list for ${course.code}`);
  const handleViewProfile = (s) => alert(`Viewing profile: ${s.name}`);
  const handleEmail     = (s) => alert(`Emailing: ${s.email}`);

  return (
    <FacultyLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Class Info Card */}
        <div style={{ marginBottom: "16px" }}>
          <ClassInfoCard course={course} />
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "16px" }}>
          <StudentSearchBar
            value={search}
            onChange={setSearch}
            onEmailAll={handleEmailAll}
            onExport={handleExport}
          />
        </div>

        {/* Student List Table */}
        <StudentListTable
          students={filteredStudents}
          onViewProfile={handleViewProfile}
          onEmail={handleEmail}
        />
      </div>
    </FacultyLayout>
  );
};

export default ViewStudentsPanel;