'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays, Search, Clock, User,
  CheckCircle, XCircle, Calendar, ChevronLeft, ChevronRight,
  AlertTriangle, Loader2, MapPin
} from 'lucide-react'
import { DoctorLayout } from '@/components/layout/DoctorLayout'
import { appointmentService } from '@/services/appointment.service'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Spinner, EmptyState } from '@/components/ui/Feedback'
import { Disclaimer } from '@/components/ui/Disclaimer'
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
    pending: 'bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-300',
    confirmed: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300',
    completed: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
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
    <DoctorLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="heading-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-cream-100">
                Appointments
              </h1>
              <p className="text-sm text-ink-500 dark:text-cream-400/70 mt-1">
                {appointments.length} total · {appointments.filter((a) => a.status === 'pending').length} pending
              </p>
            </div>
            <div className="flex items-center gap-1 card p-1">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  view === 'list' ? 'bg-primary-600 text-white shadow-sm' : 'text-ink-600 dark:text-cream-300/70 hover:text-ink-900 dark:hover:text-cream-100'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  view === 'calendar' ? 'bg-primary-600 text-white shadow-sm' : 'text-ink-600 dark:text-cream-300/70 hover:text-ink-900 dark:hover:text-cream-100'
                }`}
              >
                Calendar
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by patient name..."
                className="input-base pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === s
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-cream-300/70 border border-cream-300 dark:border-ink-700 hover:bg-cream-100 dark:hover:bg-ink-800'
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
              <div key={i} className="animate-pulse card p-5">
                <div className="h-4 bg-cream-300 dark:bg-ink-700 rounded w-1/3 mb-3" />
                <div className="h-3 bg-cream-300 dark:bg-ink-700 rounded w-2/3" />
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
                className="card card-hover p-4 lg:p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar name={apt.patient_name || apt.patientName || 'Patient'} initials={(apt.patient_name || apt.patientName || 'P').split(' ').map((n) => n[0]).join('').slice(0, 2)} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900 dark:text-cream-100">{apt.patient_name || apt.patientName || 'Patient'}</p>
                      <p className="text-xs text-ink-500 dark:text-cream-400/70 mt-0.5 truncate">{apt.reason || 'No reason provided'}</p>
                      {apt.clinic && (
                        <p className="text-xs text-ink-400 dark:text-cream-300/50 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {apt.clinic}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 lg:flex-row flex-wrap">
                    <div className="text-sm text-ink-500 dark:text-cream-400/70">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{apt.time}</span>
                      </div>
                    </div>
                    <Badge className={statusBadge(apt.status)}>{statusLabel(apt.status)}</Badge>
                    <div className="flex items-center gap-1.5">
                      {apt.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(apt.id, 'accept')}
                            disabled={acting === apt.id}
                            className="p-1.5 rounded-lg bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-900/50 transition-colors disabled:opacity-50"
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
                          className="text-xs px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors disabled:opacity-50 flex items-center gap-1 font-semibold"
                        >
                          {acting === apt.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Complete
                        </button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setSelectedApt(apt)}>
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <EmptyState icon={<CalendarDays className="h-7 w-7" />} title="No appointments found" description="Try adjusting your search or filters." />
            )}
          </motion.div>
        )}

        {!loading && view === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card overflow-hidden"
          >
            <div className="p-4 flex items-center justify-between border-b border-cream-200 dark:border-ink-800">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors">
                <ChevronLeft className="w-5 h-5 text-ink-600 dark:text-cream-300" />
              </button>
              <h3 className="text-lg font-semibold text-ink-900 dark:text-cream-100">{monthName}</h3>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors">
                <ChevronRight className="w-5 h-5 text-ink-600 dark:text-cream-300" />
              </button>
            </div>
            <div className="grid grid-cols-7 border-b border-cream-200 dark:border-ink-800">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="p-2 text-center text-xs font-semibold text-ink-500 dark:text-cream-400/70">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] p-1 border-b border-r border-cream-200 dark:border-ink-800" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayApts = getAppointmentsForDay(day)
                return (
                  <div
                    key={day}
                    className="min-h-[80px] p-1 border-b border-r border-cream-200 dark:border-ink-800 hover:bg-cream-100/60 dark:hover:bg-ink-800/30 transition-colors"
                  >
                    <span className="text-xs font-medium text-ink-600 dark:text-cream-300">{day}</span>
                    <div className="space-y-0.5 mt-1">
                      {dayApts.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className={`text-[10px] px-1 py-0.5 rounded truncate cursor-pointer ${
                            apt.status === 'confirmed' ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300' :
                            apt.status === 'pending' ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-300' :
                            apt.status === 'rejected' || apt.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                            'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          }`}
                          onClick={() => setSelectedApt(apt)}
                        >
                          {apt.time} {(apt.patient_name || apt.patientName || 'P').split(' ')[0]}
                        </div>
                      ))}
                      {dayApts.length > 2 && (
                        <span className="text-[10px] text-primary-700 dark:text-primary-300">+{dayApts.length - 2} more</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        <Modal
          open={!!selectedApt}
          onClose={() => setSelectedApt(null)}
          title="Appointment Details"
        >
          {selectedApt && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={selectedApt.patient_name || selectedApt.patientName || 'Patient'} size="lg" />
                <div>
                  <p className="text-lg font-semibold text-ink-900 dark:text-cream-100">{selectedApt.patient_name || selectedApt.patientName || 'Patient'}</p>
                  <Badge className={statusBadge(selectedApt.status)}>{statusLabel(selectedApt.status)}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-cream-100 dark:bg-ink-800 rounded-xl p-3">
                  <p className="text-xs text-ink-500 dark:text-cream-400/70">Date</p>
                  <p className="text-sm font-medium text-ink-900 dark:text-cream-100">{selectedApt.date}</p>
                </div>
                <div className="bg-cream-100 dark:bg-ink-800 rounded-xl p-3">
                  <p className="text-xs text-ink-500 dark:text-cream-400/70">Time</p>
                  <p className="text-sm font-medium text-ink-900 dark:text-cream-100">{selectedApt.time}</p>
                </div>
                {selectedApt.clinic && (
                  <div className="bg-cream-100 dark:bg-ink-800 rounded-xl p-3 col-span-2">
                    <p className="text-xs text-ink-500 dark:text-cream-400/70">Clinic</p>
                    <p className="text-sm font-medium text-ink-900 dark:text-cream-100">{selectedApt.clinic}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-ink-700 dark:text-cream-200 mb-1">Reason</p>
                <p className="text-sm text-ink-600 dark:text-cream-400/70 bg-cream-100 dark:bg-ink-800 rounded-xl p-3">{selectedApt.reason || 'Not provided'}</p>
              </div>
              {selectedApt.notes && (
                <div>
                  <p className="text-sm font-medium text-ink-700 dark:text-cream-200 mb-1">Notes</p>
                  <p className="text-sm text-ink-600 dark:text-cream-400/70 bg-cream-100 dark:bg-ink-800 rounded-xl p-3">{selectedApt.notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        <Disclaimer />
      </div>
    </DoctorLayout>
  )
}
