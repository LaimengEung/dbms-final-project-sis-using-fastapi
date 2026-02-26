import api from './api'

export const userService = {
  // ✅ RESTful: GET /users (collection)
  getAll: async (params = {}) => {
    console.log('📞 REST API: GET /users', params)
    return api.get('/users', { params })
  },
  
  // ✅ RESTful: GET /users/:id (single resource)
  getById: async (id) => {
    console.log('📞 REST API: GET /users/' + id)
    return api.get(`/users/${id}`)
  },
  
  // ✅ RESTful: POST /users (create)
  create: async (userData) => {
    console.log('📞 REST API: POST /users', userData)
    return api.post('/users', userData)
  },
  
  // ✅ RESTful: PUT /users/:id (update entire resource)
  update: async (id, userData) => {
    console.log('📞 REST API: PUT /users/' + id, userData)
    return api.put(`/users/${id}`, userData)
  },
  
  // ✅ RESTful: PATCH /users/:id (partial update)
  partialUpdate: async (id, userData) => {
    console.log('📞 REST API: PATCH /users/' + id, userData)
    return api.patch(`/users/${id}`, userData)
  },
  
  // ✅ RESTful: DELETE /users/:id
  delete: async (id) => {
    console.log('📞 REST API: DELETE /users/' + id)
    return api.delete(`/users/${id}`)
  },
  
  // ✅ Custom endpoint for stats (still RESTful)
  getStats: async () => {
    console.log('📞 REST API: GET /users/stats')
    return api.get('/users/stats')
  }
}