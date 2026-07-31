'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, ChevronRight, CalendarDays, User, Phone,
  Mail, MapPin, AlertTriangle, X, ChevronLeft, ChevronDown
} from 'lucide-react'
import DoctorSidebar from '@/components/doctor/DoctorSidebar'
import DoctorHeader from '@/components/doctor/DoctorHeader'

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DoctorSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <DoctorHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Patients</h1>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                  placeholder="Search by name or condition..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1) }}
                  className="pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginated.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedPatient(p)}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${p.color} rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
                    {p.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{p.name}</p>
                      <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{p.age} yrs | {p.gender}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{p.condition}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{p.totalVisits} visits</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Last visit: {p.lastVisit}</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">View Profile</span>
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <AnimatePresence>
            {selectedPatient && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                onClick={() => setSelectedPatient(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Patient Profile</h2>
                      <button onClick={() => setSelectedPatient(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    <div className="text-center mb-6">
                      <div className={`w-20 h-20 bg-gradient-to-br ${selectedPatient.color} rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3`}>
                        {selectedPatient.avatar}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedPatient.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPatient.condition}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Age</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedPatient.age}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedPatient.gender}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Blood Group</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedPatient.bloodGroup}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Visits</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedPatient.totalVisits}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" /> {selectedPatient.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" /> {selectedPatient.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" /> {selectedPatient.address}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Visit</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedPatient.lastVisit}</p>
                    </div>
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
