import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import { courseService } from '../../../services/courseService'
import departmentService from '../../../services/departmentService'
import { Card, Button, Input, Select, Spinner } from '../../../components/ui'
import { ArrowLeft } from 'lucide-react'

const CourseEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [departments, setDepartments] = useState([])
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    description: '',
    credits: 3,
    department_id: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, dRes] = await Promise.all([
          courseService.getById(id),
          departmentService.getAll(),
        ])
        const course = cRes.data?.data ?? cRes.data
        setFormData({
          course_code: course.course_code || '',
          course_name: course.course_name || '',
          description: course.description || '',
          credits: course.credits || 3,
          department_id: course.department_id || '',
        })
        setDepartments(Array.isArray(dRes.data) ? dRes.data : (dRes.data?.data ?? []))
      } catch (err) {
        setError('Failed to load course.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      await courseService.update(id, {
        ...formData,
        credits: Number(formData.credits),
        department_id: formData.department_id ? Number(formData.department_id) : null,
      })
      navigate('/admin/courses', { state: { message: `Course "${formData.course_name}" updated successfully.` } })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update course.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Edit Course">
        <div className="flex items-center justify-center h-64"><Spinner /></div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Edit Course">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => navigate('/admin/courses')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
            <p className="text-gray-600">Update course catalog information</p>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <p className="text-red-800 p-4">{error}</p>
          </Card>
        )}

        <Card>
          <form className="p-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Course Code"
                value={formData.course_code}
                onChange={e => handleChange('course_code', e.target.value)}
                required
              />
              <Input
                label="Course Name"
                value={formData.course_name}
                onChange={e => handleChange('course_name', e.target.value)}
                required
              />
              <Select
                label="Credits"
                value={formData.credits}
                onChange={e => handleChange('credits', e.target.value)}
                options={[1, 2, 3, 4, 5, 6].map(n => ({ value: n, label: `${n} credit${n > 1 ? 's' : ''}` }))}
                required
              />
              <Select
                label="Department"
                value={formData.department_id}
                onChange={e => handleChange('department_id', e.target.value)}
                options={departments.map(d => ({ value: d.department_id, label: d.department_name }))}
                placeholder="Select department"
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/courses')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default CourseEdit
