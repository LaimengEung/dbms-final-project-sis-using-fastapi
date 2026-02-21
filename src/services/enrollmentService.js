import api from './api';

// 🎯 MOCK DATA - DELETE WHEN BACKEND IS READY
const MOCK_ENROLLMENTS = []; // Your mock data
const MOCK_SEMESTERS = [];
const MOCK_SECTIONS = [];
const MOCK_STUDENTS = [];

const enrollmentService = {
  // GET /enrollments - List all enrollments
  getAll: async (params = {}) => {
    try {
      // 🔄 SWITCH: Uncomment for real backend, comment mock
      
      // ✅ REAL BACKEND VERSION
      // const response = await api.get('/enrollments', { params });
      // return response.data;
      
      // ✅ MOCK VERSION - DELETE WHEN BACKEND READY
      console.log('📋 Fetching enrollments with params:', params);
      await new Promise(resolve => setTimeout(resolve, 500));
      let filtered = [...MOCK_ENROLLMENTS];
      
      if (params.status) {
        filtered = filtered.filter(e => e.status === params.status);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(e => 
          e.student?.user?.first_name?.toLowerCase().includes(searchLower) ||
          e.student?.user?.last_name?.toLowerCase().includes(searchLower) ||
          e.student?.student_number?.includes(params.search)
        );
      }
      
      return {
        data: filtered,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / (params.limit || 10))
        }
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // GET /enrollments/:id - Get single enrollment
  getById: async (id) => {
    try {
      // 🔄 SWITCH: Uncomment for real backend, comment mock
      
      // ✅ REAL BACKEND VERSION
      // const response = await api.get(`/enrollments/${id}`);
      // return response.data;
      
      // ✅ MOCK VERSION - DELETE WHEN BACKEND READY
      console.log(`🔍 Fetching enrollment with ID: ${id}`);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const idNum = parseInt(id);
      if (isNaN(idNum)) throw new Error('Invalid enrollment ID');
      
      const enrollment = MOCK_ENROLLMENTS.find(e => e.enrollment_id === idNum);
      if (!enrollment) throw new Error('Enrollment not found');
      
      return { data: enrollment };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /enrollments - Create new enrollment
  create: async (data) => {
    try {
      // ✅ REAL BACKEND VERSION
      // const response = await api.post('/enrollments', data);
      // return response.data;
      
      // ✅ MOCK VERSION - DELETE WHEN BACKEND READY
      console.log('➕ Creating enrollment:', data);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newEnrollment = {
        enrollment_id: MOCK_ENROLLMENTS.length + 1,
        ...data,
        enrollment_date: new Date().toISOString(),
        student: MOCK_STUDENTS.find(s => s.student_id === data.student_id),
        section: MOCK_SECTIONS.find(s => s.section_id === data.section_id),
        status: data.status || 'enrolled'
      };
      
      MOCK_ENROLLMENTS.push(newEnrollment);
      
      return {
        data: newEnrollment,
        message: 'Enrollment created successfully'
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /enrollments/bulk - Bulk enrollments
  bulkCreate: async (data) => {
    try {
      // ✅ REAL BACKEND VERSION
      // const response = await api.post('/enrollments/bulk', data);
      // return response.data;
      
      // ✅ MOCK VERSION - DELETE WHEN BACKEND READY
      console.log('📦 Bulk creating enrollments:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        message: `${data.enrollments?.length || 0} enrollments processed successfully`,
        count: data.enrollments?.length || 0
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // PATCH /enrollments/:id/status - Update status
  updateStatus: async (id, status) => {
    try {
      // ✅ REAL BACKEND VERSION
      // const response = await api.patch(`/enrollments/${id}/status`, { status });
      // return response.data;
      
      // ✅ MOCK VERSION - DELETE WHEN BACKEND READY
      console.log(`🔄 Updating enrollment ${id} status to: ${status}`);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const enrollment = MOCK_ENROLLMENTS.find(e => e.enrollment_id === parseInt(id));
      if (enrollment) {
        enrollment.status = status;
      }
      
      return {
        message: 'Status updated successfully',
        data: { enrollment_id: id, status }
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // PUT /enrollments/:id - Update enrollment
  update: async (id, data) => {
    try {
      // ✅ REAL BACKEND VERSION
      // const response = await api.put(`/enrollments/${id}`, data);
      // return response.data;
      
      // ✅ MOCK VERSION - DELETE WHEN BACKEND READY
      console.log(`✏️ Updating enrollment ${id}:`, data);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const enrollment = MOCK_ENROLLMENTS.find(e => e.enrollment_id === parseInt(id));
      if (enrollment) {
        Object.assign(enrollment, data);
      }
      
      return {
        message: 'Enrollment updated successfully',
        data: { enrollment_id: id, ...data }
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE /enrollments/:id - Drop enrollment
  delete: async (id) => {
    try {
      // ✅ REAL BACKEND VERSION
      // const response = await api.delete(`/enrollments/${id}`);
      // return response.data;
      
      // ✅ MOCK VERSION - DELETE WHEN BACKEND READY
      console.log(`🗑️ Deleting enrollment ${id}`);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = MOCK_ENROLLMENTS.findIndex(e => e.enrollment_id === parseInt(id));
      if (index !== -1) {
        MOCK_ENROLLMENTS.splice(index, 1);
      }
      
      return {
        message: 'Enrollment dropped successfully'
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // GET /enrollments/available-sections - Get sections available for enrollment
  getAvailableSections: async (params) => {
    try {
      // ✅ REAL BACKEND VERSION
      // const response = await api.get('/enrollments/available-sections', { params });
      // return response.data;
      
      // ✅ MOCK VERSION - DELETE WHEN BACKEND READY
      console.log('📚 Fetching available sections:', params);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      let available = MOCK_SECTIONS.filter(s => 
        s.enrolled_count < s.max_capacity
      );
      
      if (params.semester_id) {
        available = available.filter(s => 
          s.semester?.semester_id === parseInt(params.semester_id)
        );
      }
      
      return { data: available };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // GET /students - Search students for enrollment
  searchStudents: async (query) => {
    try {
      // ✅ REAL BACKEND VERSION
      // const response = await api.get('/students', {
      //   params: { search: query, limit: 10 }
      // });
      // return response.data;
      
      // ✅ MOCK VERSION - DELETE WHEN BACKEND READY
      console.log(`🔎 Searching students: ${query}`);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!query) return { data: [] };
      
      const queryLower = query.toLowerCase();
      const filtered = MOCK_STUDENTS.filter(s => 
        s.student_number.includes(query) || 
        s.user.first_name.toLowerCase().includes(queryLower) ||
        s.user.last_name.toLowerCase().includes(queryLower)
      );
      
      return { data: filtered.slice(0, 10) };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // GET /class-sections - Get sections by semester
  getSectionsBySemester: async (semesterId) => {
    try {
      // ✅ REAL BACKEND VERSION
      // const response = await api.get('/class-sections', {
      //   params: { semester_id: semesterId, status: 'open', limit: 100 }
      // });
      // return response.data;
      
      // ✅ MOCK VERSION - DELETE WHEN BACKEND READY
      console.log(`📖 Fetching sections for semester: ${semesterId}`);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const filtered = MOCK_SECTIONS.filter(s => 
        s.semester?.semester_id === parseInt(semesterId)
      );
      
      return { data: filtered };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // GET /semesters - Get all semesters
  getSemesters: async () => {
    try {
      // ✅ REAL BACKEND VERSION
      // const response = await api.get('/semesters', {
      //   params: { limit: 50 }
      // });
      // return response.data;
      
      // ✅ MOCK VERSION - DELETE WHEN BACKEND READY
      console.log('📅 Fetching semesters');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { data: MOCK_SEMESTERS };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default enrollmentService;
