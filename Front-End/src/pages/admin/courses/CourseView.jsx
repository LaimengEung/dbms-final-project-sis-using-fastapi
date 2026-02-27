import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import { courseService } from '../../../services/courseService'
import departmentService from '../../../services/departmentService'
import sectionService from '../../../services/sectionService'
import { Card, Button, Spinner } from '../../../components/ui'
import { ConfirmDialog } from '../../../components/shared'
import { ArrowLeft, Pencil, Plus, Trash2, Users, BookOpen } from 'lucide-react'

const STATUS_COLORS = {
  open: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

const CourseView = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [sections, setSections] = useState([])
  const [deptName, setDeptName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, num: '' })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [cRes, sRes, dRes] = await Promise.all([
        courseService.getById(id),
        sectionService.getAll({ course_id: id }),
        departmentService.getAll(),
      ])
      const c = cRes.data?.data ?? cRes.data
      setCourse(c)
      const depts = Array.isArray(dRes.data) ? dRes.data : (dRes.data?.data ?? [])
      const dept = depts.find(d => d.department_id === c.department_id)
      setDeptName(dept?.department_name || '—')
      const rawSections = Array.isArray(sRes.data) ? sRes.data : (sRes.data?.data ?? [])
      setSections(rawSections)
    } catch (err) {
      setError('Failed to load course details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const handleDeleteSection = async () => {
    try {
      await sectionService.delete(deleteDialog.id)
      setDeleteDialog({ isOpen: false, id: null, num: '' })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete section.')
      setDeleteDialog({ isOpen: false, id: null, num: '' })
    }
  }

  if (loading) {
    return <AdminLayout title="Course Details"><div className="flex items-center justify-center h-64"><Spinner /></div></AdminLayout>
  }

  if (!course) {
    return (
      <AdminLayout title="Course Details">
        <div className="p-6 text-center text-red-600">{error || 'Course not found.'}</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Course: ${course.course_code}`}>
      <div className="p-6 space-y-6">
        {/* Back + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/courses')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course.course_code} — {course.course_name}</h1>
              <p className="text-gray-500 text-sm mt-0.5">{deptName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate(`/admin/courses/edit/${id}`)}>
              <Pencil size={16} className="mr-2" /> Edit Course
            </Button>
            <Button onClick={() => navigate(`/admin/sections/create?course_id=${id}`)}>
              <Plus size={16} className="mr-2" /> Add Section
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <p className="text-red-800 p-4">{error}</p>
          </Card>
        )}

        {/* Course Details */}
        <Card className="border border-gray-200 shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen size={18} /> Course Information
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide">Course Code</dt>
                <dd className="mt-1 font-mono font-semibold text-blue-700">{course.course_code}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide">Credits</dt>
                <dd className="mt-1 font-semibold text-gray-900">{course.credits}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide">Department</dt>
                <dd className="mt-1 text-gray-900">{deptName}</dd>
              </div>
              {course.description && (
                <div className="sm:col-span-3">
                  <dt className="text-xs text-gray-500 uppercase tracking-wide">Description</dt>
                  <dd className="mt-1 text-gray-700">{course.description}</dd>
                </div>
              )}
            </dl>
          </div>
        </Card>

        {/* Sections */}
        <Card className="border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users size={18} /> Sections ({sections.length})
            </h2>
            <Button size="sm" onClick={() => navigate(`/admin/sections/create?course_id=${id}`)}>
              <Plus size={14} className="mr-1" /> Add Section
            </Button>
          </div>
          {sections.length === 0 ? (
            <div className="text-center p-10 text-gray-500">
              <Users size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No sections yet. Add one to open this course for enrollment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Section #', 'Semester', 'Faculty', 'Schedule', 'Classroom', 'Capacity', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sections.map(s => (
                    <tr key={s.section_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-700">{s.section_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {s.semester ? `${s.semester.semester_name} ${s.semester.semester_year}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {s.faculty ? `${s.faculty.user.first_name} ${s.faculty.user.last_name}` : <span className="italic text-gray-400">TBA</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.schedule || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.classroom || '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`${s.enrolled_count >= s.max_capacity ? 'text-red-600' : 'text-green-600'} font-medium`}>
                          {s.enrolled_count}/{s.max_capacity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-600'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/admin/sections/edit/${s.section_id}`)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteDialog({ isOpen: true, id: s.section_id, num: s.section_number })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Section"
        message={`Delete section ${deleteDialog.num}? All related enrollments may be affected.`}
        onConfirm={handleDeleteSection}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null, num: '' })}
      />
    </AdminLayout>
  )
}

export default CourseView
