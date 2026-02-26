import { useState, useMemo } from "react";
import SelectCourseCard from "./SelectCourseCard";
import GradeStatsCard from "./GradeStatsCard";
import GradeDistributionCard from "./GradeDistributionCard";
import GradingTableCard from "./GradingTableCard";
import FacultyLayout from "../../../../components/layout/FacultyLayout";

/* ── Default data ─────────────────────────────────────── */
const defaultCourses = [
  { id: 1, code: "CS 301", name: "Data Structures",    section: "Section 01", schedule: "MWF 9:00-10:30 AM", room: "Engineering 201", enrolled: 28 },
  { id: 2, code: "CS 450", name: "Advanced Algorithms", section: "Section 02", schedule: "TTh 2:00-3:30 PM",  room: "Engineering 203", enrolled: 25 },
  { id: 3, code: "CS 490", name: "Senior Capstone",     section: "Section 01", schedule: "W 3:00-6:00 PM",    room: "Engineering 210", enrolled: 15 },
];

const defaultStudentsByCourse = {
  1: [
    { id: 1, studentId: "STU2024001", name: "Sarah Johnson",     avatarUrl: null, letterGrade: "A",  numericGrade: 95, comment: "", status: "posted" },
    { id: 2, studentId: "STU2024002", name: "Michael Rodriguez", avatarUrl: null, letterGrade: "B+", numericGrade: 88, comment: "", status: "posted" },
    { id: 3, studentId: "STU2024003", name: "Emily Chen",        avatarUrl: null, letterGrade: "A-", numericGrade: 92, comment: "", status: "posted" },
    { id: 4, studentId: "STU2024004", name: "James Wilson",      avatarUrl: null, letterGrade: null, numericGrade: "",  comment: "", status: "draft"  },
    { id: 5, studentId: "STU2024015", name: "Jessica Brown",     avatarUrl: null, letterGrade: "B",  numericGrade: 85, comment: "", status: "posted" },
    { id: 6, studentId: "STU2024016", name: "Daniel Lee",        avatarUrl: null, letterGrade: "A",  numericGrade: 94, comment: "", status: "posted" },
    { id: 7, studentId: "STU2024017", name: "Amanda White",      avatarUrl: null, letterGrade: "C+", numericGrade: 78, comment: "", status: "draft"  },
    { id: 8, studentId: "STU2024018", name: "Christopher Davis", avatarUrl: null, letterGrade: "B-", numericGrade: 82, comment: "", status: "posted" },
  ],
  2: [
    { id: 9,  studentId: "STU2024010", name: "Amy Nguyen",  avatarUrl: null, letterGrade: "A",  numericGrade: 91, comment: "", status: "posted" },
    { id: 10, studentId: "STU2024011", name: "Ben Carter",  avatarUrl: null, letterGrade: "B",  numericGrade: 83, comment: "", status: "posted" },
  ],
  3: [
    { id: 11, studentId: "STU2024012", name: "Clara Reid",  avatarUrl: null, letterGrade: "A",  numericGrade: 93, comment: "", status: "posted" },
    { id: 12, studentId: "STU2024013", name: "Oscar Lin",   avatarUrl: null, letterGrade: "C",  numericGrade: 72, comment: "", status: "draft"  },
  ],
};

/* ── Grade helpers ────────────────────────────────────── */
const gradePointsMap = {
  "A": 4.0, "A-": 4.0, "B+": 3.0, "B": 3.0, "B-": 3.0,
  "C+": 2.0, "C": 2.0, "C-": 2.0, "D+": 1.0, "D": 1.0, "F": 0.0,
};

const getLetterBucket = (letter) => {
  if (!letter || letter === "Select") return null;
  if (letter.startsWith("A")) return "A";
  if (letter.startsWith("B")) return "B";
  if (letter.startsWith("C")) return "C";
  if (letter.startsWith("D")) return "D";
  return "F";
};

const computeStats = (students) => {
  const graded = students.filter((s) => s.numericGrade !== "" && s.numericGrade !== null);
  if (!graded.length) return { average: "—", median: "—", graded: 0, total: students.length, distribution: { A: 0, B: 0, C: 0, D: 0, F: 0 } };

  const scores = graded.map((s) => Number(s.numericGrade));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const sorted = [...scores].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  const getAvgLetter = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  graded.forEach((s) => {
    const bucket = getLetterBucket(s.letterGrade) ?? getAvgLetter(Number(s.numericGrade));
    if (bucket) distribution[bucket]++;
  });

  return {
    average: `${avg.toFixed(1)} (${getAvgLetter(avg)})`,
    median: Math.round(median),
    graded: graded.length,
    total: students.length,
    distribution,
  };
};

const ManageGradePanel = ({
  courses = defaultCourses,
  studentsByCourse = defaultStudentsByCourse,
}) => {
  const [selectedCourse, setSelectedCourse] = useState(courses[0] ?? null);

  const students = studentsByCourse[selectedCourse?.id] ?? [];
  const stats = useMemo(() => computeStats(students), [students, selectedCourse]);

  return (
    <FacultyLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Page header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 500, color: "#111827" }}>Grade Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "#6b7280" }}>
            Enter and submit grades for your courses
          </p>
        </div>

        {/* Course selector */}
        <div style={{ marginBottom: "20px" }}>
          <SelectCourseCard
            courses={courses}
            selectedCourse={selectedCourse}
            onChange={setSelectedCourse}
          />
        </div>

        {/* Stats + Distribution row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
          <div style={{ display: "flex" , flex: 1 }}>
            <GradeStatsCard
              average={stats.average}
              median={stats.median}
              graded={stats.graded}
              total={stats.total}
            />
          </div>
          <div style={{ display: "flex", flex: 2 }}>
            <GradeDistributionCard distribution={stats.distribution} />
          </div>
        </div>

        {/* Grading table */}
        <GradingTableCard
          students={students}
          onSaveDraft={(rows) => console.log("Draft saved", rows)}
          onSubmitAll={(rows) => console.log("Submitted", rows)}
        />

      </div>
    </FacultyLayout>
  );
};

export default ManageGradePanel;