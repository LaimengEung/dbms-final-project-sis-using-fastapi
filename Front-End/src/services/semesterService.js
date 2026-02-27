import api from './api'

const _err = (error) => {
  const data = error?.response?.data
  const msg = data?.detail || data?.message || error?.message || 'An error occurred'
  const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  err.response = error?.response
  throw err
}

const semesterService = {
  getAll: async (params = { limit: 100 }) => {
    try {
      const response = await api.get('/semesters', { params })
      const raw = response.data
      const data = Array.isArray(raw) ? raw : raw?.data || []
      return { data }
    } catch (error) { _err(error) }
  },

  create: async (data) => {
    try {
      const response = await api.post('/semesters', data)
      const raw = response.data
      return { data: raw?.data || raw }
    } catch (error) { _err(error) }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/semesters/${id}`, data)
      const raw = response.data
      return { data: raw?.data || raw }
    } catch (error) { _err(error) }
  },

  delete: async (id) => {
    try {
      await api.delete(`/semesters/${id}`)
      return { success: true }
    } catch (error) { _err(error) }
  },

  setCurrent: async (id) => {
    try {
      const response = await api.patch(`/semesters/${id}/set-current`)
      return { data: response.data }
    } catch (error) { _err(error) }
  },
}

export default semesterService
