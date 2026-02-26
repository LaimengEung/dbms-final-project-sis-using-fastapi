// pages/admin/users/UserList.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'

// Import UI components
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Table from '../../../components/ui/Table'
import Spinner from '../../../components/ui/Spinner'
import Badge from '../../../components/ui/Badge'
import SearchBar from '../../../components/shared/SearchBar'
import ConfirmDialog from '../../../components/shared/ConfirmDialog'
import EmptyState from '../../../components/shared/EmptyState'

// Import your REAL service
import { userService } from '../../../services/userService'

// Icons (install lucide-react if not installed: npm install lucide-react)
import { Plus, RefreshCw, Edit, Trash2, Eye, User, Mail, Shield } from 'lucide-react'

const UserList = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null, userName: '' })
  const navigate = useNavigate()
  const resolveUserId = (row) => Number(row?.user_id ?? row?.id ?? 0)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
        const email = user.email.toLowerCase()
        const role = user.role?.toLowerCase() || ''
        const term = searchTerm.toLowerCase()
        
        return fullName.includes(term) || 
               email.includes(term) || 
               role.includes(term) ||
               (user.user_id && user.user_id.toString().includes(term))
      })
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userService.getAll({
        page: 1,
        limit: 50
      })
      // Your API might return response.data or just the array
      const usersData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : []
      setUsers(usersData)
      setFilteredUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
      
      // Show helpful error message based on error type
      if (error.response) {
        // Backend responded with error
        setError(`Backend Error: ${error.response.status} - ${error.response.data?.message || 'Failed to load users'}`)
      } else if (error.request) {
        // No response received
        setError('Cannot connect to server. Please check if backend is running.')
      } else {
        // Other errors
        setError('Failed to load users. Please try again.')
      }
      
      // Fallback to empty array
      setUsers([])
      setFilteredUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const userId = Number(id)
    if (!Number.isInteger(userId) || userId <= 0) {
      alert('Invalid user ID. Please refresh the page and try again.')
      return
    }

    try {
      await userService.delete(userId)
      // Re-sync from API to avoid stale UI state.
      await fetchUsers()
      setDeleteDialog({ open: false, userId: null, userName: '' })
      
      // Show success message
      alert('User deleted successfully!')
    } catch (error) {
      console.error('Delete failed:', error)
      
      let errorMessage = 'Failed to delete user.'
      if (error.response?.status === 409) {
        errorMessage = 'Cannot delete this user because it is linked to student/faculty/enrollment records.'
      }
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      alert(`Error: ${errorMessage}`)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    // For now, client-side filtering
    // Later you can implement API search: userService.getAll({ search: term })
  }

  const getRoleBadgeColor = (role) => {
    if (!role) return 'gray'
    switch(role.toLowerCase()) {
      case 'admin': return 'purple'
      case 'teacher': return 'green'
      case 'student': return 'blue'
      default: return 'gray'
    }
  }

  const getRoleIcon = (role) => {
    if (!role) return <User size={16} />
    switch(role.toLowerCase()) {
      case 'admin': return <Shield size={16} />
      case 'teacher': return <User size={16} />
      case 'student': return <User size={16} />
      default: return <User size={16} />
    }
  }

  const tableColumns = [
    { 
      key: 'id', 
      header: 'ID',
      render: (_, row) => <span className="font-mono text-sm">#{resolveUserId(row)}</span>
    },
    { 
      key: 'name', 
      header: 'Name',
      render: (_, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            {getRoleIcon(row.role)}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {row.first_name} {row.last_name}
            </div>
          </div>
        </div>
      )
    },
    { 
      key: 'email', 
      header: 'Email',
      render: (value) => (
        <div className="flex items-center text-gray-600">
          <Mail size={14} className="mr-2" />
          {value}
        </div>
      )
    },
    { 
      key: 'role', 
      header: 'Role',
      render: (value) => (
        <Badge color={getRoleBadgeColor(value)}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
        </Badge>
      )
    },
    { 
      key: 'actions', 
      header: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Link to={`/admin/users/edit/${resolveUserId(row)}`}>
            <Button variant="outline" size="sm" className="flex items-center">
              <Edit size={14} className="mr-1" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            color="red"
            onClick={() => setDeleteDialog({ 
              open: true, 
              userId: resolveUserId(row), 
              userName: `${row.first_name} ${row.last_name}` 
            })}
            className="flex items-center"
          >
            <Trash2 size={14} className="mr-1" />
            Delete
          </Button>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <AdminLayout title="Users Management">
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Loading users from API...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Users Management">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600">Manage system users ({filteredUsers.length} users)</p>
          </div>
          
          <Link to="/admin/users/create">
            <Button className="flex items-center">
              <Plus size={18} className="mr-2" />
              Add New User
            </Button>
          </Link>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-red-800 font-medium">API Connection Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  color="red"
                  onClick={fetchUsers}
                >
                  Retry
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <SearchBar 
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-96"
              />
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/users/create')}
                  className="flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Quick Add
                </Button>
                <Button 
                  variant="outline" 
                  onClick={fetchUsers}
                  className="flex items-center"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <EmptyState
                icon={<User size={48} className="text-gray-400" />}
                title={error ? "Cannot load users" : "No users found"}
                description={
                  error ? "Check your backend server" :
                  searchTerm ? `No users match "${searchTerm}"` : 
                  "No users in the system yet"
                }
                action={
                  error ? (
                    <Button onClick={fetchUsers}>Retry Connection</Button>
                  ) : searchTerm ? (
                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                      Clear Search
                    </Button>
                  ) : (
                    <Link to="/admin/users/create">
                      <Button>Add First User</Button>
                    </Link>
                  )
                }
              />
            ) : (
              <>
                <Table
                  columns={tableColumns}
                  data={filteredUsers}
                  keyField="user_id"
                  striped
                  hover
                />
                
                {users.length > 0 && (
                  <div className="mt-4 text-xs text-gray-500 text-center">
                    Showing {filteredUsers.length} of {users.length} users
                    {searchTerm && ` filtered by "${searchTerm}"`}
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Services Status */}
        <Card className="border-blue-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <h3 className="font-medium text-blue-800">API Connected</h3>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  ✅ Using real REST API services
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-600">Admin User</p>
                <p className="text-xs text-gray-500">admin@school.edu</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.open}
          title="Delete User"
          message={`Are you sure you want to delete user "${deleteDialog.userName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => handleDelete(deleteDialog.userId)}
          onClose={() => setDeleteDialog({ open: false, userId: null, userName: '' })}
          variant="danger"
        />
      </div>
    </AdminLayout>
  )
}

export default UserList
