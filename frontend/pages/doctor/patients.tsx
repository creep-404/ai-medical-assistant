'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, CalendarDays, User, Phone,
  Mail, MapPin, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react'
import { DoctorLayout } from '@/components/layout/DoctorLayout'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/Feedback'
import { Disclaimer } from '@/components/ui/Disclaimer'

interface Patient {
  id: number
  name: string
  age: number
  gender: string
  condition: string
  lastVisit: string
  totalVisits: number
  phone: string
  email: string
  address: string
  bloodGroup: string
  avatar: string
  color: string
}

const patients: Patient[] = [
  { id: 1, name: 'Sarah Johnson', age: 34, gender: 'Female', condition: 'Hypertension', lastVisit: '2026-07-28', totalVisits: 12, phone: '+1 (555) 123-4567', email: 'sarah.j@email.com', address: '123 Main St, NY', bloodGroup: 'A+', avatar: 'SJ', color: 'from-pink-400 to-rose-400' },
  { id: 2, name: 'Michael Chen', age: 45, gender: 'Male', condition: 'Arrhythmia', lastVisit: '2026-07-25', totalVisits: 8, phone: '+1 (555) 234-5678', email: 'michael.c@email.com', address: '456 Oak Ave, LA', bloodGroup: 'O+', avatar: 'MC', color: 'from-blue-400 to-cyan-400' },
  { id: 3, name: 'Emily Davis', age: 28, gender: 'Female', condition: 'Migraine', lastVisit: '2026-07-23', totalVisits: 5, phone: '+1 (555) 345-6789', email: 'emily.d@email.com', address: '789 Pine Rd, SF', bloodGroup: 'B+', avatar: 'ED', color: 'from-emerald-400 to-green-400' },
  { id: 4, name: 'James Wilson', age: 52, gender: 'Male', condition: 'Angina', lastVisit: '2026-07-27', totalVisits: 15, phone: '+1 (555) 456-7890', email: 'james.w@email.com', address: '321 Elm St, CHI', bloodGroup: 'AB+', avatar: 'JW', color: 'from-amber-400 to-orange-400' },
  { id: 5, name: 'Lisa Anderson', age: 39, gender: 'Female', condition: 'Cardiomyopathy', lastVisit: '2026-07-20', totalVisits: 10, phone: '+1 (555) 567-8901', email: 'lisa.a@email.com', address: '654 Birch Ln, MIA', bloodGroup: 'A-', avatar: 'LA', color: 'from-red-400 to-rose-400' },
  { id: 6, name: 'David Thompson', age: 58, gender: 'Male', condition: 'Hypertension', lastVisit: '2026-07-29', totalVisits: 20, phone: '+1 (555) 678-9012', email: 'david.t@email.com', address: '987 Cedar Dr, SEA', bloodGroup: 'O-', avatar: 'DT', color: 'from-purple-400 to-violet-400' },
  { id: 7, name: 'Maria Garcia', age: 31, gender: 'Female', condition: 'Anxiety', lastVisit: '2026-07-15', totalVisits: 3, phone: '+1 (555) 789-0123', email: 'maria.g@email.com', address: '147 Walnut Ave, PHX', bloodGroup: 'B-', avatar: 'MG', color: 'from-teal-400 to-emerald-400' },
  { id: 8, name: 'Robert Kim', age: 48, gender: 'Male', condition: 'Diabetes Type 2', lastVisit: '2026-07-22', totalVisits: 7, phone: '+1 (555) 890-1234', email: 'robert.k@email.com', address: '258 Spruce St, DAL', bloodGroup: 'A+', avatar: 'RK', color: 'from-indigo-400 to-blue-400' },
  { id: 9, name: 'Amanda White', age: 26, gender: 'Female', condition: 'Thyroid Disorder', lastVisit: '2026-07-18', totalVisits: 4, phone: '+1 (555) 901-2345', email: 'amanda.w@email.com', address: '369 Maple Dr, ATL', bloodGroup: 'AB-', avatar: 'AW', color: 'from-cyan-400 to-blue-400' },
  { id: 10, name: 'John Martinez', age: 62, gender: 'Male', condition: 'Heart Disease', lastVisit: '2026-07-26', totalVisits: 25, phone: '+1 (555) 012-3456', email: 'john.m@email.com', address: '159 Oakwood Ct, HOU', bloodGroup: 'O+', avatar: 'JM', color: 'from-orange-400 to-red-400' },
]

