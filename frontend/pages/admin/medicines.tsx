'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, ChevronLeft, ChevronRight, Edit3, Trash2,
  Plus, X, Pill, Users, FlaskConical
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { Field, Input, Label, Select } from '@/components/ui/Form'
import { EmptyState } from '@/components/ui/Feedback'
import { Disclaimer } from '@/components/ui/Disclaimer'

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
const medicineTypes = ['Tablet', 'Capsule', 'Injection', 'Inhaler', 'Syrup', 'Cream', 'Drops']
const ageGroups = ['Children', 'Adults', 'Adults & Children', 'All Ages', 'Elderly']

const emptyForm = { name: '', type: '', dosage: '', ageGroup: '' }

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>(allMedicines)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editing, setEditing] = useState<Medicine | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.type.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
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
    setAddForm(emptyForm)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="heading-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-cream-100">
                Medicine Database
              </h1>
              <p className="text-sm text-ink-500 dark:text-cream-400/70 mt-1">
                {medicines.length} medicines in the knowledge base.
              </p>
            </div>
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4" /> Add Medicine
            </Button>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search medicines..." className="input-base pl-10" />
          </div>
        </motion.div>

        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100">Add New Medicine</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors"><X className="w-5 h-5 text-ink-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <Label>Medicine Name</Label>
                <Input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
              </Field>
              <Field>
                <Label>Type</Label>
                <Select value={addForm.type} onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}>
                  <option value="">Select type</option>
                  {medicineTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Field>
              <Field>
                <Label>Dosage</Label>
                <Input type="text" value={addForm.dosage} onChange={(e) => setAddForm({ ...addForm, dosage: e.target.value })} placeholder="e.g. 10mg daily" />
              </Field>
              <Field>
                <Label>Age Group</Label>
                <Select value={addForm.ageGroup} onChange={(e) => setAddForm({ ...addForm, ageGroup: e.target.value })}>
                  <option value="">Select age group</option>
                  {ageGroups.map((g) => <option key={g} value={g}>{g}</option>)}
                </Select>
              </Field>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add Medicine</Button>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
          {paginated.length === 0 ? (
            <EmptyState icon={<Search className="h-7 w-7" />} title="No medicines found" description="Try adjusting your search." />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>ID</TH>
                  <TH>Name</TH>
                  <TH>Type</TH>
                  <TH>Dosage</TH>
                  <TH>Age Group</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {paginated.map((m) => (
                  <TR key={m.id}>
                    <TD className="text-sm text-ink-500 dark:text-cream-400/70">#{m.id}</TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-300 flex items-center justify-center">
                          <Pill className="w-4 h-4" />
                        </span>
                        <span className="text-sm font-medium text-ink-900 dark:text-cream-100">{m.name}</span>
                      </div>
                    </TD>
                    <TD className="text-sm text-ink-600 dark:text-cream-300/70">{m.type}</TD>
                    <TD className="text-sm text-ink-600 dark:text-cream-300/70">{m.dosage}</TD>
                    <TD>
                      <Badge className="bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                        <Users className="w-3 h-3" /> {m.ageGroup}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(m)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="Edit"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(m.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Remove"><Trash2 className="w-4 h-4" /></button>
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
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${currentPage === page ? 'bg-primary-600 text-white shadow-sm' : 'border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}

        <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Medicine">
          <div className="space-y-4">
            <Field>
              <Label>Name</Label>
              <Input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </Field>
            <Field>
              <Label>Type</Label>
              <Select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                {medicineTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field>
              <Label>Dosage</Label>
              <Input type="text" value={editForm.dosage} onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value })} />
            </Field>
            <Field>
              <Label>Age Group</Label>
              <Select value={editForm.ageGroup} onChange={(e) => setEditForm({ ...editForm, ageGroup: e.target.value })}>
                {ageGroups.map((g) => <option key={g} value={g}>{g}</option>)}
              </Select>
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
              <FlaskConical className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-ink-900 dark:text-cream-100 mb-2">Delete Medicine</h2>
            <p className="text-sm text-ink-500 dark:text-cream-400/70 mb-6">This will remove the medicine from the database.</p>
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
