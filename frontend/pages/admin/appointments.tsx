'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, ChevronLeft, ChevronRight, CalendarDays, Clock,
  AlertTriangle, X, CheckCircle, XCircle, User, Stethoscope
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

interface Appointment {
  id: number
  patientName: string
  doctorName: string
  doctorSpecialty: string
  date: string
  time: string
  reason: string
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'
}

const allAppointments: Appointment[] = [
  { id: 1, patientName: 'Sarah Johnson', doctorName: 'Dr. Robert', doctorSpecialty: 'Cardiology', date: '2026-07-30', time: '9:00 AM', reason: 'Regular Checkup', status: 'Confirmed' },
  { id: 2, patientName: 'Michael Chen', doctorName: 'Dr. Sarah Wilson', doctorSpecialty: 'Neurology', date: '2026-07-30', time: '10:30 AM', reason: 'Heart Palpitations', status: 'Confirmed' },
  { id: 3, patientName: 'Emily Davis', doctorName: 'Dr. Emily Davis', doctorSpecialty: 'Internal Medicine', date: '2026-07-30', time: '11:00 AM', reason: 'Migraine Follow-up', status: 'Pending' },
  { id: 4, patientName: 'James Wilson', doctorName: 'Dr. Michael Chen', doctorSpecialty: 'Cardiology', date: '2026-07-30', time: '1:30 PM', reason: 'Chest Pain', status: 'Confirmed' },
  { id: 5, patientName: 'Lisa Anderson', doctorName: 'Dr. Robert', doctorSpecialty: 'Cardiology', date: '2026-07-30', time: '3:00 PM', reason: 'Cardio Consultation', status: 'Cancelled' },
  { id: 6, patientName: 'David Thompson', doctorName: 'Dr. Sarah Wilson', doctorSpecialty: 'Orthopedics', date: '2026-07-31', time: '9:30 AM', reason: 'Joint Pain', status: 'Pending' },
  { id: 7, patientName: 'Maria Garcia', doctorName: 'Dr. Emily Davis', doctorSpecialty: 'Dermatology', date: '2026-07-31', time: '11:00 AM', reason: 'Skin Rash', status: 'Confirmed' },
  { id: 8, patientName: 'Robert Kim', doctorName: 'Dr. Michael Chen', doctorSpecialty: 'Ophthalmology', date: '2026-07-31', time: '2:00 PM', reason: 'Vision Check', status: 'Completed' },
  { id: 9, patientName: 'Amanda White', doctorName: 'Dr. Robert', doctorSpecialty: 'Cardiology', date: '2026-08-01', time: '10:00 AM', reason: 'Blood Pressure Check', status: 'Pending' },
  { id: 10, patientName: 'John Martinez', doctorName: 'Dr. Sarah Wilson', doctorSpecialty: 'Neurology', date: '2026-08-01', time: '3:30 PM', reason: 'Headache Evaluation', status: 'Confirmed' },
]

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Confirmed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    Pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    Completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  }
  return styles[status] || styles.Pending
}

const statuses = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled']

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(allAppointments)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')

  const ITEMS_PER_PAGE = 5

  const filtered = appointments.filter((a) => {
    const matchSearch = a.patientName.toLowerCase().includes(search.toLowerCase()) || a.doctorName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleCancel = (id: number) => {
    setAppointments(appointments.map((a) => a.id === id ? { ...a, status: 'Cancelled' as const } : a))
  }

  const handleConfirmReschedule = () => {
    if (!rescheduleApt || !rescheduleDate || !rescheduleTime) return
    setAppointments(appointments.map((a) => a.id === rescheduleApt.id ? { ...a, date: rescheduleDate, time: rescheduleTime, status: 'Confirmed' as const } : a))
    setRescheduleApt(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Appointments Overview</h1>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search by patient or doctor..." className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {statuses.map((s) => (
                  <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1) }} className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{s}</button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {paginated.map((apt, i) => (
              <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 lg:p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {apt.patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{apt.patientName}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <Stethoscope className="w-3 h-3" /> {apt.doctorName} | {apt.doctorSpecialty}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{apt.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 lg:flex-row flex-wrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /><span>{apt.date}</span></div>
                      <div className="flex items-center gap-1 mt-0.5"><Clock className="w-3.5 h-3.5" /><span>{apt.time}</span></div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(apt.status)}`}>{apt.status}</span>
                    <div className="flex items-center gap-1.5">
                      {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                        <>
                          <button onClick={() => handleCancel(apt.id)} className="text-xs px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">Cancel</button>
                          <button onClick={() => { setRescheduleApt(apt); setRescheduleDate(''); setRescheduleTime('') }} className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">Reschedule</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {paginated.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No appointments found</p>
              </div>
            )}
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
            {rescheduleApt && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setRescheduleApt(null)}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Reschedule Appointment</h2>
                    <button onClick={() => setRescheduleApt(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-400" /></button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{rescheduleApt.patientName} with {rescheduleApt.doctorName}</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Date</label>
                      <input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Time</label>
                      <input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setRescheduleApt(null)} className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                      <button onClick={handleConfirmReschedule} disabled={!rescheduleDate || !rescheduleTime} className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">Confirm</button>
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
