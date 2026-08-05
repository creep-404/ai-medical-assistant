'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, ChevronLeft, ChevronRight, Edit3, Trash2,
  AlertTriangle, UserPlus, Star, Shield, X
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { Field, Input, Label } from '@/components/ui/Form'
import { EmptyState } from '@/components/ui/Feedback'
import { Disclaimer } from '@/components/ui/Disclaimer'

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
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="heading-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-cream-100">
                Manage Doctors
              </h1>
              <p className="text-sm text-ink-500 dark:text-cream-400/70 mt-1">
                {doctors.length} doctors registered · {doctors.filter((d) => d.verified).length} verified.
              </p>
            </div>
            <Button onClick={() => setShowAdd(true)}>
              <UserPlus className="w-4 h-4" /> Add Doctor
            </Button>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search by name, specialty, hospital..." className="input-base pl-10" />
          </div>
        </motion.div>

        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100">Add New Doctor</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors">
                <X className="w-5 h-5 text-ink-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['name', 'email'] as const).map((field) => (
                <Field key={field}>
                  <Label className="capitalize">{field}</Label>
                  <Input type="text" value={addForm[field]} onChange={(e) => setAddForm({ ...addForm, [field]: e.target.value })} />
                </Field>
              ))}
              <Field>
                <Label>Specialty</Label>
                <Input type="text" value={addForm.specialty} onChange={(e) => setAddForm({ ...addForm, specialty: e.target.value })} />
              </Field>
              <Field>
                <Label>Hospital</Label>
                <Input type="text" value={addForm.hospital} onChange={(e) => setAddForm({ ...addForm, hospital: e.target.value })} />
              </Field>
              <Field>
                <Label>Experience (years)</Label>
                <Input type="number" value={addForm.experience} onChange={(e) => setAddForm({ ...addForm, experience: Number(e.target.value) })} />
              </Field>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add Doctor</Button>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
          {paginated.length === 0 ? (
            <EmptyState icon={<Search className="h-7 w-7" />} title="No doctors found" description="Try adjusting your search." />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Doctor</TH>
                  <TH>Specialty</TH>
                  <TH>Hospital</TH>
                  <TH>Experience</TH>
                  <TH>Rating</TH>
                  <TH>Verified</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {paginated.map((d) => (
                  <TR key={d.id}>
                    <TD>
                      <div className="flex items-center gap-2">
                        <Avatar name={d.name} initials={d.avatar} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-ink-900 dark:text-cream-100">{d.name}</p>
                          <p className="text-xs text-ink-500 dark:text-cream-400/70">{d.email}</p>
                        </div>
                      </div>
                    </TD>
                    <TD className="text-sm text-ink-600 dark:text-cream-300/70">{d.specialty}</TD>
                    <TD className="text-sm text-ink-600 dark:text-cream-300/70">{d.hospital}</TD>
                    <TD className="text-sm text-ink-600 dark:text-cream-300/70">{d.experience} yrs</TD>
                    <TD>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-accent-400 text-accent-400" />
                        <span className="text-sm text-ink-900 dark:text-cream-100">{d.rating}</span>
                      </div>
                    </TD>
                    <TD>
                      <Badge className={d.verified ? 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300' : 'bg-cream-200 text-ink-600 dark:bg-ink-800 dark:text-cream-300'}>
                        <Shield className="w-3 h-3" /> {d.verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleVerified(d.id)} className={`p-1.5 rounded-lg transition-colors ${d.verified ? 'text-ink-400 hover:bg-cream-100 dark:hover:bg-ink-800' : 'text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-900/20'}`} title={d.verified ? 'Unverify' : 'Verify'}>
                          <Shield className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(d)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="Edit"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(d.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Remove"><Trash2 className="w-4 h-4" /></button>
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

        <Modal open={!!editingDoctor} onClose={() => setEditingDoctor(null)} title="Edit Doctor">
          <div className="space-y-4">
            {(['name', 'email', 'specialty', 'hospital'] as const).map((field) => (
              <Field key={field}>
                <Label className="capitalize">{field}</Label>
                <Input type="text" value={editForm[field]} onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })} />
              </Field>
            ))}
            <Field>
              <Label>Experience (years)</Label>
              <Input type="number" value={editForm.experience} onChange={(e) => setEditForm({ ...editForm, experience: Number(e.target.value) })} />
            </Field>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditingDoctor(null)}>Cancel</Button>
              <Button className="flex-1" onClick={saveEdit}>Save</Button>
            </div>
          </div>
        </Modal>

        <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} size="sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-ink-900 dark:text-cream-100 mb-2">Remove Doctor</h2>
            <p className="text-sm text-ink-500 dark:text-cream-400/70 mb-6">Are you sure you want to remove this doctor?</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="danger" className="flex-1" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Remove</Button>
            </div>
          </div>
        </Modal>

        <Disclaimer />
      </div>
    </AdminLayout>
  )
}
