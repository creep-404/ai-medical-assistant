'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  X,
  Loader2,
  Plus,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import PatientSidebar from '@/components/patient/PatientSidebar';
import PatientHeader from '@/components/patient/PatientHeader';
import { appointmentService } from '@/services/appointment.service';

type Tab = 'Upcoming' | 'Past' | 'All';

const tabs: Tab[] = ['Upcoming', 'Past', 'All'];

function statusBadge(status: string) {
  switch (status) {
    case 'Scheduled':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Completed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Cancelled':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

interface Appointment {
  id: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
}

export default function AppointmentsPage() {
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('Upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [showReschedule, setShowReschedule] = useState<Appointment | null>(null);
  const [bookForm, setBookForm] = useState({ doctorId: '', date: '', time: '', reason: '' });
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, []);

  async function loadAppointments() {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments();
      setAppointments(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadDoctors() {
    try {
      const res = await appointmentService.getDoctors();
      setDoctors(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setDoctors([]);
    }
  }

  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') return a.status === 'Scheduled';
    return a.status === 'Completed' || a.status === 'Cancelled';
  });

  async function handleBook() {
    if (!bookForm.doctorId || !bookForm.date || !bookForm.time) return;
    setSubmitting(true);
    try {
      await appointmentService.bookAppointment({
        doctor_id: parseInt(bookForm.doctorId),
        date: bookForm.date,
        time: bookForm.time,
        reason: bookForm.reason,
      });
      setShowBooking(false);
      setBookForm({ doctorId: '', date: '', time: '', reason: '' });
      await loadAppointments();
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: number) {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancelAppointment(id);
      await loadAppointments();
    } catch {
      // handle error
    }
  }

  async function handleReschedule() {
    if (!rescheduleForm.date || !rescheduleForm.time) return;
    setSubmitting(true);
    try {
      await appointmentService.rescheduleAppointment(showReschedule!.id, rescheduleForm);
      setShowReschedule(null);
      setRescheduleForm({ date: '', time: '' });
      await loadAppointments();
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientSidebar />
      <PatientHeader onToggleDark={() => setIsDark(!isDark)} isDark={isDark} />

      <main className="lg:pl-72">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-500 mt-1">Manage your medical appointments</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowBooking(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Book New Appointment
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200 shadow-sm w-fit">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Appointment List */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No {activeTab.toLowerCase()} appointments</h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'Upcoming' ? 'You have no upcoming appointments. Book one now!' : 'No past appointments found.'}
              </p>
              {activeTab === 'Upcoming' && (
                <button
                  onClick={() => setShowBooking(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Book Appointment
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredAppointments.map((appt) => (
                  <motion.div
                    key={appt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    layout
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {appt.doctorName?.charAt(0) || 'D'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{appt.doctorName || 'Doctor'}</h3>
                          <span className="text-sm text-gray-500">• {appt.specialty || 'General'}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {appt.date ? new Date(appt.date).toLocaleDateString() : 'TBD'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {appt.time || 'TBD'}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border shrink-0 ${statusBadge(appt.status)}`}
                      >
                        {appt.status}
                      </span>
                    </div>
                    {appt.status === 'Scheduled' && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => setShowReschedule(appt)}
                          className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancel(appt.id)}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Booking Modal */}
          <AnimatePresence>
            {showBooking && (
              <Modal onClose={() => setShowBooking(false)} title="Book New Appointment">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                    <select
                      value={bookForm.doctorId}
                      onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a doctor</option>
                      {doctors.map((d: any) => (
                        <option key={d.id} value={d.id}>
                          {d.name} - {d.specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={bookForm.date}
                      onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={bookForm.time}
                      onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                    <textarea
                      value={bookForm.reason}
                      onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Brief reason for visit..."
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowBooking(false)}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBook}
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Book Appointment
                    </button>
                  </div>
                </div>
              </Modal>
            )}
          </AnimatePresence>

          {/* Reschedule Modal */}
          <AnimatePresence>
            {showReschedule && (
              <Modal onClose={() => setShowReschedule(null)} title="Reschedule Appointment">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Rescheduling appointment with <strong>{showReschedule.doctorName}</strong>
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                    <input
                      type="date"
                      value={rescheduleForm.date}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                    <input
                      type="time"
                      value={rescheduleForm.time}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowReschedule(null)}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReschedule}
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Confirm Reschedule
                    </button>
                  </div>
                </div>
              </Modal>
            )}
          </AnimatePresence>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              This application is intended for educational purposes only. It does not replace professional medical
              advice, diagnosis, or treatment. Always consult a licensed healthcare provider for serious medical
              conditions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Modal({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
