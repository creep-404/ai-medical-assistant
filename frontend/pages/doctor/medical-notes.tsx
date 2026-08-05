'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  StickyNote, Plus, Search, Edit3, Trash2, Save, User,
  CalendarDays, X, FileText, Pill
} from 'lucide-react'
import { DoctorLayout } from '@/components/layout/DoctorLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Field, Input, Label, Select, Textarea } from '@/components/ui/Form'
import { EmptyState } from '@/components/ui/Feedback'
import { Disclaimer } from '@/components/ui/Disclaimer'

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
    <DoctorLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="heading-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-cream-100">
              Medical Notes
            </h1>
            <Button onClick={() => { resetForm(); setShowForm(true) }}>
              <Plus className="w-4 h-4" /> Add New Note
            </Button>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="input-base pl-10"
            />
          </div>
        </motion.div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100">
                {editingId ? 'Edit Medical Note' : 'New Medical Note'}
              </h2>
              <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors">
                <X className="w-5 h-5 text-ink-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Field>
                <Label>Patient</Label>
                <Select
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: Number(e.target.value) })}
                >
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </Field>
              <Field>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Field>
            </div>
            <Field className="mb-4">
              <Label>Diagnosis</Label>
              <Input
                type="text"
                value={form.diagnosis}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                placeholder="Enter diagnosis"
              />
            </Field>
            <Field className="mb-4">
              <Label>Medical Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
                placeholder="Enter detailed medical notes..."
              />
            </Field>
            <Field className="mb-4">
              <Label>Prescriptions</Label>
              <Textarea
                value={form.prescriptions}
                onChange={(e) => setForm({ ...form, prescriptions: e.target.value })}
                rows={2}
                placeholder="Enter prescriptions..."
              />
            </Field>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit}>
                <Save className="w-4 h-4" /> {editingId ? 'Update' : 'Save'} Note
              </Button>
            </div>
          </motion.div>
        )}

        {filtered.length === 0 ? (
          <EmptyState icon={<FileText className="h-7 w-7" />} title="No medical notes found" description="Add a new note to get started." />
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {filtered.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card card-hover p-4 lg:p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300">
                      <StickyNote className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                        <h3 className="text-sm font-semibold text-ink-900 dark:text-cream-100">{note.diagnosis}</h3>
                        <span className="text-xs text-ink-500 dark:text-cream-400/70 flex items-center gap-1">
                          <User className="w-3 h-3" /> {note.patientName}
                        </span>
                        <span className="text-xs text-ink-500 dark:text-cream-400/70 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> {note.date}
                        </span>
                      </div>
                      <p className="text-sm text-ink-600 dark:text-cream-400/70 mt-1">{note.notes}</p>
                      {note.prescriptions && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-secondary-700 dark:text-secondary-300 bg-secondary-100 dark:bg-secondary-900/20 rounded-xl p-2">
                          <Pill className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span>{note.prescriptions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => handleEdit(note)} className="p-1.5 rounded-lg text-ink-400 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(note.id)} className="p-1.5 rounded-lg text-ink-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <Disclaimer />
      </div>
    </DoctorLayout>
  )
}
