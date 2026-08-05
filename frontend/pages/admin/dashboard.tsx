'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users, Stethoscope, Activity, CalendarDays, ArrowRight, Shield,
  BarChart3, FileText, UserPlus
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { Disclaimer } from '@/components/ui/Disclaimer'

const stats = [
  { label: 'Total Users', value: '12,847', change: '+245', icon: Users, accent: 'primary' as const },
  { label: 'Total Doctors', value: '186', change: '+12', icon: Stethoscope, accent: 'secondary' as const },
  { label: 'Total Predictions', value: '45,291', change: '+1,892', icon: Activity, accent: 'purple' as const },
  { label: 'Total Appointments', value: '8,456', change: '+523', icon: CalendarDays, accent: 'accent' as const },
]

const recentRegistrations = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', role: 'Patient', status: 'Active', date: '2026-07-30', avatar: 'SJ' },
  { id: 2, name: 'Dr. Michael Chen', email: 'michael.c@email.com', role: 'Doctor', status: 'Pending', date: '2026-07-30', avatar: 'MC' },
  { id: 3, name: 'Emily Davis', email: 'emily.d@email.com', role: 'Patient', status: 'Active', date: '2026-07-29', avatar: 'ED' },
  { id: 4, name: 'Dr. James Wilson', email: 'james.w@email.com', role: 'Doctor', status: 'Active', date: '2026-07-29', avatar: 'JW' },
  { id: 5, name: 'Lisa Anderson', email: 'lisa.a@email.com', role: 'Patient', status: 'Inactive', date: '2026-07-28', avatar: 'LA' },
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
  { name: 'Hypertension', value: 28, color: '#21816d' },
  { name: 'Diabetes', value: 22, color: '#16a34a' },
  { name: 'Migraine', value: 18, color: '#d9a441' },
  { name: 'Arrhythmia', value: 15, color: '#e11d48' },
  { name: 'Other', value: 17, color: '#7c3aed' },
]

const quickActions = [
  { label: 'Manage Users', icon: Users, href: '/admin/users', accent: 'primary' as const },
  { label: 'Manage Doctors', icon: Stethoscope, href: '/admin/doctors', accent: 'secondary' as const },
  { label: 'View Analytics', icon: BarChart3, href: '/admin/analytics', accent: 'purple' as const },
  { label: 'Generate Report', icon: FileText, href: '/admin/analytics', accent: 'accent' as const },
]

const statusBadge = (status: string) => {
  if (status === 'Active' || status === 'High') return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300'
  if (status === 'Pending' || status === 'Medium') return 'bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-300'
  return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="heading-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-cream-100">
            Dashboard Overview
          </h1>
          <p className="text-sm text-ink-500 dark:text-cream-400/70 mt-1">
            A snapshot of platform activity and health.
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card overflow-hidden"
          >
            <div className="p-5 border-b border-cream-200 dark:border-ink-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100">Recent Registrations</h2>
              <Link href="/admin/users" className="text-sm font-semibold text-primary-700 dark:text-primary-300 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>User</TH>
                    <TH>Role</TH>
                    <TH>Status</TH>
                    <TH>Date</TH>
                  </TR>
                </THead>
                <TBody>
                  {recentRegistrations.map((r) => (
                    <TR key={r.id}>
                      <TD>
                        <div className="flex items-center gap-2">
                          <Avatar name={r.name} initials={r.avatar} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-ink-900 dark:text-cream-100">{r.name}</p>
                            <p className="text-xs text-ink-500 dark:text-cream-400/70">{r.email}</p>
                          </div>
                        </div>
                      </TD>
                      <TD className="text-sm text-ink-600 dark:text-cream-300/70">{r.role}</TD>
                      <TD>
                        <Badge className={statusBadge(r.status)}>{r.status}</Badge>
                      </TD>
                      <TD className="text-sm text-ink-500 dark:text-cream-400/70">{r.date}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card overflow-hidden"
          >
            <div className="p-5 border-b border-cream-200 dark:border-ink-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100">Recent Predictions</h2>
              <Link href="/admin/analytics" className="text-sm font-semibold text-primary-700 dark:text-primary-300 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>User</TH>
                    <TH>Disease</TH>
                    <TH>Confidence</TH>
                    <TH>Date</TH>
                  </TR>
                </THead>
                <TBody>
                  {recentPredictions.map((p) => (
                    <TR key={p.id}>
                      <TD className="text-sm font-medium text-ink-900 dark:text-cream-100">{p.user}</TD>
                      <TD className="text-sm text-ink-600 dark:text-cream-300/70">{p.disease}</TD>
                      <TD>
                        <Badge className={statusBadge(p.status)}>{p.confidence}</Badge>
                      </TD>
                      <TD className="text-sm text-ink-500 dark:text-cream-400/70">{p.date}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {quickActions.map((action, i) => (
            <motion.div key={action.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <Link href={action.href} className="flex items-center gap-4 p-4 card card-hover group">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    action.accent === 'primary'
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300'
                      : action.accent === 'secondary'
                        ? 'bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-300'
                        : action.accent === 'purple'
                          ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-300'
                  }`}
                >
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-900 dark:text-cream-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">{action.label}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-ink-400 group-hover:text-primary-600 transition-colors" />
              </Link>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="gradient-primary rounded-2xl p-5 text-white shadow-soft"
          >
            <Shield className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="text-lg font-semibold mb-1">System Health</h3>
            <p className="text-sm text-primary-100 mb-4">All systems operating normally</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>API Response Time</span>
                <span className="text-primary-100">45ms</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Uptime</span>
                <span className="text-primary-100">99.9%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Active Sessions</span>
                <span className="text-primary-100">342</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-5"
          >
            <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-300" /> User Growth
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cdd8d4" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#7f9b94" />
                <YAxis tick={{ fontSize: 12 }} stroke="#7f9b94" />
                <Tooltip />
                <Line type="monotone" dataKey="patients" stroke="#21816d" strokeWidth={2} name="Patients" dot={{ fill: '#21816d' }} />
                <Line type="monotone" dataKey="doctors" stroke="#d9a441" strokeWidth={2} name="Doctors" dot={{ fill: '#d9a441' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card p-5"
          >
            <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-600 dark:text-accent-300" /> Disease Distribution
            </h2>
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
                    <span className="text-sm text-ink-600 dark:text-cream-400/70">{d.name}</span>
                    <span className="text-sm font-medium text-ink-900 dark:text-cream-100">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <Disclaimer />
      </div>
    </AdminLayout>
  )
}
