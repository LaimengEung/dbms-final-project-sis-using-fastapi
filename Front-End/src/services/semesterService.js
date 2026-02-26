import api from './api'

const semesterService = {
  getAll: async (params = { limit: 100 }) => {
    const response = await api.get('/semesters', { params })
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/semesters', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/semesters/${id}`, data)
    return response.data
  },

  setCurrent: async (id) => {
    const response = await api.patch(`/semesters/${id}/current`)
    return response.data
  },
}

export default semesterService
