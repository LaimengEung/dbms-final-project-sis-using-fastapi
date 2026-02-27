import React, { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import api from '../../../services/api'
import enrollmentService from '../../../services/enrollmentService'

/* ── helpers ─────────────────────────────────────── */
const pct = (n, total) => (total === 0 ? 0 : Math.round((n / total) * 100))
const pctStr = (n, total) => `${pct(n, total)}%`

const BAR_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-yellow-400',
  'bg-purple-500', 'bg-red-400', 'bg-pink-400',
  'bg-indigo-400', 'bg-orange-400', 'bg-teal-400',
]

const GRADE_GROUPS = {
  A: (g) => /^A/.test(g ?? ''),
  B: (g) => /^B/.test(g ?? ''),
  C: (g) => /^C/.test(g ?? ''),
  D: (g) => /^D/.test(g ?? ''),
  F: (g) => g === 'F',
  Other: (g) => g != null && !/^[ABCDF]/.test(g),
}
const GRADE_COLORS = {
  A: 'bg-green-500', B: 'bg-blue-500', C: 'bg-yellow-400',
  D: 'bg-orange-400', F: 'bg-red-500', Other: 'bg-gray-400',
}
const STATUS_COLORS = {
  enrolled: 'bg-green-500', dropped: 'bg-red-400',
  withdrawn: 'bg-orange-400', completed: 'bg-blue-500',
}
const STANDING_COLORS = {
  'good standing': 'bg-green-500', 'probation': 'bg-red-400',
  'academic warning': 'bg-yellow-400', 'suspended': 'bg-red-700',
}

/* ── stat card ───────────────────────────────────── */
const StatCard = ({ label, value, sub, color = 'text-blue-600' }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
)

/* ── bar row ─────────────────────────────────────── */
const BarRow = ({ label, count, total, color = 'bg-blue-500', extra }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-700 font-medium">{label}</span>
      <span className="text-gray-500">{count} <span className="text-gray-400">({pctStr(count, total)})</span> {extra}</span>
    </div>
    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: pctStr(count, total) }}
      />
    </div>
  </div>
)

