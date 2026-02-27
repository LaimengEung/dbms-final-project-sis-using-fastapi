import api from './api'

const preRegistrationService = {
  async getAll(params = {}) {
    const res = await api.get('/pre-registrations', { params })
    const data = Array.isArray(res.data) ? res.data : res.data?.data || []
    return { data, status: res.status }
  },

  async create(payload) {
    const res = await api.post('/pre-registrations', payload)
    return { data: res.data?.data || res.data, status: res.status }
  },

  async update(id, payload) {
    const res = await api.put(`/pre-registrations/${id}`, payload)
    return { data: res.data?.data || res.data, status: res.status }
  },

  async delete(id) {
    const res = await api.delete(`/pre-registrations/${id}`)
    return { status: res.status }
  },
}

export default preRegistrationService

