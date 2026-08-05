'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Loader2,
  Stethoscope,
  Building2,
  ArrowLeft,
  AlertTriangle,
  User,
  CalendarPlus,
} from 'lucide-react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select, Textarea } from '@/components/ui/Form';
import { appointmentService } from '@/services/appointment.service';
import { useAuth } from '@/hooks/useAuth';
import { useMounted } from '@/hooks/useMounted';
import toast from 'react-hot-toast';

export default function BookAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const mounted = useMounted();

  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const queryDoctorId = searchParams.get('doctor_id') || '';
  const queryClinic = searchParams.get('clinic') || '';
  const queryAddress = searchParams.get('address') || '';
  const querySpecialty = searchParams.get('specialty') || '';

  const [form, setForm] = useState({
    doctorId: '',
    clinic: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    appointmentService
      .getDoctors()
      .then((res: any) => {
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        setDoctors(list);
      })
      .catch(() => setDoctors([]))
      .finally(() => setLoadingDoctors(false));
  }, []);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      doctorId: queryDoctorId || prev.doctorId,
      clinic: queryClinic || queryAddress || prev.clinic,
    }));
  }, [queryDoctorId, queryClinic, queryAddress]);

  async function handleSubmit() {
    if (!form.doctorId || !form.date || !form.time) {
      toast.error('Please select a doctor, date, and time.');
      return;
    }
    setSubmitting(true);
    try {
      await appointmentService.bookAppointment({
        doctor_id: parseInt(form.doctorId),
        date: form.date,
        time: form.time,
        reason: form.reason,
        notes: form.notes,
        clinic: form.clinic,
      });
      toast.success('Appointment booked successfully!');
      router.push('/patient/appointments');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to book appointment. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PatientLayout>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-cream-300/70 hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div>
        <p className="text-sm font-medium text-primary-600 dark:text-primary-300">Scheduling</p>
        <h1 className="heading-display text-3xl font-semibold text-ink-900 dark:text-cream-100 mt-1">
          Book New Appointment
        </h1>
        <p className="mt-1.5 text-ink-500 dark:text-cream-300/70">Fill in the details below to schedule your visit</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl"
      >
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-cream-200 dark:border-ink-800">
            <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100">Appointment Details</h2>
            <p className="text-sm text-ink-500 dark:text-cream-300/70 mt-0.5">
              Booked for <strong className="text-ink-900 dark:text-cream-100">{user?.full_name || 'Patient'}</strong>
            </p>
          </div>

          <div className="p-6 space-y-5">
            <Field>
              <Label className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary-600 dark:text-primary-300" /> Patient Name
              </Label>
              <Input
                type="text"
                value={user?.full_name || ''}
                disabled
                className="bg-cream-100 dark:bg-ink-800 text-ink-500 dark:text-cream-300/70"
              />
            </Field>

            <Field>
              <Label className="flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-primary-600 dark:text-primary-300" /> Doctor
              </Label>
              {loadingDoctors ? (
                <div className="h-11 bg-cream-100 dark:bg-ink-800 rounded-xl animate-pulse" />
              ) : (
                <Select
                  value={form.doctorId}
                  onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.user?.full_name || d.name} - {d.specialty}
                      {d.hospital_name ? ` (${d.hospital_name})` : ''}
                    </option>
                  ))}
                </Select>
              )}
              {querySpecialty && (
                <p className="text-xs text-primary-600 dark:text-primary-300 mt-1.5">
                  Recommended specialty: {querySpecialty}
                </p>
              )}
            </Field>

            <Field>
              <Label className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary-600 dark:text-primary-300" /> Clinic / Hospital
              </Label>
              <Input
                type="text"
                value={form.clinic}
                onChange={(e) => setForm({ ...form, clinic: e.target.value })}
                placeholder="e.g. City General Hospital"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <Label className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-300" /> Date
                </Label>
                <Input
                  type="date"
                  value={form.date}
                  min={mounted ? new Date().toISOString().split('T')[0] : undefined}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Field>
              <Field>
                <Label className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary-600 dark:text-primary-300" /> Time
                </Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </Field>
            </div>

            <Field>
              <Label>Reason for Visit (optional)</Label>
              <Textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Brief reason for the visit..."
                className="min-h-[64px]"
              />
            </Field>

            <Field>
              <Label>Notes (optional)</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional notes for the doctor..."
              />
            </Field>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/patient/appointments')}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                loading={submitting}
                onClick={handleSubmit}
              >
                {!submitting && <CalendarPlus className="h-4 w-4" />}
                Confirm Booking
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-2xl p-4 flex items-start gap-3 max-w-3xl">
        <AlertTriangle className="h-5 w-5 text-accent-600 dark:text-accent-300 shrink-0 mt-0.5" />
        <p className="text-sm text-accent-800 dark:text-accent-200 leading-relaxed">
          Your appointment will be sent to the doctor for confirmation. This application is for educational
          purposes only.
        </p>
      </div>
    </PatientLayout>
  );
}
