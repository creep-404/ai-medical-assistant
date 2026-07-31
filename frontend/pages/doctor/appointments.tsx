'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, Search, Filter, Clock, User, MapPin,
  CheckCircle, XCircle, Calendar, ChevronLeft, ChevronRight,
  AlertTriangle, Stethoscope, FileText
} from 'lucide-react'
import DoctorSidebar from '@/components/doctor/DoctorSidebar'
import DoctorHeader from '@/components/doctor/DoctorHeader'

interface Appointment {
  id: number
  patientName: string
  age: number
  gender: string
  time: string
  date: string
  reason: string
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'
  type: string
  notes: string
}

const allAppointments: Appointment[] = [
  { id: 1, patientName: 'Sarah Johnson', age: 34, gender: 'Female', time: '9:00 AM', date: '2026-07-30', reason: 'Regular Checkup - Annual physical examination', status: 'Confirmed', type: 'Checkup', notes: 'Patient has history of mild hypertension' },
  { id: 2, patientName: 'Michael Chen', age: 45, gender: 'Male', time: '10:30 AM', date: '2026-07-30', reason: 'Heart Palpitations - Irregular heartbeat noticed', status: 'Confirmed', type: 'Consultation', notes: 'ECG recommended' },
  { id: 3, patientName: 'Emily Davis', age: 28, gender: 'Female', time: '11:00 AM', date: '2026-07-30', reason: 'Follow-up - Post treatment evaluation', status: 'Pending', type: 'Follow-up', notes: 'Previous diagnosis: Migraine' },
  { id: 4, patientName: 'James Wilson', age: 52, gender: 'Male', time: '1:30 PM', date: '2026-07-30', reason: 'Chest Pain - Discomfort in chest area', status: 'Confirmed', type: 'Emergency', notes: 'Urgent - Possible angina' },
  { id: 5, patientName: 'Lisa Anderson', age: 39, gender: 'Female', time: '3:00 PM', date: '2026-07-30', reason: 'Cardio Consultation - Heart health review', status: 'Cancelled', type: 'Consultation', notes: 'Rescheduled to next week' },
  { id: 6, patientName: 'David Thompson', age: 58, gender: 'Male', time: '4:30 PM', date: '2026-07-30', reason: 'Blood Pressure Check', status: 'Confirmed', type: 'Checkup', notes: 'Ongoing hypertension management' },
  { id: 7, patientName: 'Maria Garcia', age: 31, gender: 'Female', time: '9:30 AM', date: '2026-07-31', reason: 'Prenatal Checkup', status: 'Pending', type: 'Checkup', notes: 'First trimester screening' },
  { id: 8, patientName: 'Robert Kim', age: 48, gender: 'Male', time: '2:00 PM', date: '2026-07-31', reason: 'Stress Test Results Review', status: 'Confirmed', type: 'Follow-up', notes: ' Review stress test outcomes' },
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

export default function AppointmentsPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')

  const statuses = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled']

  const filtered = allAppointments.filter((a) => {
    const matchSearch = a.patientName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleAccept = (id: number) => {
    console.log('Accept', id)
  }
  const handleReject = (id: number) => {
    console.log('Reject', id)
  }
  const handleCancel = (id: number) => {
    console.log('Cancel', id)
  }

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return allAppointments.filter((a) => a.date === dateStr)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DoctorSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <DoctorHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
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

          {view === 'list' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
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
                        {apt.patientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{apt.patientName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{apt.age} yrs | {apt.gender} | {apt.type}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{apt.reason}</p>
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
                        {apt.status}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {apt.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleAccept(apt.id)}
                              className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                              title="Accept"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(apt.id)}
                              className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {apt.status === 'Confirmed' && (
                          <button
                            onClick={() => handleCancel(apt.id)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => { setRescheduleApt(apt); setRescheduleDate(''); setRescheduleTime('') }}
                          className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => setSelectedApt(apt)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
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
          ) : (
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
                              apt.status === 'Confirmed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                              apt.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                              apt.status === 'Cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                              'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            }`}
                            onClick={() => setSelectedApt(apt)}
                          >
                            {apt.time} {apt.patientName.split(' ')[0]}
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
                          {selectedApt.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedApt.patientName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedApt.age} yrs | {selectedApt.gender}</p>
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
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedApt.type}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1 ${statusBadge(selectedApt.status)}`}>{selectedApt.status}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">{selectedApt.reason}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medical Notes</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">{selectedApt.notes}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-start gap-2">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Patient has been visiting for 2 years. Previous diagnoses include mild hypertension and seasonal allergies.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {rescheduleApt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                onClick={() => setRescheduleApt(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Reschedule Appointment</h2>
                      <button onClick={() => setRescheduleApt(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <XCircle className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Reschedule for {rescheduleApt.patientName}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Date</label>
                        <input
                          type="date"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Time</label>
                        <input
                          type="time"
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setRescheduleApt(null)}
                          className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => { console.log('Reschedule', rescheduleApt.id, rescheduleDate, rescheduleTime); setRescheduleApt(null) }}
                          disabled={!rescheduleDate || !rescheduleTime}
                          className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Confirm
                        </button>
                      </div>
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
