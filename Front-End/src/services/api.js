// src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('currentUser')

      const path = window.location.pathname
      let loginPath = '/login/student'
      if (path.startsWith('/admin')) loginPath = '/login/admin'
      else if (path.startsWith('/faculty')) loginPath = '/login/faculty'
      else if (path.startsWith('/registrar')) loginPath = '/login/registrar'

      if (!path.startsWith('/login')) {
        window.location.assign(loginPath)
      }
    }
    return Promise.reject(error)
  }
)

// ✅ MUST BE DEFAULT EXPORT
export default api
