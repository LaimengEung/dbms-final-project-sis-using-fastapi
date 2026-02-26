import api from './api'

const facultyService = {
  async getDepartments() {
    const res = await api.get('/departments')
    const data = Array.isArray(res.data) ? res.data : res.data?.data || []
    return { data, status: res.status }
  },

  async getAll(params = {}) {
    const res = await api.get('/faculty', { params })
    const data = Array.isArray(res.data) ? res.data : res.data?.data || []
    return { data, status: res.status }
  },

  async getById(id) {
    const res = await api.get(`/faculty/${id}`)
    return { data: res.data?.data || res.data, status: res.status }
  },

  async create(payload) {
    const res = await api.post('/faculty', payload)
    return { data: res.data?.data || res.data, status: res.status }
  },

  async update(id, payload) {
    const res = await api.put(`/faculty/${id}`, payload)
    return { data: res.data?.data || res.data, status: res.status }
  },

  async delete(id) {
    const res = await api.delete(`/faculty/${id}`)
    return { data: res.data?.data || {}, status: res.status }
  },
}

export default facultyService
