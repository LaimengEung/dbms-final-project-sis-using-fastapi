import api from './api'

const gradeService = {
  async getAll(params = {}) {
    const res = await api.get('/grades', { params })
    const data = Array.isArray(res.data) ? res.data : res.data?.data || []
    return { data, status: res.status }
  },

  async create(payload) {
    const res = await api.post('/grades', payload)
    return { data: res.data?.data || res.data, status: res.status }
  },

  async update(id, payload) {
    const res = await api.put(`/grades/${id}`, payload)
    return { data: res.data?.data || res.data, status: res.status }
  },
}

export default gradeService
