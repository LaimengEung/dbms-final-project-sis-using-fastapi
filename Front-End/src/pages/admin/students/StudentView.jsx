// pages/admin/students/StudentView.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'

// Import UI components
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Spinner from '../../../components/ui/Spinner'
import Alert from '../../../components/ui/Alert'
import Table from '../../../components/ui/Table'

// Import service
import  studentService  from '../../../services/studentService'

// Icons
import {
  ArrowLeft, Edit, Trash2, Mail, Phone, Calendar,
  GraduationCap, BookOpen, Award, MapPin, User,
  Shield, CreditCard, BarChart3, FileText, Plus,
  Download, Eye, MoreVertical, Clock
} from 'lucide-react'

const StudentView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [student, setStudent] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteDialog, setDeleteDialog] = useState(false)

  useEffect(() => {
    fetchStudentData()
  }, [id])

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch student
      const studentResponse = await studentService.getById(id)
      setStudent(studentResponse.data)
      
      // Fetch enrollments (assuming this method exists)
      try {
        const enrollmentsResponse = await studentService.getEnrollments(id)
        setEnrollments(enrollmentsResponse.data || [])
      } catch (enrollmentError) {
        console.log('Enrollments not available, using mock data')
        setEnrollments([
          { id: 1, course_name: 'Data Structures', credits: 3, grade: 'A', semester: 'Fall 2024', status: 'enrolled' },
          { id: 2, course_name: 'Algorithms', credits: 3, grade: 'B+', semester: 'Fall 2024', status: 'enrolled' },
          { id: 3, course_name: 'Database Systems', credits: 3, grade: 'A-', semester: 'Spring 2024', status: 'completed' },
          { id: 4, course_name: 'Web Development', credits: 3, grade: 'A', semester: 'Fall 2023', status: 'completed' }
        ])
      }
      
    } catch (err) {
      console.error('Error fetching student data:', err)
      setError('Failed to load student details. Using sample data.')
      
      // Fallback mock data
      setStudent({
        student_id: id,
        student_number: `STU${id.toString().padStart(3, '0')}`,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@school.edu',
        classification: 3,
        major_name: 'Computer Science',
        admission_date: '2023-09-01',
        credits_earned: 90,
        gpa: 3.8,
        academic_standing: 'Good',
        phone: '+1 (555) 123-4567',
        address: '123 Campus Ave, University City, ST 12345',
        created_at: '2023-09-01T10:00:00Z'
      })
      
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await studentService.delete(id)
      alert('Student deleted successfully!')
      navigate('/admin/students')
    } catch (error) {
      console.error('Delete error:', error)
      alert(`Failed to delete: ${error.response?.data?.message || error.message}`)
    }
  }

  const getGpaColor = (gpa) => {
    if (gpa >= 3.5) return 'green'
    if (gpa >= 2.5) return 'yellow'
    return 'red'
  }

  const getStandingColor = (standing) => {
    switch(standing?.toLowerCase()) {
      case 'good': return 'green'
      case 'probation': return 'yellow'
      case 'suspended': return 'red'
      case 'graduated': return 'blue'
      default: return 'gray'
    }
  }

  const getYearText = (classification) => {
    const years = ['Freshman', 'Sophomore', 'Junior', 'Senior']
    return years[classification - 1] || `Year ${classification}`
  }

  const formatGPA = (gpa) => {
    return parseFloat(gpa || 0).toFixed(2)
  }

  const getGradeColor = (grade) => {
    if (grade === 'A' || grade === 'A-') return 'green'
    if (grade === 'B+' || grade === 'B' || grade === 'B-') return 'blue'
    if (grade === 'C+' || grade === 'C' || grade === 'C-') return 'yellow'
    if (grade === 'D+' || grade === 'D' || grade === 'D-') return 'orange'
    if (grade === 'F') return 'red'
    return 'gray'
  }

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'enrolled': return 'blue'
      case 'completed': return 'green'
      case 'dropped': return 'red'
      case 'withdrawn': return 'orange'
      default: return 'gray'
    }
  }

  const enrollmentColumns = [
    {
      key: 'course_name',
      header: 'Course',
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'credits',
      header: 'Credits',
      render: (value) => (
        <Badge color="blue" variant="outline">
          {value} credits
        </Badge>
      )
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (value) => (
        <Badge color={getGradeColor(value)}>
          {value || 'In Progress'}
        </Badge>
      )
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (value) => (
        <div className="flex items-center text-gray-600">
          <Calendar size={14} className="mr-2" />
          {value}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge color={getStatusColor(value)}>
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </Badge>
      )
    }
  ]

  if (loading) {
    return (
      <AdminLayout title="Student Details">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading student details...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!student && !loading) {
    return (
      <AdminLayout title="Student Not Found">
        <div className="p-6">
          <Alert 
            type="error" 
            title="Student Not Found" 
            message={`Student with ID ${id} was not found.`}
            className="mb-6"
          />
          <Button onClick={() => navigate('/admin/students')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Students
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`${student.first_name} ${student.last_name}`}>
      <div className="p-6">
        {/* Header with actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/students')}
                className="flex items-center mr-3"
                size="sm"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                {student.first_name} {student.last_name}
              </h1>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center text-gray-600">
                <Shield size={16} className="mr-2" />
                <span className="font-mono">{student.student_number}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center text-gray-600">
                <Mail size={16} className="mr-2" />
                {student.email}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Link to={`/admin/students/edit/${id}`}>
              <Button variant="primary" className="flex items-center">
                <Edit size={16} className="mr-2" />
                Edit Student
              </Button>
            </Link>
            <Button 
              variant="outline" 
              color="red"
              onClick={() => setDeleteDialog(true)}
              className="flex items-center"
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
            <Button variant="outline" className="flex items-center">
              <MoreVertical size={16} />
            </Button>
          </div>
        </div>

        {error && (
          <Alert 
            type="warning" 
            title="Note" 
            message={error}
            className="mb-6"
            onClose={() => setError('')}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Student Info & Academic Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile & Academic Summary Card */}
            <Card>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Profile Section */}
                  <div className="md:col-span-1">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <User size={32} className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {student.first_name} {student.last_name}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <Badge color={getStandingColor(student.academic_standing)}>
                          {student.academic_standing || 'Unknown'}
                        </Badge>
                        <p className="text-sm text-gray-500">
                          {getYearText(student.classification)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Stats */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <GraduationCap size={18} className="mr-2 text-blue-600" />
                      Academic Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Award size={16} className="text-blue-600 mr-2" />
                          <p className="text-sm text-gray-500">GPA</p>
                        </div>
                        <div className="flex items-baseline">
                          <span className={`text-2xl font-bold text-${getGpaColor(student.gpa)}-600`}>
                            {formatGPA(student.gpa)}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">/ 4.0</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <CreditCard size={16} className="text-green-600 mr-2" />
                          <p className="text-sm text-gray-500">Credits Earned</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {student.credits_earned || 0}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <BookOpen size={16} className="text-purple-600 mr-2" />
                          <p className="text-sm text-gray-500">Major</p>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.major_name || 'Undeclared'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Clock size={16} className="text-orange-600 mr-2" />
                          <p className="text-sm text-gray-500">Year</p>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {getYearText(student.classification)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Enrollments Card */}
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <BookOpen size={18} className="mr-2 text-green-600" />
                    Course Enrollments
                  </h3>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Plus size={14} className="mr-2" />
                    Add Enrollment
                  </Button>
                </div>
                
                {enrollments.length > 0 ? (
                  <Table
                    columns={enrollmentColumns}
                    data={enrollments}
                    keyField="id"
                    striped
                    hover
                  />
                ) : (
                  <div className="text-center py-8">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Enrollments</h4>
                    <p className="text-gray-500 mb-4">This student is not enrolled in any courses.</p>
                    <Button variant="primary">
                      <Plus size={16} className="mr-2" />
                      Enroll in Course
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="space-y-6">
            {/* Contact Information Card */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail size={18} className="mr-2 text-blue-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <div className="flex items-center">
                      <Mail size={14} className="mr-2 text-gray-400" />
                      <p className="font-medium text-gray-900">{student.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <div className="flex items-center">
                      <Phone size={14} className="mr-2 text-gray-400" />
                      <p className="font-medium text-gray-900">
                        {student.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <div className="flex items-start">
                      <MapPin size={14} className="mr-2 text-gray-400 mt-0.5" />
                      <p className="font-medium text-gray-900">
                        {student.address || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Status & Timeline Card */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 size={18} className="mr-2 text-green-600" />
                  Status & Timeline
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Admission Date</p>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2 text-gray-400" />
                      <p className="font-medium text-gray-900">
                        {new Date(student.admission_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Student Since</p>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-2 text-gray-400" />
                      <p className="font-medium text-gray-900">
                        {new Date(student.created_at || student.admission_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2 text-gray-400" />
                      <p className="font-medium text-gray-900">Today</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    fullWidth
                    className="justify-start"
                    onClick={() => navigate(`/admin/students/edit/${id}`)}
                  >
                    <Edit size={16} className="mr-3" />
                    Edit Student Information
                  </Button>
                  
                  <Button
                    variant="outline"
                    fullWidth
                    className="justify-start"
                    onClick={() => console.log('View grades')}
                  >
                    <BarChart3 size={16} className="mr-3" />
                    View Grade Report
                  </Button>
                  
                  <Button
                    variant="outline"
                    fullWidth
                    className="justify-start"
                    onClick={() => console.log('Add enrollment')}
                  >
                    <Plus size={16} className="mr-3" />
                    Add Course Enrollment
                  </Button>
                  
                  <Button
                    variant="outline"
                    fullWidth
                    className="justify-start"
                    onClick={() => console.log('Generate transcript')}
                  >
                    <FileText size={16} className="mr-3" />
                    Generate Transcript
                  </Button>
                  
                  <Button
                    variant="outline"
                    fullWidth
                    className="justify-start"
                    onClick={() => console.log('Send email')}
                  >
                    <Mail size={16} className="mr-3" />
                    Send Email
                  </Button>
                  
                  <Button
                    variant="outline"
                    fullWidth
                    className="justify-start"
                    onClick={() => console.log('Download records')}
                  >
                    <Download size={16} className="mr-3" />
                    Download Records
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <Trash2 size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Student</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <span className="font-semibold">{student.first_name} {student.last_name}</span> 
                  (ID: {student.student_number})? All associated data will be permanently removed.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    color="red"
                    onClick={handleDelete}
                  >
                    Delete Student
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-6 border-gray-200">
            <div className="p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Student Data</h5>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                {JSON.stringify(student, null, 2)}
              </pre>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default StudentView