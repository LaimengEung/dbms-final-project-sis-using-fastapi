import api from './api'

const enrollmentService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/enrollments', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/enrollments/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/enrollments', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  bulkCreate: async (data) => {
    try {
      const response = await api.post('/enrollments/bulk', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/enrollments/${id}/status`, { status })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/enrollments/${id}`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/enrollments/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getAvailableSections: async (params = {}) => {
    try {
      const response = await api.get('/enrollments/available-sections', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  searchStudents: async (query) => {
    try {
      if (!query) return { data: [] }
      const response = await api.get('/students', { params: { search: query, limit: 10 } })
      const data = Array.isArray(response.data) ? response.data : response.data?.data || []
      return { data }
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getSectionsBySemester: async (semesterId) => {
    try {
      const response = await api.get('/class-sections', {
        params: { semester_id: semesterId, status: 'open', limit: 100 },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getSemesters: async () => {
    try {
      const response = await api.get('/semesters', { params: { limit: 50 } })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default enrollmentService
