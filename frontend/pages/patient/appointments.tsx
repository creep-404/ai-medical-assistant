'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Plus, AlertTriangle } from 'lucide-react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Field, Label, Input, Select, Textarea } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/Feedback';
import { cn } from '@/lib/cn';
import { appointmentService } from '@/services/appointment.service';

type Tab = 'Upcoming' | 'Past' | 'All';

const tabs: Tab[] = ['Upcoming', 'Past', 'All'];

function statusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge variant="warning">{statusLabel(status)}</Badge>;
    case 'confirmed':
      return <Badge variant="info">{statusLabel(status)}</Badge>;
    case 'rejected':
      return <Badge variant="danger">{statusLabel(status)}</Badge>;
    case 'completed':
      return <Badge variant="success">{statusLabel(status)}</Badge>;
    case 'cancelled':
      return <Badge variant="danger">{statusLabel(status)}</Badge>;
    default:
      return <Badge variant="neutral">{statusLabel(status)}</Badge>;
  }
}

function statusLabel(status: string) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
}

interface Appointment {
  id: number;
  doctorName: string;
  doctor_name?: string;
  doctor_specialty?: string;
  specialty: string;
  clinic?: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
}

export default function AppointmentsPage() {
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
    if (activeTab === 'Upcoming') return a.status === 'pending' || a.status === 'confirmed';
    return a.status === 'completed' || a.status === 'cancelled' || a.status === 'rejected';
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
    <PatientLayout>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary-600 dark:text-primary-300">Appointments</p>
          <h1 className="heading-display text-3xl font-semibold text-ink-900 dark:text-cream-100 mt-1">
            My Appointments
          </h1>
          <p className="mt-1.5 text-ink-500 dark:text-cream-300/70">Manage your medical appointments</p>
        </div>
        <Button onClick={() => setShowBooking(true)}>
          <Plus className="h-4 w-4" />
          Book New Appointment
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-ink-900 rounded-xl p-1 border border-cream-200 dark:border-ink-800 shadow-soft w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-ink-500 dark:text-cream-300/70 hover:text-ink-900 dark:hover:text-cream-100 hover:bg-cream-100 dark:hover:bg-ink-800'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointment List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-ink-900 rounded-2xl p-5 border border-cream-200 dark:border-ink-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cream-200 dark:bg-ink-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-cream-200 dark:bg-ink-700 rounded w-1/3" />
                  <div className="h-3 bg-cream-200 dark:bg-ink-700 rounded w-1/4" />
                </div>
                <div className="h-6 bg-cream-200 dark:bg-ink-700 rounded-full w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Calendar className="h-8 w-8" />}
            title={`No ${activeTab.toLowerCase()} appointments`}
            description={
              activeTab === 'Upcoming'
                ? "You don't have any upcoming appointments. Book one now!"
                : 'No past appointments found.'
            }
            action={
              activeTab === 'Upcoming' ? (
                <Button onClick={() => setShowBooking(true)} size="sm">
                  Book Appointment
                </Button>
              ) : undefined
            }
          />
        </Card>
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
              >
                <Card className="p-5 card-hover">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {(appt.doctor_name || appt.doctorName || 'D').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-ink-900 dark:text-cream-100">
                          {appt.doctor_name || appt.doctorName || 'Doctor'}
                        </h3>
                        <span className="text-sm text-ink-400 dark:text-cream-300/60">
                          • {appt.doctor_specialty || appt.specialty || 'General'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-ink-500 dark:text-cream-300/70">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {appt.date ? new Date(appt.date).toLocaleDateString() : 'TBD'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {appt.time || 'TBD'}
                        </span>
                      </div>
                    </div>
                    {statusBadge(appt.status)}
                  </div>
                  {(appt.status === 'pending' || appt.status === 'confirmed') && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-cream-200 dark:border-ink-800">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowReschedule(appt)}
                      >
                        Reschedule
                      </Button>
                      <Button variant="dangerGhost" size="sm" onClick={() => handleCancel(appt.id)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        open={showBooking}
        onClose={() => setShowBooking(false)}
        title="Book New Appointment"
        description="Schedule a visit with one of our specialists"
      >
        <div className="space-y-4">
          <Field>
            <Label>Doctor</Label>
            <Select
              value={bookForm.doctorId}
              onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })}
            >
              <option value="">Select a doctor</option>
              {doctors.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.user?.full_name || d.name} - {d.specialty}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <Label>Date</Label>
              <Input
                type="date"
                value={bookForm.date}
                onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
              />
            </Field>
            <Field>
              <Label>Time</Label>
              <Input
                type="time"
                value={bookForm.time}
                onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
              />
            </Field>
          </div>
          <Field>
            <Label>Reason (optional)</Label>
            <Textarea
              value={bookForm.reason}
              onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
              placeholder="Brief reason for visit..."
            />
          </Field>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setShowBooking(false)}>
            Cancel
          </Button>
          <Button className="flex-1" loading={submitting} onClick={handleBook}>
            Book Appointment
          </Button>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        open={!!showReschedule}
        onClose={() => setShowReschedule(null)}
        title="Reschedule Appointment"
        description="Pick a new date and time for your visit"
      >
        <p className="text-sm text-ink-500 dark:text-cream-300/70 mb-4">
          Rescheduling appointment with{' '}
          <strong className="text-ink-900 dark:text-cream-100">
            {showReschedule?.doctor_name || showReschedule?.doctorName}
          </strong>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <Label>New Date</Label>
            <Input
              type="date"
              value={rescheduleForm.date}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
            />
          </Field>
          <Field>
            <Label>New Time</Label>
            <Input
              type="time"
              value={rescheduleForm.time}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setShowReschedule(null)}>
            Cancel
          </Button>
          <Button className="flex-1" loading={submitting} onClick={handleReschedule}>
            Confirm Reschedule
          </Button>
        </div>
      </Modal>

      {/* Disclaimer */}
      <div className="bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-accent-600 dark:text-accent-300 shrink-0 mt-0.5" />
        <p className="text-sm text-accent-800 dark:text-accent-200 leading-relaxed">
          This application is intended for educational purposes only. It does not replace professional medical
          advice, diagnosis, or treatment. Always consult a licensed healthcare provider for serious medical
          conditions.
        </p>
      </div>
    </PatientLayout>
  );
}
