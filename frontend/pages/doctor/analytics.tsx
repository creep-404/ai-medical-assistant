'use client'

import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, Activity, Heart, Star, Users,
  Download, CalendarDays, Stethoscope
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { DoctorLayout } from '@/components/layout/DoctorLayout'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Disclaimer } from '@/components/ui/Disclaimer'

const consultationData = [
  { month: 'Jan', consultations: 38, followUps: 20 },
  { month: 'Feb', consultations: 42, followUps: 24 },
  { month: 'Mar', consultations: 40, followUps: 22 },
  { month: 'Apr', consultations: 55, followUps: 30 },
  { month: 'May', consultations: 48, followUps: 28 },
  { month: 'Jun', consultations: 58, followUps: 35 },
  { month: 'Jul', consultations: 62, followUps: 38 },
]

const diseaseData = [
  { name: 'Hypertension', value: 35, color: '#21816d' },
  { name: 'Diabetes', value: 25, color: '#16a34a' },
  { name: 'Arrhythmia', value: 18, color: '#d9a441' },
  { name: 'Heart Disease', value: 12, color: '#e11d48' },
  { name: 'Other', value: 10, color: '#7c3aed' },
]

const appointmentTrends = [
  { month: 'Jan', total: 45, completed: 40, cancelled: 5 },
  { month: 'Feb', total: 52, completed: 48, cancelled: 4 },
  { month: 'Mar', total: 48, completed: 44, cancelled: 4 },
  { month: 'Apr', total: 61, completed: 56, cancelled: 5 },
  { month: 'May', total: 55, completed: 50, cancelled: 5 },
  { month: 'Jun', total: 68, completed: 62, cancelled: 6 },
  { month: 'Jul', total: 72, completed: 65, cancelled: 7 },
]

const recoveryData = [
  { name: 'Full Recovery', value: 65, color: '#16a34a' },
  { name: 'Improving', value: 22, color: '#21816d' },
  { name: 'Stable', value: 10, color: '#d9a441' },
  { name: 'Critical', value: 3, color: '#e11d48' },
]

const satisfactionData = [
  { month: 'Jan', rating: 4.5 },
  { month: 'Feb', rating: 4.6 },
  { month: 'Mar', rating: 4.4 },
  { month: 'Apr', rating: 4.7 },
  { month: 'May', rating: 4.8 },
  { month: 'Jun', rating: 4.6 },
  { month: 'Jul', rating: 4.9 },
]

const metricsCards = [
  { label: 'Avg Satisfaction', value: '4.8/5', change: '+0.2', icon: Star, accent: 'accent' as const },
  { label: 'Recovery Rate', value: '87%', change: '+3%', icon: Activity, accent: 'secondary' as const },
  { label: 'Total Patients', value: '1,247', change: '+12%', icon: Users, accent: 'primary' as const },
  { label: 'This Month', value: '62', change: '+8', icon: CalendarDays, accent: 'purple' as const },
]

const chartCard = 'card p-5'

export default function DoctorAnalyticsPage() {
  return (
    <DoctorLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="heading-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-cream-100">
                Analytics
              </h1>
              <p className="text-sm text-ink-500 dark:text-cream-400/70 mt-1">
                Track your practice performance and patient outcomes.
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4" /> Download Report
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {metricsCards.map((m, i) => (
            <StatCard
              key={m.label}
              icon={m.icon}
              label={m.label}
              value={m.value}
              delta={parseFloat(m.change)}
              accent={m.accent}
              index={i}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={chartCard}
          >
            <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-300" /> Consultation Statistics
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consultationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cdd8d4" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#7f9b94" />
                <YAxis tick={{ fontSize: 12 }} stroke="#7f9b94" />
                <Tooltip />
                <Legend />
                <Bar dataKey="consultations" fill="#21816d" radius={[4, 4, 0, 0]} name="Consultations" />
                <Bar dataKey="followUps" fill="#d9a441" radius={[4, 4, 0, 0]} name="Follow-ups" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={chartCard}
          >
            <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-secondary-600 dark:text-secondary-300" /> Common Diseases
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={diseaseData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {diseaseData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {diseaseData.map((d) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={chartCard}
          >
            <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-300" /> Monthly Appointment Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={appointmentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cdd8d4" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#7f9b94" />
                <YAxis tick={{ fontSize: 12 }} stroke="#7f9b94" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#21816d" strokeWidth={2} name="Total" dot={{ fill: '#21816d' }} />
                <Line type="monotone" dataKey="completed" stroke="#16a34a" strokeWidth={2} name="Completed" dot={{ fill: '#16a34a' }} />
                <Line type="monotone" dataKey="cancelled" stroke="#e11d48" strokeWidth={2} name="Cancelled" dot={{ fill: '#e11d48' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={chartCard}
          >
            <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" /> Recovery Statistics
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={recoveryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {recoveryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {recoveryData.map((d) => (
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={chartCard}
        >
          <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-accent-500" /> Patient Satisfaction
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={satisfactionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cdd8d4" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#7f9b94" />
              <YAxis domain={[3.5, 5]} tick={{ fontSize: 12 }} stroke="#7f9b94" />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#d9a441" strokeWidth={3} name="Rating" dot={{ fill: '#d9a441', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <Disclaimer />
      </div>
    </DoctorLayout>
  )
}
