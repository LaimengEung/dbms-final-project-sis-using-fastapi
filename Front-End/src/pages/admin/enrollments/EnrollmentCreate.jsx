import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import { Card } from '../../../components/ui'
import enrollmentService from '../../../services/enrollmentService'
import { ArrowLeft } from 'lucide-react'

const EnrollmentCreate = () => {
  const navigate = useNavigate()

  const [semesters, setSemesters] = useState([])
  const [sections, setSections] = useState([])
  const [students, setStudents] = useState([])

  const [semesterId, setSemesterId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [status, setStatus] = useState('enrolled')
  const [searchTerm, setSearchTerm] = useState('')

  const [loadingSemesters, setLoadingSemesters] = useState(true)
  const [loadingSections, setLoadingSections] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [error, setError] = useState('')
  const [sectionsError, setSectionsError] = useState('')
  const [searchError, setSearchError] = useState('')

  const selectedSection = sections.find(s => String(s.section_id) === String(sectionId)) || null

  // Load semesters on mount
  useEffect(() => {
    enrollmentService.getSemesters()
      .then(res => {
        const list = res.data || []
        setSemesters(list)
        const current = list.find(s => s.is_current)
        if (current) setSemesterId(String(current.semester_id))
      })
      .catch(() => setError('Failed to load semesters.'))
      .finally(() => setLoadingSemesters(false))
  }, [])

  // Load sections when semester changes
  useEffect(() => {
    setSections([])
    setSectionId('')
    setSectionsError('')
    if (!semesterId) return
    setLoadingSections(true)
    enrollmentService.getSectionsBySemester(semesterId)
      .then(res => setSections(res.data || []))
      .catch(() => setSectionsError('Failed to load sections for this semester.'))
      .finally(() => setLoadingSections(false))
  }, [semesterId])

  // Debounced student search
  useEffect(() => {
    setStudents([])
    setSearchError('')
    if (searchTerm.length <= 1) return
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true)
        const res = await enrollmentService.searchStudents(searchTerm)
        setStudents(res.data || [])
      } catch {
        setSearchError('Failed to search students.')
      } finally {
        setSearchLoading(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleSelectStudent = (s) => {
    setStudentId(String(s.student_id))
    setSelectedStudent(s)
    setStudents([])
    setSearchTerm(`${s.user?.first_name || ''} ${s.user?.last_name || ''}`.trim())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!semesterId) { setError('Please select a semester.'); return }
    if (!sectionId)  { setError('Please select a section.'); return }
    if (!studentId)  { setError('Please select a student.'); return }
    try {
      setSubmitting(true)
      setError('')
      await enrollmentService.create({
        student_id: Number(studentId),
        section_id: Number(sectionId),
        semester_id: Number(semesterId),
        status,
      })
      navigate('/admin/enrollments', { state: { message: 'Student enrolled successfully.' } })
    } catch (err) {
      const msg = err?.detail || (typeof err === 'string' ? err : null) || err?.message || 'Failed to create enrollment.'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout title="New Enrollment">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/enrollments')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Enrollment</h1>
            <p className="text-gray-600">Assign a student to a course section</p>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <p className="text-red-800 p-4">{error}</p>
          </Card>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Step 1 — Semester */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester <span className="text-red-500">*</span>
              </label>
              {loadingSemesters ? (
                <p className="text-sm text-gray-400">Loading semesters...</p>
              ) : (
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={semesterId}
                  onChange={e => setSemesterId(e.target.value)}
                  required
                >
                  <option value="">Select semester</option>
                  {semesters.map(s => (
                    <option key={s.semester_id} value={s.semester_id}>
                      {s.semester_name} {s.semester_year}{s.is_current ? ' (Current)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Step 2 — Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Section <span className="text-red-500">*</span>
              </label>
              {!semesterId ? (
                <p className="text-sm text-gray-400 italic">Select a semester first.</p>
              ) : loadingSections ? (
                <p className="text-sm text-gray-400">Loading sections...</p>
              ) : (
                <>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sectionId}
                    onChange={e => setSectionId(e.target.value)}
                    required
                  >
                    <option value="">Select section</option>
                    {sections.map(s => (
                      <option key={s.section_id} value={s.section_id}>
                        {s.course?.course_code || '—'} — {s.course?.course_name || '—'} · Sec {s.section_number} ({s.enrolled_count}/{s.max_capacity} enrolled)
                      </option>
                    ))}
                  </select>
                  {sectionsError && <p className="text-sm text-red-600 mt-1">{sectionsError}</p>}
                  {!loadingSections && sections.length === 0 && !sectionsError && (
                    <p className="text-sm text-gray-500 mt-1">
                      No open sections for this semester.{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/admin/sections/create')}
                        className="text-blue-600 underline"
                      >
                        Add a section
                      </button>
                    </p>
                  )}
                </>
              )}

              {/* Section info card */}
              {selectedSection && (
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
                  <p className="font-semibold text-blue-900">
                    {selectedSection.course?.course_code} — {selectedSection.course?.course_name}
                  </p>
                  <div className="mt-1 grid grid-cols-2 gap-x-4 text-blue-800">
                    <span>Credits: {selectedSection.course?.credits ?? '—'}</span>
                    <span>Section: {selectedSection.section_number}</span>
                    <span>Schedule: {selectedSection.schedule || 'TBA'}</span>
                    <span>
                      Instructor:{' '}
                      {selectedSection.faculty?.user
                        ? `${selectedSection.faculty.user.first_name} ${selectedSection.faculty.user.last_name}`
                        : 'TBA'}
                    </span>
                    <span>
                      Seats:{' '}
                      <span className={Number(selectedSection.enrolled_count) >= Number(selectedSection.max_capacity) ? 'text-red-700 font-semibold' : 'text-green-700 font-semibold'}>
                        {selectedSection.enrolled_count}/{selectedSection.max_capacity}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3 — Student */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type name or student number to search..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value)
                  setStudentId('')
                  setSelectedStudent(null)
                }}
              />
              <p className="text-xs text-gray-400 mt-0.5">Type at least 2 characters.</p>
              {searchLoading && <p className="text-sm text-gray-400 mt-1">Searching...</p>}
              {searchError && <p className="text-sm text-red-600 mt-1">{searchError}</p>}

              {/* Search results dropdown */}
              {students.length > 0 && (
                <div className="mt-1 border border-gray-200 rounded-lg shadow-sm bg-white max-h-52 overflow-auto divide-y divide-gray-100">
                  {students.map(s => (
                    <div
                      key={s.student_id}
                      className="px-4 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => handleSelectStudent(s)}
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {s.user?.first_name} {s.user?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{s.student_number} · {s.major?.major_name || '—'}</p>
                    </div>
                  ))}
                </div>
              )}
              {!searchLoading && searchTerm.length > 1 && students.length === 0 && !searchError && !selectedStudent && (
                <p className="text-sm text-gray-500 mt-1">No students found.</p>
              )}

              {/* Selected student chip */}
              {selectedStudent && (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-800 text-xs font-bold">
                    {(selectedStudent.user?.first_name?.[0] || '') + (selectedStudent.user?.last_name?.[0] || '')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      {selectedStudent.user?.first_name} {selectedStudent.user?.last_name}
                    </p>
                    <p className="text-xs text-green-700">{selectedStudent.student_number} · {selectedStudent.major?.major_name || '—'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4 — Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="enrolled">Enrolled</option>
                <option value="dropped">Dropped</option>
                <option value="withdrawn">Withdrawn</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || !semesterId || !sectionId || !studentId}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Enrolling...' : 'Enroll Student'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/enrollments')}
                className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default EnrollmentCreate
