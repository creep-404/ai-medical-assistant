'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, ChevronLeft, ChevronRight, Edit3, Trash2,
  CheckCircle, XCircle, AlertTriangle, UserPlus, X, Shield
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

interface User {
  id: number
  name: string
  email: string
  role: 'Patient' | 'Doctor' | 'Admin'
  status: 'Active' | 'Inactive' | 'Pending'
  joinedDate: string
  avatar: string
  color: string
}

const allUsers: User[] = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', role: 'Patient', status: 'Active', joinedDate: '2026-01-15', avatar: 'SJ', color: 'from-pink-400 to-rose-400' },
  { id: 2, name: 'Dr. Michael Chen', email: 'michael.c@email.com', role: 'Doctor', status: 'Active', joinedDate: '2026-02-20', avatar: 'MC', color: 'from-blue-400 to-cyan-400' },
  { id: 3, name: 'Emily Davis', email: 'emily.d@email.com', role: 'Patient', status: 'Active', joinedDate: '2026-03-10', avatar: 'ED', color: 'from-emerald-400 to-green-400' },
  { id: 4, name: 'Dr. James Wilson', email: 'james.w@email.com', role: 'Doctor', status: 'Pending', joinedDate: '2026-07-29', avatar: 'JW', color: 'from-amber-400 to-orange-400' },
  { id: 5, name: 'Lisa Anderson', email: 'lisa.a@email.com', role: 'Patient', status: 'Inactive', joinedDate: '2026-02-05', avatar: 'LA', color: 'from-red-400 to-rose-400' },
  { id: 6, name: 'David Thompson', email: 'david.t@email.com', role: 'Patient', status: 'Active', joinedDate: '2026-04-18', avatar: 'DT', color: 'from-purple-400 to-violet-400' },
  { id: 7, name: 'Dr. Sarah Wilson', email: 'sarah.w@email.com', role: 'Doctor', status: 'Active', joinedDate: '2026-01-30', avatar: 'SW', color: 'from-teal-400 to-emerald-400' },
  { id: 8, name: 'Admin User', email: 'admin@mediassist.com', role: 'Admin', status: 'Active', joinedDate: '2025-12-01', avatar: 'AU', color: 'from-indigo-400 to-purple-400' },
  { id: 9, name: 'Maria Garcia', email: 'maria.g@email.com', role: 'Patient', status: 'Active', joinedDate: '2026-05-22', avatar: 'MG', color: 'from-cyan-400 to-blue-400' },
  { id: 10, name: 'Dr. Robert Kim', email: 'robert.k@email.com', role: 'Doctor', status: 'Inactive', joinedDate: '2026-03-14', avatar: 'RK', color: 'from-orange-400 to-red-400' },
]

const ITEMS_PER_PAGE = 5
const roles = ['All', 'Patient', 'Doctor', 'Admin']
const statuses = ['All', 'Active', 'Inactive', 'Pending']

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(allUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' as User['role'] })
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'All' || u.role === roleFilter
    const matchStatus = statusFilter === 'All' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const toggleStatus = (id: number) => {
    setUsers(users.map((u) => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({ name: user.name, email: user.email, role: user.role })
  }

  const saveEdit = () => {
    if (!editingUser) return
    setUsers(users.map((u) => u.id === editingUser.id ? { ...u, ...editForm } : u))
    setEditingUser(null)
  }

  const handleDelete = (id: number) => {
    setUsers(users.filter((u) => u.id !== id))
    setDeleteConfirm(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700 transition-all">
                <UserPlus className="w-4 h-4" /> Add User
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {roles.map((r) => (
                  <button key={r} onClick={() => { setRoleFilter(r); setCurrentPage(1) }} className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${roleFilter === r ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{r}</button>
                ))}
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {statuses.map((s) => (
                  <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1) }} className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{s}</button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Joined</th>
                    <th className="text-right p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginated.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 bg-gradient-to-br ${u.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>{u.avatar}</div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'Doctor' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : u.role === 'Admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>{u.role}</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : u.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>{u.status}</span>
                      </td>
                      <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{u.joinedDate}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toggleStatus(u.id)} className={`p-1.5 rounded-lg transition-colors ${u.status === 'Active' ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`} title={u.status === 'Active' ? 'Deactivate' : 'Activate'}>
                            {u.status === 'Active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleEdit(u)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteConfirm(u.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <AnimatePresence>
            {editingUser && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit User</h2>
                      <button onClick={() => setEditingUser(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                        <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as User['role'] })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="Patient">Patient</option>
                          <option value="Doctor">Doctor</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setEditingUser(null)} className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                        <button onClick={saveEdit} className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700 transition-all">Save</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {deleteConfirm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full shadow-2xl p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirm Delete</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                    <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all">Delete</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
              <p><strong className="text-gray-700 dark:text-gray-300">Medical Disclaimer:</strong> This application is intended for educational purposes only. It does not replace professional medical advice, diagnosis, or treatment. Always consult a licensed healthcare provider for serious medical conditions.</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
