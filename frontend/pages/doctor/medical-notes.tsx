'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  StickyNote, Plus, Search, Edit3, Trash2, Save, User,
  CalendarDays, AlertTriangle, X, FileText, Pill, Stethoscope
} from 'lucide-react'
import DoctorSidebar from '@/components/doctor/DoctorSidebar'
import DoctorHeader from '@/components/doctor/DoctorHeader'

interface MedicalNote {
  id: number
  patientId: number
  patientName: string
  date: string
  diagnosis: string
  notes: string
  prescriptions: string
}

const patients = [
  { id: 1, name: 'Sarah Johnson' },
  { id: 2, name: 'Michael Chen' },
  { id: 3, name: 'Emily Davis' },
  { id: 4, name: 'James Wilson' },
  { id: 5, name: 'Lisa Anderson' },
  { id: 6, name: 'David Thompson' },
]

const initialNotes: MedicalNote[] = [
  { id: 1, patientId: 1, patientName: 'Sarah Johnson', date: '2026-07-28', diagnosis: 'Mild Hypertension', notes: 'Patient shows early signs of hypertension. BP: 135/85. Recommended lifestyle changes and follow-up in 3 months.', prescriptions: 'Lisinopril 10mg daily' },
  { id: 2, patientId: 2, patientName: 'Michael Chen', date: '2026-07-25', diagnosis: 'Arrhythmia - PVCs', notes: 'ECG shows occasional premature ventricular contractions. Holter monitoring recommended for 48 hours.', prescriptions: 'Beta-blocker therapy initiated' },
  { id: 3, patientId: 3, patientName: 'Emily Davis', date: '2026-07-23', diagnosis: 'Migraine without Aura', notes: 'Patient reports frequent headaches. Neurological exam normal. Prescribed preventive medication.', prescriptions: 'Sumatriptan 50mg as needed, Propranolol 40mg daily' },
  { id: 4, patientId: 1, patientName: 'Sarah Johnson', date: '2026-06-15', diagnosis: 'Seasonal Allergies', notes: 'Allergic rhinitis diagnosed. Patient to continue antihistamines and use nasal spray.', prescriptions: 'Cetirizine 10mg daily, Fluticasone nasal spray' },
]

export default function MedicalNotesPage() {
  const [notes, setNotes] = useState<MedicalNote[]>(initialNotes)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ patientId: 1, date: new Date().toISOString().split('T')[0], diagnosis: '', notes: '', prescriptions: '' })

  const filtered = notes.filter((n) =>
    n.patientName.toLowerCase().includes(search.toLowerCase()) || n.diagnosis.toLowerCase().includes(search.toLowerCase())
  )

  const resetForm = () => {
    setForm({ patientId: 1, date: new Date().toISOString().split('T')[0], diagnosis: '', notes: '', prescriptions: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = () => {
    if (!form.diagnosis || !form.notes) return
    const patient = patients.find((p) => p.id === form.patientId)
    if (editingId) {
      setNotes(notes.map((n) => n.id === editingId ? { ...n, ...form, patientName: patient?.name || '' } : n))
    } else {
      const newNote: MedicalNote = {
        id: Math.max(0, ...notes.map((n) => n.id)) + 1,
        ...form,
        patientName: patient?.name || '',
      }
      setNotes([newNote, ...notes])
    }
    resetForm()
  }

  const handleEdit = (note: MedicalNote) => {
    setForm({ patientId: note.patientId, date: note.date, diagnosis: note.diagnosis, notes: note.notes, prescriptions: note.prescriptions })
    setEditingId(note.id)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter((n) => n.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DoctorSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <DoctorHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medical Notes</h1>
              <button
                onClick={() => { resetForm(); setShowForm(true) }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700 transition-all"
              >
                <Plus className="w-4 h-4" /> Add New Note
              </button>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingId ? 'Edit Medical Note' : 'New Medical Note'}
                  </h2>
                  <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Patient</label>
                    <select
                      value={form.patientId}
                      onChange={(e) => setForm({ ...form, patientId: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diagnosis</label>
                  <input
                    type="text"
                    value={form.diagnosis}
                    onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis"
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medical Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={4}
                    placeholder="Enter detailed medical notes..."
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prescriptions</label>
                  <textarea
                    value={form.prescriptions}
                    onChange={(e) => setForm({ ...form, prescriptions: e.target.value })}
                    rows={2}
                    placeholder="Enter prescriptions..."
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={resetForm} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                  <button onClick={handleSubmit} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700 transition-all">
                    <Save className="w-4 h-4" /> {editingId ? 'Update' : 'Save'} Note
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {filtered.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 lg:p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                      <StickyNote className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{note.diagnosis}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <User className="w-3 h-3" /> {note.patientName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> {note.date}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{note.notes}</p>
                      {note.prescriptions && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                          <Pill className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span>{note.prescriptions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => handleEdit(note)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(note.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No medical notes found</p>
              </div>
            )}
          </motion.div>

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
