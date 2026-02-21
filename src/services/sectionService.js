import api from './api';

const sectionService = {
  // Get available sections for enrollment
  getAvailableSections: (semesterId, studentId) => 
    api.get('/sections/available', { params: { semesterId, studentId } }),
  
  // Get section details with enrollment count
  getSection: (id) => api.get(`/sections/${id}`),
  
  // Check if section has capacity
  checkCapacity: (sectionId) => 
    api.get(`/sections/${sectionId}/capacity`)
};

export default sectionService;