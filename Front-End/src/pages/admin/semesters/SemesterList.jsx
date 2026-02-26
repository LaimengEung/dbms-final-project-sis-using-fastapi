import React, { useEffect, useState } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import { Card, Button, Input, Table, Spinner } from '../../../components/ui'
import semesterService from '../../../services/semesterService'

const initialForm = {
  semester_name: '',
  semester_year: '',
  start_date: '',
  end_date: '',
  registration_start: '',
  registration_end: '',
  is_current: false,
}

const toDateInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const SemesterList = () => {
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)

  const loadSemesters = async () => {
    try {
      setLoading(true)
      const result = await semesterService.getAll()
      setSemesters(result.data || [])
    } catch (error) {
      alert(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSemesters()
  }, [])

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        semester_year: Number(form.semester_year),
      }
      if (editingId) {
        await semesterService.update(editingId, payload)
      } else {
        await semesterService.create(payload)
      }
      setForm(initialForm)
      setEditingId(null)
      await loadSemesters()
    } catch (error) {
      alert(error.response?.data?.message || error.message)
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (row) => {
    setEditingId(row.semester_id)
    setForm({
      semester_name: row.semester_name || '',
      semester_year: row.semester_year || '',
      start_date: toDateInput(row.start_date),
      end_date: toDateInput(row.end_date),
      registration_start: toDateInput(row.registration_start),
      registration_end: toDateInput(row.registration_end),
      is_current: Boolean(row.is_current),
    })
  }

  const onSetCurrent = async (id) => {
    try {
      await semesterService.setCurrent(id)
      await loadSemesters()
    } catch (error) {
      alert(error.response?.data?.message || error.message)
    }
  }

  const columns = [
    { header: 'Name', accessor: 'semester_name' },
    { header: 'Year', accessor: 'semester_year' },
    {
      header: 'Current',
      accessor: 'is_current',
      cell: (row) => (row.is_current ? 'Yes' : 'No'),
    },
    {
      header: 'Dates',
      accessor: 'dates',
      cell: (row) => `${toDateInput(row.start_date)} to ${toDateInput(row.end_date)}`,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => onEdit(row)}>
            Edit
          </Button>
          {!row.is_current && (
            <Button size="sm" onClick={() => onSetCurrent(row.semester_id)}>
              Set Current
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <AdminLayout title="Semesters">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semesters</h1>
          <p className="text-gray-600">Create and manage academic semesters</p>
        </div>

        <Card className="p-6">
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input label="Semester Name" value={form.semester_name} onChange={(e) => onChange('semester_name', e.target.value)} required />
            <Input label="Year" type="number" value={form.semester_year} onChange={(e) => onChange('semester_year', e.target.value)} required />
            <div className="flex items-end">
              <label className="flex items-center gap-2 pb-2 text-sm">
                <input type="checkbox" checked={form.is_current} onChange={(e) => onChange('is_current', e.target.checked)} />
                Set as current semester
              </label>
            </div>

            <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => onChange('start_date', e.target.value)} required />
            <Input label="End Date" type="date" value={form.end_date} onChange={(e) => onChange('end_date', e.target.value)} required />
            <div />
            <Input label="Registration Start" type="date" value={form.registration_start} onChange={(e) => onChange('registration_start', e.target.value)} required />
            <Input label="Registration End" type="date" value={form.registration_end} onChange={(e) => onChange('registration_end', e.target.value)} required />
            <div className="flex items-end gap-2">
              <Button type="submit" isLoading={saving}>
                {editingId ? 'Update Semester' : 'Create Semester'}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null)
                    setForm(initialForm)
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card className="p-0">
          {loading ? (
            <div className="py-10 text-center">
              <Spinner />
            </div>
          ) : (
            <Table columns={columns} data={semesters} emptyMessage="No semesters found" />
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}

export default SemesterList
