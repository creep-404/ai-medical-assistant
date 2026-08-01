'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, Search, Clock, User,
  CheckCircle, XCircle, Calendar, ChevronLeft, ChevronRight,
  AlertTriangle, Stethoscope, Loader2, MapPin
} from 'lucide-react'
import DoctorSidebar from '@/components/doctor/DoctorSidebar'
import DoctorHeader from '@/components/doctor/DoctorHeader'
import { appointmentService } from '@/services/appointment.service'
import toast from 'react-hot-toast'

interface Appointment {
  id: number
  patient_name?: string
  patientName?: string
  date: string
  time: string
  reason?: string
  status: string
  notes?: string
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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<number | null>(null)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)

  const statuses = ['All', 'Pending', 'Confirmed', 'Completed', 'Rejected', 'Cancelled']

  async function loadAppointments() {
    setLoading(true)
    try {
      const res = await appointmentService.getDoctorAppointments()
      setAppointments(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [])
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to load appointments')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  const filtered = appointments.filter((a) => {
    const matchSearch = (a.patient_name || a.patientName || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || a.status === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  async function handleAction(id: number, action: 'accept' | 'reject' | 'complete') {
    setActing(id)
    try {
      if (action === 'accept') await appointmentService.acceptAppointment(id)
      else if (action === 'reject') await appointmentService.rejectAppointment(id)
      else await appointmentService.completeAppointment(id)
      toast.success(`Appointment ${action}ed`)
      await loadAppointments()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || `Failed to ${action} appointment`)
    } finally {
      setActing(null)
    }
  }

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return filtered.filter((a) => a.date === dateStr)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DoctorSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <DoctorHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {appointments.length} total · {appointments.filter((a) => a.status === 'pending').length} pending
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-1">
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setView('calendar')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Calendar
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by patient name..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      statusFilter === s
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {!loading && view === 'list' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {filtered.map((apt, i) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 lg:p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {(apt.patient_name || apt.patientName || 'P').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{apt.patient_name || apt.patientName || 'Patient'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{apt.reason || 'No reason provided'}</p>
                        {apt.clinic && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {apt.clinic}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 lg:flex-row flex-wrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>{apt.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{apt.time}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(apt.status)}`}>
                        {statusLabel(apt.status)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {apt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(apt.id, 'accept')}
                              disabled={acting === apt.id}
                              className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50"
                              title="Accept"
                            >
                              {acting === apt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleAction(apt.id, 'reject')}
                              disabled={acting === apt.id}
                              className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              {acting === apt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => handleAction(apt.id, 'complete')}
                            disabled={acting === apt.id}
                            className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {acting === apt.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedApt(apt)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No appointments found</p>
                </div>
              )}
            </motion.div>
          )}

          {!loading && view === 'calendar' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{monthName}</h3>
                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[80px] p-1 border-b border-r border-gray-100 dark:border-gray-800" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayApts = getAppointmentsForDay(day)
                  return (
                    <div
                      key={day}
                      className="min-h-[80px] p-1 border-b border-r border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{day}</span>
                      <div className="space-y-0.5 mt-1">
                        {dayApts.slice(0, 2).map((apt) => (
                          <div
                            key={apt.id}
                            className={`text-[10px] px-1 py-0.5 rounded truncate cursor-pointer ${
                              apt.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                              apt.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                              apt.status === 'rejected' || apt.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                              'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            }`}
                            onClick={() => setSelectedApt(apt)}
                          >
                            {apt.time} {(apt.patient_name || apt.patientName || 'P').split(' ')[0]}
                          </div>
                        ))}
                        {dayApts.length > 2 && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400">+{dayApts.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {selectedApt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                onClick={() => setSelectedApt(null)}
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
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appointment Details</h2>
                      <button onClick={() => setSelectedApt(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <XCircle className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-full flex items-center justify-center text-white text-lg font-bold">
                          {(selectedApt.patient_name || selectedApt.patientName || 'P').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedApt.patient_name || selectedApt.patientName || 'Patient'}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(selectedApt.status)}`}>
                              {statusLabel(selectedApt.status)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedApt.date}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedApt.time}</p>
                        </div>
                        {selectedApt.clinic && (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 col-span-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Clinic</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedApt.clinic}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">{selectedApt.reason || 'Not provided'}</p>
                      </div>
                      {selectedApt.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">{selectedApt.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
              <p>
                <strong className="text-gray-700 dark:text-gray-300">Medical Disclaimer:</strong> This application is intended for educational purposes only. It does not replace professional medical advice, diagnosis, or treatment. Always consult a licensed healthcare provider for serious medical conditions.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
