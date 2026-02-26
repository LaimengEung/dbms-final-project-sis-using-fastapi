import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import facultyService from '../../../services/facultyService'
import { Card, Button, Spinner } from '../../../components/ui'

const FacultyView = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [faculty, setFaculty] = useState(null)

  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const res = await facultyService.getById(id)
        setFaculty(res.data || null)
      } catch (err) {
        setError(err.message || 'Failed to load faculty.')
      } finally {
        setLoading(false)
      }
    }

    loadFaculty()
  }, [id])

  if (loading) {
    return (
      <AdminLayout title="Faculty Details">
        <div className="p-6 text-center">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    )
  }

  if (!faculty) {
    return (
      <AdminLayout title="Faculty Not Found">
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <p className="text-red-800">{error || 'Faculty not found.'}</p>
          </Card>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => navigate('/admin/faculty')}>Back to Faculty</Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`${faculty.first_name} ${faculty.last_name}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{faculty.first_name} {faculty.last_name}</h1>
            <p className="text-gray-600">{faculty.email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/admin/faculty')}>Back</Button>
            <Button onClick={() => navigate(`/admin/faculty/edit/${faculty.faculty_id}`)}>Edit</Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <p className="text-yellow-800">{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              <div>
                <p className="text-sm text-gray-500">Faculty ID</p>
                <p className="font-medium">{faculty.faculty_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Faculty Number</p>
                <p className="font-medium">{faculty.faculty_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium">{faculty.title || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs ${faculty.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {faculty.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Academic Assignment</h3>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{faculty.department_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department ID</p>
                <p className="font-medium">{faculty.department_id || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Office Location</p>
                <p className="font-medium">{faculty.office_location || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium">{faculty.user_id || '-'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default FacultyView

