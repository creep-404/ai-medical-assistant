'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronLeft, ChevronRight, Edit3, Trash2, AlertTriangle,
  Plus, X, Activity, Stethoscope
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

interface Disease {
  id: number
  name: string
  symptoms: string
  description: string
}

const allDiseases: Disease[] = [
  { id: 1, name: 'Hypertension', symptoms: 'High blood pressure, headaches, shortness of breath, nosebleeds', description: 'A condition in which the force of the blood against the artery walls is too high, often leading to heart disease and stroke.' },
  { id: 2, name: 'Type 2 Diabetes', symptoms: 'Increased thirst, frequent urination, hunger, fatigue, blurred vision', description: 'A chronic condition that affects the way the body processes blood sugar (glucose), typically developing in adults.' },
  { id: 3, name: 'Migraine', symptoms: 'Intense throbbing pain, nausea, vomiting, sensitivity to light and sound', description: 'A neurological condition characterized by recurrent moderate to severe headaches, often with other symptoms.' },
  { id: 4, name: 'Atrial Fibrillation', symptoms: 'Irregular heartbeat, palpitations, chest pain, dizziness, fatigue', description: 'An irregular and often rapid heart rate that can increase the risk of stroke, heart failure, and other complications.' },
  { id: 5, name: 'Asthma', symptoms: 'Shortness of breath, chest tightness, wheezing, coughing', description: 'A condition in which the airways narrow and swell, producing extra mucus, making breathing difficult.' },
  { id: 6, name: 'Arthritis', symptoms: 'Joint pain, stiffness, swelling, decreased range of motion', description: 'Inflammation of one or more joints, causing pain and stiffness that typically worsens with age.' },
  { id: 7, name: 'Anemia', symptoms: 'Fatigue, weakness, pale skin, shortness of breath, dizziness', description: 'A condition in which the blood lacks enough healthy red blood cells to carry adequate oxygen to the body\'s tissues.' },
  { id: 8, name: 'Pneumonia', symptoms: 'Cough with phlegm, fever, chills, difficulty breathing, chest pain', description: 'An infection that inflames the air sacs in one or both lungs, which may fill with fluid.' },
]

const ITEMS_PER_PAGE = 5

export default function AdminDiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>(allDiseases)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editing, setEditing] = useState<Disease | null>(null)
  const [editForm, setEditForm] = useState({ name: '', symptoms: '', description: '' })
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', symptoms: '', description: '' })
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const filtered = diseases.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.symptoms.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleEdit = (d: Disease) => {
    setEditing(d)
    setEditForm({ name: d.name, symptoms: d.symptoms, description: d.description })
  }
  const saveEdit = () => {
    if (!editing) return
    setDiseases(diseases.map((d) => d.id === editing.id ? { ...d, ...editForm } : d))
    setEditing(null)
  }
  const handleDelete = (id: number) => {
    setDiseases(diseases.filter((d) => d.id !== id))
    setDeleteConfirm(null)
  }
  const handleAdd = () => {
    setDiseases([...diseases, { id: Math.max(0, ...diseases.map((d) => d.id)) + 1, ...addForm }])
    setShowAdd(false)
    setAddForm({ name: '', symptoms: '', description: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disease Database</h1>
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700 transition-all">
                <Plus className="w-4 h-4" /> Add Disease
              </button>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search diseases..." className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </motion.div>

          <AnimatePresence>
            {showAdd && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Disease</h2>
                  <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Disease Name</label>
                    <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Symptoms</label>
                    <textarea value={addForm.symptoms} onChange={(e) => setAddForm({ ...addForm, symptoms: e.target.value })} rows={2} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                    <button onClick={handleAdd} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700">Add Disease</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {paginated.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 lg:p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{d.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><strong>Symptoms:</strong> {d.symptoms}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{d.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => handleEdit(d)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirm(d.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
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
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Disease</h2>
                    <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-400" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                      <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Symptoms</label>
                      <textarea value={editForm.symptoms} onChange={(e) => setEditForm({ ...editForm, symptoms: e.target.value })} rows={2} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
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
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Disease</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This will remove the disease from the database.</p>
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
