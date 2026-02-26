import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import facultyService from '../../../services/facultyService'
import { Card, Button, Input, Select } from '../../../components/ui'

const FacultyCreate = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    faculty_number: `FAC${Date.now().toString().slice(-6)}`,
    title: '',
    department_id: '',
    office_location: '',
    is_active: true
  })

  useEffect(() => {
    const loadDepartments = async () => {
      const res = await facultyService.getDepartments()
      setDepartments(res.data || [])
    }
    loadDepartments()
  }, [])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      await facultyService.create(formData)
      navigate('/admin/faculty', { state: { message: 'Faculty created successfully.' } })
    } catch (err) {
      setError(err.message || 'Failed to create faculty.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Add Faculty">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Faculty</h1>
          <p className="text-gray-600">Create faculty profile and account information</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <p className="text-red-800">{error}</p>
          </Card>
        )}

        <Card>
          <form className="p-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="At least 8 characters"
                helperText="Set the faculty login password."
                required
              />
              <Input
                label="Faculty Number"
                value={formData.faculty_number}
                onChange={(e) => handleChange('faculty_number', e.target.value)}
                required
              />
              <Input
                label="Title"
                placeholder="Assistant Professor"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
              <Select
                label="Department"
                value={formData.department_id}
                onChange={(e) => handleChange('department_id', Number(e.target.value))}
                options={departments.map(d => ({ value: d.department_id, label: d.department_name }))}
                required
              />
              <Input
                label="Office Location"
                placeholder="Bldg A - Room 204"
                value={formData.office_location}
                onChange={(e) => handleChange('office_location', e.target.value)}
              />
              <Select
                label="Status"
                value={String(formData.is_active)}
                onChange={(e) => handleChange('is_active', e.target.value === 'true')}
                options={[
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' }
                ]}
              />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/faculty')}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Create Faculty
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default FacultyCreate

