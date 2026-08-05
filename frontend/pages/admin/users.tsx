'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, ChevronLeft, ChevronRight, Edit3, Trash2,
  CheckCircle, XCircle, AlertTriangle, UserPlus, Shield
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { Field, Input, Label, Select } from '@/components/ui/Form'
import { EmptyState } from '@/components/ui/Feedback'
import { Disclaimer } from '@/components/ui/Disclaimer'

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

  const roleBadge = (role: string) => {
    if (role === 'Doctor') return 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
    if (role === 'Admin') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
    return 'bg-cream-200 text-ink-700 dark:bg-ink-800 dark:text-cream-200'
  }

  const statusBadge = (status: string) => {
    if (status === 'Active') return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300'
    if (status === 'Pending') return 'bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-300'
    return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="heading-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-cream-100">
                Manage Users
              </h1>
              <p className="text-sm text-ink-500 dark:text-cream-400/70 mt-1">
                {users.length} registered users on the platform.
              </p>
            </div>
            <Button>
              <UserPlus className="w-4 h-4" /> Add User
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search by name or email..." className="input-base pl-10" />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {roles.map((r) => (
                <button key={r} onClick={() => { setRoleFilter(r); setCurrentPage(1) }} className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${roleFilter === r ? 'bg-primary-600 text-white shadow-sm' : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-cream-300/70 border border-cream-300 dark:border-ink-700 hover:bg-cream-100 dark:hover:bg-ink-800'}`}>{r}</button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {statuses.map((s) => (
                <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1) }} className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-primary-600 text-white shadow-sm' : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-cream-300/70 border border-cream-300 dark:border-ink-700 hover:bg-cream-100 dark:hover:bg-ink-800'}`}>{s}</button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
          {paginated.length === 0 ? (
            <EmptyState icon={<Search className="h-7 w-7" />} title="No users found" description="Try adjusting your search or filters." />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>User</TH>
                  <TH>Email</TH>
                  <TH>Role</TH>
                  <TH>Status</TH>
                  <TH>Joined</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {paginated.map((u) => (
                  <TR key={u.id}>
                    <TD>
                      <div className="flex items-center gap-2">
                        <Avatar name={u.name} initials={u.avatar} size="sm" />
                        <span className="text-sm font-medium text-ink-900 dark:text-cream-100">{u.name}</span>
                      </div>
                    </TD>
                    <TD className="text-sm text-ink-500 dark:text-cream-400/70">{u.email}</TD>
                    <TD>
                      <Badge className={roleBadge(u.role)}>{u.role}</Badge>
                    </TD>
                    <TD>
                      <Badge className={statusBadge(u.status)}>{u.status}</Badge>
                    </TD>
                    <TD className="text-sm text-ink-500 dark:text-cream-400/70">{u.joinedDate}</TD>
                    <TD>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleStatus(u.id)} className={`p-1.5 rounded-lg transition-colors ${u.status === 'Active' ? 'text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20' : 'text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-900/20'}`} title={u.status === 'Active' ? 'Deactivate' : 'Activate'}>
                          {u.status === 'Active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleEdit(u)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(u.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </motion.div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${currentPage === page ? 'bg-primary-600 text-white shadow-sm' : 'border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <Modal open={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User">
          <div className="space-y-4">
            <Field>
              <Label>Name</Label>
              <Input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </Field>
            <Field>
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </Field>
            <Field>
              <Label>Role</Label>
              <Select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as User['role'] })}>
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
                <option value="Admin">Admin</option>
              </Select>
            </Field>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button className="flex-1" onClick={saveEdit}>Save</Button>
            </div>
          </div>
        </Modal>

        <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} size="sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-ink-900 dark:text-cream-100 mb-2">Confirm Delete</h2>
            <p className="text-sm text-ink-500 dark:text-cream-400/70 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="danger" className="flex-1" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
            </div>
          </div>
        </Modal>

        <Disclaimer />
      </div>
    </AdminLayout>
  )
}
