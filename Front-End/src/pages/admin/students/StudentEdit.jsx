// pages/admin/students/StudentEdit.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import  studentService  from '../../../services/studentService'
import { Card, Button, Input, Select, Spinner, Alert } from '../../../components/ui'
import { ArrowLeft, Save, User, Mail, GraduationCap, BookOpen, Award } from 'lucide-react'

const StudentEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    student_number: '',
    classification: 1,
    major_name: 'Computer Science',
    gpa: 0.0,
    credits_earned: 0,
    academic_standing: 'Good'
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchStudent()
  }, [id])

  const fetchStudent = async () => {
    try {
      setLoading(true)
      setApiError('')
      
      const response = await studentService.getById(id)
      const studentData = response.data
      
      setFormData({
        first_name: studentData.first_name || '',
        last_name: studentData.last_name || '',
        email: studentData.email || '',
        student_number: studentData.student_number || '',
        classification: studentData.classification || 1,
        major_name: studentData.major_name || 'Computer Science',
        gpa: parseFloat(studentData.gpa) || 0.0,
        credits_earned: studentData.credits_earned || 0,
        academic_standing: studentData.academic_standing || 'Good'
      })
      
    } catch (error) {
      console.error('Error fetching student:', error)
      setApiError(`Failed to load student data: ${error.response?.data?.message || error.message}`)
      
      if (!error.response) {
        setApiError('Cannot connect to server. Please check your backend connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (formData.gpa < 0 || formData.gpa > 4) {
      newErrors.gpa = 'GPA must be between 0.0 and 4.0'
    }
    
    if (formData.credits_earned < 0) {
      newErrors.credits_earned = 'Credits cannot be negative'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setSaving(true)
    setApiError('')
    setSuccessMessage('')
    
    try {
      const response = await studentService.update(id, formData)
      
      setSuccessMessage(`Student #${id} updated successfully!`)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/students')
      }, 2000)
      
    } catch (error) {
      console.error('Error updating student:', error)
      
      let errorMessage = 'Failed to update student. Please try again.'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
        errorMessage = 'Please fix the errors above.'
      }
      
      setApiError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Edit Student">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading student data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Edit Student #${id}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/students')}
              className="flex items-center mb-2"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Students
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Student #{id}</h1>
            <p className="text-gray-600 mt-2">Update student information</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Student ID</div>
            <div className="font-mono font-medium">{formData.student_number}</div>
          </div>
        </div>

        {/* Alerts */}
        {apiError && (
          <Alert 
            type="error" 
            title="Error" 
            message={apiError}
            className="mb-6"
            onClose={() => setApiError('')}
          />
        )}

        {successMessage && (
          <Alert 
            type="success" 
            title="Success" 
            message={successMessage}
            className="mb-6"
          />
        )}

        <Card className="max-w-4xl">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info Column */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User size={20} className="text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  
                  <Input
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                    error={errors.first_name}
                    required
                    disabled={saving}
                    icon={<User size={16} />}
                  />
                  
                  <Input
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="Enter last name"
                    error={errors.last_name}
                    required
                    disabled={saving}
                    icon={<User size={16} />}
                  />
                  
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="student@school.edu"
                    error={errors.email}
                    required
                    disabled={saving}
                    icon={<Mail size={16} />}
                  />
                  
                  <Input
                    label="Student Number"
                    name="student_number"
                    value={formData.student_number}
                    disabled
                    helperText="Auto-generated, cannot be changed"
                    icon={<GraduationCap size={16} />}
                  />
                </div>

                {/* Academic Info Column */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <GraduationCap size={20} className="text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
                  </div>
                  
                  <Select
                    label="Year"
                    name="classification"
                    value={formData.classification}
                    onChange={(e) => handleChange('classification', parseInt(e.target.value))}
                    options={[
                      { value: 1, label: 'Year 1 - Freshman' },
                      { value: 2, label: 'Year 2 - Sophomore' },
                      { value: 3, label: 'Year 3 - Junior' },
                      { value: 4, label: 'Year 4 - Senior' }
                    ]}
                    disabled={saving}
                  />
                  
                  <Select
                    label="Major"
                    name="major_name"
                    value={formData.major_name}
                    onChange={(e) => handleChange('major_name', e.target.value)}
                    options={[
                      { value: 'Computer Science', label: 'Computer Science' },
                      { value: 'Engineering', label: 'Engineering' },
                      { value: 'Business', label: 'Business' },
                      { value: 'Mathematics', label: 'Mathematics' },
                      { value: 'Biology', label: 'Biology' },
                      { value: 'Chemistry', label: 'Chemistry' },
                      { value: 'Physics', label: 'Physics' },
                      { value: 'English', label: 'English' },
                      { value: 'History', label: 'History' }
                    ]}
                    disabled={saving}
                    icon={<BookOpen size={16} />}
                  />
                  
                  <Input
                    label="GPA"
                    name="gpa"
                    type="number"
                    min="0"
                    max="4"
                    step="0.1"
                    value={formData.gpa}
                    onChange={(e) => handleChange('gpa', parseFloat(e.target.value))}
                    placeholder="0.0 - 4.0"
                    error={errors.gpa}
                    disabled={saving}
                    icon={<Award size={16} />}
                    helperText="On a 4.0 scale"
                  />
                  
                  <Input
                    label="Credits Earned"
                    name="credits_earned"
                    type="number"
                    min="0"
                    value={formData.credits_earned}
                    onChange={(e) => handleChange('credits_earned', parseInt(e.target.value))}
                    placeholder="0"
                    error={errors.credits_earned}
                    disabled={saving}
                    icon={<BookOpen size={16} />}
                    helperText="Total credit hours"
                  />
                  
                  <Select
                    label="Academic Standing"
                    name="academic_standing"
                    value={formData.academic_standing}
                    onChange={(e) => handleChange('academic_standing', e.target.value)}
                    options={[
                      { value: 'Good', label: 'Good Standing' },
                      { value: 'Probation', label: 'Academic Probation' },
                      { value: 'Suspended', label: 'Suspended' },
                      { value: 'Dismissed', label: 'Dismissed' }
                    ]}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/students')}
                  disabled={saving}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="px-6 flex items-center"
                >
                  <Save size={18} className="mr-2" />
                  {saving ? 'Saving...' : 'Update Student'}
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-6 border-gray-200">
            <div className="p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Form Data</h5>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default StudentEdit