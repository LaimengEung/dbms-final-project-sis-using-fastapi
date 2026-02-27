import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import sectionService from '../../../services/sectionService'
import semesterService from '../../../services/semesterService'
import { Card, Button, Spinner } from '../../../components/ui'
import { SearchBar, ConfirmDialog } from '../../../components/shared'
import { Plus, Pencil, Trash2, LayoutGrid } from 'lucide-react'

const STATUS_COLORS = {
  open: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

const SectionList = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [sections, setSections] = useState([])
  const [filtered, setFiltered] = useState([])
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [semFilter, setSemFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, num: '' })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      const [sRes, semRes] = await Promise.all([
        sectionService.getAll(),
        semesterService.getAll(),
      ])
      const rows = Array.isArray(sRes.data) ? sRes.data : (sRes.data?.data ?? [])
      const sems = Array.isArray(semRes.data) ? semRes.data : (semRes.data?.data ?? [])
      setSections(rows)
      setFiltered(rows)
      setSemesters(sems)
    } catch (err) {
      setError(err.message || 'Failed to load sections.')
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
    let list = sections
    if (semFilter) list = list.filter(s => String(s.semester_id) === semFilter)
    if (statusFilter) list = list.filter(s => s.status === statusFilter)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      list = list.filter(s =>
        (s.course?.course_code || '').toLowerCase().includes(term) ||
        (s.course?.course_name || '').toLowerCase().includes(term) ||
        (s.section_number || '').toLowerCase().includes(term) ||
        (s.schedule || '').toLowerCase().includes(term)
      )
    }
    setFiltered(list)
  }, [searchTerm, semFilter, statusFilter, sections])

  const handleDelete = async () => {
    try {
      await sectionService.delete(deleteDialog.id)
      setSuccessMessage(`Section ${deleteDialog.num} deleted successfully.`)
      setDeleteDialog({ isOpen: false, id: null, num: '' })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete section.')
      setDeleteDialog({ isOpen: false, id: null, num: '' })
    }
  }

  const openCount = sections.filter(s => s.status === 'open').length
  const closedCount = sections.filter(s => s.status === 'closed').length

  return (
    <AdminLayout title="Class Sections">
      <div className="p-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Sections</h1>
            <p className="text-gray-600 mt-1">Manage scheduled sections for courses</p>
          </div>
          <Button className="md:self-start" onClick={() => navigate('/admin/sections/create')}>
            <Plus size={18} className="mr-2" />
            Add Section
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
              <p className="text-sm text-gray-600 mb-1">Total Sections</p>
              <p className="text-3xl font-semibold text-gray-900">{sections.length}</p>
            </div>
          </Card>
          <Card className="border border-green-200 bg-green-50/40 shadow-sm">
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-1">Open</p>
              <p className="text-3xl font-semibold text-green-700">{openCount}</p>
            </div>
          </Card>
          <Card className="border border-red-200 bg-red-50/40 shadow-sm">
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-1">Closed / Cancelled</p>
              <p className="text-3xl font-semibold text-red-700">{closedCount}</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <div className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search by course code, name, or schedule..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={semFilter}
              onChange={e => setSemFilter(e.target.value)}
            >
              <option value="">All Semesters</option>
              {semesters.map(s => (
                <option key={s.semester_id} value={s.semester_id}>
                  {s.semester_name} {s.semester_year}
                </option>
              ))}
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </Card>

        {/* Table */}
        <Card className="border border-gray-200 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center p-16"><Spinner /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-16 text-gray-500">
              <LayoutGrid size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No sections found</p>
              <p className="text-sm mt-1">Try adjusting filters or create a new section.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Section', 'Course', 'Semester', 'Faculty', 'Schedule', 'Capacity', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map(s => (
                    <tr key={s.section_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-700">
                        {s.section_number}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{s.course?.course_code}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[160px]">{s.course?.course_name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {s.semester ? `${s.semester.semester_name} ${s.semester.semester_year}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {s.faculty
                          ? `${s.faculty.user.first_name} ${s.faculty.user.last_name}`
                          : <span className="italic text-gray-400">TBA</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.schedule || '—'}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <span className={s.enrolled_count >= s.max_capacity ? 'text-red-600' : 'text-green-600'}>
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
                          <button
                            onClick={() => navigate(`/admin/sections/edit/${s.section_id}`)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, id: s.section_id, num: s.section_number })}
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
                <p className="text-sm text-gray-600">Showing {filtered.length} of {sections.length} sections</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Section"
        message={`Delete section ${deleteDialog.num}? Enrolled students will be affected.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null, num: '' })}
      />
    </AdminLayout>
  )
}

export default SectionList
