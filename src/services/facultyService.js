import api from './api'

const FACULTY_KEY = 'school_faculty'
const DEPARTMENTS_KEY = 'school_departments'

const defaultDepartments = [
  { department_id: 1, department_code: 'CS', department_name: 'Computer Science' },
  { department_id: 2, department_code: 'ENG', department_name: 'Engineering' },
  { department_id: 3, department_code: 'BUS', department_name: 'Business Administration' },
  { department_id: 4, department_code: 'MATH', department_name: 'Mathematics' }
]

const defaultFaculty = [
  {
    faculty_id: 1,
    user_id: 101,
    faculty_number: 'FAC001',
    first_name: 'Alice',
    last_name: 'Nguyen',
    email: 'alice.nguyen@school.edu',
    title: 'Assistant Professor',
    department_id: 1,
    department_name: 'Computer Science',
    office_location: 'Bldg A - Room 204',
    is_active: true
  }
]

const safeRead = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback
  } catch {
    return fallback
  }
}

const safeWrite = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const normalizeFaculty = (row = {}, departments = []) => {
  const deptId = row.department_id || row.department?.department_id
  const deptNameFromMap = departments.find(d => Number(d.department_id) === Number(deptId))?.department_name

  return {
    faculty_id: row.faculty_id || row.id,
    user_id: row.user_id || row.user?.user_id,
    faculty_number: row.faculty_number || row.employee_number || '',
    first_name: row.first_name || row.user?.first_name || '',
    last_name: row.last_name || row.user?.last_name || '',
    email: row.email || row.user?.email || '',
    title: row.title || '',
    department_id: deptId || '',
    department_name: row.department_name || row.department?.department_name || deptNameFromMap || '',
    office_location: row.office_location || '',
    is_active: row.is_active !== false
  }
}

const facultyService = {
  async getDepartments() {
    try {
      const res = await api.get('/departments')
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      return { data, status: res.status }
    } catch {
      const data = safeRead(DEPARTMENTS_KEY, defaultDepartments)
      safeWrite(DEPARTMENTS_KEY, data)
      return { data, status: 200 }
    }
  },

  async getAll(params = {}) {
    try {
      const res = await api.get('/faculty', { params })
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      return { data, status: res.status }
    } catch {
      const departments = safeRead(DEPARTMENTS_KEY, defaultDepartments)
      const data = safeRead(FACULTY_KEY, defaultFaculty).map(item => normalizeFaculty(item, departments))
      safeWrite(FACULTY_KEY, data)
      return { data, status: 200 }
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/faculty/${id}`)
      return { data: res.data?.data || res.data, status: res.status }
    } catch {
      const departments = safeRead(DEPARTMENTS_KEY, defaultDepartments)
      const data = safeRead(FACULTY_KEY, defaultFaculty).map(item => normalizeFaculty(item, departments))
      const found = data.find(item => Number(item.faculty_id) === Number(id))

      if (!found) {
        throw new Error(`Faculty with ID ${id} not found`)
      }

      return { data: found, status: 200 }
    }
  },

  async create(payload) {
    try {
      const res = await api.post('/faculty', payload)
      return { data: res.data?.data || res.data, status: res.status }
    } catch {
      const departments = safeRead(DEPARTMENTS_KEY, defaultDepartments)
      const rows = safeRead(FACULTY_KEY, defaultFaculty).map(item => normalizeFaculty(item, departments))
      const maxId = rows.length ? Math.max(...rows.map(x => Number(x.faculty_id) || 0)) : 0

      const newRow = normalizeFaculty(
        {
          ...payload,
          faculty_id: maxId + 1,
          faculty_number: payload.faculty_number || `FAC${String(maxId + 1).padStart(3, '0')}`
        },
        departments
      )

      const updated = [...rows, newRow]
      safeWrite(FACULTY_KEY, updated)
      return { data: newRow, status: 201 }
    }
  },

  async update(id, payload) {
    try {
      const res = await api.put(`/faculty/${id}`, payload)
      return { data: res.data?.data || res.data, status: res.status }
    } catch {
      const departments = safeRead(DEPARTMENTS_KEY, defaultDepartments)
      const rows = safeRead(FACULTY_KEY, defaultFaculty).map(item => normalizeFaculty(item, departments))
      const index = rows.findIndex(item => Number(item.faculty_id) === Number(id))

      if (index === -1) {
        throw new Error(`Faculty with ID ${id} not found`)
      }

      rows[index] = normalizeFaculty({ ...rows[index], ...payload, faculty_id: Number(id) }, departments)
      safeWrite(FACULTY_KEY, rows)
      return { data: rows[index], status: 200 }
    }
  },

  async delete(id) {
    try {
      const res = await api.delete(`/faculty/${id}`)
      return { data: res.data?.data || {}, status: res.status }
    } catch {
      const departments = safeRead(DEPARTMENTS_KEY, defaultDepartments)
      const rows = safeRead(FACULTY_KEY, defaultFaculty).map(item => normalizeFaculty(item, departments))
      const updated = rows.filter(item => Number(item.faculty_id) !== Number(id))
      safeWrite(FACULTY_KEY, updated)
      return { data: {}, status: 200 }
    }
  }
}

export default facultyService

