import api from './api'

export const courseService = {
  // Courses collection
  getAll: async () => api.get('/courses'),
  getById: async (id) => api.get(`/courses/${id}`),
  create: async (courseData) => api.post('/courses', courseData),
  update: async (id, courseData) => api.put(`/courses/${id}`, courseData),
  delete: async (id) => api.delete(`/courses/${id}`),
  
  // Nested: Course sections
  getSections: async (courseId) => api.get(`/courses/${courseId}/sections`),
  createSection: async (courseId, sectionData) => 
    api.post(`/courses/${courseId}/sections`, sectionData),
  
  // Nested: Course prerequisites
  getPrerequisites: async (courseId) => 
    api.get(`/courses/${courseId}/prerequisites`)
}