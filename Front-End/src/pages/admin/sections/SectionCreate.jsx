import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import { courseService } from '../../../services/courseService'
import sectionService from '../../../services/sectionService'
import semesterService from '../../../services/semesterService'
import facultyService from '../../../services/facultyService'
import { Card, Button, Input, Select } from '../../../components/ui'
import { ArrowLeft } from 'lucide-react'

const SectionCreate = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedCourseId = searchParams.get('course_id') || ''

  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [semesters, setSemesters] = useState([])
  const [facultyList, setFacultyList] = useState([])
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    course_id: preselectedCourseId,
    semester_id: '',
    faculty_id: '',
    classroom: '',
    schedule: '',
    max_capacity: 30,
    status: 'open',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, sRes, fRes] = await Promise.all([
          courseService.getAll(),
          semesterService.getAll(),
          facultyService.getAll(),
        ])
        setCourses(Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data ?? []))
        setSemesters(Array.isArray(sRes.data) ? sRes.data : (sRes.data?.data ?? []))
        setFacultyList(Array.isArray(fRes.data) ? fRes.data : (fRes.data?.data ?? []))
      } catch (err) {
        setError('Failed to load data.')
      }
    }
    load()
  }, [])

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.course_id) { setError('Please select a course.'); return }
    if (!formData.semester_id) { setError('Please select a semester.'); return }
    try {
      setLoading(true)
      setError('')
      await sectionService.create(formData.course_id, {
        semester_id: Number(formData.semester_id),
        faculty_id: formData.faculty_id ? Number(formData.faculty_id) : null,
        classroom: formData.classroom || null,
        schedule: formData.schedule || null,
        max_capacity: Number(formData.max_capacity),
        status: formData.status,
      })
      const backUrl = preselectedCourseId
        ? `/admin/courses/${preselectedCourseId}`
        : '/admin/sections'
      navigate(backUrl, { state: { message: 'Section created successfully.' } })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create section.')
    } finally {
      setLoading(false)
    }
  }

  const selectedCourse = courses.find(c => String(c.course_id) === String(formData.course_id))

  return (
    <AdminLayout title="Add Section">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(preselectedCourseId ? `/admin/courses/${preselectedCourseId}` : '/admin/sections')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Section</h1>
            <p className="text-gray-600">
              {selectedCourse ? `Creating section for ${selectedCourse.course_code} — ${selectedCourse.course_name}` : 'Schedule a class section for a course'}
            </p>
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
              <Select
                label="Course"
                value={formData.course_id}
                onChange={e => handleChange('course_id', e.target.value)}
                options={courses.map(c => ({ value: c.course_id, label: `${c.course_code} — ${c.course_name}` }))}
                placeholder="Select course"
                required
              />
              <Select
                label="Semester"
                value={formData.semester_id}
                onChange={e => handleChange('semester_id', e.target.value)}
                options={semesters.map(s => ({ value: s.semester_id, label: `${s.semester_name} ${s.semester_year}` }))}
                placeholder="Select semester"
                required
              />
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
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Create Section'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(preselectedCourseId ? `/admin/courses/${preselectedCourseId}` : '/admin/sections')}
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

export default SectionCreate
