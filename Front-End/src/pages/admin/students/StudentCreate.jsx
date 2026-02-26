// src/pages/admin/students/StudentCreate.jsx - FIXED VERSION
import React, { useState } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import { useNavigate } from 'react-router-dom'
import studentService from '../../../services/studentService'
import { Card, Button, Input, Select } from '../../../components/ui'

const StudentCreate = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    student_number: `STU${Date.now().toString().slice(-6)}`, // Auto-generated
    classification: 1,
    major_name: 'Computer Science',
    gpa: 3.0,
    credits_earned: 0,
    academic_standing: 'Good'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Submitting form data:', formData)
    setLoading(true)
    
    try {
      const response = await studentService.create(formData)
      console.log('Create response:', response)
      
      // Navigate back WITH SUCCESS MESSAGE
      navigate('/admin/students', { 
        state: { 
          message: `${response.message || 'Student created successfully!'}` 
        } 
      })
    } catch (error) {
      console.error('Create error:', error)
      const message = error?.response?.data?.message || error.message || 'Unknown error'
      alert('Error creating student: ' + message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <AdminLayout title="Add New Student">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
          <p className="text-gray-600">Create a new student record</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                
                <Input
                  label="First Name *"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  required
                  placeholder="Enter first name"
                />
                
                <Input
                  label="Last Name *"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  required
                  placeholder="Enter last name"
                />
                
                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  placeholder="student@school.edu"
                />

                <Input
                  label="Password *"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  placeholder="At least 8 characters"
                  helperText="Set the student's login password."
                />
              </div>

              {/* Academic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Academic Information</h3>
                
                <Input
                  label="Student Number"
                  value={formData.student_number}
                  disabled
                  helperText="Auto-generated"
                />
                
                <Select
                  label="Year *"
                  value={formData.classification}
                  onChange={(e) => handleChange('classification', parseInt(e.target.value))}
                  options={[
                    { value: 1, label: 'Year 1' },
                    { value: 2, label: 'Year 2' },
                    { value: 3, label: 'Year 3' },
                    { value: 4, label: 'Year 4' }
                  ]}
                />
                
                <Select
                  label="Major *"
                  value={formData.major_name}
                  onChange={(e) => handleChange('major_name', e.target.value)}
                  options={[
                    { value: 'Computer Science', label: 'Computer Science' },
                    { value: 'Engineering', label: 'Engineering' },
                    { value: 'Business', label: 'Business' },
                    { value: 'Mathematics', label: 'Mathematics' },
                    { value: 'Biology', label: 'Biology' },
                    { value: 'Chemistry', label: 'Chemistry' }
                  ]}
                />
                
                <Input
                  label="GPA"
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  value={formData.gpa}
                  onChange={(e) => handleChange('gpa', parseFloat(e.target.value))}
                  placeholder="0.0 - 4.0"
                />
                
                <Input
                  label="Credits Earned"
                  type="number"
                  min="0"
                  value={formData.credits_earned}
                  onChange={(e) => handleChange('credits_earned', parseInt(e.target.value))}
                  placeholder="0"
                />
                
                <Select
                  label="Academic Standing"
                  value={formData.academic_standing}
                  onChange={(e) => handleChange('academic_standing', e.target.value)}
                  options={[
                    { value: 'Good', label: 'Good' },
                    { value: 'Probation', label: 'Probation' },
                    { value: 'Suspended', label: 'Suspended' }
                  ]}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/students')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                {loading ? 'Creating...' : 'Create Student'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default StudentCreate
