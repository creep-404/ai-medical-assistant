'use client'

import { motion } from 'framer-motion'
import {
  BarChart3, Users, Activity, CalendarDays, Download,
  Stethoscope, TrendingUp, Clock
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Disclaimer } from '@/components/ui/Disclaimer'

const userStats = [
  { label: 'Total Users', value: '12,847', change: '+8.2%', icon: Users, accent: 'primary' as const },
  { label: 'Total Doctors', value: '186', change: '+6.9%', icon: Stethoscope, accent: 'secondary' as const },
  { label: 'Active Today', value: '1,342', change: '+12.4%', icon: Activity, accent: 'purple' as const },
  { label: 'Avg Session', value: '14.2 min', change: '+1.2', icon: Clock, accent: 'accent' as const },
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
  { name: 'Hypertension', value: 28, color: '#21816d' },
  { name: 'Diabetes', value: 22, color: '#16a34a' },
  { name: 'Migraine', value: 18, color: '#d9a441' },
  { name: 'Arrhythmia', value: 15, color: '#e11d48' },
  { name: 'Asthma', value: 10, color: '#7c3aed' },
  { name: 'Other', value: 7, color: '#0891b2' },
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

const chartCard = 'card p-5'

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="heading-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-cream-100">
                Analytics Dashboard
              </h1>
              <p className="text-sm text-ink-500 dark:text-cream-400/70 mt-1">
                Platform-wide performance and usage insights.
              </p>
            </div>
            <Button>
              <Download className="w-4 h-4" /> Download Reports
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {userStats.map((s, i) => (
            <StatCard
              key={s.label}
              icon={s.icon}
              label={s.label}
              value={s.value}
              delta={parseFloat(s.change)}
              accent={s.accent}
              index={i}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={chartCard}>
            <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-300" /> User Growth
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cdd8d4" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#7f9b94" />
                <YAxis tick={{ fontSize: 12 }} stroke="#7f9b94" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#21816d" strokeWidth={2} name="Total Users" dot={{ fill: '#21816d' }} />
                <Line type="monotone" dataKey="patients" stroke="#16a34a" strokeWidth={2} name="Patients" dot={{ fill: '#16a34a' }} />
                <Line type="monotone" dataKey="doctors" stroke="#d9a441" strokeWidth={2} name="Doctors" dot={{ fill: '#d9a441' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={chartCard}>
            <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-300" /> Predictions Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={predictionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cdd8d4" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#7f9b94" />
                <YAxis tick={{ fontSize: 12 }} stroke="#7f9b94" />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#21816d" radius={[4, 4, 0, 0]} name="Total Predictions" />
                <Bar dataKey="accurate" fill="#d9a441" radius={[4, 4, 0, 0]} name="Accurate" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={chartCard}>
            <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-accent-600 dark:text-accent-300" /> Appointment Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cdd8d4" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#7f9b94" />
                <YAxis tick={{ fontSize: 12 }} stroke="#7f9b94" />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#21816d" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill="#16a34a" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="cancelled" fill="#e11d48" radius={[4, 4, 0, 0]} name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={chartCard}>
            <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-secondary-600 dark:text-secondary-300" /> Most Common Diseases
            </h2>
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
                    <span className="text-sm text-ink-600 dark:text-cream-400/70">{d.name}</span>
                    <span className="text-sm font-medium text-ink-900 dark:text-cream-100">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={chartCard}>
          <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-300" /> Active Users (Past Week)
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={activeUsersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cdd8d4" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#7f9b94" />
              <YAxis tick={{ fontSize: 12 }} stroke="#7f9b94" />
              <Tooltip />
              <Line type="monotone" dataKey="active" stroke="#7c3aed" strokeWidth={3} name="Active Users" dot={{ fill: '#7c3aed', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <Disclaimer />
      </div>
    </AdminLayout>
  )
}
