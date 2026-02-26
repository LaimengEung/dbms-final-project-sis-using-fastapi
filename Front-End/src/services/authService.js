import api from './api'

const authService = {
  async login(payload) {
    const response = await api.post('/auth/login', payload)
    return response.data
  },

  async changePassword(payload) {
    const response = await api.post('/auth/change-password', payload)
    return response.data
  },

  async forgotPassword(payload) {
    const response = await api.post('/auth/forgot-password', payload)
    return response.data
  },

  async resetPassword(payload) {
    const response = await api.post('/auth/reset-password', payload)
    return response.data
  },
}

export default authService
