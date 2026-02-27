import api from './api';

const sectionService = {
  // List all sections (optionally filtered)
  getAll: (params = {}) => api.get('/sections', { params }),

  // Get section details with enrollment count
  getSection: (id) => api.get(`/sections/${id}`),

  // Check if section has capacity
  checkCapacity: (sectionId) => api.get(`/sections/${sectionId}/capacity`),

  // Get available sections for enrollment (student view)
  getAvailableSections: (semesterId, studentId) =>
    api.get('/sections/available', { params: { semesterId, studentId } }),

  // Create a section under a specific course
  create: (courseId, data) => api.post(`/courses/${courseId}/sections`, data),

  // Update a section
  update: (id, data) => api.put(`/sections/${id}`, data),

  // Delete a section
  delete: (id) => api.delete(`/sections/${id}`),
};

export default sectionService;