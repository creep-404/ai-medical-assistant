'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, ChevronLeft, ChevronRight, CalendarDays, Clock,
  X, Stethoscope, Loader2, CalendarCheck, Hourglass,
  CheckCircle2, Ban, CalendarClock
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Label } from '@/components/ui/Form'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/Feedback'
import { Disclaimer } from '@/components/ui/Disclaimer'
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
    pending: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
    confirmed: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300',
    completed: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    cancelled: 'bg-cream-200 text-ink-600 dark:bg-ink-800 dark:text-cream-300',
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
    { label: 'Total', value: stats?.total ?? 0, icon: CalendarCheck, accent: 'primary' as const },
    { label: 'Pending', value: stats?.pending ?? 0, icon: Hourglass, accent: 'accent' as const },
    { label: 'Confirmed', value: stats?.confirmed ?? 0, icon: CheckCircle2, accent: 'secondary' as const },
    { label: 'Completed', value: stats?.completed ?? 0, icon: CalendarCheck, accent: 'purple' as const },
    { label: 'Upcoming', value: stats?.upcoming ?? 0, icon: CalendarClock, accent: 'accent' as const },
    { label: 'Cancelled', value: stats?.cancelled ?? 0, icon: Ban, accent: 'rose' as const },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="heading-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-cream-100 mb-6">
            Appointments Overview
          </h1>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-cream-100 dark:bg-ink-900 rounded-2xl border border-cream-200 dark:border-ink-800 h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((s, i) => (
              <StatCard
                key={s.label}
                icon={s.icon}
                label={s.label}
                value={String(s.value)}
                accent={s.accent}
                index={i}
              />
            ))}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search by patient or doctor..." className="input-base pl-10" />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {statuses.map((s) => (
                <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1) }} className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-primary-600 text-white shadow-sm' : 'border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800'}`}>{s}</button>
              ))}
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-cream-100 dark:bg-ink-900 rounded-2xl border border-cream-200 dark:border-ink-800 p-5">
                <div className="h-4 bg-cream-200 dark:bg-ink-800 rounded w-1/3 mb-3" />
                <div className="h-3 bg-cream-200 dark:bg-ink-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {paginated.length === 0 ? (
              <EmptyState icon={<CalendarDays className="h-7 w-7" />} title="No appointments found" description="Try adjusting your search or filters." />
            ) : (
              paginated.map((apt, i) => (
                <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="card p-4 lg:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar name={apt.patient_name || apt.patientName || 'Patient'} initials={(apt.patient_name || apt.patientName || 'P').split(' ').map((n) => n[0]).join('').slice(0, 2)} size="lg" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-900 dark:text-cream-100">{apt.patient_name || apt.patientName || 'Patient'}</p>
                        <div className="flex items-center gap-1 text-xs text-ink-500 dark:text-cream-400/70 mt-0.5">
                          <Stethoscope className="w-3 h-3" /> {apt.doctor_name || 'Doctor'} {apt.doctor_specialty ? `| ${apt.doctor_specialty}` : ''}
                        </div>
                        <p className="text-xs text-ink-500 dark:text-cream-400/70 mt-0.5">{apt.reason || 'No reason provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="text-sm text-ink-600 dark:text-cream-300/70">
                        <div className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /><span>{apt.date}</span></div>
                        <div className="flex items-center gap-1.5 mt-0.5"><Clock className="w-3.5 h-3.5" /><span>{apt.time}</span></div>
                      </div>
                      <Badge className={statusBadge(apt.status)}>{statusLabel(apt.status)}</Badge>
                      <div className="flex items-center gap-2">
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && apt.status !== 'rejected' && (
                          <>
                            <Button variant="dangerGhost" size="sm" onClick={() => handleCancel(apt.id)} disabled={busy}>Cancel</Button>
                            <Button variant="outline" size="sm" onClick={() => { setRescheduleApt(apt); setRescheduleDate(''); setRescheduleTime('') }}>Reschedule</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${currentPage === page ? 'bg-primary-600 text-white shadow-sm' : 'border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-cream-300/70 hover:bg-cream-100 dark:hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}

        <Modal open={!!rescheduleApt} onClose={() => setRescheduleApt(null)} title="Reschedule Appointment">
          <p className="text-sm text-ink-500 dark:text-cream-400/70 mb-4">{rescheduleApt?.patient_name || rescheduleApt?.patientName} with {rescheduleApt?.doctor_name}</p>
          <div className="space-y-4">
            <Field>
              <Label>New Date</Label>
              <Input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
            </Field>
            <Field>
              <Label>New Time</Label>
              <Input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
            </Field>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setRescheduleApt(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleConfirmReschedule} disabled={!rescheduleDate || !rescheduleTime || busy}>
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Confirm
              </Button>
            </div>
          </div>
        </Modal>

        <Disclaimer />
      </div>
    </AdminLayout>
  )
}
