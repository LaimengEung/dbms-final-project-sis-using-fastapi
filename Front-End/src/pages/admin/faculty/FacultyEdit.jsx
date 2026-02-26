import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import facultyService from '../../../services/facultyService'
import { Card, Button, Input, Select, Spinner } from '../../../components/ui'

const FacultyEdit = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [departments, setDepartments] = useState([])
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    faculty_number: '',
    title: '',
    department_id: '',
    office_location: '',
    is_active: true
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [facultyRes, deptRes] = await Promise.all([
          facultyService.getById(id),
          facultyService.getDepartments()
        ])

        const data = facultyRes.data || {}
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          faculty_number: data.faculty_number || '',
          title: data.title || '',
          department_id: data.department_id || '',
          office_location: data.office_location || '',
          is_active: data.is_active !== false
        })
        setDepartments(deptRes.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load faculty data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      await facultyService.update(id, formData)
      navigate('/admin/faculty', { state: { message: 'Faculty updated successfully.' } })
    } catch (err) {
      setError(err.message || 'Failed to update faculty.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Edit Faculty">
        <div className="p-6 text-center">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Edit Faculty #${id}`}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Faculty</h1>
          <p className="text-gray-600">Update faculty profile and assignment details</p>
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
                label="Faculty Number"
                value={formData.faculty_number}
                onChange={(e) => handleChange('faculty_number', e.target.value)}
                required
              />
              <Input
                label="Title"
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
              <Button type="submit" isLoading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default FacultyEdit

