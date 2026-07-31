'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users, CalendarDays, Clock, CheckCircle, ArrowRight, StickyNote,
  BarChart3, Activity, ChevronRight, User, AlertTriangle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import DoctorSidebar from '@/components/doctor/DoctorSidebar'
import DoctorHeader from '@/components/doctor/DoctorHeader'

const stats = [
  { label: 'Total Patients', value: '1,247', change: '+12%', icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: "Today's Appointments", value: '18', change: '+4', icon: CalendarDays, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'Pending Reviews', value: '7', change: '-2', icon: Clock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { label: 'Completed Consultations', value: '1,892', change: '+8%', icon: CheckCircle, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
]

const todaysAppointments = [
  { name: 'Sarah Johnson', time: '9:00 AM', reason: 'Regular Checkup', status: 'Confirmed', avatar: 'SJ', color: 'from-pink-400 to-rose-400' },
  { name: 'Michael Chen', time: '10:30 AM', reason: 'Heart Palpitations', status: 'Confirmed', avatar: 'MC', color: 'from-blue-400 to-cyan-400' },
  { name: 'Emily Davis', time: '11:00 AM', reason: 'Follow-up', status: 'Pending', avatar: 'ED', color: 'from-emerald-400 to-green-400' },
  { name: 'James Wilson', time: '1:30 PM', reason: 'Chest Pain', status: 'Confirmed', avatar: 'JW', color: 'from-amber-400 to-orange-400' },
  { name: 'Lisa Anderson', time: '3:00 PM', reason: 'Cardio Consultation', status: 'Cancelled', avatar: 'LA', color: 'from-red-400 to-rose-400' },
  { name: 'David Thompson', time: '4:30 PM', reason: 'Blood Pressure', status: 'Confirmed', avatar: 'DT', color: 'from-purple-400 to-violet-400' },
]

const recentPatients = [
  { name: 'Sarah Johnson', age: 34, gender: 'Female', condition: 'Hypertension', lastVisit: '2 days ago', avatar: 'SJ', color: 'from-pink-400 to-rose-400' },
  { name: 'Michael Chen', age: 45, gender: 'Male', condition: 'Arrhythmia', lastVisit: '5 days ago', avatar: 'MC', color: 'from-blue-400 to-cyan-400' },
  { name: 'Emily Davis', age: 28, gender: 'Female', condition: 'Migraine', lastVisit: '1 week ago', avatar: 'ED', color: 'from-emerald-400 to-green-400' },
  { name: 'James Wilson', age: 52, gender: 'Male', condition: 'Angina', lastVisit: '3 days ago', avatar: 'JW', color: 'from-amber-400 to-orange-400' },
  { name: 'Lisa Anderson', age: 39, gender: 'Female', condition: 'Cardiomyopathy', lastVisit: '1 week ago', avatar: 'LA', color: 'from-red-400 to-rose-400' },
]

const quickActions = [
  { label: 'View Schedule', icon: CalendarDays, href: '/doctor/appointments', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Add Medical Notes', icon: StickyNote, href: '/doctor/medical-notes', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'View Analytics', icon: BarChart3, href: '/doctor/analytics', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
]

const demographicsData = [
  { name: '18-30', value: 25, color: '#3b82f6' },
  { name: '31-45', value: 35, color: '#22c55e' },
  { name: '46-60', value: 25, color: '#f59e0b' },
  { name: '60+', value: 15, color: '#ef4444' },
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
    Confirmed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    Pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  }
  return styles[status] || styles.Pending
}

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DoctorSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <DoctorHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color.replace('from-', 'text-').split(' ')[0]}`} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.change.startsWith('+') ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Schedule</h2>
                <Link href="/doctor/appointments" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {todaysAppointments.map((apt, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${apt.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                      {apt.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{apt.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{apt.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{apt.time}</p>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${statusBadge(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Patients</h2>
              </div>
              <div className="p-4 space-y-3">
                {recentPatients.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedPatient(i)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedPatient === i
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${p.color} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                      {p.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{p.age} yrs | {p.condition}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href="/doctor/patients"
                  className="flex items-center justify-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
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
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group"
                >
                  <div className={`p-3 rounded-lg ${action.bg}`}>
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {action.label}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patient Demographics</h2>
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
                      <span className="text-sm text-gray-600 dark:text-gray-400">{d.name}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appointment Trends</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Appointments" />
                  <Bar dataKey="consultations" fill="#22c55e" radius={[4, 4, 0, 0]} name="Consultations" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
          >
            <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
              <p>
                <strong className="text-gray-700 dark:text-gray-300">Medical Disclaimer:</strong> This application is intended for educational purposes only. It does not replace professional medical advice, diagnosis, or treatment. Always consult a licensed healthcare provider for serious medical conditions.
              </p>
            </div>
          </motion.footer>
        </main>
      </div>
    </div>
  )
}
