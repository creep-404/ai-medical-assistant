'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users, Stethoscope, Activity, CalendarDays, ArrowRight, Shield,
  AlertTriangle, BarChart3, FileText, UserPlus, CheckCircle, XCircle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

const stats = [
  { label: 'Total Users', value: '12,847', change: '+245', icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Total Doctors', value: '186', change: '+12', icon: Stethoscope, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'Total Predictions', value: '45,291', change: '+1,892', icon: Activity, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { label: 'Total Appointments', value: '8,456', change: '+523', icon: CalendarDays, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
]

const recentRegistrations = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', role: 'Patient', status: 'Active', date: '2026-07-30', avatar: 'SJ', color: 'from-pink-400 to-rose-400' },
  { id: 2, name: 'Dr. Michael Chen', email: 'michael.c@email.com', role: 'Doctor', status: 'Pending', date: '2026-07-30', avatar: 'MC', color: 'from-blue-400 to-cyan-400' },
  { id: 3, name: 'Emily Davis', email: 'emily.d@email.com', role: 'Patient', status: 'Active', date: '2026-07-29', avatar: 'ED', color: 'from-emerald-400 to-green-400' },
  { id: 4, name: 'Dr. James Wilson', email: 'james.w@email.com', role: 'Doctor', status: 'Active', date: '2026-07-29', avatar: 'JW', color: 'from-amber-400 to-orange-400' },
  { id: 5, name: 'Lisa Anderson', email: 'lisa.a@email.com', role: 'Patient', status: 'Inactive', date: '2026-07-28', avatar: 'LA', color: 'from-red-400 to-rose-400' },
]

const recentPredictions = [
  { id: 1, user: 'Sarah Johnson', disease: 'Hypertension', confidence: '94%', date: '2026-07-30', status: 'High' },
  { id: 2, user: 'Michael Chen', disease: 'Arrhythmia', confidence: '89%', date: '2026-07-30', status: 'Medium' },
  { id: 3, user: 'Emily Davis', disease: 'Migraine', confidence: '96%', date: '2026-07-29', status: 'High' },
  { id: 4, user: 'David Thompson', disease: 'Diabetes Type 2', confidence: '91%', date: '2026-07-29', status: 'High' },
]

const userGrowthData = [
  { month: 'Jan', patients: 1200, doctors: 150 },
  { month: 'Feb', patients: 1350, doctors: 158 },
  { month: 'Mar', patients: 1500, doctors: 165 },
  { month: 'Apr', patients: 1680, doctors: 170 },
  { month: 'May', patients: 1850, doctors: 175 },
  { month: 'Jun', patients: 2100, doctors: 182 },
  { month: 'Jul', patients: 2400, doctors: 186 },
]

const diseaseDistData = [
  { name: 'Hypertension', value: 28, color: '#3b82f6' },
  { name: 'Diabetes', value: 22, color: '#22c55e' },
  { name: 'Migraine', value: 18, color: '#f59e0b' },
  { name: 'Arrhythmia', value: 15, color: '#ef4444' },
  { name: 'Other', value: 17, color: '#8b5cf6' },
]

const quickActions = [
  { label: 'Manage Users', icon: Users, href: '/admin/users', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Manage Doctors', icon: Stethoscope, href: '/admin/doctors', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'View Analytics', icon: BarChart3, href: '/admin/analytics', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { label: 'Generate Report', icon: FileText, href: '/admin/analytics', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-4 lg:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard Overview</h1>
          </motion.div>

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
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color.replace('from-', 'text-').split(' ')[0]}`} />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Registrations</h2>
                <Link href="/admin/users" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {recentRegistrations.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 bg-gradient-to-br ${r.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>{r.avatar}</div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{r.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{r.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{r.role}</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            r.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                            r.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>{r.status}</span>
                        </td>
                        <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Predictions</h2>
                <Link href="/admin/analytics" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Disease</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Confidence</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {recentPredictions.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="p-3 text-sm font-medium text-gray-900 dark:text-white">{p.user}</td>
                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{p.disease}</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            p.status === 'High' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                            'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          }`}>{p.confidence}</span>
                        </td>
                        <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{p.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {quickActions.map((action, i) => (
              <motion.div key={action.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                <Link href={action.href} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group">
                  <div className={`p-3 rounded-lg ${action.bg}`}>
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{action.label}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl p-5 text-white"
            >
              <Shield className="w-8 h-8 mb-3 opacity-80" />
              <h3 className="text-lg font-semibold mb-1">System Health</h3>
              <p className="text-sm text-blue-100 mb-4">All systems operating normally</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>API Response Time</span>
                  <span className="text-blue-200">45ms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Uptime</span>
                  <span className="text-blue-200">99.9%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Active Sessions</span>
                  <span className="text-blue-200">342</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} name="Patients" dot={{ fill: '#3b82f6' }} />
                  <Line type="monotone" dataKey="doctors" stroke="#22c55e" strokeWidth={2} name="Doctors" dot={{ fill: '#22c55e' }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Disease Distribution</h2>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={diseaseDistData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {diseaseDistData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {diseaseDistData.map((d) => (
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
