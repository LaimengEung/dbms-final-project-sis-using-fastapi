// pages/admin/users/UserEdit.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'

// Import UI components
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Spinner from '../../../components/ui/Spinner'
import Alert from '../../../components/ui/Alert' // Assuming you have Alert component

// Import your service
import { userService } from '../../../services/userService'

// Icons
import { ArrowLeft, Save, User, Mail, Shield, AlertCircle } from 'lucide-react'

const UserEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'student'
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  console.log('🔍 UserEdit loaded for ID:', id)

  // Fetch user data
  useEffect(() => {
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      setApiError('')
      console.log('📡 Fetching user data for ID:', id)
      
      // Use service to fetch user
      const response = await userService.getById(id)
      const userData = response.data
      
      console.log('✅ User data loaded:', userData)
      
      setFormData({
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        role: userData.role || 'student'
      })
      
    } catch (error) {
      console.error('❌ Error fetching user:', error)
      setApiError(`Failed to load user data: ${error.response?.data?.message || error.message}`)
      
      // Optional: Show alert to user
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
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
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
      console.log('💾 Updating user ID:', id, 'with data:', formData)
      
      // Use service to update user
      const response = await userService.update(id, formData)
      console.log('✅ Update response:', response)
      
      setSuccessMessage(`User #${id} updated successfully!`)
      
      // Redirect to user list after 2 seconds
      setTimeout(() => {
        navigate('/admin/users')
      }, 2000)
      
    } catch (error) {
      console.error('❌ Error updating user:', error)
      
      let errorMessage = 'Failed to update user. Please try again.'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = error.response.data.errors
        setErrors(backendErrors)
        errorMessage = 'Please fix the errors above.'
      }
      
      setApiError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Edit User">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading user #{id}...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Edit User #${id}`}>
      <div className="p-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/users')}
              className="flex items-center mb-2"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Users
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Edit User #{id}</h1>
            <p className="text-gray-600 mt-2">Update user information</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Editing</div>
            <div className="font-medium">{formData.first_name} {formData.last_name}</div>
          </div>
        </div>

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

        <Card className="max-w-2xl">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <Input
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                  error={errors.first_name}
                  required
                  icon={<User size={16} />}
                />
                
                {/* Last Name */}
                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                  error={errors.last_name}
                  required
                  icon={<User size={16} />}
                />
              </div>
              
              {/* Email */}
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="user@school.edu"
                error={errors.email}
                required
                icon={<Mail size={16} />}
                helperText="School email address required"
              />
              
              {/* Role */}
              <Select
                label="Role"
                name="role"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                options={[
                  { value: 'student', label: 'Student' },
                  { value: 'teacher', label: 'Teacher' },
                  { value: 'admin', label: 'Administrator' }
                ]}
                icon={<Shield size={16} />}
              />
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/users')}
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
                  {saving ? 'Saving...' : 'Update User'}
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Debug/Info Section */}
        <Card className="mt-6 border-blue-200">
          <div className="p-4">
            <div className="flex items-center">
              <AlertCircle size={18} className="text-blue-600 mr-3" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-800 mb-1">API Information</h4>
                <p className="text-blue-700 text-sm">
                  This form will send a PUT request to: <code className="bg-blue-100 px-1 rounded">/users/{id}</code>
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  <div>Endpoint: <span className="font-mono">PUT /api/v1/users/{id}</span></div>
                  <div>Service: {userService.update ? '✅ Connected' : '⚠️ Mock'}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Form Data Preview (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-4 border-gray-200">
            <div className="p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Form Data Preview</h5>
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

export default UserEdit