const ITEMS_PER_PAGE = 6

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = patients.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase())
    const matchDate = !filterDate || p.lastVisit === filterDate
    return matchSearch && matchDate
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="heading-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-cream-100 mb-6">
            My Patients
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                placeholder="Search by name or condition..."
                className="input-base pl-10"
              />
            </div>
            <div className="relative">
              <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1) }}
                className="input-base pl-10"
              />
            </div>
          </div>
        </motion.div>

        {paginated.length === 0 ? (
          <EmptyState
            icon={<User className="h-7 w-7" />}
            title="No patients found"
            description="Try adjusting your search or date filter."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginated.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedPatient(p)}
                className="card card-hover p-4 cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <Avatar name={p.name} initials={p.avatar} className="h-14 w-14 text-lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-ink-900 dark:text-cream-100 truncate">{p.name}</p>
                      <ChevronRight className="w-4 h-4 text-ink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-ink-500 dark:text-cream-400/70">{p.age} yrs | {p.gender}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="primary">{p.condition}</Badge>
                      <span className="text-xs text-ink-500 dark:text-cream-400/70">{p.totalVisits} visits</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-cream-200 dark:border-ink-800 flex items-center justify-between text-xs text-ink-500 dark:text-cream-400/70">
                  <span>Last visit: {p.lastVisit}</span>
                  <span className="font-semibold text-primary-700 dark:text-primary-300">View Profile</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                  currentPage === page
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        <Modal
          open={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title="Patient Profile"
        >
          {selectedPatient && (
            <div>
              <div className="text-center mb-6">
                <Avatar name={selectedPatient.name} initials={selectedPatient.avatar} size="lg" className="h-20 w-20 text-2xl mx-auto mb-3" />
                <h3 className="text-xl font-bold text-ink-900 dark:text-cream-100">{selectedPatient.name}</h3>
                <p className="text-sm text-ink-500 dark:text-cream-400/70">{selectedPatient.condition}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-cream-100 dark:bg-ink-800 rounded-xl p-3">
                  <p className="text-xs text-ink-500 dark:text-cream-400/70">Age</p>
                  <p className="text-sm font-medium text-ink-900 dark:text-cream-100">{selectedPatient.age}</p>
                </div>
                <div className="bg-cream-100 dark:bg-ink-800 rounded-xl p-3">
                  <p className="text-xs text-ink-500 dark:text-cream-400/70">Gender</p>
                  <p className="text-sm font-medium text-ink-900 dark:text-cream-100">{selectedPatient.gender}</p>
                </div>
                <div className="bg-cream-100 dark:bg-ink-800 rounded-xl p-3">
                  <p className="text-xs text-ink-500 dark:text-cream-400/70">Blood Group</p>
                  <p className="text-sm font-medium text-ink-900 dark:text-cream-100">{selectedPatient.bloodGroup}</p>
                </div>
                <div className="bg-cream-100 dark:bg-ink-800 rounded-xl p-3">
                  <p className="text-xs text-ink-500 dark:text-cream-400/70">Total Visits</p>
                  <p className="text-sm font-medium text-ink-900 dark:text-cream-100">{selectedPatient.totalVisits}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-ink-600 dark:text-cream-300/70">
                  <Mail className="w-4 h-4" /> {selectedPatient.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-600 dark:text-cream-300/70">
                  <Phone className="w-4 h-4" /> {selectedPatient.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-600 dark:text-cream-300/70">
                  <MapPin className="w-4 h-4" /> {selectedPatient.address}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-cream-200 dark:border-ink-800">
                <p className="text-sm text-ink-500 dark:text-cream-400/70">Last Visit</p>
                <p className="text-sm font-medium text-ink-900 dark:text-cream-100">{selectedPatient.lastVisit}</p>
              </div>
            </div>
          )}
        </Modal>

        <Disclaimer />
      </div>
    </DoctorLayout>
  )
}
