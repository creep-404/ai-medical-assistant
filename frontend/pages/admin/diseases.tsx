'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, ChevronLeft, ChevronRight, Edit3, Trash2,
  Plus, X, Activity
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Label, Textarea } from '@/components/ui/Form'
import { EmptyState } from '@/components/ui/Feedback'
import { Disclaimer } from '@/components/ui/Disclaimer'

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
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
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
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="heading-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-cream-100">
                Disease Database
              </h1>
              <p className="text-sm text-ink-500 dark:text-cream-400/70 mt-1">
                {diseases.length} diseases in the knowledge base.
              </p>
            </div>
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4" /> Add Disease
            </Button>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search diseases..." className="input-base pl-10" />
          </div>
        </motion.div>

        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100">Add New Disease</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors"><X className="w-5 h-5 text-ink-400" /></button>
            </div>
            <div className="space-y-4">
              <Field>
                <Label>Disease Name</Label>
                <Input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
              </Field>
              <Field>
                <Label>Symptoms</Label>
                <Textarea rows={2} value={addForm.symptoms} onChange={(e) => setAddForm({ ...addForm, symptoms: e.target.value })} />
              </Field>
              <Field>
                <Label>Description</Label>
                <Textarea rows={3} value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} />
              </Field>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Add Disease</Button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {paginated.length === 0 ? (
            <EmptyState icon={<Search className="h-7 w-7" />} title="No diseases found" description="Try adjusting your search." />
          ) : (
            paginated.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="card p-4 lg:p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-ink-900 dark:text-cream-100">{d.name}</h3>
                      <p className="text-xs text-ink-500 dark:text-cream-400/70 mt-1"><strong>Symptoms:</strong> {d.symptoms}</p>
                      <p className="text-xs text-ink-500 dark:text-cream-400/70 mt-0.5">{d.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => handleEdit(d)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirm(d.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${currentPage === page ? 'bg-primary-600 text-white shadow-sm' : 'border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}

        <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Disease">
          <div className="space-y-4">
            <Field>
              <Label>Name</Label>
              <Input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </Field>
            <Field>
              <Label>Symptoms</Label>
              <Textarea rows={2} value={editForm.symptoms} onChange={(e) => setEditForm({ ...editForm, symptoms: e.target.value })} />
            </Field>
            <Field>
              <Label>Description</Label>
              <Textarea rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </Field>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
              <Button className="flex-1" onClick={saveEdit}>Save</Button>
            </div>
          </div>
        </Modal>

        <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} size="sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-ink-900 dark:text-cream-100 mb-2">Delete Disease</h2>
            <p className="text-sm text-ink-500 dark:text-cream-400/70 mb-6">This will remove the disease from the database.</p>
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
