'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronLeft, ChevronRight, Edit3, Trash2, CheckCircle, XCircle,
  AlertTriangle, UserPlus, X, Star, Shield, Stethoscope
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

interface Doctor {
  id: number
  name: string
  email: string
  specialty: string
  hospital: string
  experience: number
  rating: number
  verified: boolean
  avatar: string
  color: string
}

const allDoctors: Doctor[] = [
  { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.j@mediassist.com', specialty: 'Cardiology', hospital: 'City General Hospital', experience: 15, rating: 4.9, verified: true, avatar: 'SJ', color: 'from-pink-400 to-rose-400' },
  { id: 2, name: 'Dr. Michael Chen', email: 'michael.c@mediassist.com', specialty: 'Neurology', hospital: 'St. Mary Medical Center', experience: 12, rating: 4.8, verified: true, avatar: 'MC', color: 'from-blue-400 to-cyan-400' },
  { id: 3, name: 'Dr. Emily Davis', email: 'emily.d@mediassist.com', specialty: 'Internal Medicine', hospital: 'University Health System', experience: 18, rating: 4.9, verified: true, avatar: 'ED', color: 'from-emerald-400 to-green-400' },
  { id: 4, name: 'Dr. James Wilson', email: 'james.w@mediassist.com', specialty: 'Pediatrics', hospital: 'Children\'s Hospital', experience: 10, rating: 4.7, verified: false, avatar: 'JW', color: 'from-amber-400 to-orange-400' },
  { id: 5, name: 'Dr. Lisa Anderson', email: 'lisa.a@mediassist.com', specialty: 'Cardiology', hospital: 'Heart Institute', experience: 14, rating: 4.6, verified: true, avatar: 'LA', color: 'from-red-400 to-rose-400' },
  { id: 6, name: 'Dr. David Thompson', email: 'david.t@mediassist.com', specialty: 'Orthopedics', hospital: 'Sports Medicine Clinic', experience: 20, rating: 4.9, verified: true, avatar: 'DT', color: 'from-purple-400 to-violet-400' },
  { id: 7, name: 'Dr. Sarah Wilson', email: 'sarah.w@mediassist.com', specialty: 'Dermatology', hospital: 'Skin Care Center', experience: 8, rating: 4.5, verified: false, avatar: 'SW', color: 'from-teal-400 to-emerald-400' },
  { id: 8, name: 'Dr. Robert Kim', email: 'robert.k@mediassist.com', specialty: 'Ophthalmology', hospital: 'Vision Institute', experience: 16, rating: 4.8, verified: true, avatar: 'RK', color: 'from-orange-400 to-red-400' },
]

const ITEMS_PER_PAGE = 5

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(allDoctors)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', specialty: '', hospital: '', experience: 0 })
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', email: '', specialty: '', hospital: '', experience: 0 })
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()) || d.hospital.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const toggleVerified = (id: number) => {
    setDoctors(doctors.map((d) => d.id === id ? { ...d, verified: !d.verified } : d))
  }

  const handleEdit = (doc: Doctor) => {
    setEditingDoctor(doc)
    setEditForm({ name: doc.name, email: doc.email, specialty: doc.specialty, hospital: doc.hospital, experience: doc.experience })
  }

  const saveEdit = () => {
    if (!editingDoctor) return
    setDoctors(doctors.map((d) => d.id === editingDoctor.id ? { ...d, ...editForm } : d))
    setEditingDoctor(null)
  }

  const handleDelete = (id: number) => {
    setDoctors(doctors.filter((d) => d.id !== id))
    setDeleteConfirm(null)
  }

  const handleAdd = () => {
    const newDoc: Doctor = {
      id: Math.max(0, ...doctors.map((d) => d.id)) + 1,
      ...addForm,
      rating: 0,
      verified: false,
      avatar: addForm.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      color: 'from-blue-400 to-cyan-400',
    }
    setDoctors([newDoc, ...doctors])
    setShowAdd(false)
    setAddForm({ name: '', email: '', specialty: '', hospital: '', experience: 0 })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Doctors</h1>
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700 transition-all">
                <UserPlus className="w-4 h-4" /> Add Doctor
              </button>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search by name, specialty, hospital..." className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </motion.div>

          <AnimatePresence>
            {showAdd && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Doctor</h2>
                  <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['name', 'email'] as const).map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">{field}</label>
                      <input type="text" value={addForm[field]} onChange={(e) => setAddForm({ ...addForm, [field]: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialty</label>
                    <input type="text" value={addForm.specialty} onChange={(e) => setAddForm({ ...addForm, specialty: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hospital</label>
                    <input type="text" value={addForm.hospital} onChange={(e) => setAddForm({ ...addForm, hospital: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience (years)</label>
                    <input type="number" value={addForm.experience} onChange={(e) => setAddForm({ ...addForm, experience: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-4">
                  <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                  <button onClick={handleAdd} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700">Add Doctor</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Doctor</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Specialty</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hospital</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Experience</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rating</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Verified</th>
                    <th className="text-right p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginated.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 bg-gradient-to-br ${d.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>{d.avatar}</div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{d.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{d.specialty}</td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{d.hospital}</td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{d.experience} yrs</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{d.rating}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${d.verified ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                          <Shield className="w-3 h-3" /> {d.verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toggleVerified(d.id)} className={`p-1.5 rounded-lg transition-colors ${d.verified ? 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`} title={d.verified ? 'Unverify' : 'Verify'}>
                            <Shield className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEdit(d)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteConfirm(d.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Remove"><Trash2 className="w-4 h-4" /></button>
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
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}

          <AnimatePresence>
            {editingDoctor && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingDoctor(null)}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Doctor</h2>
                    <button onClick={() => setEditingDoctor(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-400" /></button>
                  </div>
                  <div className="space-y-4">
                    {(['name', 'email', 'specialty', 'hospital'] as const).map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">{field}</label>
                        <input type="text" value={editForm[field]} onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience (years)</label>
                      <input type="number" value={editForm.experience} onChange={(e) => setEditForm({ ...editForm, experience: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setEditingDoctor(null)} className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                      <button onClick={saveEdit} className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700">Save</button>
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
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Remove Doctor</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to remove this doctor?</p>
                  <div className="flex gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                    <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Remove</button>
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
