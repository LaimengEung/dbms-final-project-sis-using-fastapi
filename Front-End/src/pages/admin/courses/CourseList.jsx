import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import { courseService } from '../../../services/courseService'
import departmentService from '../../../services/departmentService'
import { Card, Button, Spinner } from '../../../components/ui'
import { SearchBar, ConfirmDialog } from '../../../components/shared'
import { Plus, Eye, Pencil, Trash2, BookOpen } from 'lucide-react'

const CourseList = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [courses, setCourses] = useState([])
  const [filtered, setFiltered] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      const [cRes, dRes] = await Promise.all([
        courseService.getAll(),
        departmentService.getAll(),
      ])
      const rows = Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data ?? [])
      const depts = Array.isArray(dRes.data) ? dRes.data : (dRes.data?.data ?? [])
      setCourses(rows)
      setFiltered(rows)
      setDepartments(depts)
    } catch (err) {
      setError(err.message || 'Failed to load courses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    let list = courses
    if (deptFilter) {
      list = list.filter(c => String(c.department_id) === deptFilter)
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      list = list.filter(c =>
        (c.course_code || '').toLowerCase().includes(term) ||
        (c.course_name || '').toLowerCase().includes(term) ||
        (c.description || '').toLowerCase().includes(term)
      )
    }
    setFiltered(list)
  }, [searchTerm, deptFilter, courses])

  const deptMap = Object.fromEntries(departments.map(d => [d.department_id, d.department_name]))

  const handleDelete = async () => {
    try {
      await courseService.delete(deleteDialog.id)
      setSuccessMessage(`Course "${deleteDialog.name}" deleted successfully.`)
      setDeleteDialog({ isOpen: false, id: null, name: '' })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete course.')
      setDeleteDialog({ isOpen: false, id: null, name: '' })
    }
  }

  const totalCredits = courses.reduce((s, c) => s + (c.credits || 0), 0)
  const uniqueDepts = new Set(courses.map(c => c.department_id).filter(Boolean)).size

  return (
    <AdminLayout title="Courses">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600 mt-1">Manage the academic course catalog</p>
          </div>
          <Button className="md:self-start" onClick={() => navigate('/admin/courses/create')}>
            <Plus size={18} className="mr-2" />
            Add Course
          </Button>
        </div>

        {successMessage && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <p className="text-green-800 p-4">{successMessage}</p>
          </Card>
        )}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <p className="text-red-800 p-4">{error}</p>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border border-gray-200 shadow-sm">
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total Courses</p>
              <p className="text-3xl font-semibold text-gray-900">{courses.length}</p>
            </div>
          </Card>
          <Card className="border border-blue-200 bg-blue-50/40 shadow-sm">
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-1">Departments</p>
              <p className="text-3xl font-semibold text-blue-700">{uniqueDepts}</p>
            </div>
          </Card>
          <Card className="border border-purple-200 bg-purple-50/40 shadow-sm">
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total Credits Offered</p>
              <p className="text-3xl font-semibold text-purple-700">{totalCredits}</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <div className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search by code, name, or description..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Table */}
        <Card className="border border-gray-200 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center p-16">
              <Spinner />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-16 text-gray-500">
              <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No courses found</p>
              <p className="text-sm mt-1">Try adjusting your search or add a new course.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Code', 'Course Name', 'Department', 'Credits', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map(course => (
                    <tr key={course.course_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-blue-100 text-blue-800">
                          {course.course_code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{course.course_name}</p>
                        {course.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{course.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {deptMap[course.department_id] || <span className="text-gray-400 italic">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {course.credits} cr
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/courses/${course.course_id}`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/courses/edit/${course.course_id}`)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, id: course.course_id, name: course.course_name })}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing {filtered.length} of {courses.length} courses
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteDialog.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
      />
    </AdminLayout>
  )
}

export default CourseList
