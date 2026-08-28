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
  Search,
  AlertTriangle,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
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
  { label: 'Total Diagnoses', value: '--', icon: Activity, desc: 'All time predictions', accent: 'text-primary-600 bg-primary-50 dark:text-primary-300 dark:bg-primary-900/30' },
  { label: 'Upcoming Appointments', value: '--', icon: Calendar, desc: 'Next 7 days', accent: 'text-secondary-600 bg-secondary-50 dark:text-secondary-300 dark:bg-secondary-900/30' },
  { label: 'Active Reminders', value: '--', icon: Bell, desc: 'Medicine alerts', accent: 'text-purple-600 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30' },
  { label: 'Pending Reports', value: '--', icon: FileText, desc: 'Awaiting review', accent: 'text-accent-600 bg-accent-50 dark:text-accent-300 dark:bg-accent-900/30' },
];

function confidenceBadge(score: number) {
  if (score >= 80) return <Badge variant="success">{Math.round(score)}%</Badge>;
  if (score >= 50) return <Badge variant="warning">{Math.round(score)}%</Badge>;
  return <Badge variant="danger">{Math.round(score)}%</Badge>;
}

function statusBadge(status: string) {
  switch (status) {
    case 'Scheduled':
      return <Badge variant="info">{status}</Badge>;
    case 'Completed':
      return <Badge variant="success">{status}</Badge>;
    case 'Cancelled':
      return <Badge variant="danger">{status}</Badge>;
    default:
      return <Badge>{status || 'Scheduled'}</Badge>;
  }
}

