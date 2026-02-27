import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import axios from 'axios'

const API = 'http://localhost:5002/api'

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || ''
}

function authHeaders() {
  return { headers: { Authorization: `Bearer ${getToken()}` } }
}

const EMPTY = { major_code: '', major_name: '', department_id: '', required_credits: '', description: '' }

export default function MajorList() {
  const [majors, setMajors] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchAll = async () => {
    try {
      const [majRes, deptRes] = await Promise.all([
        axios.get(`${API}/majors`, authHeaders()),
        axios.get(`${API}/departments`, authHeaders()),
      ])
      setMajors(majRes.data)
      setDepartments(deptRes.data)
    } catch {
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const deptMap = Object.fromEntries(departments.map(d => [d.department_id, d.department_name]))

  const openCreate = () => {
    setEditId(null)
    setForm(EMPTY)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (m) => {
    setEditId(m.major_id)
    setForm({
      major_code: m.major_code || '',
      major_name: m.major_name || '',
      department_id: m.department_id ?? '',
      required_credits: m.required_credits ?? '',
      description: m.description || '',
    })
    setFormError('')
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.major_code.trim() || !form.major_name.trim() || !form.department_id) {
      setFormError('Code, name, and department are required.')
      return
    }
    setSaving(true)
    setFormError('')
    const payload = {
      major_code: form.major_code.trim(),
      major_name: form.major_name.trim(),
      department_id: Number(form.department_id),
      required_credits: form.required_credits !== '' ? Number(form.required_credits) : null,
      description: form.description.trim() || null,
    }
    try {
      if (editId) {
        await axios.put(`${API}/majors/${editId}`, payload, authHeaders())
      } else {
        await axios.post(`${API}/majors`, payload, authHeaders())
      }
      setShowForm(false)
      await fetchAll()
    } catch (err) {
      setFormError(err?.response?.data?.detail || 'Failed to save major.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/majors/${id}`, authHeaders())
      setDeleteConfirm(null)
      await fetchAll()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to delete major.')
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Majors</h1>
            <p className="text-sm text-gray-500 mt-1">Manage academic majors and programs</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + New Major
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Inline form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editId ? 'Edit Major' : 'New Major'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              {formError && <p className="text-red-600 text-sm">{formError}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Major Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.major_code}
                    onChange={e => setForm(f => ({ ...f, major_code: e.target.value }))}
                    placeholder="e.g. BSCS"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Major Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.major_name}
                    onChange={e => setForm(f => ({ ...f, major_name: e.target.value }))}
                    placeholder="e.g. BS Computer Science"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.department_id}
                    onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select department…</option>
                    {departments.map(d => (
                      <option key={d.department_id} value={d.department_id}>
                        {d.department_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Required Credits</label>
                  <input
                    type="number"
                    min="0"
                    value={form.required_credits}
                    onChange={e => setForm(f => ({ ...f, required_credits: e.target.value }))}
                    placeholder="e.g. 120"
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
          ) : majors.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No majors found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Code', 'Name', 'Department', 'Credits', 'Description', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {majors.map((m) => (
                  <tr key={m.major_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">{m.major_code}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.major_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {deptMap[m.department_id] || <span className="text-gray-300 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{m.required_credits ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {m.description || <span className="text-gray-300 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(m)} className="text-blue-600 hover:text-blue-800 font-medium">
                          Edit
                        </button>
                        {deleteConfirm === m.major_id ? (
                          <>
                            <button onClick={() => handleDelete(m.major_id)} className="text-red-600 hover:text-red-800 font-medium">
                              Confirm
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-gray-500 hover:text-gray-700">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setDeleteConfirm(m.major_id)} className="text-red-500 hover:text-red-700">
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
