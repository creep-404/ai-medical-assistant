'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronLeft, ChevronRight, Edit3, Trash2, AlertTriangle,
  Plus, X, Pill, Users
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

interface Medicine {
  id: number
  name: string
  type: string
  dosage: string
  ageGroup: string
}

const allMedicines: Medicine[] = [
  { id: 1, name: 'Lisinopril', type: 'Tablet', dosage: '10mg daily', ageGroup: 'Adults' },
  { id: 2, name: 'Metformin', type: 'Tablet', dosage: '500mg twice daily', ageGroup: 'Adults' },
  { id: 3, name: 'Sumatriptan', type: 'Tablet', dosage: '50mg as needed', ageGroup: 'Adults' },
  { id: 4, name: 'Amoxicillin', type: 'Capsule', dosage: '500mg three times daily', ageGroup: 'All Ages' },
  { id: 5, name: 'Cetirizine', type: 'Tablet', dosage: '10mg daily', ageGroup: 'Adults & Children' },
  { id: 6, name: 'Ibuprofen', type: 'Tablet', dosage: '400mg as needed', ageGroup: 'Adults' },
  { id: 7, name: 'Omeprazole', type: 'Capsule', dosage: '20mg daily', ageGroup: 'Adults' },
  { id: 8, name: 'Albuterol', type: 'Inhaler', dosage: '2 puffs as needed', ageGroup: 'All Ages' },
  { id: 9, name: 'Levothyroxine', type: 'Tablet', dosage: '50mcg daily', ageGroup: 'Adults' },
  { id: 10, name: 'Losartan', type: 'Tablet', dosage: '25mg daily', ageGroup: 'Adults' },
]

const ITEMS_PER_PAGE = 5

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>(allMedicines)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editing, setEditing] = useState<Medicine | null>(null)
  const [editForm, setEditForm] = useState({ name: '', type: '', dosage: '', ageGroup: '' })
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', type: '', dosage: '', ageGroup: '' })
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.type.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleEdit = (m: Medicine) => {
    setEditing(m)
    setEditForm({ name: m.name, type: m.type, dosage: m.dosage, ageGroup: m.ageGroup })
  }
  const saveEdit = () => {
    if (!editing) return
    setMedicines(medicines.map((m) => m.id === editing.id ? { ...m, ...editForm } : m))
    setEditing(null)
  }
  const handleDelete = (id: number) => {
    setMedicines(medicines.filter((m) => m.id !== id))
    setDeleteConfirm(null)
  }
  const handleAdd = () => {
    setMedicines([...medicines, { id: Math.max(0, ...medicines.map((m) => m.id)) + 1, ...addForm }])
    setShowAdd(false)
    setAddForm({ name: '', type: '', dosage: '', ageGroup: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medicine Database</h1>
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700 transition-all">
                <Plus className="w-4 h-4" /> Add Medicine
              </button>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search medicines..." className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </motion.div>

          <AnimatePresence>
            {showAdd && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Medicine</h2>
                  <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medicine Name</label>
                    <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select value={addForm.type} onChange={(e) => setAddForm({ ...addForm, type: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select type</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Injection">Injection</option>
                      <option value="Inhaler">Inhaler</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Cream">Cream</option>
                      <option value="Drops">Drops</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dosage</label>
                    <input type="text" value={addForm.dosage} onChange={(e) => setAddForm({ ...addForm, dosage: e.target.value })} placeholder="e.g. 10mg daily" className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age Group</label>
                    <select value={addForm.ageGroup} onChange={(e) => setAddForm({ ...addForm, ageGroup: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select age group</option>
                      <option value="Children">Children</option>
                      <option value="Adults">Adults</option>
                      <option value="Adults & Children">Adults & Children</option>
                      <option value="All Ages">All Ages</option>
                      <option value="Elderly">Elderly</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-4">
                  <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                  <button onClick={handleAdd} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700">Add Medicine</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dosage</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Age Group</th>
                    <th className="text-right p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginated.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-3 text-sm text-gray-500 dark:text-gray-400">#{m.id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{m.type}</td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{m.dosage}</td>
                      <td className="p-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{m.ageGroup}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(m)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteConfirm(m.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}

          <AnimatePresence>
            {editing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Medicine</h2>
                    <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-400" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                      <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                      <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Tablet">Tablet</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Injection">Injection</option>
                        <option value="Inhaler">Inhaler</option>
                        <option value="Syrup">Syrup</option>
                        <option value="Cream">Cream</option>
                        <option value="Drops">Drops</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dosage</label>
                      <input type="text" value={editForm.dosage} onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age Group</label>
                      <select value={editForm.ageGroup} onChange={(e) => setEditForm({ ...editForm, ageGroup: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Children">Children</option>
                        <option value="Adults">Adults</option>
                        <option value="Adults & Children">Adults & Children</option>
                        <option value="All Ages">All Ages</option>
                        <option value="Elderly">Elderly</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setEditing(null)} className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
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
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Medicine</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This will remove the medicine from the database.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                    <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete</button>
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
