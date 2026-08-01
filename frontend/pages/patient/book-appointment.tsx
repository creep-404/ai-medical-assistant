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
} from 'lucide-react';
import PatientSidebar from '@/components/patient/PatientSidebar';
import PatientHeader from '@/components/patient/PatientHeader';
import { appointmentService } from '@/services/appointment.service';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function BookAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [isDark, setIsDark] = useState(false);
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
    <div className="min-h-screen bg-gray-50">
      <PatientSidebar />
      <PatientHeader onToggleDark={() => setIsDark(!isDark)} isDark={isDark} />

      <main className="lg:pl-72">
        <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Book New Appointment</h1>
            <p className="text-gray-500 mt-1">Fill in the details below to schedule your visit</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Appointment Details</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Booked for <strong>{user?.full_name || 'Patient'}</strong>
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" /> Patient Name
                </label>
                <input
                  type="text"
                  value={user?.full_name || ''}
                  disabled
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-blue-600" /> Doctor
                </label>
                {loadingDoctors ? (
                  <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
                ) : (
                  <select
                    value={form.doctorId}
                    onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.user?.full_name || d.name} - {d.specialty}
                        {d.hospital_name ? ` (${d.hospital_name})` : ''}
                      </option>
                    ))}
                  </select>
                )}
                {querySpecialty && (
                  <p className="text-xs text-blue-600 mt-1.5">Recommended specialty: {querySpecialty}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" /> Clinic / Hospital
                </label>
                <input
                  type="text"
                  value={form.clinic}
                  onChange={(e) => setForm({ ...form, clinic: e.target.value })}
                  placeholder="e.g. City General Hospital"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" /> Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" /> Time
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Visit (optional)</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={2}
                  placeholder="Brief reason for the visit..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Any additional notes for the doctor..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => router.push('/patient/appointments')}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Booking
                </motion.button>
              </div>
            </div>
          </motion.div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              Your appointment will be sent to the doctor for confirmation. This application is for educational
              purposes only.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
