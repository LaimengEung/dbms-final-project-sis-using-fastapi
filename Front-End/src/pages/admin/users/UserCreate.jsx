// pages/admin/users/UserCreate.jsx
import React, { useState } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import { useNavigate } from 'react-router-dom'

// Import UI components
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Alert from '../../../components/ui/Alert'
import Spinner from '../../../components/ui/Spinner'

// Import service
import { userService } from '../../../services/userService'

// Icons
import { ArrowLeft, Save, User, Mail, Lock, Shield, UserPlus } from 'lucide-react'

const UserCreate = () => {
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'student'
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setApiError('')
    setSuccessMessage('')
    
    try {
      // Prepare user data (remove confirmPassword)
      const userData = {
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        role: formData.role
      }

      console.log('Creating user:', userData)
      
      // Use service to create user
      const response = await userService.create(userData)
      console.log('✅ User created successfully!', response)
      
      setSuccessMessage(`User "${formData.first_name} ${formData.last_name}" created successfully!`)
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        role: 'student'
      })
      setErrors({})
      
      // Optional: Redirect after 3 seconds
      setTimeout(() => {
        navigate('/admin/users')
      }, 3000)
      
    } catch (error) {
      console.error('Error creating user:', error)
      
      let errorMessage = 'Failed to create user. Please try again.'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = error.response.data.errors
        setErrors(backendErrors)
        errorMessage = 'Please fix the validation errors above.'
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Please check your backend connection.'
      }
      
      setApiError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Create New User">
      <div className="p-6">
        {/* Header */}
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
            <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
            <p className="text-gray-600 mt-2">Add a new user to the system</p>
          </div>
          
          <div className="flex items-center text-blue-600">
            <UserPlus size={24} className="mr-2" />
            <div className="text-right">
              <div className="text-sm">New User Form</div>
              <div className="text-xs text-gray-500">All fields are required</div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {apiError && (
          <Alert 
            type="error" 
            title="Error" 
            message={apiError}
            className="mb-6"
            onClose={() => setApiError('')}
          />
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert 
            type="success" 
            title="Success" 
            message={successMessage}
            className="mb-6"
          />
        )}

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            {/* Personal Information Card */}
            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <User size={20} className="text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                    error={errors.first_name}
                    required
                    disabled={loading}
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
                    disabled={loading}
                    icon={<User size={16} />}
                  />
                </div>
              </div>
            </Card>

            {/* Account Information Card */}
            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Mail size={20} className="text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                </div>
                
                <div className="space-y-6">
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="user@school.edu"
                    error={errors.email}
                    required
                    disabled={loading}
                    icon={<Mail size={16} />}
                    helperText="Use a valid school email address"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Minimum 6 characters"
                      error={errors.password}
                      required
                      disabled={loading}
                      icon={<Lock size={16} />}
                      helperText="At least 6 characters"
                    />
                    
                    <Input
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      error={errors.confirmPassword}
                      required
                      disabled={loading}
                      icon={<Lock size={16} />}
                    />
                  </div>
                  
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
                    disabled={loading}
                    icon={<Shield size={16} />}
                  />
                </div>
              </div>
            </Card>

            {/* Form Actions Card */}
            <Card>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      All changes are saved to the database
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/admin/users')}
                      disabled={loading}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="px-6 flex items-center"
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="mr-2" />
                          Create User
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </form>
        </div>

        {/* Info Card */}
        <Card className="mt-6 border-green-200">
          <div className="p-4">
            <div className="flex items-center">
              <UserPlus size={20} className="text-green-600 mr-3" />
              <div className="flex-1">
                <h4 className="font-medium text-green-800 mb-1">✅ Create User Form Ready</h4>
                <p className="text-green-700 text-sm">
                  This form will send a POST request to: <code className="bg-green-100 px-1 rounded">/users</code>
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  <div>Endpoint: <span className="font-mono">POST /api/v1/users</span></div>
                  <div>Service: {userService.create ? '✅ Connected' : '⚠️ Mock'}</div>
                  <div>Data will be validated before submission</div>
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

export default UserCreate