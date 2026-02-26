import api from './api'

const preRegistrationService = {
  async getAll(params = {}) {
    const res = await api.get('/pre-registrations', { params })
    const data = Array.isArray(res.data) ? res.data : res.data?.data || []
    return { data, status: res.status }
  },

  async update(id, payload) {
    const res = await api.put(`/pre-registrations/${id}`, payload)
    return { data: res.data?.data || res.data, status: res.status }
  },
}

export default preRegistrationService

