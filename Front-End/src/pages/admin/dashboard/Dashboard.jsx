import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { userService } from '../../../services/userService'
import studentService from '../../../services/studentService'
import facultyService from '../../../services/facultyService'
import enrollmentService from '../../../services/enrollmentService'
import { courseService } from '../../../services/courseService'
import { Users, GraduationCap, BookOpen, CheckCircle, Clock, Activity, RefreshCw, Settings, Plus } from 'lucide-react'

const formatAgo = (dateValue) => {
  if (!dateValue) return 'Unknown time'
  const diffMs = Date.now() - new Date(dateValue).getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboard, setDashboard] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    userRoles: {},
    activities: [],
    lastUpdated: null,
  })

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [usersStatsRes, usersRes, studentsRes, facultyRes, coursesRes, enrollmentsRes] = await Promise.all([
        userService.getStats(),
        userService.getAll({ page: 1, limit: 5 }),
        studentService.getAll(),
        facultyService.getAll(),
        courseService.getAll(),
        enrollmentService.getAll({ page: 1, limit: 5 }),
      ])

      const userRoles = usersStatsRes?.data?.roles || {}
      const users = Array.isArray(usersRes?.data) ? usersRes.data : []
      const students = Array.isArray(studentsRes?.data) ? studentsRes.data : []
      const faculty = Array.isArray(facultyRes?.data) ? facultyRes.data : []
      const courses = Array.isArray(coursesRes?.data) ? coursesRes.data : []
      const enrollmentItems = Array.isArray(enrollmentsRes?.data) ? enrollmentsRes.data : []
      const totalEnrollments = Number(enrollmentsRes?.pagination?.total || 0)

      const recentUserActivities = users.map((user) => ({
        id: `user-${user.user_id}`,
        name: `${user.first_name} ${user.last_name}`,
        action: `user account created (${user.role})`,
        time: formatAgo(user.created_at),
      }))

      const recentEnrollmentActivities = enrollmentItems.map((enrollment) => ({
        id: `enrollment-${enrollment.enrollment_id}`,
        name: `${enrollment.student?.user?.first_name || 'Student'} ${enrollment.student?.user?.last_name || ''}`.trim(),
        action: `enrolled in ${enrollment.section?.course?.course_code || 'course'}`,
        time: formatAgo(enrollment.enrollment_date),
      }))

      setDashboard({
        totalStudents: students.length,
        totalFaculty: faculty.length,
        totalCourses: courses.length,
        totalEnrollments,
        userRoles,
        activities: [...recentEnrollmentActivities, ...recentUserActivities].slice(0, 6),
        lastUpdated: new Date().toISOString(),
      })
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load dashboard data from backend')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const statCards = useMemo(
    () => [
      {
        title: 'Total Students',
        value: dashboard.totalStudents,
        icon: <GraduationCap size={24} />,
        color: 'blue',
      },
      {
        title: 'Total Faculty',
        value: dashboard.totalFaculty,
        icon: <Users size={24} />,
        color: 'green',
      },
      {
        title: 'Active Courses',
        value: dashboard.totalCourses,
        icon: <BookOpen size={24} />,
        color: 'purple',
      },
      {
        title: 'Total Enrollments',
        value: dashboard.totalEnrollments,
        icon: <CheckCircle size={24} />,
        color: 'yellow',
      },
    ],
    [dashboard]
  )

  const quickStats = useMemo(
    () => [
      {
        title: 'Total Users',
        value: dashboard.userRoles
          ? Object.values(dashboard.userRoles).reduce((sum, current) => sum + Number(current || 0), 0)
          : 0,
      },
      { title: 'Admins', value: Number(dashboard.userRoles?.admin || 0) },
      { title: 'Students', value: Number(dashboard.userRoles?.student || 0) },
      { title: 'Faculty', value: Number(dashboard.userRoles?.faculty || 0) },
    ],
    [dashboard.userRoles]
  )

  return (
    <AdminLayout title="Dashboard">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to School Admin</h1>
            <p className="text-gray-600">Manage your school efficiently with real-time backend data</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button variant="outline" className="flex items-center" onClick={loadDashboardData} disabled={loading}>
              <RefreshCw size={16} className="mr-2" />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button variant="primary" className="flex items-center">
              <Plus size={16} className="mr-2" />
              Quick Add
            </Button>
          </div>
        </div>

        {error ? (
          <Card className="mb-6 border border-red-200 bg-red-50">
            <div className="p-4 text-red-700">{error}</div>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-l-4" style={{ borderLeftColor: `var(--color-${stat.color})` }}>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                    <div className={`text-${stat.color}-600`}>{stat.icon}</div>
                  </div>
                  <Badge color="green" variant="outline">
                    Live
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-500 text-sm">{stat.title}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
                  <Settings size={18} className="text-gray-400" />
                </div>
                <div className="space-y-4">
                  {quickStats.map((stat) => (
                    <div key={stat.title} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-blue-100 mr-3">
                          <div className="text-blue-600">
                            <Clock size={18} />
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{stat.title}</p>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                </div>
                <div className="space-y-4">
                  {dashboard.activities.length ? (
                    dashboard.activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <div className="text-blue-600">
                              <Activity size={16} />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              <span className="font-semibold">{activity.name}</span> {activity.action}
                            </p>
                            <p className="text-sm text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No recent backend activity found.</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">System Status</h3>
                  <p className="text-gray-600">
                    API connected. Last updated:{' '}
                    {dashboard.lastUpdated ? new Date(dashboard.lastUpdated).toLocaleString() : 'Not loaded yet'}
                  </p>
                </div>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <Badge color={error ? 'red' : 'green'} className="px-3 py-1">
                    <Activity size={12} className="mr-1" />
                    {error ? 'Issue' : 'Online'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard
