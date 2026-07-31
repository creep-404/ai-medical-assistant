'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Calendar,
  Bell,
  FileText,
  ChevronRight,
  Activity,
  Droplets,
  Target,
  Thermometer,
  Pill,
  AlertTriangle,
  Search,
} from 'lucide-react';
import PatientSidebar from '@/components/patient/PatientSidebar';
import PatientHeader from '@/components/patient/PatientHeader';
import { medicalService } from '@/services/medical.service';
import { appointmentService } from '@/services/appointment.service';
import { useAuth } from '@/hooks/useAuth';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 20, stiffness: 200 },
  },
};

const statCards = [
  { label: 'Total Diagnoses', value: '--', icon: Activity, color: 'blue', desc: 'All time predictions' },
  { label: 'Upcoming Appointments', value: '--', icon: Calendar, color: 'green', desc: 'Next 7 days' },
  { label: 'Active Reminders', value: '--', icon: Bell, color: 'purple', desc: 'Medicine alerts' },
  { label: 'Pending Reports', value: '--', icon: FileText, color: 'orange', desc: 'Awaiting review' },
];

const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-500' },
  green: { bg: 'bg-green-50', text: 'text-green-700', iconBg: 'bg-green-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', iconBg: 'bg-orange-500' },
};

function confidenceColor(score: number) {
  if (score >= 80) return 'bg-green-100 text-green-700 border-green-200';
  if (score >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

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

export default function PatientDashboard() {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [stats, setStats] = useState({ diagnoses: 0, appointments: 0, reminders: 0, reports: 0 });
  const [recentDiagnoses, setRecentDiagnoses] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [healthSummary, setHealthSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [diagRes, apptRes] = await Promise.allSettled([
          medicalService.getPredictionHistory(),
          appointmentService.getAppointments(),
        ]);

        const diagData = diagRes.status === 'fulfilled' ? diagRes.value : null;
        const apptData = apptRes.status === 'fulfilled' ? apptRes.value : null;
        const diagnoses = Array.isArray(diagData?.data) ? diagData.data : Array.isArray(diagData) ? diagData : [];
        const appointments = Array.isArray(apptData?.data) ? apptData.data : Array.isArray(apptData) ? apptData : [];

        setRecentDiagnoses(diagnoses.slice(0, 3));
        setUpcomingAppointments(appointments.slice(0, 4));
        setStats({
          diagnoses: diagnoses.length,
          appointments: appointments.length,
          reminders: 0,
          reports: 0,
        });

        setHealthSummary({
          bmi: 22.5,
          waterGoal: 2.5,
          nextAppointment: appointments[0]?.date || null,
        });
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const displayStats = statCards.map((card) => ({
    ...card,
    value:
      card.label === 'Total Diagnoses'
        ? stats.diagnoses
        : card.label === 'Upcoming Appointments'
        ? stats.appointments
        : card.label === 'Active Reminders'
        ? stats.reminders
        : stats.reports,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientSidebar />
      <PatientHeader onToggleDark={() => setIsDark(!isDark)} isDark={isDark} />

      <main className="lg:pl-72">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {displayStats.map((card) => {
              const colors = colorMap[card.color];
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  variants={itemVariants}
                  whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${colors.iconBg} p-2.5 rounded-xl`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{card.value}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{card.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{card.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Diagnoses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Recent Diagnoses
                </h3>
                <Link
                  href="/patient/history"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-5 space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                      <div className="w-10 h-10 rounded-lg bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  ))
                ) : recentDiagnoses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Stethoscope className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No diagnoses yet. Use the Symptom Checker to get started.</p>
                  </div>
                ) : (
                  recentDiagnoses.map((d: any, i: number) => (
                    <motion.div
                      key={d.id || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Thermometer className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{d.disease || d.predictedDisease}</p>
                        <p className="text-sm text-gray-500">{d.date ? new Date(d.date).toLocaleDateString() : ''}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${confidenceColor(d.confidence || 0)}`}
                      >
                        {d.confidence ? `${Math.round(d.confidence)}%` : '--'}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Health Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Health Summary
                </h3>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">BMI</p>
                    <p className="text-xl font-bold text-gray-900">{healthSummary?.bmi?.toFixed(1) || '--'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Water Goal</p>
                    <p className="text-xl font-bold text-gray-900">{healthSummary?.waterGoal || '--'}L</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Appointment</p>
                    <p className="text-xl font-bold text-gray-900">
                      {healthSummary?.nextAppointment
                        ? new Date(healthSummary.nextAppointment).toLocaleDateString()
                        : 'None'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Upcoming Appointments + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Upcoming Appointments
                </h3>
                <Link
                  href="/patient/appointments"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Manage <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-5 space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/5" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No upcoming appointments.</p>
                    <Link href="/patient/appointments" className="text-blue-600 font-medium text-sm mt-1 inline-block">
                      Book one now
                    </Link>
                  </div>
                ) : (
                  upcomingAppointments.map((a: any, i: number) => (
                    <motion.div
                      key={a.id || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {a.doctorName?.charAt(0) || 'D'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{a.doctorName || 'Doctor'}</p>
                        <p className="text-sm text-gray-500">
                          {a.date ? new Date(a.date).toLocaleDateString() : ''} at {a.time || ''}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBadge(a.status)}`}
                      >
                        {a.status || 'Scheduled'}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-5 space-y-3">
                <Link href="/patient/symptom-checker">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-left"
                  >
                    <Search className="w-5 h-5" />
                    <div>
                      <p className="font-semibold text-sm">Check Symptoms</p>
                      <p className="text-xs text-blue-500">AI-powered analysis</p>
                    </div>
                  </motion.button>
                </Link>
                <Link href="/patient/appointments">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-left"
                  >
                    <Calendar className="w-5 h-5" />
                    <div>
                      <p className="font-semibold text-sm">Book Appointment</p>
                      <p className="text-xs text-green-500">Schedule a visit</p>
                    </div>
                  </motion.button>
                </Link>
                <Link href="/patient/reports">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-left"
                  >
                    <FileText className="w-5 h-5" />
                    <div>
                      <p className="font-semibold text-sm">Download Reports</p>
                      <p className="text-xs text-purple-500">Export medical data</p>
                    </div>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              This application is intended for educational purposes only. It does not replace professional medical
              advice, diagnosis, or treatment. Always consult a licensed healthcare provider for serious medical
              conditions.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

