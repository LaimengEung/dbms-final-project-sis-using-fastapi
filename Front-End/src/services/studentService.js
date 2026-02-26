import api from './api'

const studentService = {
  async getAll(params = {}) {
    const response = await api.get('/students', { params })
    const data = Array.isArray(response.data) ? response.data : response.data?.data || []
    return { data, status: response.status }
  },

  async getById(id) {
    const response = await api.get(`/students/${id}`)
    return { data: response.data?.data || response.data, status: response.status }
  },

  async create(studentData) {
    const response = await api.post('/students', studentData)
    return {
      data: response.data?.data || response.data,
      status: response.status,
      message: response.data?.message || 'Student created successfully!',
    }
  },

  async update(id, studentData) {
    const response = await api.put(`/students/${id}`, studentData)
    return {
      data: response.data?.data || response.data,
      status: response.status,
      message: response.data?.message || 'Student updated successfully!',
    }
  },

  async delete(id) {
    const response = await api.delete(`/students/${id}`)
    return {
      data: response.data?.data || {},
      status: response.status,
      message: response.data?.message || 'Student deleted successfully!',
    }
  },

  async getEnrollments(studentId) {
    const response = await api.get(`/students/${studentId}/enrollments`)
    const data = Array.isArray(response.data) ? response.data : response.data?.data || []
    return { data, status: response.status }
  },
}

export default studentService
