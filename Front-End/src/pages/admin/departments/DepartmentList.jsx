import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import axios from 'axios'

const API = 'http://localhost:5002/api'

function getToken() {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || ''
}

function authHeaders() {
  return { headers: { Authorization: `Bearer ${getToken()}` } }
}

const EMPTY = { department_code: '', department_name: '', description: '' }

export default function DepartmentList() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // create / edit state
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API}/departments`, authHeaders())
      setDepartments(res.data)
    } catch {
      setError('Failed to load departments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDepartments() }, [])

  const openCreate = () => {
    setEditId(null)
    setForm(EMPTY)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (dept) => {
    setEditId(dept.department_id)
    setForm({
      department_code: dept.department_code || '',
      department_name: dept.department_name || '',
      description: dept.description || '',
    })
    setFormError('')
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.department_code.trim() || !form.department_name.trim()) {
      setFormError('Code and name are required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editId) {
        await axios.put(`${API}/departments/${editId}`, form, authHeaders())
      } else {
        await axios.post(`${API}/departments`, form, authHeaders())
      }
      setShowForm(false)
      await fetchDepartments()
    } catch (err) {
      setFormError(err?.response?.data?.detail || 'Failed to save department.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/departments/${id}`, authHeaders())
      setDeleteConfirm(null)
      await fetchDepartments()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to delete department.')
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <p className="text-sm text-gray-500 mt-1">Manage academic departments</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + New Department
          </button>
        </div>

        {/* Global error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Inline form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editId ? 'Edit Department' : 'New Department'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              {formError && (
                <p className="text-red-600 text-sm">{formError}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.department_code}
                    onChange={e => setForm(f => ({ ...f, department_code: e.target.value }))}
                    placeholder="e.g. CS"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.department_name}
                    onChange={e => setForm(f => ({ ...f, department_name: e.target.value }))}
                    placeholder="e.g. Computer Science"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="Optional description"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading…</div>
          ) : departments.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No departments found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Code', 'Name', 'Description', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {departments.map((dept) => (
                  <tr key={dept.department_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">{dept.department_code}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.department_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {dept.description || <span className="text-gray-300 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(dept)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        {deleteConfirm === dept.department_id ? (
                          <>
                            <button
                              onClick={() => handleDelete(dept.department_id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(dept.department_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
