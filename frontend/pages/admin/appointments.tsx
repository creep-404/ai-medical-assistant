'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronLeft, ChevronRight, CalendarDays, Clock,
  AlertTriangle, X, Stethoscope, Loader2
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { appointmentService } from '@/services/appointment.service'
import toast from 'react-hot-toast'

interface Appointment {
  id: number
  patient_name?: string
  patientName?: string
  doctor_name?: string
  doctor_specialty?: string
  date: string
  time: string
  reason?: string
  status: string
  clinic?: string
}

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    confirmed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  }
  return styles[status] || styles.pending
}

const statusLabel = (status: string) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'

const statuses = ['All', 'Pending', 'Confirmed', 'Completed', 'Rejected', 'Cancelled']

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [busy, setBusy] = useState(false)

  const ITEMS_PER_PAGE = 5

  async function loadData() {
    setLoading(true)
    try {
      const [apptsRes, statsRes] = await Promise.all([
        appointmentService.getAllAppointments(),
        appointmentService.getAppointmentStats(),
      ])
      setAppointments(Array.isArray(apptsRes.data) ? apptsRes.data : Array.isArray(apptsRes) ? apptsRes : [])
      setStats(statsRes.data || statsRes || null)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to load appointments')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = appointments.filter((a) => {
    const matchSearch =
      (a.patient_name || a.patientName || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.doctor_name || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || a.status === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  async function handleCancel(id: number) {
    setBusy(true)
    try {
      await appointmentService.cancelAppointment(id)
      toast.success('Appointment cancelled')
      await loadData()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to cancel appointment')
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirmReschedule() {
    if (!rescheduleApt || !rescheduleDate || !rescheduleTime) return
    setBusy(true)
    try {
      await appointmentService.rescheduleAppointment(rescheduleApt.id, { date: rescheduleDate, time: rescheduleTime })
      toast.success('Appointment rescheduled')
      setRescheduleApt(null)
      setRescheduleDate('')
      setRescheduleTime('')
      await loadData()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to reschedule appointment')
    } finally {
      setBusy(false)
    }
  }

  const statCards = [
    { label: 'Total', value: stats?.total ?? 0, color: 'from-blue-500 to-blue-600' },
    { label: 'Pending', value: stats?.pending ?? 0, color: 'from-amber-500 to-amber-600' },
    { label: 'Confirmed', value: stats?.confirmed ?? 0, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Completed', value: stats?.completed ?? 0, color: 'from-violet-500 to-violet-600' },
    { label: 'Upcoming', value: stats?.upcoming ?? 0, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Cancelled', value: stats?.cancelled ?? 0, color: 'from-red-500 to-red-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Appointments Overview</h1>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {statCards.map((s, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 h-24" />
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {statCards.map((s, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                    <CalendarDays className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {paginated.map((apt, i) => (
                <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 lg:p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {(apt.patient_name || apt.patientName || 'P').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{apt.patient_name || apt.patientName || 'Patient'}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <Stethoscope className="w-3 h-3" /> {apt.doctor_name || 'Doctor'} {apt.doctor_specialty ? `| ${apt.doctor_specialty}` : ''}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{apt.reason || 'No reason provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 lg:flex-row flex-wrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /><span>{apt.date}</span></div>
                        <div className="flex items-center gap-1 mt-0.5"><Clock className="w-3.5 h-3.5" /><span>{apt.time}</span></div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(apt.status)}`}>{statusLabel(apt.status)}</span>
                      <div className="flex items-center gap-1.5">
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && apt.status !== 'rejected' && (
                          <>
                            <button onClick={() => handleCancel(apt.id)} disabled={busy} className="text-xs px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50">Cancel</button>
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
          )}

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
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{rescheduleApt.patient_name || rescheduleApt.patientName} with {rescheduleApt.doctor_name}</p>
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
                      <button onClick={handleConfirmReschedule} disabled={!rescheduleDate || !rescheduleTime || busy} className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {busy && <Loader2 className="w-4 h-4 animate-spin" />} Confirm
                      </button>
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
