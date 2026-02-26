// src/pages/admin/students/StudentList.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import { useNavigate, useLocation } from 'react-router-dom'
import studentService from '../../../services/studentService'

// Import your UI components
import { Card, Button, Table, Badge, Spinner } from '../../../components/ui'
import { SearchBar, ConfirmDialog, EmptyState } from '../../../components/shared'

const StudentList = () => {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ 
    open: false, 
    studentId: null, 
    studentName: '' 
  })
  
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    console.log('Location state received:', location.state)
    
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // REFRESH THE LIST when coming from create/edit
      fetchStudents()
      // Clear the state to prevent infinite loops
      window.history.replaceState({}, document.title)
    } else {
      // Normal load
      fetchStudents()
    }
  }, [location.state]) // This dependency is IMPORTANT

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await studentService.getAll()
      console.log('Fetched students:', response.data)
      const data = response.data || []
      setStudents(data)
      setFilteredStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('Failed to load students. Please check if backend is running.')
      setStudents([])
      setFilteredStudents([])
    } finally {
      setLoading(false)
    }
  }

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter(student => 
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.major_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredStudents(filtered)
    }
  }, [searchTerm, students])

const handleDelete = async () => {
  console.log('🔄 handleDelete called')
  console.log('Deleting ID:', deleteDialog.studentId)
  console.log('Student Name:', deleteDialog.studentName)
  
  try {
    console.log('📞 Calling studentService.delete...')
    const result = await studentService.delete(deleteDialog.studentId)
    console.log('✅ Delete result:', result)
    
    // Force refresh the list
    await fetchStudents()
    
    setSuccessMessage(`Student "${deleteDialog.studentName}" deleted successfully!`)
    setDeleteDialog({ open: false, studentId: null, studentName: '' })
    
  } catch (error) {
    console.error('❌ Delete failed:', error)
    const message = error?.response?.data?.message || error.message || 'Unknown error'
    alert(`Delete failed: ${message}`)
    setDeleteDialog({ open: false, studentId: null, studentName: '' })
    
    // Still refresh to sync with localStorage
    fetchStudents()
  }
}

  const confirmDelete = (studentId, firstName, lastName) => {
    setDeleteDialog({
      open: true,
      studentId,
      studentName: `${firstName} ${lastName}`
    })
  }

  const handleEdit = (studentId) => {
    navigate(`/admin/students/edit/${studentId}`)
  }

  const handleView = (studentId) => {
    navigate(`/admin/students/${studentId}`)
  }

  const handleCreate = () => {
    navigate('/admin/students/create')
  }

  
  // Table columns configuration
  const columns = [
    {
      key: 'student_id',
      label: 'ID',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>
    },
    {
      key: 'student_number',
      label: 'Student #'
    },
    {
      key: 'name',
      label: 'Name',
      render: (_, student) => (
        <div>
          <div className="font-medium text-gray-900">
            {student.first_name} {student.last_name}
          </div>
          <div className="text-sm text-gray-500">{student.email}</div>
        </div>
      )
    },
    {
      key: 'major_name',
      label: 'Major',
      render: (value) => value || 'Undeclared'
    },
    {
      key: 'classification',
      label: 'Year',
      render: (value) => (
        <Badge className="bg-blue-100 text-blue-800">
          Year {value || 1}
        </Badge>
      )
    },
    {
      key: 'gpa',
      label: 'GPA',
      render: (value) => {
        const gpa = value || 0
        let colorClass = 'text-red-600'
        if (gpa >= 3.5) colorClass = 'text-green-600'
        else if (gpa >= 2.5) colorClass = 'text-yellow-600'
        
        return (
          <span className={`font-medium ${colorClass}`}>
            {gpa.toFixed(2)}
          </span>
        )
      }
    },
    {
      key: 'credits_earned',
      label: 'Credits',
      render: (value) => value || 0
    },
    {
      key: 'academic_standing',
      label: 'Status',
      render: (value) => {
        const status = value || 'Unknown'
        let variant = 'default'
        
        if (status === 'Good') variant = 'success'
        else if (status === 'Probation') variant = 'warning'
        else if (status === 'Suspended') variant = 'danger'
        
        return <Badge variant={variant}>{status}</Badge>
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, student) => (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleView(student.student_id)}
          >
            View
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => handleEdit(student.student_id)}
          >
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="danger"
            onClick={() => confirmDelete(
              student.student_id, 
              student.first_name, 
              student.last_name
            )}
          >
            Delete
          </Button>
        </div>
      )
    }
  ]

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  return (
    <AdminLayout title="Students Management">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-600">Manage student records and information</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <p className="text-green-800 font-medium">✅ {successMessage}</p>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <p className="text-yellow-800">⚠️ {error}</p>
          </Card>
        )}

        {/* Actions Bar */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search students by name, email, or ID..."
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleCreate}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Add New Student
              </Button>
              <Button
                variant="secondary"
                onClick={fetchStudents}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* Students Table - SIMPLIFIED */}
        <Card>
        {loading ? (
            <div className="text-center py-12">
            <Spinner size="lg" />
            <p className="mt-3 text-gray-600">Loading students...</p>
            </div>
        ) : (
            <>
            {/* Show count */}
            <div className="mb-4 text-sm text-gray-500">
                Showing {filteredStudents.length} of {students.length} students
            </div>
            
            {/* Simple HTML table as fallback */}
            {filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Major</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GPA</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map(student => (
                        <tr key={student.student_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{student.student_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{student.student_number}</td>
                        <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                            </div>
                            <div className="text-xs text-gray-500">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{student.major_name || 'Undeclared'}</td>
                        <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            Year {student.classification || 1}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`text-sm font-medium ${
                            (student.gpa || 0) >= 3.5 ? 'text-green-600' :
                            (student.gpa || 0) >= 2.5 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {(student.gpa || 0).toFixed(2)}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                            <button
                            onClick={() => handleView(student.student_id)}
                            className="text-gray-600 hover:text-gray-900 mr-4"
                            >
                            View
                            </button>
                            <button
                            onClick={() => handleEdit(student.student_id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                            Edit
                            </button>
                            <button
                            onClick={() => confirmDelete(student.student_id, student.first_name, student.last_name)}
                            className="text-red-600 hover:text-red-900"
                            >
                            Delete
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            ) : (
                <div className="text-center py-12">
                <p className="text-gray-500">No students found</p>
                </div>
            )}
            </>
        )}
        </Card>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.open}
          title="Delete Student"
          message={`Are you sure you want to delete student "${deleteDialog.studentName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
          onClose={() => setDeleteDialog({ open: false, studentId: null, studentName: '' })}
          variant="danger"
        />
      </div>
      
    </AdminLayout>
  )
}

export default StudentList
