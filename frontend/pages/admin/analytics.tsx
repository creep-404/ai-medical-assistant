'use client'

import { motion } from 'framer-motion'
import {
  BarChart3, Users, Activity, CalendarDays, Download, AlertTriangle,
  Stethoscope, TrendingUp, CheckCircle, Clock
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

const userStats = [
  { label: 'Total Users', value: '12,847', change: '+8.2%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Total Doctors', value: '186', change: '+6.9%', icon: Stethoscope, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'Active Today', value: '1,342', change: '+12.4%', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { label: 'Avg Session', value: '14.2 min', change: '+1.2 min', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
]

const userGrowthData = [
  { month: 'Jan', patients: 1200, doctors: 150, total: 1350 },
  { month: 'Feb', patients: 1350, doctors: 158, total: 1508 },
  { month: 'Mar', patients: 1500, doctors: 165, total: 1665 },
  { month: 'Apr', patients: 1680, doctors: 170, total: 1850 },
  { month: 'May', patients: 1850, doctors: 175, total: 2025 },
  { month: 'Jun', patients: 2100, doctors: 182, total: 2282 },
  { month: 'Jul', patients: 2400, doctors: 186, total: 2586 },
]

const predictionData = [
  { month: 'Jan', total: 1200, accurate: 1100 },
  { month: 'Feb', total: 1450, accurate: 1320 },
  { month: 'Mar', total: 1350, accurate: 1240 },
  { month: 'Apr', total: 1600, accurate: 1480 },
  { month: 'May', total: 1800, accurate: 1650 },
  { month: 'Jun', total: 2100, accurate: 1950 },
  { month: 'Jul', total: 2400, accurate: 2220 },
]

const appointmentStats = [
  { month: 'Jan', total: 450, completed: 380, cancelled: 70 },
  { month: 'Feb', total: 520, completed: 440, cancelled: 80 },
  { month: 'Mar', total: 480, completed: 410, cancelled: 70 },
  { month: 'Apr', total: 610, completed: 530, cancelled: 80 },
  { month: 'May', total: 550, completed: 480, cancelled: 70 },
  { month: 'Jun', total: 680, completed: 590, cancelled: 90 },
  { month: 'Jul', total: 720, completed: 630, cancelled: 90 },
]

const commonDiseases = [
  { name: 'Hypertension', value: 28, color: '#3b82f6' },
  { name: 'Diabetes', value: 22, color: '#22c55e' },
  { name: 'Migraine', value: 18, color: '#f59e0b' },
  { name: 'Arrhythmia', value: 15, color: '#ef4444' },
  { name: 'Asthma', value: 10, color: '#8b5cf6' },
  { name: 'Other', value: 7, color: '#06b6d4' },
]

const activeUsersData = [
  { day: 'Mon', active: 1200 },
  { day: 'Tue', active: 1350 },
  { day: 'Wed', active: 1400 },
  { day: 'Thu', active: 1280 },
  { day: 'Fri', active: 1150 },
  { day: 'Sat', active: 980 },
  { day: 'Sun', active: 850 },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700 transition-all">
                <Download className="w-4 h-4" /> Download Reports
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {userStats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">{s.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-600" /> User Growth</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Users" dot={{ fill: '#3b82f6' }} />
                  <Line type="monotone" dataKey="patients" stroke="#22c55e" strokeWidth={2} name="Patients" dot={{ fill: '#22c55e' }} />
                  <Line type="monotone" dataKey="doctors" stroke="#f59e0b" strokeWidth={2} name="Doctors" dot={{ fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-purple-600" /> Predictions Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Predictions" />
                  <Bar dataKey="accurate" fill="#22c55e" radius={[4, 4, 0, 0]} name="Accurate" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-amber-600" /> Appointment Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total" />
                  <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} name="Cancelled" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Stethoscope className="w-5 h-5 text-emerald-600" /> Most Common Diseases</h2>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={commonDiseases} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {commonDiseases.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {commonDiseases.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{d.name}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-purple-600" /> Active Users (Past Week)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={activeUsersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Line type="monotone" dataKey="active" stroke="#8b5cf6" strokeWidth={3} name="Active Users" dot={{ fill: '#8b5cf6', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <footer className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
              <p><strong className="text-gray-700 dark:text-gray-300">Medical Disclaimer:</strong> This application is intended for educational purposes only. It does not replace professional medical advice, diagnosis, or treatment. Always consult a licensed healthcare provider for serious medical conditions.</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
