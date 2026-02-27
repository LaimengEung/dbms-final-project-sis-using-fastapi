import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import sectionService from '../../../services/sectionService'
import facultyService from '../../../services/facultyService'
import { Card, Button, Input, Select, Spinner } from '../../../components/ui'
import { ArrowLeft } from 'lucide-react'

const SectionEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [section, setSection] = useState(null)
  const [facultyList, setFacultyList] = useState([])
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    faculty_id: '',
    classroom: '',
    schedule: '',
    max_capacity: 30,
    status: 'open',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, fRes] = await Promise.all([
          sectionService.getSection(id),
          facultyService.getAll(),
        ])
        const s = sRes.data?.data ?? sRes.data
        setSection(s)
        setFormData({
          faculty_id: s.faculty_id || '',
          classroom: s.classroom || '',
          schedule: s.schedule || '',
          max_capacity: s.max_capacity || 30,
          status: s.status || 'open',
        })
        setFacultyList(Array.isArray(fRes.data) ? fRes.data : (fRes.data?.data ?? []))
      } catch (err) {
        setError('Failed to load section.')
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
      await sectionService.update(id, {
        ...formData,
        faculty_id: formData.faculty_id ? Number(formData.faculty_id) : null,
        max_capacity: Number(formData.max_capacity),
      })
      const backUrl = section?.course_id
        ? `/admin/courses/${section.course_id}`
        : '/admin/sections'
      navigate(backUrl, { state: { message: 'Section updated successfully.' } })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update section.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <AdminLayout title="Edit Section"><div className="flex items-center justify-center h-64"><Spinner /></div></AdminLayout>
  }

  return (
    <AdminLayout title="Edit Section">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(section?.course_id ? `/admin/courses/${section.course_id}` : '/admin/sections')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Section</h1>
            {section && (
              <p className="text-gray-600 mt-0.5">
                {section.course?.course_code} — Section {section.section_number}
                {section.semester ? ` · ${section.semester.semester_name} ${section.semester.semester_year}` : ''}
              </p>
            )}
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <p className="text-red-800 p-4">{error}</p>
          </Card>
        )}

        {/* Read-only info */}
        {section && (
          <Card className="mb-6 border border-gray-200 bg-gray-50">
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Course</p>
                <p className="text-sm font-medium text-gray-900">{section.course?.course_code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Section #</p>
                <p className="text-sm font-mono font-medium text-gray-900">{section.section_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Semester</p>
                <p className="text-sm text-gray-900">{section.semester ? `${section.semester.semester_name} ${section.semester.semester_year}` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Enrolled</p>
                <p className="text-sm font-medium text-gray-900">{section.enrolled_count} / {section.max_capacity}</p>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <form className="p-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Instructor (Faculty)"
                value={formData.faculty_id}
                onChange={e => handleChange('faculty_id', e.target.value)}
                options={facultyList.map(f => ({
                  value: f.faculty_id,
                  label: `${f.first_name} ${f.last_name}${f.title ? ` (${f.title})` : ''}`,
                }))}
                placeholder="TBA (optional)"
              />
              <Input
                label="Classroom"
                placeholder="e.g. Bldg A Room 101"
                value={formData.classroom}
                onChange={e => handleChange('classroom', e.target.value)}
              />
              <Input
                label="Schedule"
                placeholder="e.g. MWF 8:00 - 9:30 AM"
                value={formData.schedule}
                onChange={e => handleChange('schedule', e.target.value)}
              />
              <Input
                label="Max Capacity"
                type="number"
                min={1}
                max={500}
                value={formData.max_capacity}
                onChange={e => handleChange('max_capacity', e.target.value)}
                required
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={e => handleChange('status', e.target.value)}
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'closed', label: 'Closed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                required
              />
            </div>

            <div className="mt-8 flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(section?.course_id ? `/admin/courses/${section.course_id}` : '/admin/sections')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default SectionEdit
