import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import axios from 'axios'

const API = 'http://localhost:5002/api'

function getToken() {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || ''
}

function authHeaders() {
  return { headers: { Authorization: `Bearer ${getToken()}` } }
}

const LETTER_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'W', 'I', 'P']

export default function AdminGrades() {
  const [grades, setGrades] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // filters
  const [semFilter, setSemFilter] = useState('')
  const [search, setSearch] = useState('')

  // inline edit
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ letter_grade: '', numeric_grade: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [gRes, eRes, sRes] = await Promise.all([
        axios.get(`${API}/grades`, authHeaders()),
        axios.get(`${API}/enrollments`, authHeaders()),
        axios.get(`${API}/semesters`, authHeaders()),
      ])
      setGrades(gRes.data)
      setEnrollments(eRes.data)
      setSemesters(sRes.data)
    } catch {
      setError('Failed to load grades data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // Build enrollment lookup by enrollment_id
  const enrollmentMap = useMemo(() => {
    const m = {}
    for (const e of enrollments) {
      m[e.enrollment_id] = e
    }
    return m
  }, [enrollments])

  // Enrich grades with enrollment data
  const enriched = useMemo(() => {
    return grades.map(g => {
      const e = enrollmentMap[g.enrollment_id] || {}
      const studentFirstName = e.student?.user?.first_name || ''
      const studentLastName = e.student?.user?.last_name || ''
      return {
        ...g,
        studentName: `${studentFirstName} ${studentLastName}`.trim() || `Enrollment #${g.enrollment_id}`,
        studentNumber: e.student?.student_number || '—',
        courseName: e.course?.course_name || e.section?.course?.course_name || '—',
        courseCode: e.course?.course_code || e.section?.course?.course_code || '—',
        sectionNumber: e.section_number || e.section?.section_number || '—',
        semesterName: e.semester?.semester_name
          ? `${e.semester.semester_name} ${e.semester.semester_year}`
          : g.semester_id
            ? semesters.find(s => s.semester_id === g.semester_id)?.semester_name || `Sem #${g.semester_id}`
            : '—',
        semesterId: e.semester?.semester_id || g.semester_id || null,
      }
    })
  }, [grades, enrollmentMap, semesters])

  // Filtered rows
  const rows = useMemo(() => {
    return enriched.filter(r => {
      const matchSem = !semFilter || String(r.semesterId) === semFilter
      const matchSearch = !search ||
        r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.studentNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.courseName.toLowerCase().includes(search.toLowerCase()) ||
        r.courseCode.toLowerCase().includes(search.toLowerCase())
      return matchSem && matchSearch
    })
  }, [enriched, semFilter, search])

  const startEdit = (g) => {
    setEditId(g.grade_id)
    setEditForm({ letter_grade: g.letter_grade || '', numeric_grade: g.numeric_grade ?? '' })
    setSaveError('')
  }

  const handleSave = async (gradeId) => {
    setSaving(true)
    setSaveError('')
    try {
      await axios.put(
        `${API}/grades/${gradeId}`,
        {
          letter_grade: editForm.letter_grade || null,
          numeric_grade: editForm.numeric_grade !== '' ? Number(editForm.numeric_grade) : null,
        },
        authHeaders()
      )
      setEditId(null)
      await fetchAll()
    } catch (err) {
      setSaveError(err?.response?.data?.detail || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const gradeColor = (letter) => {
    if (!letter) return 'text-gray-400'
    if (['A', 'A-'].includes(letter)) return 'text-green-700 font-semibold'
    if (['B+', 'B', 'B-'].includes(letter)) return 'text-blue-700 font-semibold'
    if (['C+', 'C', 'C-'].includes(letter)) return 'text-yellow-700 font-semibold'
    if (['D+', 'D'].includes(letter)) return 'text-orange-600 font-semibold'
    if (letter === 'F') return 'text-red-600 font-bold'
    return 'text-gray-600 font-medium'
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage student grades</p>
          </div>
          <span className="text-sm text-gray-400">{rows.length} record{rows.length !== 1 ? 's' : ''}</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={semFilter}
            onChange={e => setSemFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
          >
            <option value="">All Semesters</option>
            {semesters.map(s => (
              <option key={s.semester_id} value={s.semester_id}>
                {s.semester_name} {s.semester_year}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search student or course…"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          {(semFilter || search) && (
            <button
              onClick={() => { setSemFilter(''); setSearch('') }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>

        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {saveError}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No grade records found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Student', 'Student #', 'Course', 'Section', 'Semester', 'Letter Grade', 'Numeric', 'GPA Pts', 'Posted', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((r) => (
                  <tr key={r.grade_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{r.studentName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{r.studentNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      <span className="font-mono text-xs text-gray-400 mr-1">{r.courseCode}</span>
                      {r.courseName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{r.sectionNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{r.semesterName}</td>

                    {editId === r.grade_id ? (
                      <>
                        <td className="px-4 py-3">
                          <select
                            value={editForm.letter_grade}
                            onChange={e => setEditForm(f => ({ ...f, letter_grade: e.target.value }))}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="">—</option>
                            {LETTER_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={editForm.numeric_grade}
                            onChange={e => setEditForm(f => ({ ...f, numeric_grade: e.target.value }))}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{r.grade_points ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {r.posted_date ? new Date(r.posted_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(r.grade_id)}
                              disabled={saving}
                              className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                            >
                              {saving ? '…' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={`px-4 py-3 text-sm ${gradeColor(r.letter_grade)}`}>
                          {r.letter_grade || <span className="text-gray-300 italic">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {r.numeric_grade != null ? Number(r.numeric_grade).toFixed(2) : <span className="text-gray-300 italic">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {r.grade_points != null ? Number(r.grade_points).toFixed(2) : <span className="text-gray-300 italic">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {r.posted_date ? new Date(r.posted_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => startEdit(r)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