/* ── fill bar ────────────────────────────────────── */
const FillBar = ({ enrolled, capacity }) => {
  const p = pct(enrolled, capacity)
  const color = p >= 100 ? 'bg-red-500' : p >= 80 ? 'bg-yellow-400' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(p, 100)}%` }} />
      </div>
      <span className={`text-xs font-semibold w-10 text-right ${p >= 100 ? 'text-red-600' : p >= 80 ? 'text-yellow-600' : 'text-green-600'}`}>
        {p}%
      </span>
    </div>
  )
}

/* ── section table row ───────────────────────────── */
const SectionRow = ({ s }) => (
  <tr className="border-b border-gray-50 hover:bg-gray-50">
    <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.course?.course_code || '—'}</td>
    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{s.course?.course_name || '—'}</td>
    <td className="px-4 py-3 text-sm text-gray-600">{s.section_number || '—'}</td>
    <td className="px-4 py-3 text-sm text-gray-500">{s.schedule || 'TBA'}</td>
    <td className="px-4 py-3 text-sm text-gray-600">
      {s.faculty?.user ? `${s.faculty.user.first_name} ${s.faculty.user.last_name}` : <span className="text-gray-400 italic">TBA</span>}
    </td>
    <td className="px-4 py-3 text-sm text-center">{s.enrolled_count ?? 0}/{s.max_capacity ?? '—'}</td>
    <td className="px-4 py-3 min-w-[160px]"><FillBar enrolled={s.enrolled_count ?? 0} capacity={s.max_capacity ?? 1} /></td>
    <td className="px-4 py-3">
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
        s.status === 'open' ? 'bg-green-100 text-green-800' :
        s.status === 'closed' ? 'bg-red-100 text-red-700' :
        'bg-gray-100 text-gray-600'
      }`}>{s.status}</span>
    </td>
  </tr>
)

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
const Reports = () => {
  const [tab, setTab] = useState('enrollment')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [enrollments, setEnrollments] = useState([])
  const [grades, setGrades] = useState([])
  const [students, setStudents] = useState([])
  const [sections, setSections] = useState([])
  const [semesters, setSemesters] = useState([])
  const [majors, setMajors] = useState([])
  const [departments, setDepartments] = useState([])
  const [utilSemester, setUtilSemester] = useState('')
  const [filterDept, setFilterDept] = useState('')

  /* ── Load all data ── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const [semRes, enrRes, grdRes, stuRes, secRes, majRes, deptRes] = await Promise.all([
          enrollmentService.getSemesters(),
          api.get('/enrollments', { params: { limit: 5000, page: 1 } }),
          api.get('/grades', { params: { limit: 5000 } }),
          api.get('/students', { params: { limit: 5000 } }),
          api.get('/sections', { params: { limit: 1000 } }),
          api.get('/majors'),
          api.get('/departments'),
        ])

        const semList = semRes.data || []
        setSemesters(semList)
        const current = semList.find(s => s.is_current)
        if (current) setUtilSemester(String(current.semester_id))

        const enrData = Array.isArray(enrRes.data) ? enrRes.data : enrRes.data?.data || []
        setEnrollments(enrData)

        const grdData = Array.isArray(grdRes.data) ? grdRes.data : grdRes.data?.data || []
        setGrades(grdData)

        const stuData = Array.isArray(stuRes.data) ? stuRes.data : stuRes.data?.data || []
        setStudents(stuData)

        const secData = Array.isArray(secRes.data) ? secRes.data : secRes.data?.data || []
        setSections(secData)

        const majData = Array.isArray(majRes.data) ? majRes.data : majRes.data?.data || []
        setMajors(majData)

        const deptData = Array.isArray(deptRes.data) ? deptRes.data : deptRes.data?.data || []
        setDepartments(deptData)
      } catch (err) {
        setError('Failed to load report data. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /* ══ COMPUTED: ENROLLMENT SUMMARY ══ */
  const enrollmentStats = useMemo(() => {
    const statusCount = {}
    const bySemester = {}
    for (const e of enrollments) {
      const s = (e.status || 'unknown').toLowerCase()
      statusCount[s] = (statusCount[s] || 0) + 1
      const semKey = e.section?.semester
        ? `${e.section.semester.semester_name} ${e.section.semester.semester_year}`
        : 'Unknown'
      if (!bySemester[semKey]) bySemester[semKey] = { total: 0, enrolled: 0, dropped: 0, withdrawn: 0, completed: 0 }
      bySemester[semKey].total++
      if (bySemester[semKey][s] !== undefined) bySemester[semKey][s]++
    }
    return {
      total: enrollments.length,
      statusCount,
      bySemester: Object.entries(bySemester).sort((a, b) => a[0].localeCompare(b[0])),
    }
  }, [enrollments])

  /* ══ COMPUTED: ACADEMIC PERFORMANCE ══ */
  const gradeStats = useMemo(() => {
    const groups = { A: 0, B: 0, C: 0, D: 0, F: 0, Other: 0 }
    let sumGP = 0, countGP = 0
    for (const g of grades) {
      const lg = (g.letter_grade || '').toUpperCase()
      let matched = false
      for (const [key, test] of Object.entries(GRADE_GROUPS)) {
        if (test(lg)) { groups[key]++; matched = true; break }
      }
      if (!matched) groups.Other++
      if (g.grade_points != null) { sumGP += Number(g.grade_points); countGP++ }
    }
    const avgGPA = countGP > 0 ? (sumGP / countGP).toFixed(2) : '—'
    const gpaBuckets = { '4.0': 0, '3.0–3.99': 0, '2.0–2.99': 0, '1.0–1.99': 0, '<1.0': 0 }
    for (const g of grades) {
      const gp = Number(g.grade_points)
      if (isNaN(gp)) continue
      if (gp === 4.0) gpaBuckets['4.0']++
      else if (gp >= 3.0) gpaBuckets['3.0–3.99']++
      else if (gp >= 2.0) gpaBuckets['2.0–2.99']++
      else if (gp >= 1.0) gpaBuckets['1.0–1.99']++
      else gpaBuckets['<1.0']++
    }
    return { total: grades.length, groups, avgGPA, gpaBuckets }
  }, [grades])

  /* ══ major → department lookup ══ */
  const majorToDept = useMemo(() => {
    const map = {}
    for (const m of majors) {
      if (m.major_name) map[m.major_name] = m.department_name || 'No Department'
    }
    return map
  }, [majors])

  /* ══ COMPUTED: STUDENT DEMOGRAPHICS ══ */
  const studentStats = useMemo(() => {
    const filteredStudents = filterDept
      ? students.filter(s => {
          const majorName = s.major?.major_name || s.major_name || 'Undeclared'
          const dept = majorToDept[majorName] || 'No Department'
          return dept === filterDept
        })
      : students

    const byMajor = {}
    const byStanding = {}
    for (const s of filteredStudents) {
      const major = s.major?.major_name || s.major_name || 'Undeclared'
      byMajor[major] = (byMajor[major] || 0) + 1
      const standing = (s.academic_standing || 'Unknown').toLowerCase()
      byStanding[standing] = (byStanding[standing] || 0) + 1
    }
    return {
      total: filteredStudents.length,
      byMajor: Object.entries(byMajor).sort((a, b) => b[1] - a[1]),
      byStanding: Object.entries(byStanding).sort((a, b) => b[1] - a[1]),
    }
  }, [students, filterDept, majorToDept])

  /* ══ COMPUTED: SECTION UTILIZATION ══ */
  const utilSections = useMemo(() => {
    let list = sections
    if (utilSemester) list = list.filter(s => String(s.semester?.semester_id ?? s.semester_id ?? '') === utilSemester)
    return [...list].sort((a, b) => {
      const pa = pct(a.enrolled_count ?? 0, a.max_capacity ?? 1)
      const pb = pct(b.enrolled_count ?? 0, b.max_capacity ?? 1)
      return pb - pa
    })
  }, [sections, utilSemester])

  const utilStats = useMemo(() => {
    const full = utilSections.filter(s => (s.enrolled_count ?? 0) >= (s.max_capacity ?? 1)).length
    const avgFill = utilSections.length
      ? Math.round(utilSections.reduce((sum, s) => sum + pct(s.enrolled_count ?? 0, s.max_capacity ?? 1), 0) / utilSections.length)
      : 0
    return { full, avgFill }
  }, [utilSections])

  const TABS = [
    { key: 'enrollment',   label: 'Enrollment Summary' },
    { key: 'performance',  label: 'Academic Performance' },
    { key: 'demographics', label: 'Student Demographics' },
    { key: 'utilization',  label: 'Section Utilization' },
  ]

  return (
    <AdminLayout title="Reports">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Institutional analytics across enrollment, academics, students, and sections</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading report data...</div>
        ) : (
          <>
            {/* ══ ENROLLMENT SUMMARY ══ */}
            {tab === 'enrollment' && (
              <div className="space-y-6">
                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard label="Total Enrollments" value={enrollmentStats.total} color="text-blue-600" />
                  <StatCard label="Active Enrolled" value={enrollmentStats.statusCount.enrolled ?? 0} color="text-green-600"
                    sub={`${pctStr(enrollmentStats.statusCount.enrolled ?? 0, enrollmentStats.total)} of total`} />
                  <StatCard label="Dropped" value={enrollmentStats.statusCount.dropped ?? 0} color="text-red-500"
                    sub={`${pctStr(enrollmentStats.statusCount.dropped ?? 0, enrollmentStats.total)} of total`} />
                  <StatCard label="Completed" value={enrollmentStats.statusCount.completed ?? 0} color="text-purple-600"
                    sub={`${pctStr(enrollmentStats.statusCount.completed ?? 0, enrollmentStats.total)} of total`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status breakdown */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Enrollment by Status</h2>
                    {Object.entries(enrollmentStats.statusCount)
                      .sort((a, b) => b[1] - a[1])
                      .map(([status, count]) => (
                        <BarRow
                          key={status}
                          label={status.charAt(0).toUpperCase() + status.slice(1)}
                          count={count}
                          total={enrollmentStats.total}
                          color={STATUS_COLORS[status] || 'bg-gray-400'}
                        />
                      ))}
                    {Object.keys(enrollmentStats.statusCount).length === 0 && (
                      <p className="text-sm text-gray-400">No enrollment data.</p>
                    )}
                  </div>

                  {/* Per-semester table */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-x-auto">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Enrollments by Semester</h2>
                    {enrollmentStats.bySemester.length === 0 ? (
                      <p className="text-sm text-gray-400">No semester data.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                            <th className="pb-2 font-medium">Semester</th>
                            <th className="pb-2 font-medium text-right">Total</th>
                            <th className="pb-2 font-medium text-right">Enrolled</th>
                            <th className="pb-2 font-medium text-right">Dropped</th>
                            <th className="pb-2 font-medium text-right">Completed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrollmentStats.bySemester.map(([sem, counts]) => (
                            <tr key={sem} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-2 text-gray-700">{sem}</td>
                              <td className="py-2 text-right font-semibold text-gray-800">{counts.total}</td>
                              <td className="py-2 text-right text-green-600">{counts.enrolled}</td>
                              <td className="py-2 text-right text-red-500">{counts.dropped}</td>
                              <td className="py-2 text-right text-blue-500">{counts.completed}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══ ACADEMIC PERFORMANCE ══ */}
            {tab === 'performance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <StatCard label="Total Grades Recorded" value={gradeStats.total} color="text-blue-600" />
                  <StatCard label="Average GPA" value={gradeStats.avgGPA} color="text-green-600"
                    sub="Across all graded enrollments" />
                  <StatCard label="A Grades" value={gradeStats.groups.A}
                    sub={`${pctStr(gradeStats.groups.A, gradeStats.total)} of total`}
                    color="text-green-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Letter grade distribution */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Grade Distribution</h2>
                    {Object.entries(gradeStats.groups).map(([g, count]) => (
                      <BarRow
                        key={g}
                        label={`${g} (${g === 'A' ? '≥90' : g === 'B' ? '80–89' : g === 'C' ? '70–79' : g === 'D' ? '60–69' : g === 'F' ? '<60' : 'Other'})`}
                        count={count}
                        total={gradeStats.total}
                        color={GRADE_COLORS[g] || 'bg-gray-400'}
                      />
                    ))}
                    {gradeStats.total === 0 && <p className="text-sm text-gray-400">No grade data yet.</p>}
                  </div>

                  {/* GPA points distribution */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Grade Points Distribution</h2>
                    {Object.entries(gradeStats.gpaBuckets).map(([bucket, count], i) => (
                      <BarRow
                        key={bucket}
                        label={bucket}
                        count={count}
                        total={gradeStats.total}
                        color={BAR_COLORS[i] || 'bg-gray-400'}
                      />
                    ))}
                    {gradeStats.total === 0 && <p className="text-sm text-gray-400">No grade data yet.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ══ STUDENT DEMOGRAPHICS ══ */}
            {tab === 'demographics' && (
              <div className="space-y-6">
                {/* Department filter */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-600">Filter by Department:</label>
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterDept}
                    onChange={e => setFilterDept(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments.map(d => (
                      <option key={d.department_id} value={d.department_name}>
                        {d.department_name}
                      </option>
                    ))}
                  </select>
                  {filterDept && (
                    <button
                      onClick={() => setFilterDept('')}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <StatCard label="Total Students" value={studentStats.total} color="text-blue-600" />
                  <StatCard label="Declared Majors" value={studentStats.byMajor.filter(([m]) => m !== 'Undeclared').length}
                    color="text-purple-600" sub="Distinct majors with students" />
                  <StatCard
                    label="Good Standing"
                    value={studentStats.byStanding.find(([s]) => s === 'good standing')?.[1] ?? 0}
                    color="text-green-600"
                    sub={`${pctStr(studentStats.byStanding.find(([s]) => s === 'good standing')?.[1] ?? 0, studentStats.total)} of students`}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* By Major */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Students by Major</h2>
                    {studentStats.byMajor.length === 0
                      ? <p className="text-sm text-gray-400">No student data.</p>
                      : studentStats.byMajor.map(([major, count], i) => (
                        <BarRow
                          key={major}
                          label={major}
                          count={count}
                          total={studentStats.total}
                          color={BAR_COLORS[i % BAR_COLORS.length]}
                        />
                      ))}
                  </div>

                  {/* By Academic Standing */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Students by Academic Standing</h2>
                    {studentStats.byStanding.length === 0
                      ? <p className="text-sm text-gray-400">No academic standing data.</p>
                      : studentStats.byStanding.map(([standing, count]) => (
                        <BarRow
                          key={standing}
                          label={standing.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          count={count}
                          total={studentStats.total}
                          color={STANDING_COLORS[standing] || 'bg-gray-400'}
                        />
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ SECTION UTILIZATION ══ */}
            {tab === 'utilization' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <StatCard label="Sections Shown" value={utilSections.length} color="text-blue-600" />
                  <StatCard label="Full Sections" value={utilStats.full} color="text-red-500"
                    sub={`${pctStr(utilStats.full, utilSections.length)} are at capacity`} />
                  <StatCard label="Avg. Fill Rate" value={`${utilStats.avgFill}%`} color="text-yellow-600" />
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  {/* Semester filter */}
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <label className="text-sm text-gray-500 font-medium">Semester:</label>
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={utilSemester}
                      onChange={e => setUtilSemester(e.target.value)}
                    >
                      <option value="">All Semesters</option>
                      {semesters.map(s => (
                        <option key={s.semester_id} value={s.semester_id}>
                          {s.semester_name} {s.semester_year}{s.is_current ? ' (Current)' : ''}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-400 ml-2">Sorted by fill rate (highest first)</span>
                  </div>

                  {utilSections.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">No sections found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            {['Code', 'Course Name', 'Section', 'Schedule', 'Instructor', 'Seats', 'Fill Rate', 'Status'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {utilSections.map(s => <SectionRow key={s.section_id} s={s} />)}
                        </tbody>
                      </table>
                      <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                        {utilSections.length} section{utilSections.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default Reports