export default function PatientDashboard() {
  const { user } = useAuth();
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
    <PatientLayout>
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary-600 dark:text-primary-300">Welcome back</p>
          <h1 className="heading-display text-3xl sm:text-4xl font-semibold text-ink-900 dark:text-cream-100 mt-1">
            Your health, <span className="text-gradient-primary italic">in one place</span>
          </h1>
          <p className="mt-2 text-ink-500 dark:text-cream-300/70">
            Track diagnoses, appointments and reminders — all from a single dashboard.
          </p>
        </div>
        <Link href="/patient/symptom-checker">
          <Button className="w-full sm:w-auto">
            <Sparkles className="h-4 w-4" />
            Check Symptoms
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {displayStats.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={itemVariants}>
              <Card className="p-5 sm:p-6 card-hover">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${card.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-bold tracking-tight text-ink-900 dark:text-cream-100">
                    {card.value}
                  </span>
                </div>
                <p className="mt-4 text-sm font-semibold text-ink-900 dark:text-cream-100">{card.label}</p>
                <p className="text-xs text-ink-400 dark:text-cream-300/60 mt-0.5">{card.desc}</p>
              </Card>
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
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                Recent Diagnoses
              </CardTitle>
              <Link
                href="/patient/history"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-300 font-medium flex items-center gap-1"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-3 rounded-xl bg-cream-100 dark:bg-ink-800">
                      <div className="w-10 h-10 rounded-lg bg-cream-200 dark:bg-ink-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-cream-200 dark:bg-ink-700 rounded w-1/3" />
                        <div className="h-3 bg-cream-200 dark:bg-ink-700 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentDiagnoses.length === 0 ? (
                <EmptyState
                  icon={<Stethoscope className="h-8 w-8" />}
                  title="No diagnoses yet"
                  description="Use the Symptom Checker to get started with your first AI-powered analysis."
                  action={
                    <Link href="/patient/symptom-checker">
                      <Button size="sm">Try Symptom Checker</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {recentDiagnoses.map((d: any, i: number) => (
                    <motion.div
                      key={d.id || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                        <Thermometer className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink-900 dark:text-cream-100 truncate">
                          {d.disease || d.predictedDisease}
                        </p>
                        <p className="text-sm text-ink-400 dark:text-cream-300/60">
                          {d.date ? new Date(d.date).toLocaleDateString() : ''}
                        </p>
                      </div>
                      {d.confidence ? confidenceBadge(d.confidence) : <Badge variant="neutral">--</Badge>}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Health Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                Health Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-cream-100 dark:bg-ink-800">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary-600 dark:text-primary-300" />
                </div>
                <div>
                  <p className="text-sm text-ink-400 dark:text-cream-300/60">BMI</p>
                  <p className="text-xl font-bold text-ink-900 dark:text-cream-100">
                    {healthSummary?.bmi?.toFixed(1) || '--'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-cream-100 dark:bg-ink-800">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm text-ink-400 dark:text-cream-300/60">Water Goal</p>
                  <p className="text-xl font-bold text-ink-900 dark:text-cream-100">
                    {healthSummary?.waterGoal || '--'}L
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-cream-100 dark:bg-ink-800">
                <div className="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-accent-600 dark:text-accent-300" />
                </div>
                <div>
                  <p className="text-sm text-ink-400 dark:text-cream-300/60">Next Appointment</p>
                  <p className="text-xl font-bold text-ink-900 dark:text-cream-100">
                    {healthSummary?.nextAppointment
                      ? new Date(healthSummary.nextAppointment).toLocaleDateString()
                      : 'None'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Appointments + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                Upcoming Appointments
              </CardTitle>
              <Link
                href="/patient/appointments"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-300 font-medium flex items-center gap-1"
              >
                Manage <ChevronRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-3 rounded-xl bg-cream-100 dark:bg-ink-800">
                      <div className="w-10 h-10 rounded-full bg-cream-200 dark:bg-ink-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-cream-200 dark:bg-ink-700 rounded w-2/5" />
                        <div className="h-3 bg-cream-200 dark:bg-ink-700 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <EmptyState
                  icon={<Calendar className="h-8 w-8" />}
                  title="No upcoming appointments"
                  description="Book a visit with a specialist whenever you're ready."
                  action={
                    <Link href="/patient/appointments">
                      <Button size="sm">Book one now</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {upcomingAppointments.map((a: any, i: number) => (
                    <motion.div
                      key={a.id || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {a.doctorName?.charAt(0) || 'D'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink-900 dark:text-cream-100 truncate">
                          {a.doctorName || 'Doctor'}
                        </p>
                        <p className="text-sm text-ink-400 dark:text-cream-300/60">
                          {a.date ? new Date(a.date).toLocaleDateString() : ''} at {a.time || ''}
                        </p>
                      </div>
                      {statusBadge(a.status)}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/chat">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/30 dark:to-purple-900/30 text-primary-700 dark:text-primary-200 hover:from-primary-100 hover:to-purple-100 dark:hover:from-primary-900/50 dark:hover:to-purple-900/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Medi AI Assistant</p>
                    <p className="text-xs text-primary-500 dark:text-primary-300/70">Chat with your health AI</p>
                  </div>
                </motion.button>
              </Link>
              <Link href="/patient/symptom-checker">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors text-left"
                >
                  <Search className="h-5 w-5" />
                  <div>
                    <p className="font-semibold text-sm">Check Symptoms</p>
                    <p className="text-xs text-primary-500 dark:text-primary-300/70">AI-powered analysis</p>
                  </div>
                </motion.button>
              </Link>
              <Link href="/patient/appointments">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-900/50 transition-colors text-left"
                >
                  <Calendar className="h-5 w-5" />
                  <div>
                    <p className="font-semibold text-sm">Book Appointment</p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-300/70">Schedule a visit</p>
                  </div>
                </motion.button>
              </Link>
              <Link href="/patient/reports">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors text-left"
                >
                  <FileText className="h-5 w-5" />
                  <div>
                    <p className="font-semibold text-sm">Download Reports</p>
                    <p className="text-xs text-purple-500 dark:text-purple-300/70">Export medical data</p>
                  </div>
                </motion.button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-2xl p-4 flex items-start gap-3"
      >
        <AlertTriangle className="h-5 w-5 text-accent-600 dark:text-accent-300 shrink-0 mt-0.5" />
        <p className="text-sm text-accent-800 dark:text-accent-200 leading-relaxed">
          This application is intended for educational purposes only. It does not replace professional medical
          advice, diagnosis, or treatment. Always consult a licensed healthcare provider for serious medical
          conditions.
        </p>
      </motion.div>
    </PatientLayout>
  );
}
