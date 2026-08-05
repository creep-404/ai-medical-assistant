'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users, CalendarDays, Clock, CheckCircle, ArrowRight, StickyNote,
  BarChart3, Activity, ChevronRight, AlertTriangle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { DoctorLayout } from '@/components/layout/DoctorLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Disclaimer } from '@/components/ui/Disclaimer'

const stats = [
  { label: 'Total Patients', value: '1,247', change: '+12%', icon: Users, accent: 'primary' as const },
  { label: "Today's Appointments", value: '18', change: '+4', icon: CalendarDays, accent: 'secondary' as const },
  { label: 'Pending Reviews', value: '7', change: '-2', icon: Clock, accent: 'accent' as const },
  { label: 'Completed Consultations', value: '1,892', change: '+8%', icon: CheckCircle, accent: 'purple' as const },
]

const todaysAppointments = [
  { name: 'Sarah Johnson', time: '9:00 AM', reason: 'Regular Checkup', status: 'Confirmed', avatar: 'SJ' },
  { name: 'Michael Chen', time: '10:30 AM', reason: 'Heart Palpitations', status: 'Confirmed', avatar: 'MC' },
  { name: 'Emily Davis', time: '11:00 AM', reason: 'Follow-up', status: 'Pending', avatar: 'ED' },
  { name: 'James Wilson', time: '1:30 PM', reason: 'Chest Pain', status: 'Confirmed', avatar: 'JW' },
  { name: 'Lisa Anderson', time: '3:00 PM', reason: 'Cardio Consultation', status: 'Cancelled', avatar: 'LA' },
  { name: 'David Thompson', time: '4:30 PM', reason: 'Blood Pressure', status: 'Confirmed', avatar: 'DT' },
]

const recentPatients = [
  { name: 'Sarah Johnson', age: 34, gender: 'Female', condition: 'Hypertension', lastVisit: '2 days ago', avatar: 'SJ' },
  { name: 'Michael Chen', age: 45, gender: 'Male', condition: 'Arrhythmia', lastVisit: '5 days ago', avatar: 'MC' },
  { name: 'Emily Davis', age: 28, gender: 'Female', condition: 'Migraine', lastVisit: '1 week ago', avatar: 'ED' },
  { name: 'James Wilson', age: 52, gender: 'Male', condition: 'Angina', lastVisit: '3 days ago', avatar: 'JW' },
  { name: 'Lisa Anderson', age: 39, gender: 'Female', condition: 'Cardiomyopathy', lastVisit: '1 week ago', avatar: 'LA' },
]

const quickActions = [
  { label: 'View Schedule', icon: CalendarDays, href: '/doctor/appointments', accent: 'primary' as const },
  { label: 'Add Medical Notes', icon: StickyNote, href: '/doctor/medical-notes', accent: 'secondary' as const },
  { label: 'View Analytics', icon: BarChart3, href: '/doctor/analytics', accent: 'purple' as const },
]

const demographicsData = [
  { name: '18-30', value: 25, color: '#21816d' },
  { name: '31-45', value: 35, color: '#16a34a' },
  { name: '46-60', value: 25, color: '#d9a441' },
  { name: '60+', value: 15, color: '#e11d48' },
]

const trendsData = [
  { month: 'Jan', appointments: 45, consultations: 38 },
  { month: 'Feb', appointments: 52, consultations: 42 },
  { month: 'Mar', appointments: 48, consultations: 40 },
  { month: 'Apr', appointments: 61, consultations: 55 },
  { month: 'May', appointments: 55, consultations: 48 },
  { month: 'Jun', appointments: 68, consultations: 58 },
  { month: 'Jul', appointments: 72, consultations: 62 },
]

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Confirmed: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300',
    Pending: 'bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-300',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  }
  return styles[status] || styles.Pending
}

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState(0)

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="heading-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-cream-100">
            Doctor Dashboard
          </h1>
          <p className="text-sm text-ink-500 dark:text-cream-400/70 mt-1">
            Welcome back, here&apos;s what&apos;s happening today.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              delta={parseFloat(stat.change)}
              accent={stat.accent}
              index={i}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card lg:col-span-2 overflow-hidden"
          >
            <div className="p-5 border-b border-cream-200 dark:border-ink-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100">Today&apos;s Schedule</h2>
              <Link href="/doctor/appointments" className="text-sm font-semibold text-primary-700 dark:text-primary-300 hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-cream-200 dark:divide-ink-800">
              {todaysAppointments.map((apt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 hover:bg-cream-100/60 dark:hover:bg-ink-800/40 transition-colors"
                >
                  <Avatar name={apt.name} initials={apt.avatar} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 dark:text-cream-100 truncate">{apt.name}</p>
                    <p className="text-xs text-ink-500 dark:text-cream-400/70">{apt.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-ink-700 dark:text-cream-200">{apt.time}</p>
                    <Badge className={`mt-1 ${statusBadge(apt.status)}`}>{apt.status}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card overflow-hidden"
          >
            <div className="p-5 border-b border-cream-200 dark:border-ink-800">
              <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100">Recent Patients</h2>
            </div>
            <div className="p-4 space-y-3">
              {recentPatients.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedPatient(i)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedPatient === i
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-cream-100/60 dark:hover:bg-ink-800/40 border border-transparent'
                  }`}
                >
                  <Avatar name={p.name} initials={p.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 dark:text-cream-100">{p.name}</p>
                    <p className="text-xs text-ink-500 dark:text-cream-400/70">{p.age} yrs | {p.condition}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-400 flex-shrink-0" />
                </motion.div>
              ))}
            </div>
            <div className="p-3 border-t border-cream-200 dark:border-ink-800">
              <Link
                href="/doctor/patients"
                className="flex items-center justify-center gap-1 text-sm font-semibold text-primary-700 dark:text-primary-300 hover:underline"
              >
                View All Patients <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Link
                href={action.href}
                className="flex items-center gap-4 p-4 card card-hover group"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    action.accent === 'primary'
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300'
                      : action.accent === 'secondary'
                        ? 'bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-300'
                        : 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                  }`}
                >
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-900 dark:text-cream-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                    {action.label}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-ink-400 group-hover:text-primary-600 transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-5"
          >
            <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600 dark:text-primary-300" /> Patient Demographics
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={demographicsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {demographicsData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {demographicsData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-ink-500 dark:text-cream-400/70">{d.name}</span>
                    <span className="text-sm font-medium text-ink-900 dark:text-cream-100">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="card p-5"
          >
            <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent-600 dark:text-accent-300" /> Appointment Trends
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cdd8d4" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#7f9b94" />
                <YAxis tick={{ fontSize: 12 }} stroke="#7f9b94" />
                <Tooltip />
                <Bar dataKey="appointments" fill="#21816d" radius={[4, 4, 0, 0]} name="Appointments" />
                <Bar dataKey="consultations" fill="#d9a441" radius={[4, 4, 0, 0]} name="Consultations" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <Disclaimer />
      </div>
    </DoctorLayout>
  )
}
