import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import facultyService from '../../../services/facultyService'
import { Card, Button, Spinner } from '../../../components/ui'
import { SearchBar, ConfirmDialog } from '../../../components/shared'
import { Plus, Eye, Pencil } from 'lucide-react'

const FacultyList = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [faculty, setFaculty] = useState([])
  const [filteredFaculty, setFilteredFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' })

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await facultyService.getAll()
      const rows = res.data || []
      setFaculty(rows)
      setFilteredFaculty(rows)
    } catch (err) {
      setError(err.message || 'Failed to load faculty.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaculty()
  }, [])

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFaculty(faculty)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = faculty.filter(item => {
      const fullName = `${item.first_name} ${item.last_name}`.toLowerCase()
      return (
        fullName.includes(term) ||
        (item.email || '').toLowerCase().includes(term) ||
        (item.faculty_number || '').toLowerCase().includes(term) ||
        (item.department_name || '').toLowerCase().includes(term) ||
        (item.title || '').toLowerCase().includes(term)
      )
    })
    setFilteredFaculty(filtered)
  }, [searchTerm, faculty])

  const handleDelete = async () => {
    try {
      await facultyService.delete(deleteDialog.id)
      setSuccessMessage(`Faculty "${deleteDialog.name}" deleted successfully.`)
      setDeleteDialog({ isOpen: false, id: null, name: '' })
      fetchFaculty()
    } catch (err) {
      setError(err.message || 'Failed to delete faculty.')
    }
  }

  const totalFaculty = faculty.length
  const activeFaculty = faculty.filter(item => item.is_active).length
  const totalDepartments = new Set(
    faculty
      .map(item => item.department_name)
      .filter(Boolean)
  ).size

  return (
    <AdminLayout title="Faculty Management">
      <div className="p-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Faculty</h1>
            <p className="text-gray-600 mt-1">Manage faculty profiles, departments, and offices</p>
          </div>
          <Button className="md:self-start" onClick={() => navigate('/admin/faculty/create')}>
            <Plus size={18} className="mr-2" />
            Add Faculty
          </Button>
        </div>

        {successMessage && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <p className="text-green-800">{successMessage}</p>
          </Card>
        )}

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <p className="text-red-800">{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="border border-gray-200 shadow-sm">
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-2">Total Faculty</p>
              <p className="text-3xl font-semibold text-gray-900">{totalFaculty}</p>
            </div>
          </Card>
          <Card className="border border-blue-200 bg-blue-50/40 shadow-sm">
            <div className="p-6">
              <p className="text-sm text-blue-700 mb-2">Total Departments</p>
              <p className="text-3xl font-semibold text-blue-800">{totalDepartments}</p>
            </div>
          </Card>
          <Card className="border border-green-200 bg-green-50/40 shadow-sm">
            <div className="p-6">
              <p className="text-sm text-green-700 mb-2">Active Faculty</p>
              <p className="text-3xl font-semibold text-green-800">{activeFaculty}</p>
            </div>
          </Card>
        </div>

        <Card className="mb-6 shadow-sm">
          <div className="p-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search faculty..."
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
              />
            </div>
          </div>
        </Card>

        {loading ? (
          <Card>
            <div className="py-12 text-center">
              <Spinner size="lg" />
              <p className="mt-3 text-gray-600">Loading faculty...</p>
            </div>
          </Card>
        ) : (
          <>
            {filteredFaculty.length === 0 ? (
              <Card className="shadow-sm">
                <div className="p-12 text-center">
                  <p className="text-gray-800 font-medium">No faculty found</p>
                  <p className="text-gray-500 mt-1">Try another keyword or clear your search.</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredFaculty.map(item => (
                  <Card key={item.faculty_id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {item.first_name} {item.last_name}
                          </h3>
                          <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {item.faculty_number || 'FAC'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="p-2.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            onClick={() => navigate(`/admin/faculty/${item.faculty_id}`)}
                            aria-label="View faculty"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="p-2.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                            onClick={() => navigate(`/admin/faculty/edit/${item.faculty_id}`)}
                            aria-label="Edit faculty"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department</span>
                          <span className="text-gray-900 font-medium">{item.department_name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Title</span>
                          <span className="text-gray-900 font-medium">{item.title || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <span className={`font-medium ${item.is_active ? 'text-green-700' : 'text-red-700'}`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 mt-5 pt-4">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Contact</p>
                        <p className="text-sm text-gray-900 break-all">{item.email || '-'}</p>
                        <p className="text-sm text-gray-700 mt-1">Office: {item.office_location || '-'}</p>
                      </div>

                      <div className="mt-5">
                        <button
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                          onClick={() => setDeleteDialog({
                            isOpen: true,
                            id: item.faculty_id,
                            name: `${item.first_name} ${item.last_name}`
                          })}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
          onConfirm={handleDelete}
          title="Delete Faculty"
          message={`Are you sure you want to delete "${deleteDialog.name}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </AdminLayout>
  )
}

export default FacultyList

